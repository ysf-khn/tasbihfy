const CACHE_NAME = "dhikr-v9.2";

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

// Handle messages from client (for update notifications)
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Skipping waiting and taking control");
    self.skipWaiting();
  }
});

// Background sync for dhikr sessions (when available)
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync event:", event.tag);

  if (event.tag === "dhikr-session-sync") {
    event.waitUntil(syncDhikrSessions());
  }
});

// Enhanced push notification handling for daily ayah reminders
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  if (!event.data) {
    console.warn("[SW] Push event received without data");
    return;
  }

  try {
    const data = event.data.json();
    console.log("[SW] Push notification data:", data);

    // Default notification options
    let options = {
      body: data.body || "Time for your dhikr practice!",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [100, 50, 100],
      tag: data.tag || "dhikr-reminder",
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.data?.primaryKey || "default",
        url: data.data?.url || "/",
        type: data.data?.type || "generic",
        ...data.data,
      },
      actions: data.actions || [
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

    // Customize notification based on type
    if (data.data?.type === "daily-ayah") {
      options = {
        ...options,
        body: data.body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        vibrate: [200, 100, 200], // Gentle vibration for daily ayah
        tag: "daily-ayah",
        requireInteraction: false, // Don't require user interaction
        silent: false, // Allow notification sound
        actions: [
          {
            action: "read-more",
            title: "Read More",
            icon: "/icons/icon-192x192.png",
          },
          {
            action: "dismiss",
            title: "Dismiss",
            icon: "/icons/icon-192x192.png",
          },
        ],
      };
    } else if (data.data?.type === "test-notification") {
      options = {
        ...options,
        body: data.body,
        tag: "test-notification",
        vibrate: [100, 50, 100], // Short test vibration
        requireInteraction: true, // Require interaction for test
        actions: [
          {
            action: "open",
            title: "Open App",
            icon: "/icons/icon-192x192.png",
          },
        ],
      };
    }

    const title = data.title || "Tasbihfy";

    event.waitUntil(
      self.registration
        .showNotification(title, options)
        .then(() => {
          console.log("[SW] Notification displayed successfully:", title);
        })
        .catch((error) => {
          console.error("[SW] Failed to display notification:", error);
        })
    );
  } catch (error) {
    console.error("[SW] Error processing push notification:", error);

    // Fallback notification if JSON parsing fails
    event.waitUntil(
      self.registration.showNotification("Tasbihfy", {
        body: "You have a new notification",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        tag: "fallback",
      })
    );
  }
});

// Enhanced notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click received:", {
    action: event.action,
    tag: event.notification.tag,
    data: event.notification.data,
  });

  event.notification.close();

  // Handle different notification actions
  if (event.action === "dismiss") {
    console.log("[SW] Notification dismissed by user");
    return;
  }

  // Determine URL to open based on notification type and action
  let urlToOpen = "/";

  if (event.notification.data) {
    const { type, url, verseKey, chapterId, verseNumber } =
      event.notification.data;

    if (type === "daily-ayah") {
      if (event.action === "read-more" && chapterId && verseNumber) {
        // Open specific ayah in Quran reader
        urlToOpen = `/quran/${chapterId}?verse=${verseNumber}`;
      } else {
        // Default to main page for ayah notifications
        urlToOpen = url || "/";
      }
    } else {
      urlToOpen = url || "/";
    }
  }

  console.log("[SW] Opening URL:", urlToOpen);

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && "focus" in client) {
            // If app is open, navigate to the desired URL and focus
            client.navigate && client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // If app is not open, open it with the desired URL
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error("[SW] Error handling notification click:", error);
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
