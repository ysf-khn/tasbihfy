/**
 * Prayer time calculation rules.
 *
 * Two independent axes, both of which visibly change the times:
 *  - `method`  picks the Fajr/Isha twilight angles (a few minutes' spread).
 *  - `school`  picks the Asr shadow ratio. Hanafi runs ~1 hour later than
 *              Standard (Shafi'i/Maliki/Hanbali), so getting this wrong is
 *              immediately obvious to the user.
 *
 * Aladhan has no auto-detect, so we derive both from the country returned by
 * reverse/forward geocoding and fall back to Muslim World League + Standard.
 */

export const ASR_STANDARD = 0;
export const ASR_HANAFI = 1;

export interface CalculationRules {
  method: number;
  school: number;
}

/** Regional prayer-time authority by ISO 3166-1 alpha-2 country code. */
const METHOD_BY_COUNTRY: Record<string, number> = {
  // Indian subcontinent — University of Islamic Sciences, Karachi
  PK: 1, IN: 1, BD: 1, AF: 1, LK: 1, NP: 1,
  // Gulf
  SA: 4, AE: 8, BH: 8, OM: 8, KW: 9, QA: 10,
  // Levant & North Africa
  EG: 5, SD: 5, SY: 5, LY: 5, JO: 23, PS: 23,
  MA: 21, TN: 18, DZ: 19,
  // Southeast Asia
  MY: 17, BN: 17, ID: 20, SG: 11,
  // Turkey, Iran, Central Asia & Caucasus
  TR: 13, IR: 7,
  RU: 14, KZ: 14, KG: 14, UZ: 14, TJ: 14, TM: 14, AZ: 14,
  // Europe & North America
  FR: 12, PT: 22, US: 2, CA: 2,
};

/**
 * Countries where the Hanafi madhhab predominates. Asr is the only prayer
 * this affects.
 */
const HANAFI_COUNTRIES = new Set([
  "PK", "IN", "BD", "AF", "LK", "NP",
  "TR", "RU", "KZ", "KG", "UZ", "TJ", "TM", "AZ",
  "BA", "AL", "MK", "XK",
]);

const DEFAULT_METHOD = 3; // Muslim World League

/** Display names for the methods we can select. */
const METHOD_NAMES: Record<number, string> = {
  0: "Shia Ithna-Ashari",
  1: "University of Islamic Sciences, Karachi",
  2: "Islamic Society of North America",
  3: "Muslim World League",
  4: "Umm Al-Qura University, Makkah",
  5: "Egyptian General Authority of Survey",
  7: "Institute of Geophysics, University of Tehran",
  8: "Gulf Region",
  9: "Kuwait",
  10: "Qatar",
  11: "Majlis Ugama Islam Singapura",
  12: "Union Organization Islamic de France",
  13: "Diyanet İşleri Başkanlığı",
  14: "Spiritual Administration of Muslims of Russia",
  15: "Moonsighting Committee Worldwide",
  16: "Dubai",
  17: "Jabatan Kemajuan Islam Malaysia",
  18: "Tunisia",
  19: "Algeria",
  20: "Kementerian Agama Republik Indonesia",
  21: "Morocco",
  22: "Comunidade Islamica de Lisboa",
  23: "Ministry of Awqaf, Jordan",
};

export function getMethodName(method: number): string {
  return METHOD_NAMES[method] ?? `Method ${method}`;
}

export function getSchoolName(school: number): string {
  return school === ASR_HANAFI ? "Hanafi" : "Standard";
}

/**
 * Pick calculation rules for a country. Env vars act as a global escape hatch
 * for ops; otherwise the country decides.
 */
export function getCalculationRules(
  countryCode: string | null
): CalculationRules {
  const code = countryCode?.toUpperCase();

  const methodOverride = Number(process.env.PRAYER_CALCULATION_METHOD);
  const schoolOverride = Number(process.env.PRAYER_ASR_SCHOOL);

  return {
    method: Number.isInteger(methodOverride)
      ? methodOverride
      : (code ? METHOD_BY_COUNTRY[code] : undefined) ?? DEFAULT_METHOD,
    school: Number.isInteger(schoolOverride)
      ? schoolOverride
      : code && HANAFI_COUNTRIES.has(code)
        ? ASR_HANAFI
        : ASR_STANDARD,
  };
}
