import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDhikrByIdSimple,
  getActiveSession,
  getSessionById,
  createDhikrSession,
} from "@/lib/supabase-queries";
import { z } from "zod";

const createSessionSchema = z.object({
  dhikrId: z.string(),
  currentCount: z.number().int().min(0).optional().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dhikrId = searchParams.get("dhikrId");

    if (!dhikrId) {
      return NextResponse.json(
        { error: "dhikrId parameter is required" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First, get the dhikr data (always needed)
    const dhikr = await getDhikrByIdSimple(dhikrId, session.user.id);

    if (!dhikr) {
      return NextResponse.json({ error: "Dhikr not found" }, { status: 404 });
    }

    // Find active session for this dhikr
    const dhikrSession = await getActiveSession(dhikrId, session.user.id);

    // Always return dhikr data, with or without session
    return NextResponse.json({
      session: dhikrSession,
      dhikr: dhikr,
    });
  } catch (error) {
    console.error("Error fetching session by dhikr:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { dhikrId, currentCount } = createSessionSchema.parse(body);

    // Verify the dhikr belongs to the user
    const dhikr = await getDhikrByIdSimple(dhikrId, session.user.id);

    if (!dhikr) {
      return NextResponse.json({ error: "Dhikr not found" }, { status: 404 });
    }

    // Check if there's already an active session
    const existingSession = await getActiveSession(dhikrId, session.user.id);

    if (existingSession) {
      // Need to fetch with dhikr included for consistency
      const sessionWithDhikr = await getSessionById(
        existingSession.id,
        session.user.id
      );
      return NextResponse.json(sessionWithDhikr);
    }

    // Create new session
    const dhikrSession = await createDhikrSession({
      dhikrId,
      userId: session.user.id,
      currentCount,
      completed: currentCount >= dhikr.targetCount,
    });

    return NextResponse.json(dhikrSession, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
