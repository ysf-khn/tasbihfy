// Simplified Service Worker for Tasbihfy PWA
// Based on Next.js PWA guide - much simpler than previous implementation

const CACHE_NAME = "tasbihfy-v1301261";
const urlsToCache = [
  "/",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
];

// Install event - cache essential resources and skip waiting
self.addEventListener("install", function (event) {
  self.skipWaiting(); // Take over immediately, don't wait for old SW
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("[SW] Caching essential resources");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Removing old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function () {
        console.log("[SW] Claiming clients");
        return self.clients.claim(); // Take control of all open pages
      })
  );
});

// Fetch event - network first, fallback to cache for offline
self.addEventListener("fetch", function (event) {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.url.includes("verses.quran.foundation")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clone the response as it can only be consumed once
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then(function (cache) {
          // Cache successful responses
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(function () {
        // Network request failed, try to get from cache
        return caches.match(event.request).then(function (response) {
          if (response) {
            return response;
          }
          // If not in cache and offline, return offline page for navigation
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
      })
  );
});

// Push notification handler
self.addEventListener("push", function (event) {
  console.log("[SW] Push notification received");

  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();

    const options = {
      body: data.body || "Tasbihfy Reminder",
      icon: data.icon || "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: data.vibrate || [200, 100, 200],
      tag: data.tag || "tasbihfy-notification",
      data: {
        url: data.url || "/",
        ...data.data,
      },
      actions: data.actions || [
        {
          action: "open",
          title: "Open App",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "Tasbihfy", options)
    );
  } catch (error) {
    console.error("[SW] Error handling push notification:", error);
  }
});

// Notification click handler
self.addEventListener("notificationclick", function (event) {
  console.log("[SW] Notification click received");
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window if no existing window
        return clients.openWindow(urlToOpen);
      })
  );
});

// Handle messages from clients
self.addEventListener("message", function (event) {
  if (event.data?.type === "SKIP_WAITING") {
    console.log("[SW] Skip waiting requested");
    self.skipWaiting();
  }
});

console.log("[SW] Service Worker loaded");
