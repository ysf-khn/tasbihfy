// GET /api/notifications/test
// Send a test notification to verify setup

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { sendTestNotification, validatePushSubscription } from "@/lib/notifications/push-service";
import { getRandomAyah, getFallbackAyah } from "@/lib/notifications/random-ayah";

// Rate limiting for test notifications
const testNotificationLimits = new Map<string, number>();
const RATE_LIMIT_DURATION = 60 * 1000; // 1 minute
const MAX_TESTS_PER_MINUTE = 3;

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Processing test notification request...");
    
    // Get user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.log("❌ Unauthorized test notification request");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check rate limiting
    const userId = session.user.id;
    const now = Date.now();
    const userLimitKey = `test_notification_${userId}`;
    
    const lastRequestTime = testNotificationLimits.get(userLimitKey);
    if (lastRequestTime && (now - lastRequestTime) < RATE_LIMIT_DURATION) {
      console.log(`❌ Rate limited test notification for user: ${userId}`);
      return NextResponse.json(
        { 
          error: "Rate limited. Please wait before sending another test notification.",
          retryAfter: RATE_LIMIT_DURATION - (now - lastRequestTime),
        },
        { status: 429 }
      );
    }

    // Update rate limit
    testNotificationLimits.set(userLimitKey, now);

    // Get user's reminder preferences
    const reminderPreferences = await prisma.reminderPreferences.findUnique({
      where: { userId: userId },
    });

    if (!reminderPreferences?.pushSubscription) {
      console.log("❌ No push subscription found for test");
      return NextResponse.json(
        { error: "No push subscription found. Please enable notifications first." },
        { status: 400 }
      );
    }

    // Validate subscription
    if (!validatePushSubscription(reminderPreferences.pushSubscription)) {
      console.log("❌ Invalid push subscription format for test");
      return NextResponse.json(
        { error: "Invalid push subscription. Please re-enable notifications." },
        { status: 400 }
      );
    }

    console.log(`🧪 Sending test notification to user: ${userId}`);

    // Get a random ayah for the test
    let ayah;
    try {
      ayah = await getRandomAyah();
    } catch (error) {
      console.warn("⚠️ Failed to get random ayah for test, using fallback");
      ayah = getFallbackAyah();
    }

    // Send test notification
    const success = await sendTestNotification(
      reminderPreferences.pushSubscription as any,
      ayah
    );

    if (success) {
      console.log("✅ Test notification sent successfully");
      return NextResponse.json({
        success: true,
        message: "Test notification sent successfully!",
        ayah: {
          verseKey: ayah.verseKey,
          translation: ayah.translation.substring(0, 100) + (ayah.translation.length > 100 ? "..." : ""),
        },
      });
    } else {
      console.log("❌ Failed to send test notification");
      return NextResponse.json(
        { error: "Failed to send test notification. Please check your notification settings." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("❌ Error sending test notification:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}