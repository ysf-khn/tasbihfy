// User region detection utility
// Uses browser timezone to detect if user is in IndoPak region

import { QuranScript } from "@/lib/quran/types";

// Timezones where IndoPak script is preferred
export const INDOPAK_TIMEZONES = [
  "Asia/Karachi", // Pakistan
  "Asia/Kolkata", // India
  "Asia/Dhaka", // Bangladesh
] as const;

/**
 * Detect if user is in IndoPak region based on browser timezone
 */
export function isIndoPakRegion(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return INDOPAK_TIMEZONES.includes(
      timezone as (typeof INDOPAK_TIMEZONES)[number]
    );
  } catch {
    return false;
  }
}

/**
 * Get the recommended default script based on user region
 * Returns 'indopak' for India/Pakistan/Bangladesh, 'uthmani' otherwise
 */
export function getRegionDefaultScript(): QuranScript {
  return isIndoPakRegion() ? "indopak" : "uthmani";
}
