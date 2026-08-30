/**
 * Cache-key and local-date helpers shared by the prayer-times route and the
 * reminder cron. Both must agree byte-for-byte or they cache past each other.
 */

/**
 * Raw GPS precision made every device its own cache key, so the cache almost
 * never hit and PrayerTimeCache grew a row per device per day. Two decimals is
 * ~1.1 km, far inside the tolerance of a prayer-time calculation.
 */
export function roundCoordinate(value: string | number): string {
  return Number(value).toFixed(2);
}

export function prayerCacheKey(
  latitude: string | number,
  longitude: string | number
): string {
  return `${roundCoordinate(latitude)},${roundCoordinate(longitude)}`;
}

/** "YYYY-MM-DD" in the given IANA zone, or null if the zone is unusable. */
export function localDateInTimeZone(
  timeZone: string | null | undefined,
  now: Date = new Date()
): string | null {
  if (!timeZone) return null;

  try {
    // en-CA formats as YYYY-MM-DD.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    return null;
  }
}

/**
 * Solar-offset fallback for when no timezone is known yet. Political zones can
 * sit up to ~3 hours off solar time, so this is only a starting guess: the
 * route re-checks the date against the timezone Aladhan reports.
 */
export function approximateLocalDate(
  longitude: number,
  now: Date = new Date()
): string {
  const offsetMs = Math.round(longitude / 15) * 60 * 60 * 1000;
  return new Date(now.getTime() + offsetMs).toISOString().split("T")[0];
}

/** UTC midnight of a "YYYY-MM-DD" string, which is what the cache layer wants. */
export function dateFromLocalDateString(localDate: string): Date {
  const [year, month, day] = localDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function utcDateString(now: Date = new Date()): string {
  return now.toISOString().split("T")[0];
}
