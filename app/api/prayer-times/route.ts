import { NextRequest, NextResponse } from "next/server";
import {
  getCachedPrayerTimes,
  cachePrayerTimes,
  deleteOldPrayerCache,
} from "@/lib/supabase-queries";
import {
  UpstreamError,
  fetchPrayerTimings,
  fetchQiblaDirection,
  parseCoordinates,
  resolveLocation,
} from "@/lib/prayer/aladhan";
import {
  CalculationRules,
  getCalculationRules,
  getMethodName,
  getSchoolName,
} from "@/lib/prayer/calculation-methods";
import { CalculationInfo, ResolvedLocation } from "@/types/prayer";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const latParam = searchParams.get("latitude");
    const lonParam = searchParams.get("longitude");

    // Coordinates are the primary path; `location` stays supported for saved
    // city names and the static /prayer-times/[country]/[city] pages.
    let cacheKey: string;
    if (latParam && lonParam) {
      cacheKey = `${latParam},${lonParam}`;
    } else if (location) {
      cacheKey = location;
    } else {
      return NextResponse.json(
        { error: "A location or latitude/longitude pair is required" },
        { status: 400 }
      );
    }

    // Anchor to UTC midnight so the cache key survives round-tripping through
    // toISOString() regardless of the server's local timezone.
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const dateStr = today.toISOString().split("T")[0];

    // The cache is an optimization, not a dependency: if the database is
    // unreachable we still serve live prayer times.
    let cachedData = null;
    try {
      cachedData = await getCachedPrayerTimes(cacheKey, today);
    } catch (error) {
      console.warn("Prayer times cache read failed:", error);
    }

    if (cachedData) {
      return NextResponse.json({
        location: {
          name: location ?? cacheKey,
          latitude: cachedData.latitude || "",
          longitude: cachedData.longitude || "",
          country: cachedData.country || "",
          countryCode: cachedData.countryCode || "",
          timezone: cachedData.timezone || "",
        },
        date: dateStr,
        prayers: buildPrayers(cachedData),
        qiblaDirection: cachedData.qiblaDirection || "",
        sunrise: cachedData.shurooq,
        hijri: cachedData.hijri ?? null,
        // Re-derived rather than stored: the rules are a pure function of the
        // country, which the cache row already carries.
        calculation: describeRules(
          getCalculationRules(cachedData.countryCode)
        ),
      });
    }

    let resolved: ResolvedLocation;
    if (latParam && lonParam) {
      const coords = parseCoordinates(`${latParam},${lonParam}`);
      if (!coords) {
        return NextResponse.json(
          { error: "Invalid latitude/longitude" },
          { status: 400 }
        );
      }
      // Reuse the reverse-geocode branch to fill in city/country labels.
      resolved = await resolveLocation(`${coords.latitude},${coords.longitude}`);
    } else {
      resolved = await resolveLocation(location!);
    }

    const rules = getCalculationRules(resolved.countryCode);

    const [timings, qiblaDirection] = await Promise.all([
      fetchPrayerTimings(resolved.latitude, resolved.longitude, today, rules),
      fetchQiblaDirection(resolved.latitude, resolved.longitude),
    ]);

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

    return NextResponse.json({
      location: {
        name: location ?? resolved.name,
        latitude: String(resolved.latitude),
        longitude: String(resolved.longitude),
        country: resolved.country ?? "",
        countryCode: resolved.countryCode ?? "",
        timezone: timings.timezone ?? "",
      },
      date: dateStr,
      prayers: buildPrayers(timings),
      qiblaDirection: qiblaDirection ?? "",
      sunrise: timings.shurooq,
      calculation: describeRules(rules),
      hijri: timings.hijri,
    });
  } catch (error) {
    if (error instanceof UpstreamError) {
      // Surface third-party failures as a gateway error rather than passing the
      // upstream status through, which made outages look like a missing route.
      console.error("Prayer times upstream error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    console.error("Prayer times API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
