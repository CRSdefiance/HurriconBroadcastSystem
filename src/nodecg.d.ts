import type { Brand, BroadcastRailState, Commentator, LowerThirdState, MatchState, ObsState, ShowState, SpeedrunState } from './types';
declare global {
  interface Window { nodecg?: { Replicant<T>(name: string, options?: unknown): { value: T; on(event: 'change', cb: (next: T) => void): void }; sendMessage<T=unknown>(name: string, data?: T): Promise<unknown> } }
}
export type HbsState = { match: MatchState; commentators: Commentator[]; lowerThird: LowerThirdState; show: ShowState; speedrun: SpeedrunState; broadcastRail: BroadcastRailState; obs: ObsState; activeBrand: string; brand: Brand };
