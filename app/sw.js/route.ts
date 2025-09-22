import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic'; // Ensure this route is never cached
export const runtime = 'nodejs'; // Use Node.js runtime for file system access
export const revalidate = 0; // Never cache this route

// This is an explicit route for /sw.js that doesn't rely on rewrites
export async function GET(request: Request) {
  // Handle requests with or without query parameters
  // The query params are ignored, but we accept them to avoid 404s
  try {
    // Generate a unique version based on current timestamp and git commit (if available)
    const timestamp = Date.now();
    const gitCommit = process.env.VERCEL_GIT_COMMIT_SHA ||
                      process.env.GIT_COMMIT_SHA ||
                      'dev';
    const version = `${gitCommit.slice(0, 7)}-${timestamp}`;
    const buildTime = new Date().toISOString();

    // Read the service worker template from public directory
    const swTemplatePath = path.join(process.cwd(), 'public', 'sw-template.js');
    let swContent: string;

    // Try to read the template, fallback to a basic SW if not found
    try {
      swContent = fs.readFileSync(swTemplatePath, 'utf-8');
    } catch {
      // If template doesn't exist, create a basic service worker
      swContent = `
const SW_VERSION = "TEMPLATE_VERSION";
const BUILD_TIME = "TEMPLATE_TIME";

self.addEventListener('install', () => {
  console.log('[SW] Installing version:', SW_VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('[SW] Activating version:', SW_VERSION);
  self.clients.claim();
});
`;
    }

    // Replace the version and build time placeholders
    swContent = swContent.replace(
      /const SW_VERSION = ".*?";/,
      `const SW_VERSION = "${version}";`
    );
    swContent = swContent.replace(
      /const BUILD_TIME = ".*?";/,
      `const BUILD_TIME = "${buildTime}";`
    );

    // Generate random bytes to ensure byte-for-byte difference
    const randomHash = crypto.randomBytes(16).toString('hex');

    // Add a comment showing this is dynamically generated
    swContent = `// Dynamically generated service worker
// Build Time: ${buildTime}
// Version: ${version}
// Unique Hash: ${randomHash}
// This ensures the service worker is always different from cached versions
// Random Padding: ${crypto.randomBytes(32).toString('base64')}

${swContent}

// Self-Update Mechanism - Balanced Approach
// Ensures service workers update properly without causing loops
(function() {
  const INSTALL_TIME = ${Date.now()};
  const THIS_VERSION = "${version}";
  const MAX_AGE_HOURS = 24; // Service worker max age
  const MAX_AGE_MS = MAX_AGE_HOURS * 60 * 60 * 1000;

  // Only unregister if this is a known problematic version
  if (THIS_VERSION.startsWith('018849a')) {
    console.log('[SW] Old stuck version detected, will unregister...');
    // Give time for the page to stabilize before unregistering
    setTimeout(async () => {
      await self.registration.unregister();
      // Don't auto-reload, let the page handle it
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        client.postMessage({ type: 'SW_UPDATE_AVAILABLE', newVersion: 'latest' });
      });
    }, 5000);
    return;
  }

  // Age-based check only - no aggressive update checking
  // This prevents the constant reload loop
  setInterval(() => {
    const age = Date.now() - INSTALL_TIME;
    if (age > MAX_AGE_MS) {
      console.log('[SW] Service worker exceeded max age, requesting update...');
      // Don't unregister, just notify clients an update is needed
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATE_AVAILABLE', newVersion: 'latest' });
        });
      });
    }
  }, 60 * 60 * 1000); // Check every hour (not every 30 minutes)
})();`;

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