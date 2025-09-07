// GET/PUT /api/notifications/preferences
// Get and update user's reminder preferences

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for preferences update
const preferencesSchema = z.object({
  reminderEnabled: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  timezone: z.string().optional(),
});

// GET: Retrieve user's current reminder preferences
export async function GET(request: NextRequest) {
  try {
    console.log("📄 Getting user reminder preferences...");

    // Get user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.log("❌ Unauthorized preferences access");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's reminder preferences
    const reminderPreferences = await prisma.reminderPreferences.findUnique({
      where: { userId: session.user.id },
    });

    const preferences = {
      reminderEnabled: reminderPreferences?.reminderEnabled || false,
      reminderTime: reminderPreferences?.reminderTime || "09:00",
      timezone: reminderPreferences?.timezone || "UTC",
      hasSubscription: !!reminderPreferences?.pushSubscription,
      lastReminderSent: reminderPreferences?.lastReminderSent,
    };

    console.log(
      "✅ Retrieved preferences for user:",
      session.user.id,
      preferences
    );

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("❌ Error getting reminder preferences:", error);
    return NextResponse.json(
      { error: "Failed to get preferences" },
      { status: 500 }
    );
  }
}

// PUT: Update user's reminder preferences
export async function PUT(request: NextRequest) {
  try {
    console.log("📝 Updating user reminder preferences...");

    // Get user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.log("❌ Unauthorized preferences update");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = preferencesSchema.parse(body);

    const { reminderEnabled, reminderTime, timezone } = validatedData;

    console.log(
      `📱 Updating preferences for user ${session.user.id}:`,
      validatedData
    );

    // Update reminder preferences
    const reminderPreferences = await prisma.reminderPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        ...(reminderEnabled !== undefined && { reminderEnabled }),
        ...(reminderTime && { reminderTime }),
        ...(timezone && { timezone }),
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        reminderEnabled: reminderEnabled ?? false,
        reminderTime: reminderTime || "09:00",
        timezone: timezone || "UTC",
      },
    });

    console.log("✅ Preferences updated successfully:", {
      userId: session.user.id,
      reminderEnabled: reminderPreferences.reminderEnabled,
      reminderTime: reminderPreferences.reminderTime,
      timezone: reminderPreferences.timezone,
    });

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
      preferences: {
        reminderEnabled: reminderPreferences.reminderEnabled,
        reminderTime: reminderPreferences.reminderTime,
        timezone: reminderPreferences.timezone,
        hasSubscription: !!reminderPreferences.pushSubscription,
        lastReminderSent: reminderPreferences.lastReminderSent,
      },
    });
  } catch (error) {
    console.error("❌ Error updating reminder preferences:", error);

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
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
