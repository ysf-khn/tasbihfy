// POST /api/cron/send-reminders
// Manual endpoint to trigger daily reminder sending (for testing and manual execution)

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  getRandomAyah,
  getFallbackAyah,
} from "@/lib/notifications/random-ayah";
import {
  sendBatchNotifications,
  validatePushSubscription,
} from "@/lib/notifications/push-service";

// Simple authentication for cron endpoints
const CRON_SECRET = process.env.CRON_SECRET || "your-secret-key";

// Timezone helper functions
function getCurrentTimeInTimezone(timezone: string): string {
  try {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return now.toLocaleTimeString("en-US", options);
  } catch (error) {
    console.error(`❌ Invalid timezone: ${timezone}`, error);
    return new Date().toTimeString().slice(0, 5); // Fallback to UTC
  }
}

function isTimeMatch(currentTime: string, reminderTime: string): boolean {
  return currentTime === reminderTime;
}

function isToday(date: Date | null): boolean {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Manual reminder trigger endpoint called");

    // Simple authentication check
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      console.log("❌ Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for force parameter to send to all users regardless of time/date
    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";

    console.log(
      `📅 Processing ${force ? "forced" : "scheduled"} daily reminders...`
    );

    // Get users with reminder preferences enabled
    const reminderPreferences = await prisma.reminderPreferences.findMany({
      where: {
        reminderEnabled: true,
        pushSubscription: { not: Prisma.JsonNull },
      },
      select: {
        userId: true,
        reminderTime: true,
        timezone: true,
        pushSubscription: true,
        lastReminderSent: true,
      },
    });

    if (reminderPreferences.length === 0) {
      console.log("ℹ️ No users with reminder preferences found");
      return NextResponse.json({
        success: true,
        message: "No users with reminders enabled",
        stats: { eligible: 0, sent: 0, failed: 0 },
      });
    }

    console.log(
      `📱 Found ${reminderPreferences.length} users with reminders enabled`
    );

    // Filter users who should receive reminder now (or all if forced)
    const eligibleUsers = [];

    for (const pref of reminderPreferences) {
      if (!force) {
        // Skip if reminder already sent today
        if (isToday(pref.lastReminderSent)) {
          console.log(
            `⏩ Skipping user ${pref.userId}: reminder already sent today`
          );
          continue;
        }

        // Check if current time matches user's reminder time in their timezone
        const currentTimeInUserTz = getCurrentTimeInTimezone(pref.timezone);

        if (!isTimeMatch(currentTimeInUserTz, pref.reminderTime)) {
          console.log(
            `⏰ Skipping user ${pref.userId}: not their reminder time (${currentTimeInUserTz} != ${pref.reminderTime})`
          );
          continue;
        }
      }

      // Validate push subscription
      if (validatePushSubscription(pref.pushSubscription)) {
        eligibleUsers.push({
          userId: pref.userId,
          pushSubscription: pref.pushSubscription,
          timezone: pref.timezone,
          reminderTime: pref.reminderTime,
        });
        console.log(`✅ User ${pref.userId} eligible for reminder`);
      } else {
        console.log(`⚠️ User ${pref.userId} has invalid push subscription`);
      }
    }

    console.log(
      `🎯 Found ${eligibleUsers.length} users eligible for reminders`
    );

    if (eligibleUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users eligible for reminders at this time",
        stats: { eligible: 0, sent: 0, failed: 0 },
      });
    }

    // Get random ayah for today's reminders
    let ayah;
    try {
      ayah = await getRandomAyah();
      console.log(
        `📖 Using ayah: ${ayah.verseKey} - "${ayah.translation.substring(
          0,
          50
        )}..."`
      );
    } catch (error) {
      console.warn("⚠️ Failed to get random ayah, using fallback");
      ayah = getFallbackAyah();
    }

    // Extract push subscriptions
    const subscriptions = eligibleUsers.map((user) => user.pushSubscription);

    // Send notifications in batches
    const result = await sendBatchNotifications(subscriptions, ayah, 5);

    console.log("📊 Reminder batch results:", result);

    // Update lastReminderSent for successful notifications
    const successfulUserIds = eligibleUsers
      .filter(
        (_, index) =>
          !result.expiredSubscriptions.includes(subscriptions[index])
      )
      .map((user) => user.userId);

    if (successfulUserIds.length > 0) {
      await prisma.reminderPreferences.updateMany({
        where: { userId: { in: successfulUserIds } },
        data: { lastReminderSent: new Date() },
      });
      console.log(
        `✅ Updated lastReminderSent for ${successfulUserIds.length} users`
      );
    }

    // Handle expired subscriptions
    if (result.expiredSubscriptions.length > 0) {
      console.log(
        `🧹 Cleaning up ${result.expiredSubscriptions.length} expired subscriptions`
      );

      // Find user IDs for expired subscriptions
      const expiredUserIds = eligibleUsers
        .filter((_, index) =>
          result.expiredSubscriptions.includes(subscriptions[index])
        )
        .map((user) => user.userId);

      // Remove expired subscriptions
      await prisma.reminderPreferences.updateMany({
        where: { userId: { in: expiredUserIds } },
        data: {
          pushSubscription: Prisma.JsonNull,
          reminderEnabled: false,
        },
      });

      console.log(
        `✅ Cleaned up expired subscriptions for ${expiredUserIds.length} users`
      );
    }

    console.log("🎉 Reminder process completed successfully");

    return NextResponse.json({
      success: true,
      message: "Reminders sent successfully",
      stats: {
        eligible: eligibleUsers.length,
        sent: result.successful,
        failed: result.failed,
        expired: result.expiredSubscriptions.length,
      },
      ayah: {
        verseKey: ayah.verseKey,
        translation:
          ayah.translation.substring(0, 100) +
          (ayah.translation.length > 100 ? "..." : ""),
      },
    });
  } catch (error) {
    console.error("❌ Error in reminder endpoint:", error);

    return NextResponse.json(
      {
        error: "Failed to process reminders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also allow GET for testing
export async function GET(request: NextRequest) {
  return POST(request);
}
