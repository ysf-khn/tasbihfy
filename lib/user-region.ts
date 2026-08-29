// User region detection utility
// Picks a sensible default Quran script from the browser's timezone/locale.
// Users can always override it in settings — this only seeds the first value.

import { QuranScript } from "@/lib/quran/types";

// Timezones where IndoPak script is the norm (includes legacy tz aliases
// some browsers still report, e.g. Asia/Calcutta, Asia/Dacca)
export const INDOPAK_TIMEZONES = [
  "Asia/Karachi", // Pakistan
  "Asia/Kolkata", // India
  "Asia/Calcutta", // India (legacy alias)
  "Asia/Dhaka", // Bangladesh
  "Asia/Dacca", // Bangladesh (legacy alias)
  "Asia/Kabul", // Afghanistan
  "Asia/Kathmandu", // Nepal
  "Asia/Katmandu", // Nepal (legacy alias)
] as const;

// Language subtags of the subcontinent — covers the diaspora, whose
// timezone is elsewhere but whose mushaf is still IndoPak
export const INDOPAK_LANGUAGES = [
  "ur", // Urdu
  "hi", // Hindi
  "bn", // Bengali
  "pa", // Punjabi
  "sd", // Sindhi
  "ps", // Pashto
  "ks", // Kashmiri
  "gu", // Gujarati
] as const;

function getTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

function getLanguages(): string[] {
  if (typeof navigator === "undefined") return [];
  const langs = navigator.languages?.length
    ? navigator.languages
    : navigator.language
      ? [navigator.language]
      : [];
  return langs.map((l) => l.toLowerCase());
}

/**
 * Detect if the user is in (or from) the IndoPak region.
 * Timezone is the primary signal; browser language is the fallback so
 * an Urdu/Bengali speaker abroad still gets the script they expect.
 */
export function isIndoPakRegion(): boolean {
  if (typeof window === "undefined") return false;

  const timezone = getTimezone();
  if (
    timezone &&
    INDOPAK_TIMEZONES.includes(timezone as (typeof INDOPAK_TIMEZONES)[number])
  ) {
    return true;
  }

  const languages = getLanguages();
  return languages.some((lang) => {
    const base = lang.split("-")[0];
    const region = lang.split("-")[1];
    if (INDOPAK_LANGUAGES.includes(base as (typeof INDOPAK_LANGUAGES)[number])) {
      return true;
    }
    // e.g. "en-in", "en-pk", "en-bd" — English speakers in the region
    return region === "in" || region === "pk" || region === "bd";
  });
}

/**
 * Get the recommended default script based on user region
 * Returns 'indopak' for the subcontinent, 'uthmani' otherwise
 */
export function getRegionDefaultScript(): QuranScript {
  return isIndoPakRegion() ? "indopak" : "uthmani";
}
