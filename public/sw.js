// Simplified Service Worker for Tasbihfy PWA
// Based on Next.js PWA guide - much simpler than previous implementation

const CACHE_NAME = "tasbihfy-5412f0d";
const urlsToCache = [
  "/offline",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
];

// Install event - cache essential resources.
// No skipWaiting here: the new SW parks in "waiting" until the client
// approves the update via the SKIP_WAITING message (see message handler).
self.addEventListener("install", function (event) {
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

// Fetch event.
// - Navigations: network only, offline fallback to the precached /offline page.
//   Never cached, so users always get the latest HTML shell.
// - /api/*: never intercepted, never cached.
// - Same-origin static assets (/_next/static, icons, fonts, images): cache-first.
// - Everything else same-origin: network-first with cache fallback (no cache fill).
self.addEventListener("fetch", function (event) {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  if (request.url.includes("verses.quran.foundation")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(function () {
        return caches.match("/offline");
      })
    );
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|otf)$/.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(function (cached) {
        if (cached) {
          return cached;
        }
        return fetch(request).then(function (response) {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(function () {
      return caches.match(request);
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
