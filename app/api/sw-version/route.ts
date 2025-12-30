import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = Date.now();
  const gitCommit = process.env.VERCEL_GIT_COMMIT_SHA ||
                    process.env.GIT_COMMIT_SHA ||
                    'dev';
  const version = `${gitCommit.slice(0, 7)}-${timestamp}`;
  const buildTime = new Date().toISOString();

  return NextResponse.json({
    version,
    buildTime,
    timestamp,
    gitCommit,
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}