import {
  getCachedPrayerTimes,
  getLatestPrayerCache,
  cachePrayerTimes,
  deleteOldPrayerCache,
} from "@/lib/supabase-queries";
import {
  AladhanTimings,
  computeQiblaDirection,
  fetchPrayerTimings,
  parseCoordinates,
  resolveLocation,
} from "@/lib/prayer/aladhan";
import {
  approximateLocalDate,
  dateFromLocalDateString,
  localDateInTimeZone,
  prayerCacheKey,
  utcDateString,
} from "@/lib/prayer/location";
import {
  CalculationRules,
  getCalculationRules,
  getMethodName,
  getSchoolName,
} from "@/lib/prayer/calculation-methods";
import {
  CalculationInfo,
  PrayerTimesData,
  ResolvedLocation,
} from "@/types/prayer";
import { PrayerTimeCache } from "@/types/models";

/**
 * The prayer-times computation, lifted out of the route handler so the
 * statically generated /prayer-times/[country]/[city] pages can render the
 * times into their HTML instead of fetching them from the browser. Those pages
 * exist to rank for "prayer times in <city>" and were serving crawlers a
 * spinner.
 */

/** Caller supplied neither a location name nor a usable coordinate pair. */
export class InvalidLocationError extends Error {}

export interface PrayerTimesInput {
  /** Saved city name or free-text query. */
  location?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  /** The caller's IANA zone, when it knows it. Everything else is a guess. */
  timezone?: string | null;
  /**
   * A location the caller already knows, which skips the reverse geocode
   * entirely. The city pages use this: they carry name/country/countryCode in
   * `data/cities.ts`, and the country code is what picks the calculation
   * method and the Hanafi asr school, so it must not be guessed.
   */
  known?: {
    name: string;
    country?: string | null;
    countryCode?: string | null;
  } | null;
}

function describeRules(rules: CalculationRules): CalculationInfo {
  return {
    methodName: getMethodName(rules.method),
    schoolName: getSchoolName(rules.school),
  };
}

function buildPrayers(times: {
  fajr: string;
  shurooq: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}) {
  return [
    { name: "fajr", time: times.fajr, arabicName: "الفجر" },
    { name: "shurooq", time: times.shurooq, arabicName: "الشروق" },
    { name: "dhuhr", time: times.dhuhr, arabicName: "الظهر" },
    { name: "asr", time: times.asr, arabicName: "العصر" },
    { name: "maghrib", time: times.maghrib, arabicName: "المغرب" },
    { name: "isha", time: times.isha, arabicName: "العشاء" },
  ];
}

function fromCache(
  cached: PrayerTimeCache,
  displayName: string,
  dateStr: string
): PrayerTimesData {
  return {
    location: {
      name: displayName,
      latitude: cached.latitude || "",
      longitude: cached.longitude || "",
      country: cached.country || "",
      countryCode: cached.countryCode || "",
      timezone: cached.timezone || "",
    },
    date: dateStr,
    prayers: buildPrayers(cached),
    qiblaDirection: cached.qiblaDirection || "",
    sunrise: cached.shurooq,
    hijri: cached.hijri as PrayerTimesData["hijri"],
    // Re-derived rather than stored: the rules are a pure function of the
    // country, which the cache row already carries.
    calculation: describeRules(getCalculationRules(cached.countryCode)),
  };
}

export async function getPrayerTimes(
  input: PrayerTimesInput
): Promise<PrayerTimesData> {
  const {
    location = null,
    latitude,
    longitude,
    timezone: tzInput,
    known = null,
  } = input;

  // Coordinates are the primary path; `location` stays supported for saved
  // city names and the static /prayer-times/[country]/[city] pages.
  let cacheKey: string;
  let coords: { latitude: number; longitude: number } | null = null;

  if (latitude != null && longitude != null && latitude !== "" && longitude !== "") {
    coords = parseCoordinates(`${latitude},${longitude}`);
    if (!coords) {
      throw new InvalidLocationError("Invalid latitude/longitude");
    }
    // Rounded to ~1.1 km. Raw GPS precision gave every device its own key,
    // so the cache never hit and the table grew a row per device per day.
    cacheKey = prayerCacheKey(coords.latitude, coords.longitude);
  } else if (location) {
    cacheKey = location;
  } else {
    throw new InvalidLocationError(
      "A location or latitude/longitude pair is required"
    );
  }

  // One read serves two purposes: the row may already be today's, and if it
  // isn't it still carries the timezone and city label for this location,
  // which is what keeps Nominatim off the hot path.
  let latest: PrayerTimeCache | null = null;
  try {
    latest = await getLatestPrayerCache(cacheKey);
  } catch (error) {
    console.warn("Prayer times cache read failed:", error);
  }

  // A real display label from a previous day, if there is one. Rows written
  // before `locationName` existed have none, and a row whose name is just the
  // cache key is one this fallback previously wrote — treat both as missing so
  // the location gets geocoded once and the row self-heals, rather than
  // serving "24.86,67.00" as a city name forever.
  const cachedLabel =
    latest?.locationName && latest.locationName !== cacheKey
      ? latest.locationName
      : location ?? null;

  // "Today" has to be the user's today, not the server's. Anchoring to UTC
  // gave everyone east of UTC yesterday's Hijri date until UTC midnight.
  const timezone =
    (tzInput && localDateInTimeZone(tzInput) ? tzInput : null) ??
    latest?.timezone ??
    null;

  let localDate =
    localDateInTimeZone(timezone) ??
    (coords ? approximateLocalDate(coords.longitude) : utcDateString());
  let today = dateFromLocalDateString(localDate);

  const cachedToday =
    latest && latest.date.toISOString().split("T")[0] === localDate
      ? latest
      : null;

  if (cachedToday) {
    return fromCache(cachedToday, cachedLabel ?? cacheKey, localDate);
  }

  let resolved: ResolvedLocation;
  if (known && coords) {
    resolved = {
      name: known.name,
      latitude: coords.latitude,
      longitude: coords.longitude,
      country: known.country ?? null,
      countryCode: known.countryCode ?? null,
    };
  } else if (cachedLabel && latest?.latitude && latest?.longitude) {
    // Already geocoded on an earlier day, so reuse it: the reverse lookup
    // only supplies labels and the country code, and neither moves.
    resolved = {
      name: cachedLabel,
      latitude: Number(latest.latitude),
      longitude: Number(latest.longitude),
      country: latest.country,
      countryCode: latest.countryCode,
    };
  } else if (coords) {
    resolved = await resolveLocation(`${coords.latitude},${coords.longitude}`);
  } else {
    resolved = await resolveLocation(location!);
  }

  const rules = getCalculationRules(resolved.countryCode);

  let timings: AladhanTimings = await fetchPrayerTimings(
    resolved.latitude,
    resolved.longitude,
    today,
    rules
  );

  // Aladhan reports the location's real timezone. If the date we guessed from
  // longitude disagrees with it, redo the day: the timings barely move, but
  // the Hijri date would be off by one, which matters for fasting days.
  const reportedDate = localDateInTimeZone(timings.timezone);
  if (reportedDate && reportedDate !== localDate) {
    localDate = reportedDate;
    today = dateFromLocalDateString(localDate);

    let corrected: PrayerTimeCache | null = null;
    try {
      corrected = await getCachedPrayerTimes(cacheKey, today);
    } catch (error) {
      console.warn("Prayer times cache read failed:", error);
    }

    if (corrected) {
      return fromCache(
        corrected,
        location ?? corrected.locationName ?? resolved.name,
        localDate
      );
    }

    timings = await fetchPrayerTimings(
      resolved.latitude,
      resolved.longitude,
      today,
      rules
    );
  }

  // Pure spherical trigonometry, not an upstream request.
  const qiblaDirection = computeQiblaDirection(
    resolved.latitude,
    resolved.longitude
  );

  try {
    await cachePrayerTimes({
      locationQuery: cacheKey,
      date: today,
      fajr: timings.fajr,
      shurooq: timings.shurooq,
      dhuhr: timings.dhuhr,
      asr: timings.asr,
      maghrib: timings.maghrib,
      isha: timings.isha,
      locationName: resolved.name,
      qiblaDirection,
      latitude: String(resolved.latitude),
      longitude: String(resolved.longitude),
      timezone: timings.timezone,
      country: resolved.country,
      countryCode: resolved.countryCode,
      hijri: timings.hijri as unknown as Record<string, unknown> | null,
      raw: timings.raw as unknown as Record<string, string>,
    });

    // Clean up old cache entries for this location (keep only today's data)
    await deleteOldPrayerCache(cacheKey, today);
  } catch (error) {
    console.warn("Prayer times cache write failed:", error);
  }

  return {
    location: {
      name: location ?? resolved.name,
      latitude: String(resolved.latitude),
      longitude: String(resolved.longitude),
      country: resolved.country ?? "",
      countryCode: resolved.countryCode ?? "",
      timezone: timings.timezone ?? "",
    },
    date: localDate,
    prayers: buildPrayers(timings),
    qiblaDirection,
    sunrise: timings.shurooq,
    calculation: describeRules(rules),
    hijri: timings.hijri,
  };
}
