/**
 * Shared helpers for per-day dhikr totals.
 *
 * Dates are keyed by *local* calendar day, not UTC — a dhikr counted at 11pm
 * belongs to that evening, not to tomorrow.
 */

export function localDateString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

/** Consecutive days with any dhikr activity, ending today or yesterday */
export function computeStreak(totals: Record<string, number>): number {
  let streak = 0;
  let offset = (totals[localDateString()] ?? 0) > 0 ? 0 : 1;
  for (;;) {
    const date = localDateString(daysAgo(offset));
    if ((totals[date] ?? 0) > 0) {
      streak++;
      offset++;
    } else {
      break;
    }
  }
  return streak;
}
