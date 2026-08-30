import { NextRequest, NextResponse } from "next/server";
import { UpstreamError } from "@/lib/prayer/aladhan";
import {
  InvalidLocationError,
  getPrayerTimes,
} from "@/lib/prayer/prayer-times-service";

/**
 * Thin HTTP wrapper. The computation lives in the service so the statically
 * generated city pages can call it directly instead of round-tripping through
 * this route from the browser.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const data = await getPrayerTimes({
      location: searchParams.get("location"),
      latitude: searchParams.get("latitude"),
      longitude: searchParams.get("longitude"),
      timezone: searchParams.get("tz"),
    });

    return NextResponse.json(data, {
      headers: {
        // Per-user by location and day; never store it in a shared cache.
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof InvalidLocationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

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
