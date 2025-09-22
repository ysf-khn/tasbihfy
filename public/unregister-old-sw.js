// Emergency Service Worker Cleanup Script
// This script forcefully unregisters old/stuck service workers
// Can be included temporarily to fix caching issues

(async function() {
  if ('serviceWorker' in navigator) {
    console.log('[SW Cleanup] Starting emergency service worker cleanup...');

    try {
      // Get all service worker registrations
      const registrations = await navigator.serviceWorker.getRegistrations();

      for (const registration of registrations) {
        console.log('[SW Cleanup] Found registration:', registration.scope);

        // Check if it's an old version
        let shouldUnregister = false;

        if (registration.active) {
          // Try to get version from the active worker
          const messageChannel = new MessageChannel();
          const versionPromise = new Promise((resolve) => {
            messageChannel.port1.onmessage = (event) => {
              if (event.data?.type === 'VERSION') {
                resolve(event.data.version);
              } else {
                resolve(null);
              }
            };

            // Timeout after 500ms
            setTimeout(() => resolve(null), 500);
          });

          registration.active.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
          const version = await versionPromise;

          console.log('[SW Cleanup] Active worker version:', version);

          // Unregister if it's the old stuck version
          if (version && version.startsWith('018849a')) {
            shouldUnregister = true;
            console.log('[SW Cleanup] Old stuck version detected!');
          }
        }

        // Also unregister if there's no active worker but waiting/installing
        if (!registration.active && (registration.waiting || registration.installing)) {
          shouldUnregister = true;
          console.log('[SW Cleanup] Found zombie registration with no active worker');
        }

        if (shouldUnregister) {
          console.log('[SW Cleanup] Unregistering old service worker...');
          await registration.unregister();
          console.log('[SW Cleanup] Successfully unregistered');
        }
      }

      // Clear all caches
      const cacheNames = await caches.keys();
      console.log('[SW Cleanup] Found caches:', cacheNames);

      for (const cacheName of cacheNames) {
        // Delete old version caches
        if (cacheName.includes('018849a') ||
            cacheName.includes('static-') ||
            cacheName.includes('runtime-') ||
            cacheName.includes('api-') ||
            cacheName.includes('images-') ||
            cacheName.includes('quran-audio-')) {
          console.log('[SW Cleanup] Deleting cache:', cacheName);
          await caches.delete(cacheName);
        }
      }

      console.log('[SW Cleanup] Cleanup complete!');

      // If we unregistered anything, reload after a short delay
      if (registrations.length > 0) {
        console.log('[SW Cleanup] Reloading page in 2 seconds...');
        setTimeout(() => {
          window.location.reload(true);
        }, 2000);
      }

    } catch (error) {
      console.error('[SW Cleanup] Error during cleanup:', error);
    }
  }
})();