// POST /api/notifications/subscribe
// Save push subscription to user's reminder preferences

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { validatePushSubscription } from "@/lib/notifications/push-service";
import { z } from "zod";

// Validation schema for subscription data
const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
  reminderTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  timezone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Processing push notification subscription...");

    // Get user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.log("❌ Unauthorized subscription attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = subscribeSchema.parse(body);

    const { subscription, reminderTime, timezone } = validatedData;

    // Validate push subscription format
    if (!validatePushSubscription(subscription)) {
      console.log("❌ Invalid push subscription format");
      return NextResponse.json(
        { error: "Invalid subscription format" },
        { status: 400 }
      );
    }

    console.log(`📱 Subscribing user ${session.user.id} to push notifications`);

    // Upsert reminder preferences
    const reminderPreferences = await prisma.reminderPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        pushSubscription: subscription,
        reminderTime: reminderTime || undefined,
        timezone: timezone || undefined,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        reminderEnabled: true,
        pushSubscription: subscription,
        reminderTime: reminderTime || "09:00",
        timezone: timezone || "UTC",
      },
    });

    console.log("✅ Push subscription saved successfully:", {
      userId: session.user.id,
      reminderTime: reminderPreferences.reminderTime,
      timezone: reminderPreferences.timezone,
      endpoint: subscription.endpoint.substring(0, 50) + "...",
    });

    return NextResponse.json({
      success: true,
      message: "Push subscription saved successfully",
      preferences: {
        reminderEnabled: reminderPreferences.reminderEnabled,
        reminderTime: reminderPreferences.reminderTime,
        timezone: reminderPreferences.timezone,
      },
    });
  } catch (error) {
    console.error("❌ Error saving push subscription:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}
