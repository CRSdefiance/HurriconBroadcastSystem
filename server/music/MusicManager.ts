import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, extname, relative, resolve, sep } from 'node:path';
import type { Request, Response } from 'express';
import { normalizeMusic, rainwaveStations } from '../../src/interstitial';
import type { MusicLibraryState, MusicState, RainwaveStation } from '../../src/types';

const audioExtensions = new Set(['.mp3', '.ogg', '.wav', '.flac', '.m4a', '.aac', '.opus']);
type MusicConfig = { localRoot?: string };
type StateAccess = { get(): MusicState; set(value: MusicState): void; setLibrary(value: MusicLibraryState): void };
type Logger = { info(message: string): void; warn(message: string): void };

export class MusicManager {
  readonly localRoot: string;
  private tracks = new Map<string, string[]>();
  private pollTimer?: NodeJS.Timeout;

  constructor(config: MusicConfig, private readonly state: StateAccess, private readonly log: Logger) {
    this.localRoot = resolve(config.localRoot || resolve(process.cwd(), 'music'));
  }

  async start(): Promise<void> {
    mkdirSync(this.localRoot, { recursive: true });
    await this.refreshLibrary();
    this.pollTimer = setInterval(() => void this.pollRainwave(), 10000);
    if (this.state.get().source === 'rainwave') await this.pollRainwave();
  }

  stop(): void { if (this.pollTimer) clearInterval(this.pollTimer); }

  async refreshLibrary(): Promise<void> {
    this.tracks.clear();
    const folders = readdirSync(this.localRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
    for (const folder of folders) {
      const directory = resolve(this.localRoot, folder);
      const files = readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.isFile() && audioExtensions.has(extname(entry.name).toLowerCase())).map((entry) => entry.name).sort();
      this.tracks.set(folder, files);
    }
    let stations = rainwaveStations;
    let error: string | undefined;
    try {
      const response = await fetch('https://rainwave.cc/api4/stations');
      if (!response.ok) throw new Error(`Rainwave stations returned HTTP ${response.status}`);
      const payload = await response.json() as { stations?: Array<{ id?: number; key?: string; name?: string; description?: string }> };
      const fetched = payload.stations?.filter((station): station is RainwaveStation => typeof station.id === 'number' && typeof station.key === 'string' && typeof station.name === 'string').map((station) => ({ id: station.id, key: station.key, name: station.name, ...(station.description ? { description: station.description } : {}) }));
      if (fetched?.length) stations = fetched;
    } catch (cause) { error = cause instanceof Error ? cause.message : String(cause); }
    this.state.setLibrary({ folders, stations, error });
  }

  configure(update: Partial<MusicState>): void {
    const current = this.state.get();
    const next = normalizeMusic({ ...current, ...update, updatedAt: Date.now() });
    if (next.source === 'rainwave') this.applyRainwaveStream(next);
    else if (next.playing) this.ensureLocalTrack(next, true);
    else this.state.set({ ...next, streamUrl: undefined, trackKey: undefined, trackTitle: undefined, artist: undefined, album: undefined, artworkUrl: undefined, status: 'stopped', error: undefined });
    if (next.source === 'rainwave') void this.pollRainwave();
  }

  play(): void {
    const current = normalizeMusic(this.state.get());
    if (current.source === 'rainwave') this.applyRainwaveStream({ ...current, playing: true, status: 'loading', error: undefined, updatedAt: Date.now() });
    else this.ensureLocalTrack({ ...current, playing: true, status: 'loading', error: undefined, updatedAt: Date.now() }, false);
  }

  stopPlayback(): void { this.state.set({ ...this.state.get(), playing: false, status: 'stopped', updatedAt: Date.now(), error: undefined }); }

  next(): void {
    const current = this.state.get();
    if (current.source === 'rainwave') { void this.pollRainwave(); return; }
    this.ensureLocalTrack({ ...current, playing: true, status: 'loading', updatedAt: Date.now() }, true);
  }

  markStatus(status: MusicState['status'], error?: string): void {
    const current = this.state.get();
    if (current.status === status && current.error === error) return;
    this.state.set({ ...current, status, error, updatedAt: Date.now() });
  }

  serveAudio = (req: Request, res: Response): void => {
    const folder = String(req.params.folder || '');
    const file = String(req.params.file || '');
    if (!this.tracks.get(folder)?.includes(file)) { res.status(404).send('Track not found'); return; }
    const path = resolve(this.localRoot, folder, file);
    const withinRoot = relative(this.localRoot, path);
    if (!withinRoot || withinRoot.startsWith(`..${sep}`) || !existsSync(path)) { res.status(404).send('Track not found'); return; }
    res.sendFile(path);
  };

  serveRainwave = async (req: Request, res: Response): Promise<void> => {
    const key = String(req.params.station || '').replace(/\.mp3$/i, '');
    if (!rainwaveStations.some((station) => station.key === key)) { res.status(404).send('Station not found'); return; }
    try {
      this.log.info(`Rainwave audio client connected to ${key}.`);
      const upstream = await fetch(`https://relay.rainwave.cc/${key}.mp3`, { headers: { 'User-Agent': 'HurriconBroadcastSystem/0.1' } });
      if (!upstream.ok || !upstream.body) throw new Error(`Rainwave relay returned HTTP ${upstream.status}`);
      res.status(200);
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-cache, no-store');
      res.setHeader('Connection', 'keep-alive');
      const reader = upstream.body.getReader();
      let closed = false;
      res.on('close', () => { closed = true; void reader.cancel(); this.log.info(`Rainwave audio client disconnected from ${key}.`); });
      while (!closed) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!res.write(Buffer.from(value))) await new Promise<void>((resolveDrain) => res.once('drain', resolveDrain));
      }
      if (!res.writableEnded) res.end();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      this.log.warn(`Rainwave audio relay unavailable: ${message}`);
      if (!res.headersSent) res.status(502).send('Rainwave audio relay unavailable');
      else if (!res.writableEnded) res.end();
    }
  };

  private applyRainwaveStream(state: MusicState): void {
    const station = rainwaveStations.find((item) => item.key === state.rainwaveStation) ?? rainwaveStations[4];
    this.state.set({ ...state, rainwaveStation: station.key, streamUrl: `/hbs-media/rainwave/${station.key}.mp3`, trackKey: `rainwave:${station.key}`, status: state.playing ? state.status : 'stopped', error: undefined });
  }

  private ensureLocalTrack(state: MusicState, advance: boolean): void {
    const files = this.tracks.get(state.localFolder) ?? [];
    if (!files.length) { this.state.set({ ...state, playing: false, status: 'error', streamUrl: undefined, error: `No supported audio files found in ${state.localFolder || 'the selected folder'}.` }); return; }
    const currentFile = state.trackKey?.startsWith(`local:${state.localFolder}:`) ? state.trackKey.slice(`local:${state.localFolder}:`.length) : undefined;
    const currentIndex = currentFile ? files.indexOf(currentFile) : -1;
    const file = files[advance && currentIndex >= 0 ? (currentIndex + 1) % files.length : Math.max(0, currentIndex)];
    const stem = basename(file, extname(file));
    const parts = stem.split(' - ');
    const artist = parts.length > 1 ? parts.shift() : undefined;
    const title = parts.length ? parts.join(' - ') : stem;
    this.state.set({ ...state, streamUrl: `/hbs-media/audio/${encodeURIComponent(state.localFolder)}/${encodeURIComponent(file)}`, trackKey: `local:${state.localFolder}:${file}`, trackTitle: title, artist, album: state.localFolder, artworkUrl: undefined, status: state.playing ? 'loading' : 'stopped', error: undefined });
  }

  private async pollRainwave(): Promise<void> {
    const current = this.state.get();
    if (current.source !== 'rainwave') return;
    const station = rainwaveStations.find((item) => item.key === current.rainwaveStation) ?? rainwaveStations[4];
    try {
      const response = await fetch(`https://rainwave.cc/api4/info_all?sid=${station.id}`);
      if (!response.ok) throw new Error(`Rainwave now playing returned HTTP ${response.status}`);
      const payload = await response.json() as { all_stations_info?: Record<string, { title?: string; album?: string; artists?: string; art?: string }> };
      const track = payload.all_stations_info?.[String(station.id)];
      this.state.set({ ...this.state.get(), rainwaveStation: station.key, trackTitle: track?.title || 'Rainwave', artist: track?.artists || station.name, album: track?.album || '', artworkUrl: track?.art ? `https://rainwave.cc${track.art}` : undefined, error: undefined, updatedAt: Date.now() });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      this.state.set({ ...this.state.get(), error: message, updatedAt: Date.now() });
      this.log.warn(`Rainwave metadata unavailable: ${message}`);
    }
  }
}
