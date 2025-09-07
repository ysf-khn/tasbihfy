// GET /api/notifications/vapid
// Return VAPID public key for client-side subscription

import { NextRequest, NextResponse } from "next/server";
import { getVapidPublicKey, isVapidConfigured } from "@/lib/notifications/push-service";

export async function GET(request: NextRequest) {
  try {
    console.log("🔑 Getting VAPID public key...");
    
    // Check if VAPID is properly configured
    if (!isVapidConfigured()) {
      console.error("❌ VAPID is not properly configured");
      return NextResponse.json(
        { error: "Push notifications are not configured on this server" },
        { status: 503 }
      );
    }

    const publicKey = getVapidPublicKey();
    
    console.log("✅ VAPID public key retrieved successfully");
    
    return NextResponse.json({
      success: true,
      publicKey: publicKey,
    });

  } catch (error) {
    console.error("❌ Error getting VAPID public key:", error);
    
    return NextResponse.json(
      { error: "Failed to get VAPID public key" },
      { status: 500 }
    );
  }
}