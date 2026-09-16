export type DashboardPanel = 'live' | 'setup';

export interface PanelLayoutPreferences {
  version: 1;
  panel: DashboardPanel;
  order: string[];
  collapsed: string[];
}

export const normalizePanelLayoutPreferences = (value: unknown, panel: DashboardPanel, knownIds: string[]): PanelLayoutPreferences | null => {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<PanelLayoutPreferences>;
  if (candidate.version !== 1 || candidate.panel !== panel || !Array.isArray(candidate.order) || !Array.isArray(candidate.collapsed)) return null;
  const known = new Set(knownIds);
  const uniqueKnown = (items: unknown[]) => [...new Set(items.filter((item): item is string => typeof item === 'string' && known.has(item)))];
  const order = uniqueKnown(candidate.order);
  return { version: 1, panel, order: [...order, ...knownIds.filter((id) => !order.includes(id))], collapsed: uniqueKnown(candidate.collapsed) };
};
