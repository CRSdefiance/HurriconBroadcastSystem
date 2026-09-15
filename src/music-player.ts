import { defaultMusic, normalizeMusic } from './interstitial';
import { observe } from './replicant';
import type { MusicState } from './types';

const audio = new Audio();
audio.preload = 'auto';
audio.autoplay = true;
audio.setAttribute('playsinline', '');
audio.style.display = 'none';
document.body.append(audio);
const enabled = new URLSearchParams(location.search).get('output') === '1';
let currentUrl = '';
let operation = 0;
let startTimer: number | undefined;

const report = (status: MusicState['status'], error?: string) => { if (window.nodecg) void window.nodecg.sendMessage('music:status', { status, error }); };
const ramp = async (target: number, durationMs: number, token: number) => {
  const start = audio.volume; const startedAt = performance.now();
  if (durationMs <= 0) { audio.volume = target; return; }
  while (token === operation) {
    const progress = Math.min(1, (performance.now() - startedAt) / durationMs);
    audio.volume = start + (target - start) * progress;
    if (progress >= 1) return;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
};

const apply = async (raw: MusicState) => {
  if (!enabled) return;
  const state = normalizeMusic(raw); const token = ++operation;
  if (startTimer !== undefined) { window.clearTimeout(startTimer); startTimer = undefined; }
  if (!state.playing || !state.streamUrl) {
    await ramp(0, state.fadeMs, token); if (token === operation) { audio.pause(); report('stopped'); } return;
  }
  if (currentUrl !== state.streamUrl) {
    if (!audio.paused) await ramp(0, state.fadeMs, token);
    if (token !== operation) return;
    audio.pause(); currentUrl = state.streamUrl; audio.src = currentUrl; audio.load();
  }
  audio.volume = currentUrl === state.streamUrl && audio.paused ? 0 : audio.volume;
  try {
    const playAttempt = audio.play();
    void playAttempt.catch((cause) => report('error', cause instanceof Error ? cause.message : String(cause)));
    startTimer = window.setTimeout(() => { if (token === operation && audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) report('error', 'Audio stream did not start within 15 seconds. Refresh the OBS Browser Source and try again.'); }, 15000);
    await ramp(state.volume, state.fadeMs, token);
  } catch (cause) { report('error', cause instanceof Error ? cause.message : String(cause)); }
};

audio.addEventListener('playing', () => { if (startTimer !== undefined) { window.clearTimeout(startTimer); startTimer = undefined; } report('playing'); });
audio.addEventListener('waiting', () => { if (!audio.paused) report('loading'); });
audio.addEventListener('ended', () => { if (window.nodecg) void window.nodecg.sendMessage('music:control', 'next'); });
audio.addEventListener('error', () => report('error', audio.error?.message || 'Audio source could not be played.'));
observe<MusicState>('music', defaultMusic(), (state) => { void apply(state); });
