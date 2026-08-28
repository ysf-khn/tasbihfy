/** Raw shape of https://api.aladhan.com/v1/timings */
export interface AladhanTimingsResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Sunset: string;
      Maghrib: string;
      Isha: string;
      Imsak: string;
      Midnight: string;
    };
    date: {
      readable: string;
      gregorian: { date: string };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: { id: number; name: string };
    };
  };
}

/** Raw shape of https://api.aladhan.com/v1/qibla/{lat}/{lng} */
export interface AladhanQiblaResponse {
  code: number;
  status: string;
  data: {
    latitude: number;
    longitude: number;
    direction: number;
  };
}

/** Which ruleset produced the times, surfaced to the user for trust. */
export interface CalculationInfo {
  methodName: string;
  schoolName: string;
}

/** A location string resolved to coordinates plus display labels. */
export interface ResolvedLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string | null;
  countryCode: string | null;
}

export interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
  isPast: boolean;
  isNext: boolean;
  isCurrent: boolean;
}

export interface LocationData {
  name: string;
  latitude: string;
  longitude: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
}

export interface PrayerTimesData {
  location: LocationData;
  date: string;
  prayers: PrayerTime[];
  qiblaDirection: string;
  sunrise: string;
  /** Optional: absent from PrayerTimesData cached in localStorage before this shipped. */
  calculation?: CalculationInfo;
}

export type PrayerName = 'fajr' | 'shurooq' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYER_NAMES: Record<PrayerName, { english: string; arabic: string }> = {
  fajr: { english: 'Fajr', arabic: 'الفجر' },
  shurooq: { english: 'Sunrise', arabic: 'الشروق' },
  dhuhr: { english: 'Dhuhr', arabic: 'الظهر' },
  asr: { english: 'Asr', arabic: 'العصر' },
  maghrib: { english: 'Maghrib', arabic: 'المغرب' },
  isha: { english: 'Isha', arabic: 'العشاء' },
};