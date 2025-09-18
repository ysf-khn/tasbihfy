'use client'

import { useEffect, createContext, useContext, useState } from 'react'

type UpdateContextType = {
  updateAvailable: boolean
  triggerUpdate: () => void
  dismissUpdate: () => void
}

const UpdateContext = createContext<UpdateContextType | null>(null)

export function useServiceWorkerUpdate() {
  const context = useContext(UpdateContext)
  if (!context) {
    throw new Error('useServiceWorkerUpdate must be used within ServiceWorkerRegistration')
  }
  return context
}

export default function ServiceWorkerRegistration({ children }: { children?: React.ReactNode }) {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

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

      // Check if there's already a waiting worker
      if (registration.waiting) {
        setWaitingWorker(registration.waiting)
        setUpdateAvailable(true)
      }

      // Listen for new workers being installed
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New worker is installed and there's already a controller
              setWaitingWorker(newWorker)
              setUpdateAvailable(true)
            }
          })
        }
      })

      // Listen for the waiting worker to become active
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })

    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error)
    }
  }

  const triggerUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
      setUpdateAvailable(false)
    }
  }

  const dismissUpdate = () => {
    setUpdateAvailable(false)
  }

  const contextValue: UpdateContextType = {
    updateAvailable,
    triggerUpdate,
    dismissUpdate,
  }

  return (
    <UpdateContext.Provider value={contextValue}>
      {children}
    </UpdateContext.Provider>
  )
}