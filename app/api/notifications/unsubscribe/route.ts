// DELETE /api/notifications/unsubscribe
// Remove push subscription from user's reminder preferences

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { upsertReminderPreferences } from "@/lib/supabase-queries";

export async function DELETE(request: NextRequest) {
  try {
    console.log("🗑️ Processing push notification unsubscribe...");

    // Get user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.log("❌ Unauthorized unsubscribe attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(
      `📱 Unsubscribing user ${session.user.id} from push notifications`
    );

    // Update reminder preferences to remove subscription
    const reminderPreferences = await upsertReminderPreferences(
      session.user.id,
      {
        pushSubscription: null,
        reminderEnabled: false,
      }
    );

    console.log("✅ Push subscription removed successfully:", {
      userId: session.user.id,
      reminderEnabled: reminderPreferences.reminderEnabled,
    });

    return NextResponse.json({
      success: true,
      message: "Push subscription removed successfully",
      preferences: {
        reminderEnabled: reminderPreferences.reminderEnabled,
        reminderTime: reminderPreferences.reminderTime,
        timezone: reminderPreferences.timezone,
      },
    });
  } catch (error) {
    console.error("❌ Error removing push subscription:", error);

    return NextResponse.json(
      { error: "Failed to remove subscription" },
      { status: 500 }
    );
  }
}
