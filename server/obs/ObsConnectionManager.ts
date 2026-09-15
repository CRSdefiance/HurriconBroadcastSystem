import OBSWebSocket from 'obs-websocket-js';
import type { ObsState, ShowMode } from '../../src/types';

export interface TransitionSpec { name: string; durationMs?: number }
export interface ObsConfig { url?: string; password?: string; sceneMap?: Partial<Record<ShowMode, string>>; transition?: TransitionSpec; transitionMap?: Partial<Record<ShowMode, TransitionSpec>> }
export interface ObsStateSink { (state: ObsState): void }

export class ObsConnectionManager {
  private readonly client = new OBSWebSocket();
  private retry?: NodeJS.Timeout;
  private stopped = false;
  private retryDelayMs = 3000;
  private lastLoggedError?: string;
  private transitionOverride?: TransitionSpec;
  constructor(private readonly config: ObsConfig, private readonly update: ObsStateSink, private readonly log: { info(message: string): void; warn(message: string): void }) {}

  async start(): Promise<void> {
    this.stopped = false;
    this.client.on('ConnectionClosed', () => { this.update({ connected: false, host: this.config.url, lastError: 'OBS connection closed; retrying.' }); this.scheduleRetry(); });
    this.client.on('CurrentProgramSceneChanged', (event) => this.update({ connected: true, host: this.config.url, currentProgramScene: event.sceneName }));
    this.client.on('CurrentSceneTransitionChanged', (event) => this.update({ connected: true, currentTransition: event.transitionName }));
    this.client.on('CurrentSceneTransitionDurationChanged', (event) => this.update({ connected: true, transitionDurationMs: event.transitionDuration }));
    await this.connect();
  }
  stop(): void { this.stopped = true; if (this.retry) clearTimeout(this.retry); void this.client.disconnect(); }
  private scheduleRetry(): void { if (!this.stopped && !this.retry) { const delay=this.retryDelayMs; this.retryDelayMs=Math.min(this.retryDelayMs*2,30000); this.retry = setTimeout(() => { this.retry = undefined; void this.connect(); }, delay); } }
  private async connect(): Promise<void> {
    const url = this.config.url ?? 'ws://127.0.0.1:4455';
    try {
      const hello = await this.client.connect(url, this.config.password, { rpcVersion: 1 });
      const scene = await this.client.call('GetCurrentProgramScene');
      const stream = await this.client.call('GetStreamStatus');
      const recording = await this.client.call('GetRecordStatus');
      const transitionList = await this.client.call('GetSceneTransitionList');
      const currentTransition = await this.client.call('GetCurrentSceneTransition');
      const availableTransitions = transitionList.transitions.map((entry) => typeof entry.transitionName === 'string' ? entry.transitionName : '').filter(Boolean);
      this.update({ connected: true, host: url, currentProgramScene: scene.currentProgramSceneName, streaming: stream.outputActive, recording: recording.outputActive, currentTransition: currentTransition.transitionName, transitionDurationMs: currentTransition.transitionFixed ? undefined : currentTransition.transitionDuration, availableTransitions });
      this.retryDelayMs = 3000;
      this.lastLoggedError = undefined;
      this.log.info(`Connected to OBS ${hello.obsWebSocketVersion}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.update({ connected: false, host: url, lastError: `${message} Check OBS, WebSocket settings, and the local config.` });
      if (message !== this.lastLoggedError) { this.log.warn(`OBS connection failed: ${message}`); this.lastLoggedError = message; }
      this.scheduleRetry();
    }
  }
  async switchScene(mode: ShowMode): Promise<void> {
    const sceneName = this.sceneFor(mode);
    if (!sceneName) throw new Error(`No OBS scene is configured for ${mode}.`);
    const transition = this.transitionOverride ?? this.config.transitionMap?.[mode] ?? this.config.transition ?? { name: 'Fade', durationMs: 500 };
    let appliedTransition = transition.name;
    try {
      await this.applyTransition(transition);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.log.warn(`Could not apply transition ${transition.name}: ${message}. Falling back to Cut.`);
      try { await this.applyTransition({ name: 'Cut' }); appliedTransition = 'Cut'; } catch { appliedTransition = 'the current OBS transition'; }
    }
    await this.client.call('SetCurrentProgramScene', { sceneName });
    this.log.info(`Switched OBS to ${sceneName} using ${appliedTransition}.`);
  }
  async cutToScene(mode: ShowMode): Promise<void> {
    const sceneName = this.sceneFor(mode);
    if (!sceneName) throw new Error(`No OBS scene is configured for ${mode}.`);
    const previous = await this.client.call('GetCurrentSceneTransition');
    try {
      await this.client.call('SetCurrentSceneTransition', { transitionName: 'Cut' });
      await this.client.call('SetCurrentProgramScene', { sceneName });
      this.log.info(`Switched OBS to ${sceneName} behind the HBS transition overlay.`);
    } finally {
      if (previous.transitionName !== 'Cut') {
        try {
          await this.client.call('SetCurrentSceneTransition', { transitionName: previous.transitionName });
          const restored = await this.client.call('GetCurrentSceneTransition');
          if (!restored.transitionFixed) await this.client.call('SetCurrentSceneTransitionDuration', { transitionDuration: previous.transitionDuration });
        } catch (error) { this.log.warn(`Scene changed, but OBS transition restore failed: ${error instanceof Error ? error.message : String(error)}`); }
      }
    }
  }
  async setTransition(transition: TransitionSpec): Promise<void> {
    if (!transition.name.trim()) throw new Error('Transition name is required.');
    if (transition.durationMs !== undefined && (transition.durationMs < 50 || transition.durationMs > 20000)) throw new Error('Transition duration must be between 50 and 20000 ms.');
    await this.applyTransition(transition);
    this.transitionOverride = transition;
  }
  private async applyTransition(transition: TransitionSpec): Promise<void> {
    await this.client.call('SetCurrentSceneTransition', { transitionName: transition.name });
    const current = await this.client.call('GetCurrentSceneTransition');
    if (!current.transitionFixed && transition.durationMs !== undefined) await this.client.call('SetCurrentSceneTransitionDuration', { transitionDuration: transition.durationMs });
    this.update({ connected: true, currentTransition: current.transitionName, transitionDurationMs: current.transitionFixed ? undefined : transition.durationMs ?? current.transitionDuration, lastError: undefined });
  }
  private sceneFor(mode: ShowMode): string | undefined {
    return this.config.sceneMap?.[mode] ?? (mode === 'interstitial' ? 'HBS - Interstitial' : undefined);
  }
}
