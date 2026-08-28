// GET /api/notifications/test
// Sends a test push notification to the signed-in user's subscription

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  sendTestNotification,
  validatePushSubscription,
  isVapidConfigured,
} from "@/lib/notifications/push-service";
import {
  getReminderPreferences,
  clearPushSubscription,
} from "@/lib/supabase-queries";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isVapidConfigured()) {
      return NextResponse.json(
        { success: false, message: "Push notifications are not configured" },
        { status: 503 }
      );
    }

    const prefs = await getReminderPreferences(session.user.id);
    if (!prefs || !validatePushSubscription(prefs.pushSubscription)) {
      return NextResponse.json(
        { success: false, message: "No push subscription found. Enable notifications first." },
        { status: 400 }
      );
    }

    const result = await sendTestNotification(prefs.pushSubscription);

    if (result.expired) {
      await clearPushSubscription(session.user.id);
      return NextResponse.json(
        { success: false, message: "Subscription expired. Please re-enable notifications." },
        { status: 410 }
      );
    }

    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: `Push service returned ${result.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: "Test notification sent" });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send test notification" },
      { status: 500 }
    );
  }
}
