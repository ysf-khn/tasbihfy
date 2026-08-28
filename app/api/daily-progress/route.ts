// GET /api/daily-progress?from=YYYY-MM-DD&to=YYYY-MM-DD
// Daily dhikr progress history for the signed-in user

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDailyProgressRange } from "@/lib/supabase-queries";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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

    const progress = await getDailyProgressRange(session.user.id, from, to);
    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Daily progress GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
