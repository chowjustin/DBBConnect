/**
 * Lightweight timezone helpers. No date-fns dep — uses Intl directly.
 */
export function isValidIanaTz(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function utcToLocalMinutes(
  date: Date,
  timezone: string,
): { dayOfWeek: number; minutes: number } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const wkMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Sun';
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const minute = parseInt(
    parts.find((p) => p.type === 'minute')?.value ?? '0',
    10,
  );
  return { dayOfWeek: wkMap[weekday] ?? 0, minutes: hour * 60 + minute };
}

export function isInsideSlot(
  range: { start: Date; end: Date },
  slot: { dayOfWeek: number; startMin: number; endMin: number; timezone: string },
): boolean {
  const localStart = utcToLocalMinutes(range.start, slot.timezone);
  const localEnd = utcToLocalMinutes(range.end, slot.timezone);
  if (localStart.dayOfWeek !== slot.dayOfWeek) return false;
  if (localEnd.dayOfWeek !== slot.dayOfWeek) return false;
  return localStart.minutes >= slot.startMin && localEnd.minutes <= slot.endMin;
}
