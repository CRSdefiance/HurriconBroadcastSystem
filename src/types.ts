export type ShowMode = 'tournament' | 'gameplay' | 'interview' | 'stage' | 'break' | 'schedule' | 'technical';
export interface PlayerState { id?: string; displayName: string; handle?: string; pronouns?: string; seed?: number | null; location?: string; social?: string; score: number }
export interface MatchState { game: string; gameSubtitle?: string; round: string; format?: string; bestOf?: number | null; player1: PlayerState; player2: PlayerState; status: 'setup' | 'ready' | 'live' | 'complete' }
export interface Commentator { name: string; pronouns?: string; social?: string }
export interface LowerThirdState { visible: boolean; title: string; subtitle?: string; tertiary?: string; style?: 'person' | 'announcement' | 'sponsor' }
export interface ShowState { mode: ShowMode; currentSegment?: string; nextSegment?: string; nextSegmentTime?: string }
export type RailModule = 'donation' | 'sponsor' | 'announcement' | 'programming';
export interface SponsorItem { id: string; name: string; logoUrl?: string; enabled: boolean }
export interface DonationState { total: number; goal: number; currency: string; latestDonor?: string; latestAmount?: number; latestMessage?: string; updatedAt?: number }
export interface BroadcastRailState { visible: boolean; automatic: boolean; held: boolean; rotationSeconds: number; activeModule: RailModule; enabledModules: Record<RailModule, boolean>; donation: DonationState; announcement: string; sponsors: SponsorItem[]; sponsorIndex: number; updatedAt: number }
export type FeedCount = 1 | 2 | 3 | 4;
export interface RunTimerState { running: boolean; elapsedMs: number; startedAt?: number }
export interface FeedIdentity { name: string; pronouns?: string; social?: string }
export interface SpeedrunState { feedCount: FeedCount; cameraVisible: boolean; timerVisible: boolean; guidesVisible: boolean; feedIdentitiesVisible?: boolean; feedSocialsVisible?: boolean; feedIdentities?: FeedIdentity[]; game: string; platform?: string; category?: string; runner: string; pronouns?: string; estimate?: string; timer: RunTimerState }
export interface ObsState { connected: boolean; host?: string; currentProgramScene?: string; streaming?: boolean; recording?: boolean; currentTransition?: string; transitionDurationMs?: number; availableTransitions?: string[]; lastError?: string }
export interface Brand { id: string; displayName: string; shortName: string; website?: string; socialHandle?: string; assets: Record<string, string>; colors: Record<string, string>; typography: { headingFamily: string; bodyFamily: string; numericFamily: string; headingWeight: number }; shape: { cornerRadius: number; borderWidth: number; panelOpacity: number }; animation: { durationMs: number; reducedMotion: boolean } }
