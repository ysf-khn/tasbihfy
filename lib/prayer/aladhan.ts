import {
  AladhanHijriDate,
  AladhanQiblaResponse,
  AladhanTimingsResponse,
  HijriDate,
  MonthlyTimetableDay,
  RawPrayerTimings,
  ResolvedLocation,
} from "@/types/prayer";

import { CalculationRules } from "@/lib/prayer/calculation-methods";

const ALADHAN_BASE = "https://api.aladhan.com/v1";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "DhikrApp/1.0";

export class UpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpstreamError";
  }
}

const COORD_PATTERN = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;

export function parseCoordinates(
  value: string
): { latitude: number; longitude: number } | null {
  const match = value.match(COORD_PATTERN);
  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);

  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  return { latitude, longitude };
}

async function nominatim(path: string): Promise<any> {
  const response = await fetch(`${NOMINATIM_BASE}${path}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new UpstreamError(`Geocoding service returned ${response.status}`);
  }

  return response.json();
}

function cityFrom(address: Record<string, string> | undefined): string | null {
  if (!address) return null;
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.hamlet ||
    address.suburb ||
    address.state_district ||
    address.county ||
    null
  );
}

/**
 * Turn a user-supplied location string into coordinates plus display metadata.
 * Accepts either a place name ("Moradabad") or a "lat,lon" pair, which is what
 * the client falls back to when reverse geocoding fails on its side.
 */
export async function resolveLocation(
  location: string
): Promise<ResolvedLocation> {
  const coords = parseCoordinates(location);

  if (coords) {
    // Coordinates are already usable; the reverse lookup only supplies labels.
    try {
      const data = await nominatim(
        `/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10&addressdetails=1`
      );

      return {
        name: cityFrom(data.address) ?? location,
        latitude: coords.latitude,
        longitude: coords.longitude,
        country: data.address?.country ?? null,
        countryCode: data.address?.country_code?.toUpperCase() ?? null,
      };
    } catch (error) {
      console.warn("Reverse geocoding failed, using raw coordinates:", error);
      return {
        name: location,
        latitude: coords.latitude,
        longitude: coords.longitude,
        country: null,
        countryCode: null,
      };
    }
  }

  const results = await nominatim(
    `/search?format=json&q=${encodeURIComponent(location)}&limit=1&addressdetails=1`
  );

  if (!Array.isArray(results) || results.length === 0) {
    throw new UpstreamError(`Could not find a location named "${location}"`);
  }

  const place = results[0];

  return {
    name: cityFrom(place.address) ?? place.name ?? location,
    latitude: Number(place.lat),
    longitude: Number(place.lon),
    country: place.address?.country ?? null,
    countryCode: place.address?.country_code?.toUpperCase() ?? null,
  };
}

/** Aladhan wants DD-MM-YYYY. Read UTC parts: callers pass a UTC-midnight date. */
function toAladhanDate(date: Date): string {
  return [
    String(date.getUTCDate()).padStart(2, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    date.getUTCFullYear(),
  ].join("-");
}

/**
 * Aladhan returns 24-hour times ("04:29"), sometimes with a timezone suffix.
 * The UI has always rendered lowercase 12-hour times, so normalize to that.
 */
export function format12Hour(time: string): string {
  const [rawHours, rawMinutes] = time.trim().split(" ")[0].split(":");
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return time;

  const period = hours < 12 ? "am" : "pm";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/** Strip an Aladhan timezone suffix, e.g. "04:29 (BST)" -> "04:29" */
function clean24Hour(time: string): string {
  return time.trim().split(" ")[0];
}

function toHijriDate(hijri: AladhanHijriDate | undefined): HijriDate | null {
  if (!hijri?.month) return null;
  return {
    day: Number(hijri.day),
    year: Number(hijri.year),
    monthNumber: hijri.month.number,
    monthEn: hijri.month.en,
    monthAr: hijri.month.ar,
  };
}

export interface AladhanTimings {
  fajr: string;
  shurooq: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  timezone: string | null;
  hijri: HijriDate | null;
  /** 24-hour times ("04:29") for notification scheduling */
  raw: RawPrayerTimings;
}

export async function fetchPrayerTimings(
  latitude: number,
  longitude: number,
  date: Date,
  rules: CalculationRules
): Promise<AladhanTimings> {
  const url =
    `${ALADHAN_BASE}/timings/${toAladhanDate(date)}` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&method=${rules.method}&school=${rules.school}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new UpstreamError(`Prayer times service returned ${response.status}`);
  }

  const body: AladhanTimingsResponse = await response.json();

  if (body.code !== 200 || !body.data?.timings) {
    throw new UpstreamError("Invalid response from prayer times service");
  }

  const { timings, meta, date: dateInfo } = body.data;

  return {
    fajr: format12Hour(timings.Fajr),
    shurooq: format12Hour(timings.Sunrise),
    dhuhr: format12Hour(timings.Dhuhr),
    asr: format12Hour(timings.Asr),
    maghrib: format12Hour(timings.Maghrib),
    isha: format12Hour(timings.Isha),
    timezone: meta?.timezone ?? null,
    hijri: toHijriDate(dateInfo?.hijri),
    raw: {
      fajr: clean24Hour(timings.Fajr),
      shurooq: clean24Hour(timings.Sunrise),
      dhuhr: clean24Hour(timings.Dhuhr),
      asr: clean24Hour(timings.Asr),
      maghrib: clean24Hour(timings.Maghrib),
      isha: clean24Hour(timings.Isha),
    },
  };
}

/** Raw shape of one https://api.aladhan.com/v1/calendar day */
interface AladhanCalendarDay {
  timings: AladhanTimingsResponse["data"]["timings"];
  date: {
    gregorian: { date: string }; // DD-MM-YYYY
    hijri: AladhanHijriDate;
  };
}

/**
 * Full-month timetable from Aladhan /v1/calendar.
 * Returns one entry per day with formatted 12-hour timings and the hijri date.
 */
export async function fetchMonthlyCalendar(
  latitude: number,
  longitude: number,
  month: number,
  year: number,
  rules: CalculationRules
): Promise<MonthlyTimetableDay[]> {
  const url =
    `${ALADHAN_BASE}/calendar/${year}/${month}` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&method=${rules.method}&school=${rules.school}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new UpstreamError(`Prayer calendar service returned ${response.status}`);
  }

  const body: { code: number; data: AladhanCalendarDay[] } =
    await response.json();

  if (body.code !== 200 || !Array.isArray(body.data)) {
    throw new UpstreamError("Invalid response from prayer calendar service");
  }

  return body.data.map((day) => {
    // Aladhan formats gregorian dates as DD-MM-YYYY
    const [dd, mm, yyyy] = day.date.gregorian.date.split("-");
    return {
      gregorianDate: `${yyyy}-${mm}-${dd}`,
      hijri: toHijriDate(day.date.hijri),
      timings: {
        fajr: format12Hour(day.timings.Fajr),
        shurooq: format12Hour(day.timings.Sunrise),
        dhuhr: format12Hour(day.timings.Dhuhr),
        asr: format12Hour(day.timings.Asr),
        maghrib: format12Hour(day.timings.Maghrib),
        isha: format12Hour(day.timings.Isha),
      },
    };
  });
}

/** Qibla is a separate endpoint; a failure here shouldn't sink the whole request. */
export async function fetchQiblaDirection(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `${ALADHAN_BASE}/qibla/${latitude}/${longitude}`
    );

    if (!response.ok) return null;

    const body: AladhanQiblaResponse = await response.json();
    const direction = body.data?.direction;

    return typeof direction === "number" ? direction.toFixed(2) : null;
  } catch (error) {
    console.warn("Qibla lookup failed:", error);
    return null;
  }
}
