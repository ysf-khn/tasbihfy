// POST /api/cron/send-reminders
// Push notifications temporarily disabled for Cloudflare Pages migration

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Notifications temporarily disabled
  return NextResponse.json({
    success: true,
    message: "Push notifications temporarily disabled",
    stats: { eligible: 0, sent: 0, failed: 0 },
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
