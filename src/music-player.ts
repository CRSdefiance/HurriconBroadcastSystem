import { defaultMusic, normalizeMusic } from './interstitial';
import { observe } from './replicant';
import type { MusicState } from './types';

const audio = new Audio();
audio.preload = 'auto';
const enabled = new URLSearchParams(location.search).get('output') === '1';
let currentUrl = '';
let operation = 0;

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
  if (!state.playing || !state.streamUrl) {
    await ramp(0, state.fadeMs, token); if (token === operation) { audio.pause(); report('stopped'); } return;
  }
  if (currentUrl !== state.streamUrl) {
    if (!audio.paused) await ramp(0, state.fadeMs, token);
    if (token !== operation) return;
    audio.pause(); currentUrl = state.streamUrl; audio.src = currentUrl; audio.load();
  }
  audio.volume = currentUrl === state.streamUrl && audio.paused ? 0 : audio.volume;
  try { await audio.play(); if (state.status !== 'playing') report('playing'); await ramp(state.volume, state.fadeMs, token); }
  catch (cause) { report('error', cause instanceof Error ? cause.message : String(cause)); }
};

audio.addEventListener('ended', () => { if (window.nodecg) void window.nodecg.sendMessage('music:control', 'next'); });
audio.addEventListener('error', () => report('error', audio.error?.message || 'Audio source could not be played.'));
observe<MusicState>('music', defaultMusic(), (state) => { void apply(state); });
