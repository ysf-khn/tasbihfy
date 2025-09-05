const CACHE_NAME = "dhikr-v4";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
];

// Install event - cache essential resources
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Ensure the new service worker takes control immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip requests to chrome-extension:// and other protocols
  if (!event.request.url.startsWith("http")) {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests (pages)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If successful, cache the page
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If offline, try to serve from cache first
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If not in cache, serve a basic offline message
            return new Response(
              "<html><body><h1>Offline</h1><p>This page is not available offline.</p></body></html>",
              { headers: { "Content-Type": "text/html" } }
            );
          });
        })
    );
    return;
  }

  // Handle API requests with NetworkFirst strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If API fails, try to serve cached version
          return caches.match(request).then((cachedResponse) => {
            return (
              cachedResponse ||
              new Response(
                JSON.stringify({ error: "Offline - data not available" }),
                {
                  status: 503,
                  headers: { "Content-Type": "application/json" },
                }
              )
            );
          });
        })
    );
    return;
  }

  // Handle static assets with CacheFirst strategy
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // For all other requests, use NetworkFirst
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Background sync for dhikr sessions (when available)
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync event:", event.tag);

  if (event.tag === "dhikr-session-sync") {
    event.waitUntil(syncDhikrSessions());
  }
});

// Push notification handling (for future enhancement)
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || "Time for your dhikr practice!",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [100, 50, 100],
      tag: "dhikr-reminder",
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.id || "default",
        url: data.url || "/",
      },
      actions: [
        {
          action: "open",
          title: "Open App",
          icon: "/icons/icon-192x192.png",
        },
        {
          action: "dismiss",
          title: "Dismiss",
          icon: "/icons/icon-192x192.png",
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || "Dhikr Reminder",
        options
      )
    );
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click received");

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        // If app is not open, open it
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Sync dhikr sessions when back online
async function syncDhikrSessions() {
  try {
    console.log("[SW] Syncing dhikr sessions...");

    // Get pending sessions from IndexedDB or localStorage
    const pendingSessions = await getPendingSessions();

    for (const session of pendingSessions) {
      try {
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(session),
        });

        if (response.ok) {
          await removePendingSession(session.id);
          console.log("[SW] Synced session:", session.id);
        }
      } catch (error) {
        console.error("[SW] Failed to sync session:", session.id, error);
      }
    }
  } catch (error) {
    console.error("[SW] Background sync failed:", error);
  }
}

// Helper functions for session management
async function getPendingSessions() {
  // This would integrate with your existing session storage
  // For now, return empty array
  return [];
}

async function removePendingSession(sessionId) {
  // This would remove the session from local storage
  console.log("[SW] Removing pending session:", sessionId);
}
