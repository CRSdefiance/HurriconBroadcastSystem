export interface NameMarqueeMetrics { travelPx: number; durationMs: number }

export const nameMarqueeMetrics = (contentWidth: number, viewportWidth: number): NameMarqueeMetrics | null => {
  const overflow = Math.ceil(Math.max(0, contentWidth - viewportWidth));
  if (overflow <= 2) return null;
  const travelPx = overflow + 18;
  return { travelPx, durationMs: Math.min(18000, Math.max(9000, 7000 + travelPx * 24)) };
};
