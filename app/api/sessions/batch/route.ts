import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDhikrByIdSimple,
  getActiveSession,
  createDhikrSession,
  updateDhikrSession,
} from "@/lib/supabase-queries";
import { z } from "zod";

const updateSchema = z.object({
  type: z.enum(["session_update", "session_create"]),
  sessionId: z.string().optional(),
  dhikrId: z.string(),
  count: z.number().int().min(0),
  timestamp: z.number(),
  completed: z.boolean().optional(),
});

const batchSchema = z.object({
  updates: z.array(updateSchema),
});

interface BatchResult {
  success: boolean;
  index: number;
  sessionId?: string;
  error?: string;
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
    const { updates } = batchSchema.parse(body);

    if (updates.length === 0) {
      return NextResponse.json({ results: [], success: true });
    }

    const results: BatchResult[] = [];

    // Process updates sequentially to maintain order
    // Group by dhikrId to optimize
    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];

      try {
        if (update.type === "session_create") {
          // Verify dhikr belongs to user
          const dhikr = await getDhikrByIdSimple(
            update.dhikrId,
            session.user.id
          );

          if (!dhikr) {
            results.push({
              success: false,
              index: i,
              error: "Dhikr not found",
            });
            continue;
          }

          // Check for existing active session
          const existing = await getActiveSession(
            update.dhikrId,
            session.user.id
          );

          if (existing) {
            // Update existing instead of creating
            const updated = await updateDhikrSession(
              existing.id,
              session.user.id,
              {
                currentCount: update.count,
                completed:
                  update.completed ?? update.count >= dhikr.targetCount,
                completedAt:
                  (update.completed ?? update.count >= dhikr.targetCount) &&
                  !existing.completed
                    ? new Date()
                    : existing.completedAt,
              }
            );

            results.push({
              success: true,
              index: i,
              sessionId: updated.id,
            });
          } else {
            // Create new session
            const created = await createDhikrSession({
              dhikrId: update.dhikrId,
              userId: session.user.id,
              currentCount: update.count,
              completed: update.completed ?? update.count >= dhikr.targetCount,
            });

            results.push({
              success: true,
              index: i,
              sessionId: created.id,
            });
          }
        } else if (update.type === "session_update" && update.sessionId) {
          // Get dhikr for target check
          const dhikr = await getDhikrByIdSimple(
            update.dhikrId,
            session.user.id
          );

          if (!dhikr) {
            results.push({
              success: false,
              index: i,
              error: "Dhikr not found",
            });
            continue;
          }

          // Get current session to check completion state
          const currentSession = await getActiveSession(
            update.dhikrId,
            session.user.id
          );

          const isCompleted =
            update.completed ?? update.count >= dhikr.targetCount;
          const completedAt =
            isCompleted && currentSession && !currentSession.completed
              ? new Date()
              : currentSession?.completedAt ?? null;

          const updated = await updateDhikrSession(
            update.sessionId,
            session.user.id,
            {
              currentCount: update.count,
              completed: isCompleted,
              completedAt,
            }
          );

          results.push({
            success: true,
            index: i,
            sessionId: updated.id,
          });
        } else {
          results.push({
            success: false,
            index: i,
            error: "Invalid update type or missing sessionId",
          });
        }
      } catch (error) {
        console.error(`Batch update ${i} failed:`, error);
        results.push({
          success: false,
          index: i,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const allSuccess = results.every((r) => r.success);
    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: allSuccess,
      processed: updates.length,
      succeeded: successCount,
      failed: updates.length - successCount,
      results,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Batch sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
