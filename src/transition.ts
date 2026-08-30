import type { HbsTransitionMode, TransitionOverlayState, TransitionSettings } from './types';

const modes: HbsTransitionMode[] = ['obs', 'corner', 'diagonal', 'iris'];
const styles: Array<Exclude<HbsTransitionMode, 'obs'>> = ['corner', 'diagonal', 'iris'];
const MIN_DURATION_MS = 400;
const MAX_DURATION_MS = 4000;

export function defaultTransitionSettings(): TransitionSettings {
  return { mode: 'obs', obsName: 'Fade', durationMs: 700 };
}

export function defaultTransitionOverlay(): TransitionOverlayState {
  return { requestId: 0, phase: 'idle', style: 'corner', durationMs: 700, startedAt: 0 };
}

export function normalizeTransitionSettings(input: Partial<TransitionSettings> | null | undefined): TransitionSettings {
  const defaults = defaultTransitionSettings();
  const mode = typeof input?.mode === 'string' && modes.includes(input.mode as HbsTransitionMode)
    ? input.mode as HbsTransitionMode : defaults.mode;
  const obsName = typeof input?.obsName === 'string' && input.obsName.trim()
    ? input.obsName.trim().slice(0, 120) : defaults.obsName;
  const rawDuration = typeof input?.durationMs === 'number' && Number.isFinite(input.durationMs)
    ? input.durationMs : defaults.durationMs;
  return { mode, obsName, durationMs: Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, Math.round(rawDuration))) };
}

export function transitionHalfMs(settings: TransitionSettings): number {
  return normalizeTransitionSettings(settings).durationMs / 2;
}

export function normalizeTransitionOverlay(input: Partial<TransitionOverlayState> | null | undefined): TransitionOverlayState {
  const defaults = defaultTransitionOverlay();
  const value = input && typeof input === 'object' ? input : {};
  const rawDuration = typeof value.durationMs === 'number' && Number.isFinite(value.durationMs) ? value.durationMs : defaults.durationMs;
  const style = typeof value.style === 'string' && styles.includes(value.style as Exclude<HbsTransitionMode, 'obs'>)
    ? value.style as Exclude<HbsTransitionMode, 'obs'> : defaults.style;
  const phase = value.phase === 'covering' || value.phase === 'revealing' || value.phase === 'error' || value.phase === 'idle' ? value.phase : defaults.phase;
  const requestId = typeof value.requestId === 'number' && Number.isFinite(value.requestId) ? Math.max(0, Math.floor(value.requestId)) : defaults.requestId;
  const startedAt = typeof value.startedAt === 'number' && Number.isFinite(value.startedAt) ? Math.max(0, value.startedAt) : defaults.startedAt;
  return {
    requestId,
    phase,
    style,
    durationMs: Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, Math.round(rawDuration))),
    startedAt,
    error: typeof value.error === 'string' && value.error.trim() ? value.error.trim().slice(0, 240) : undefined
  };
}
