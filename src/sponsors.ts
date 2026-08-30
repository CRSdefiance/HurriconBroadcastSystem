export interface Sponsor { id: string; path: string; weight?: number }
export function nextSponsor(items: Sponsor[], currentId?: string): Sponsor | null {
  if (!items.length) return null;
  const index = items.findIndex((item) => item.id === currentId);
  return items[(index + 1) % items.length] ?? items[0] ?? null;
}

