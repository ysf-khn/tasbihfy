// GET /api/prayer-log?from=YYYY-MM-DD&to=YYYY-MM-DD — logged prayers in range
// POST /api/prayer-log { date, prayer } — toggle a prayer's logged state

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { togglePrayerLog, getPrayerLogRange } from "@/lib/supabase-queries";


/**
 * Per-user data. Without an explicit directive browsers apply heuristic
 * caching to these responses, which is never right for an authenticated
 * payload.
 */
const PRIVATE_NO_STORE = { "Cache-Control": "private, no-store" } as const;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const toggleSchema = z.object({
  date: z.string().regex(DATE_REGEX),
  prayer: z.enum(["fajr", "dhuhr", "asr", "maghrib", "isha"]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to || !DATE_REGEX.test(from) || !DATE_REGEX.test(to)) {
      return NextResponse.json(
        { error: "from and to (YYYY-MM-DD) are required" },
        { status: 400 }
      );
    }

    const logs = await getPrayerLogRange(session.user.id, from, to);
    return NextResponse.json({ logs }, { headers: PRIVATE_NO_STORE });
  } catch (error) {
    console.error("Prayer log GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = toggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const logged = await togglePrayerLog(
      session.user.id,
      parsed.data.date,
      parsed.data.prayer
    );
    return NextResponse.json({ logged });
  } catch (error) {
    console.error("Prayer log POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
