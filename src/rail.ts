import type { BroadcastRailState, DonationState, RailModule, SponsorItem } from './types';

export const railModules: RailModule[] = ['donation', 'sponsor', 'announcement', 'programming'];

const defaultDonation = (): DonationState => ({ total: 0, goal: 0, currency: 'USD' });

export const defaultBroadcastRail = (): BroadcastRailState => ({
  visible: true,
  automatic: true,
  held: false,
  rotationSeconds: 12,
  activeModule: 'programming',
  enabledModules: { donation: true, sponsor: true, announcement: true, programming: true },
  donation: defaultDonation(),
  announcement: '',
  sponsors: [],
  sponsorIndex: 0,
  updatedAt: Date.now()
});

const finite = (value: unknown, fallback: number): number => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const text = (value: unknown, max: number): string => typeof value === 'string' ? value.trim().slice(0, max) : '';
const moduleIsValid = (value: unknown): value is RailModule => typeof value === 'string' && railModules.includes(value as RailModule);

export function availableRailModules(state: BroadcastRailState): RailModule[] {
  return railModules.filter((module) => {
    if (!state.enabledModules[module]) return false;
    if (module === 'sponsor') return state.sponsors.some((sponsor) => sponsor.enabled && Boolean(sponsor.logoUrl || sponsor.name));
    if (module === 'announcement') return Boolean(state.announcement.trim());
    if (module === 'donation') return state.donation.goal > 0 || state.donation.total > 0 || Boolean(state.donation.latestDonor || state.donation.latestMessage);
    return true;
  });
}

export function normalizeBroadcastRail(input: Partial<BroadcastRailState> | null | undefined): BroadcastRailState {
  const defaults = defaultBroadcastRail();
  const value = input && typeof input === 'object' ? input : {};
  const rawDonation: Partial<DonationState> = value.donation && typeof value.donation === 'object' ? value.donation : {};
  const donation: DonationState = {
    total: Math.max(0, finite(rawDonation.total, 0)),
    goal: Math.max(0, finite(rawDonation.goal, 0)),
    currency: text(rawDonation.currency, 8) || defaults.donation.currency,
    latestDonor: text(rawDonation.latestDonor, 120) || undefined,
    latestAmount: Math.max(0, finite(rawDonation.latestAmount, 0)) || undefined,
    latestMessage: text(rawDonation.latestMessage, 240) || undefined,
    updatedAt: finite(rawDonation.updatedAt, 0) || undefined
  };
  const sponsors: SponsorItem[] = Array.isArray(value.sponsors) ? value.sponsors.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const candidate = item as SponsorItem;
    const name = text(candidate.name, 120);
    if (!name) return [];
    return [{ id: text(candidate.id, 80) || `sponsor-${index + 1}`, name, logoUrl: text(candidate.logoUrl, 500) || undefined, enabled: candidate.enabled !== false }];
  }) : [];
  const enabledModules = railModules.reduce((result, module) => {
    result[module] = value.enabledModules?.[module] !== false;
    return result;
  }, {} as Record<RailModule, boolean>);
  const normalized: BroadcastRailState = {
    visible: value.visible !== false,
    automatic: value.automatic !== false,
    held: value.held === true,
    rotationSeconds: Math.min(300, Math.max(3, Math.round(finite(value.rotationSeconds, defaults.rotationSeconds)))),
    activeModule: moduleIsValid(value.activeModule) ? value.activeModule : defaults.activeModule,
    enabledModules,
    donation,
    announcement: text(value.announcement, 240),
    sponsors,
    sponsorIndex: sponsors.length ? Math.max(0, Math.min(sponsors.length - 1, Math.floor(finite(value.sponsorIndex, 0)))) : 0,
    updatedAt: finite(value.updatedAt, Date.now())
  };
  const available = availableRailModules(normalized);
  normalized.activeModule = available.includes(normalized.activeModule) ? normalized.activeModule : (available[0] ?? 'programming');
  return normalized;
}

export function advanceBroadcastRail(state: BroadcastRailState, delta = 1, now = Date.now()): BroadcastRailState {
  const normalized = normalizeBroadcastRail(state);
  const available = availableRailModules(normalized);
  if (available.length < 2) return { ...normalized, updatedAt: now };
  const current = Math.max(0, available.indexOf(normalized.activeModule));
  const next = ((current + Math.trunc(delta)) % available.length + available.length) % available.length;
  const sponsorIndices = normalized.sponsors.reduce<number[]>((indices, sponsor, index) => {
    if (sponsor.enabled) indices.push(index);
    return indices;
  }, []);
  const sponsorPosition = sponsorIndices.indexOf(normalized.sponsorIndex);
  const sponsorIndex = normalized.activeModule === 'sponsor' && sponsorIndices.length
    ? sponsorIndices[((Math.max(0, sponsorPosition) + Math.trunc(delta)) % sponsorIndices.length + sponsorIndices.length) % sponsorIndices.length]
    : normalized.sponsorIndex;
  return { ...normalized, activeModule: available[next], sponsorIndex, updatedAt: now };
}
