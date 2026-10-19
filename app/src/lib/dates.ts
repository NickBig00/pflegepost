/** Date helpers for deadlines. Dates are calendar days ('YYYY-MM-DD') in local time. */

export type DeadlineUrgency = 'overdue' | 'today' | 'soon' | 'week' | 'later';

export function parseDay(isoDay: string): Date {
  const [y, m, d] = isoDay.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysUntil(isoDay: string, today: Date = new Date()): number {
  const ms = parseDay(isoDay).getTime() - startOfDay(today).getTime();
  return Math.round(ms / 86_400_000);
}

export function deadlineUrgency(days: number): DeadlineUrgency {
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 2) return 'soon';
  if (days <= 7) return 'week';
  return 'later';
}

const shortDate = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' });
const longDate = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

/** "12. Nov." */
export function formatShortDate(isoDay: string): string {
  return shortDate.format(parseDay(isoDay));
}

/** "Mittwoch, 12. November" */
export function formatLongDate(isoDay: string): string {
  return longDate.format(parseDay(isoDay));
}

/** Short, calm, never blaming label for a deadline. */
export function deadlineLabel(isoDay: string, today: Date = new Date()): string {
  const days = daysUntil(isoDay, today);
  if (days < -1) return `Seit ${-days} Tagen offen`;
  if (days === -1) return 'Seit gestern offen';
  if (days === 0) return 'Heute';
  if (days === 1) return 'Morgen';
  if (days === 2) return 'Übermorgen';
  if (days <= 7) return `In ${days} Tagen`;
  return `Bis ${formatShortDate(isoDay)}`;
}

/** ISO calendar day `days` from `from` (local time). */
export function isoInDays(days: number, from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map((n) => String(n).padStart(2, '0')).join('-');
}

/** "Heute", "Gestern" or "14. Okt." for when a letter arrived. */
export function receivedLabel(isoDay: string, today: Date = new Date()): string {
  const days = daysUntil(isoDay, today);
  if (days === 0) return 'Heute';
  if (days === -1) return 'Gestern';
  return formatShortDate(isoDay);
}
