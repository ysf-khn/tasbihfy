import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic'; // Ensure this route is never cached
export const runtime = 'nodejs'; // Use Node.js runtime for file system access
export const revalidate = 0; // Never cache this route

export async function GET() {
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

// Aggressive Update Mechanism - Immediate Old Version Detection
// This ensures old service workers are immediately replaced
(async function() {
  const INSTALL_TIME = ${Date.now()};
  const THIS_VERSION = "${version}";
  const MAX_AGE_HOURS = 2; // Reduced from 24 to 2 hours
  const MAX_AGE_MS = MAX_AGE_HOURS * 60 * 60 * 1000;

  // Check if this is an old version (018849a) and immediately unregister
  if (THIS_VERSION.startsWith('018849a')) {
    console.log('[SW] Old stuck version detected, immediately unregistering...');
    await self.registration.unregister();
    // Notify all clients to reload
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => {
      client.postMessage({ type: 'RELOAD_PAGE' });
    });
    return;
  }

  // Check for updates every 30 seconds for the first 5 minutes
  let checkCount = 0;
  const earlyCheckInterval = setInterval(async () => {
    checkCount++;
    if (checkCount > 10) { // Stop after 10 checks (5 minutes)
      clearInterval(earlyCheckInterval);
      return;
    }

    try {
      const response = await fetch('/sw.js?check=' + Date.now(), {
        cache: 'no-store'
      });
      const text = await response.text();
      const versionMatch = text.match(/const SW_VERSION = "([^"]+)"/);

      if (versionMatch && versionMatch[1] !== THIS_VERSION) {
        console.log('[SW] Newer version detected during early check:', versionMatch[1]);
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach(client => {
          client.postMessage({ type: 'RELOAD_PAGE' });
        });
      }
    } catch (e) {
      console.log('[SW] Early update check failed:', e);
    }
  }, 30000); // Every 30 seconds

  // Regular age-based check every 30 minutes
  setInterval(() => {
    const age = Date.now() - INSTALL_TIME;
    if (age > MAX_AGE_MS) {
      console.log('[SW] Service worker is older than 2 hours, self-destructing...');
      self.registration.unregister().then(() => {
        self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'RELOAD_PAGE' });
          });
        });
      });
    }
  }, 30 * 60 * 1000); // Check every 30 minutes
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