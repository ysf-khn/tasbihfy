// GET /api/prayer-times/monthly?location=...&month=8&year=2026
// Full-month prayer timetable. CDN-cached for a day; no DB cache.

import { NextRequest, NextResponse } from "next/server";
import {
  UpstreamError,
  fetchMonthlyCalendar,
  parseCoordinates,
  resolveLocation,
} from "@/lib/prayer/aladhan";
import { getCalculationRules } from "@/lib/prayer/calculation-methods";
import { ResolvedLocation } from "@/types/prayer";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const latParam = searchParams.get("latitude");
    const lonParam = searchParams.get("longitude");

    const now = new Date();
    const month = Number(searchParams.get("month") ?? now.getUTCMonth() + 1);
    const year = Number(searchParams.get("year") ?? now.getUTCFullYear());

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      return NextResponse.json(
        { error: "Invalid month or year" },
        { status: 400 }
      );
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
      resolved = await resolveLocation(`${coords.latitude},${coords.longitude}`);
    } else if (location) {
      resolved = await resolveLocation(location);
    } else {
      return NextResponse.json(
        { error: "A location or latitude/longitude pair is required" },
        { status: 400 }
      );
    }

    const rules = getCalculationRules(resolved.countryCode);
    const days = await fetchMonthlyCalendar(
      resolved.latitude,
      resolved.longitude,
      month,
      year,
      rules
    );

    return NextResponse.json(
      {
        location: {
          name: location ?? resolved.name,
          latitude: String(resolved.latitude),
          longitude: String(resolved.longitude),
          country: resolved.country ?? "",
          countryCode: resolved.countryCode ?? "",
        },
        month,
        year,
        days,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    if (error instanceof UpstreamError) {
      console.error("Monthly prayer times upstream error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    console.error("Monthly prayer times API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
