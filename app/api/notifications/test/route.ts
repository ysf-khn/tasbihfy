// GET /api/notifications/test
// Push notifications temporarily disabled

import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    message: "Push notifications temporarily disabled",
  });
}
