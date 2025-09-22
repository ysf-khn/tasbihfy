import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic'; // Ensure this route is never cached
export const runtime = 'nodejs'; // Use Node.js runtime for file system access

export async function GET() {
  try {
    // Generate a unique version based on current timestamp and git commit (if available)
    const timestamp = Date.now();
    const gitCommit = process.env.VERCEL_GIT_COMMIT_SHA ||
                      process.env.GIT_COMMIT_SHA ||
                      'dev';
    const version = `${gitCommit.slice(0, 7)}-${timestamp}`;
    const buildTime = new Date().toISOString();

    // Read the service worker file from public directory
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    let swContent = fs.readFileSync(swPath, 'utf-8');

    // Replace the version and build time placeholders
    swContent = swContent.replace(
      /const SW_VERSION = ".*?";/,
      `const SW_VERSION = "${version}";`
    );
    swContent = swContent.replace(
      /const BUILD_TIME = ".*?";/,
      `const BUILD_TIME = "${buildTime}";`
    );

    // Add a comment showing this is dynamically generated
    swContent = `// Dynamically generated at ${buildTime}\n// Version: ${version}\n\n${swContent}`;

    // Return the service worker with proper headers
    return new NextResponse(swContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Service-Worker-Version': version,
        'X-Build-Time': buildTime,
        // Allow service worker to control the page immediately
        'Service-Worker-Allowed': '/',
      },
    });
  } catch (error) {
    console.error('Error generating dynamic service worker:', error);

    // Fallback: Return a minimal service worker if there's an error
    const fallbackSW = `
// Fallback Service Worker - Error loading dynamic version
const SW_VERSION = "fallback-${Date.now()}";
const BUILD_TIME = "${new Date().toISOString()}";

self.addEventListener('install', () => {
  console.log('[SW] Fallback service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('[SW] Fallback service worker activated');
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests
  event.respondWith(fetch(event.request));
});
`;

    return new NextResponse(fallbackSW, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}