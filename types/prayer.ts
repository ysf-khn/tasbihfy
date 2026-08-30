/** Hijri date as returned by Aladhan (day/year are strings on the wire) */
export interface AladhanHijriDate {
  date: string;
  day: string;
  year: string;
  month: { number: number; en: string; ar: string };
}

/** App-facing hijri date */
export interface HijriDate {
  day: number;
  year: number;
  monthNumber: number;
  monthEn: string;
  monthAr: string;
}

/** 24-hour prayer timings, used for notification scheduling */
export interface RawPrayerTimings {
  fajr: string;
  shurooq: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

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
      hijri: AladhanHijriDate;
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
  /**
   * Optional because the API has never sent these: they are derived from the
   * current clock, which only the client knows. PrayerTimesList computes them
   * locally rather than reading them off the payload.
   */
  isPast?: boolean;
  isNext?: boolean;
  isCurrent?: boolean;
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
  /** Optional: absent from older cached payloads. */
  hijri?: HijriDate | null;
}

/** One day in the monthly timetable */
export interface MonthlyTimetableDay {
  gregorianDate: string; // YYYY-MM-DD
  hijri: HijriDate | null;
  timings: RawPrayerTimings; // formatted 12-hour display strings
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