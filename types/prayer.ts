export interface PrayerTimesResponse {
  title: string;
  query: string;
  for: string;
  method: number;
  prayer_method_name: string;
  daylight: string;
  timezone: string | number;
  map_image: string;
  sealevel: string;
  today_weather: {
    pressure: number;
    temperature: string;
  };
  link: string;
  qibla_direction: string;
  latitude: string;
  longitude: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  country_code: string;
  items: PrayerTimesItem[];
  status_valid: number;
  status_code: number;
  status_description: string;
}

export interface PrayerTimesItem {
  date_for: string;
  fajr: string;
  shurooq: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
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
  weather: {
    temperature: string;
    pressure: number;
  };
  sunrise: string;
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