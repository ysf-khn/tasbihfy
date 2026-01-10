import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionById, updateDhikrSession } from "@/lib/supabase-queries";
import { z } from "zod";

const updateSessionSchema = z.object({
  currentCount: z.number().int().min(0),
  completed: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dhikrSession = await getSessionById(id, session.user.id);

    if (!dhikrSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(dhikrSession);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentCount, completed } = updateSessionSchema.parse(body);

    // Get the session with dhikr info to check completion
    const existingSession = await getSessionById(id, session.user.id);

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Auto-determine completion status based on target
    const isCompleted =
      completed !== undefined
        ? completed
        : currentCount >= existingSession.dhikr.targetCount;

    // Set completion time if just completed
    const completedAt =
      isCompleted && !existingSession.completed
        ? new Date()
        : existingSession.completedAt;

    const updatedSession = await updateDhikrSession(id, session.user.id, {
      currentCount,
      completed: isCompleted,
      completedAt,
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
