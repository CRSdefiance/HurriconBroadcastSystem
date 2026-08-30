export interface ScheduleItem { id: string; title: string; startTime?: string; subtitle?: string }
export function parseSchedule(value: unknown): ScheduleItem[] {
  if (!Array.isArray(value)) throw new Error('Schedule must be a JSON array.');
  return value.map((item, index) => {
    if (!item || typeof item !== 'object' || !('title' in item) || typeof item.title !== 'string' || !item.title.trim()) throw new Error(`Schedule item ${index + 1} needs a title.`);
    const candidate = item as Record<string, unknown>;
    return { id: typeof candidate.id === 'string' ? candidate.id : `item-${index + 1}`, title: item.title.trim(), startTime: typeof candidate.startTime === 'string' ? candidate.startTime : undefined, subtitle: typeof candidate.subtitle === 'string' ? candidate.subtitle : undefined };
  });
}

