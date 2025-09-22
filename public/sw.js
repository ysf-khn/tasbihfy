// Service Worker with enhanced caching strategies and version management
// This file is used as a template - the actual sw.js is generated at build time

const SW_VERSION = "0c33207-1758564900392";
const BUILD_TIME = "2025-09-22T18:15:00.392Z";

// PRECACHE_MANIFEST_PLACEHOLDER

// Cache names with versioning
const CACHE_NAMES = {
  STATIC: `static-${SW_VERSION}`,
  RUNTIME: `runtime-${SW_VERSION}`,
  API: `api-${SW_VERSION}`,
  IMAGES: `images-${SW_VERSION}`,
  QURAN_AUDIO: `quran-audio-${SW_VERSION}`,
};

// Get all cache names for cleanup
const ALL_CACHES = Object.values(CACHE_NAMES);

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  API: 5 * 60 * 1000, // 5 minutes
  RUNTIME: 24 * 60 * 60 * 1000, // 1 day
  IMAGES: 7 * 24 * 60 * 60 * 1000, // 1 week
  QURAN_AUDIO: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Maximum cache sizes
const MAX_CACHE_SIZE = {
  API: 50,
  RUNTIME: 100,
  IMAGES: 50,
  QURAN_AUDIO: 114,
};

// Essential routes to precache
const PRECACHE_ROUTES = [
  '/',
  '/dhikrs',
  '/quran',
  '/duas',
  '/prayer',
  '/settings',
  '/daily',
];

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

// API endpoints for stale-while-revalidate
const SWR_APIS = [
  '/api/dhikrs',
  '/api/duas',
  '/api/quran/chapters',
  '/api/prayer-times',
];

// Network timeouts
const NETWORK_TIMEOUTS = {
  API: 3000,
  PAGE: 5000,
  ASSET: 10000,
};

// Utility: Clean expired cache entries
async function cleanExpiredCache(cacheName, maxAge, maxSize) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  const now = Date.now();

  // Sort by cache time (stored in metadata)
  const entries = [];
  for (const request of requests) {
    const response = await cache.match(request);
    const cacheTime = response.headers.get('sw-cache-time');
    if (cacheTime) {
      entries.push({
        request,
        time: parseInt(cacheTime),
      });
    }
  }

  // Sort by time (oldest first)
  entries.sort((a, b) => a.time - b.time);

  // Remove expired entries
  for (const entry of entries) {
    if (now - entry.time > maxAge) {
      await cache.delete(entry.request);
    }
  }

  // Enforce max size (remove oldest)
  while (entries.length > maxSize) {
    const oldest = entries.shift();
    await cache.delete(oldest.request);
  }
}

// Utility: Add cache timestamp to response
function addCacheTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cache-time', Date.now().toString());
  headers.set('sw-version', SW_VERSION);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
}

// Utility: Network request with timeout
async function fetchWithTimeout(request, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(request, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Strategy: Stale While Revalidate
async function staleWhileRevalidate(request, cacheName, timeout = NETWORK_TIMEOUTS.API) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Return cached version immediately if available
  const fetchPromise = fetchWithTimeout(request, timeout)
    .then(response => {
      if (response.status === 200) {
        cache.put(request, addCacheTimestamp(response.clone()));
      }
      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Strategy: Cache First, Network Fallback
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cache is still valid
    const cacheTime = cachedResponse.headers.get('sw-cache-time');
    if (cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      const maxAge = CACHE_EXPIRATION[cacheName] || CACHE_EXPIRATION.RUNTIME;

      if (age < maxAge) {
        return cachedResponse;
      }
    } else {
      // No timestamp, use cached version
      return cachedResponse;
    }
  }

  // Fetch from network
  try {
    const response = await fetchWithTimeout(request, NETWORK_TIMEOUTS.ASSET);
    if (response.status === 200) {
      cache.put(request, addCacheTimestamp(response.clone()));
    }
    return response;
  } catch (error) {
    // Return expired cache if available
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Strategy: Network First, Cache Fallback
async function networkFirst(request, cacheName, timeout = NETWORK_TIMEOUTS.PAGE) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetchWithTimeout(request, timeout);
    if (response.status === 200) {
      cache.put(request, addCacheTimestamp(response.clone()));
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/');
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    throw error;
  }
}

// Install event - cache essential resources
self.addEventListener('install', event => {
  console.log(`[SW] Installing version ${SW_VERSION}`);

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAMES.STATIC).then(cache => {
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Failed to cache some static assets:', err);
        });
      }),
      // Precache app routes
      caches.open(CACHE_NAMES.RUNTIME).then(cache => {
        return Promise.all(
          PRECACHE_ROUTES.map(route =>
            fetch(route)
              .then(response => {
                if (response.status === 200) {
                  return cache.put(route, addCacheTimestamp(response));
                }
              })
              .catch(err => {
                console.warn(`[SW] Failed to precache ${route}:`, err);
              })
          )
        );
      }),
    ]).then(() => {
      console.log(`[SW] Version ${SW_VERSION} installed successfully`);
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log(`[SW] Activating version ${SW_VERSION}`);

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all([
        // Delete old version caches
        ...cacheNames
          .filter(cacheName => !ALL_CACHES.includes(cacheName))
          .map(cacheName => {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }),
        // Clean expired entries from current caches
        cleanExpiredCache(CACHE_NAMES.API, CACHE_EXPIRATION.API, MAX_CACHE_SIZE.API),
        cleanExpiredCache(CACHE_NAMES.RUNTIME, CACHE_EXPIRATION.RUNTIME, MAX_CACHE_SIZE.RUNTIME),
        cleanExpiredCache(CACHE_NAMES.IMAGES, CACHE_EXPIRATION.IMAGES, MAX_CACHE_SIZE.IMAGES),
        cleanExpiredCache(CACHE_NAMES.QURAN_AUDIO, CACHE_EXPIRATION.QURAN_AUDIO, MAX_CACHE_SIZE.QURAN_AUDIO),
      ]);
    }).then(() => {
      console.log(`[SW] Version ${SW_VERSION} activated`);
      // Take control of all clients
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-HTTP(S) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);
  const { pathname } = url;

  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, CACHE_NAMES.RUNTIME));
    return;
  }

  // Handle API requests with Stale-While-Revalidate for specific endpoints
  if (pathname.startsWith('/api/')) {
    if (SWR_APIS.some(api => pathname.startsWith(api))) {
      event.respondWith(staleWhileRevalidate(event.request, CACHE_NAMES.API));
    } else {
      // Network-first for other API calls
      event.respondWith(networkFirst(event.request, CACHE_NAMES.API, NETWORK_TIMEOUTS.API));
    }
    return;
  }

  // Handle Quran audio with long-term caching
  if (url.hostname === 'verses.quran.foundation' || pathname.includes('/audio/')) {
    event.respondWith(cacheFirst(event.request, CACHE_NAMES.QURAN_AUDIO));
    return;
  }

  // Handle images with cache-first
  if (
    pathname.startsWith('/icons/') ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|avif)$/i)
  ) {
    event.respondWith(cacheFirst(event.request, CACHE_NAMES.IMAGES));
    return;
  }

  // Handle static assets (JS, CSS) with cache-first
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.match(/\.(js|css)$/i)
  ) {
    event.respondWith(cacheFirst(event.request, CACHE_NAMES.STATIC));
    return;
  }

  // Default strategy: Network first with cache fallback
  event.respondWith(networkFirst(event.request, CACHE_NAMES.RUNTIME));
});

// Handle messages from clients
self.addEventListener('message', event => {
  console.log(`[SW] Message received:`, event.data);

  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }

  if (event.data?.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: SW_VERSION,
      buildTime: BUILD_TIME,
    });
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
        .then(() => {
          event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
        });
    });
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log(`[SW] Background sync: ${event.tag}`);

  if (event.tag === 'dhikr-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when back online
async function syncOfflineData() {
  // This would be implemented based on your offline storage strategy
  console.log('[SW] Syncing offline data...');
}

// Push notifications
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');

  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();

    const options = {
      body: data.body || 'Tasbihfy Reminder',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'tasbihfy-notification',
      data: {
        url: data.url || '/',
        ...data.data,
      },
      actions: data.actions || [
        {
          action: 'open',
          title: 'Open App',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Tasbihfy', options)
    );
  } catch (error) {
    console.error('[SW] Error handling push notification:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Focus existing window or open new one
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        return clients.openWindow(urlToOpen);
      })
  );
});

console.log(`[SW] Service Worker loaded - Version: ${SW_VERSION}, Build: ${BUILD_TIME}`);