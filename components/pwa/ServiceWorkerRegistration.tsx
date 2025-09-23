'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for updates
      })

      console.log('[SW] Service Worker registered successfully:', registration.scope)

      // Check for updates on visibility change
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && registration.waiting) {
          // There's an update waiting, could notify user here
          console.log('[SW] Update available')
        }
      })

      // Listen for new service worker waiting
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          console.log('[SW] New service worker installing')

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker installed and ready
              console.log('[SW] New version available - refresh to update')
            }
          })
        }
      })

      // Listen for the service worker becoming active
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] New service worker activated')
      })

    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error)
    }
  }

  return <>{children}</>
}