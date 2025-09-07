'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      
      console.log('[SW] Service Worker registered successfully:', registration.scope)
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error)
    }
  }

  return null // This component doesn't render anything
}