import type { FeedIdentity, MatchState, PlayerState, RunTimerState, SpeedrunState } from './types';
export const clampScore = (score: number, allowNegative = false) => allowNegative ? score : Math.max(0, score);
export const changeScore = (match: MatchState, side: 'player1'|'player2', delta: number): MatchState => ({ ...match, [side]: { ...match[side], score: clampScore(match[side].score + delta) } });
export const swapPlayers = (match: MatchState): MatchState => ({ ...match, player1: match.player2, player2: match.player1 });
export const emptyPlayer = (displayName: string): PlayerState => ({ displayName, score: 0 });
export const defaultMatch = (): MatchState => ({ game: 'Featured Game', round: 'Exhibition', bestOf: 3, player1: emptyPlayer('Player One'), player2: emptyPlayer('Player Two'), status: 'setup' });
export const defaultSpeedrun = (): SpeedrunState => ({ feedCount: 1, cameraVisible: true, timerVisible: true, guidesVisible: true, feedIdentitiesVisible: true, feedSocialsVisible: true, feedIdentities: [{ name: 'Runner Name' }, { name: 'Runner 2' }, { name: 'Runner 3' }, { name: 'Runner 4' }], game: 'Featured Game', platform: 'PC', category: 'Any%', runner: 'Runner Name', estimate: '1:00:00', timer: { running: false, elapsedMs: 0 } });
export const speedrunFeedIdentities = (run: SpeedrunState): FeedIdentity[] => Array.from({ length: 4 }, (_, index) => {
  const existing = run.feedIdentities?.[index];
  const legacy: FeedIdentity = index === 0 ? { name: run.runner, pronouns: run.pronouns } : { name: '' };
  return { name: existing?.name ?? legacy.name, pronouns: existing?.pronouns ?? legacy.pronouns, social: existing?.social, socialPlatform: existing?.socialPlatform };
});
export function timerElapsed(timer: RunTimerState, now = Date.now()): number { return timer.running && timer.startedAt ? timer.elapsedMs + Math.max(0, now - timer.startedAt) : timer.elapsedMs; }
export function timerAction(timer: RunTimerState, action: 'start'|'pause'|'reset', now = Date.now()): RunTimerState {
  if (action === 'reset') return { running: false, elapsedMs: 0 };
  if (action === 'start') return timer.running ? timer : { running: true, elapsedMs: timer.elapsedMs, startedAt: now };
  return timer.running ? { running: false, elapsedMs: timerElapsed(timer, now) } : timer;
}
