'use client'

import { useEffect, createContext, useContext, useState, useCallback } from 'react'

type UpdateContextType = {
  updateAvailable: boolean
  updateProgress: 'idle' | 'checking' | 'downloading' | 'ready' | 'error'
  currentVersion: string | null
  newVersion: string | null
  triggerUpdate: () => void
  dismissUpdate: () => void
  checkForUpdates: (isManualCheck?: boolean) => Promise<void>
  lastUpdateCheck: Date | null
  updateError: string | null
  isManualCheck: boolean
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
  const [updateProgress, setUpdateProgress] = useState<UpdateContextType['updateProgress']>('idle')
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [newVersion, setNewVersion] = useState<string | null>(null)
  const [lastUpdateCheck, setLastUpdateCheck] = useState<Date | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isManualCheck, setIsManualCheck] = useState(false)

  // Get version from active service worker
  const getServiceWorkerVersion = useCallback(async (worker: ServiceWorker): Promise<string | null> => {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        if (event.data?.type === 'VERSION') {
          resolve(event.data.version)
        } else {
          resolve(null)
        }
      }

      worker.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2])

      // Timeout after 1 second
      setTimeout(() => resolve(null), 1000)
    })
  }, [])

  // Check for updates manually
  const checkForUpdates = useCallback(async (isManual = false) => {
    if (!registration) return

    try {
      setIsManualCheck(isManual)
      setUpdateProgress('checking')
      setUpdateError(null)
      setLastUpdateCheck(new Date())

      // Force check for updates
      await registration.update()

      // Check if there's a waiting worker
      if (registration.waiting) {
        const waitingVersion = await getServiceWorkerVersion(registration.waiting)
        if (waitingVersion && waitingVersion !== currentVersion) {
          setWaitingWorker(registration.waiting)
          setNewVersion(waitingVersion)
          setUpdateAvailable(true)
          setUpdateProgress('ready')
        } else {
          setUpdateProgress('idle')
        }
      } else if (registration.installing) {
        setUpdateProgress('downloading')
      } else {
        setUpdateProgress('idle')
      }
    } catch (error) {
      console.error('[SW] Update check failed:', error)
      setUpdateError(error instanceof Error ? error.message : 'Update check failed')
      setUpdateProgress('error')
    } finally {
      setIsManualCheck(false)
    }
  }, [registration, currentVersion, getServiceWorkerVersion])

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for updates
      })

      setRegistration(reg)
      console.log('[SW] Service Worker registered successfully:', reg.scope)

      // Get current version from active worker
      if (reg.active) {
        const version = await getServiceWorkerVersion(reg.active)
        setCurrentVersion(version)
        console.log('[SW] Current version:', version)
      }

      // Check if there's already a waiting worker
      if (reg.waiting) {
        const waitingVersion = await getServiceWorkerVersion(reg.waiting)
        if (waitingVersion && waitingVersion !== currentVersion) {
          setWaitingWorker(reg.waiting)
          setNewVersion(waitingVersion)
          setUpdateAvailable(true)
          setUpdateProgress('ready')
        }
      }

      // Listen for new workers being installed
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          console.log('[SW] New worker installing')
          setUpdateProgress('downloading')

          newWorker.addEventListener('statechange', async () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New worker is installed and there's already a controller
              const waitingVersion = await getServiceWorkerVersion(newWorker)

              if (waitingVersion && waitingVersion !== currentVersion) {
                console.log('[SW] New version available:', waitingVersion)
                setWaitingWorker(newWorker)
                setNewVersion(waitingVersion)
                setUpdateAvailable(true)
                setUpdateProgress('ready')
              }
            } else if (newWorker.state === 'activated') {
              // New worker activated
              const newVersion = await getServiceWorkerVersion(newWorker)
              if (newVersion) {
                setCurrentVersion(newVersion)
                setUpdateAvailable(false)
                setUpdateProgress('idle')
                setNewVersion(null)
              }
            }
          })
        }
      })

      // Listen for the waiting worker to become active
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          // Show a notification that the app is updating
          console.log('[SW] Controller changed, reloading page...')
          window.location.reload()
        }
      })

    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error)
      setUpdateError(error instanceof Error ? error.message : 'Registration failed')
      setUpdateProgress('error')
    }
  }

  // Check for updates once on app launch
  useEffect(() => {
    if (!registration) return

    // Check for updates 3 seconds after registration
    const timer = setTimeout(() => {
      checkForUpdates(false) // Automatic check on app launch
    }, 3000)

    return () => clearTimeout(timer)
  }, [registration]) // Only run once when registration is available

  const triggerUpdate = () => {
    if (waitingWorker) {
      console.log('[SW] Triggering update to version:', newVersion)
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
      setUpdateAvailable(false)
      setUpdateProgress('idle')
    }
  }

  const dismissUpdate = () => {
    console.log('[SW] Update dismissed, will remind later')
    setUpdateAvailable(false)

    // Set a timer to remind again in 30 minutes
    setTimeout(() => {
      if (waitingWorker) {
        setUpdateAvailable(true)
      }
    }, 30 * 60 * 1000)
  }

  const contextValue: UpdateContextType = {
    updateAvailable,
    updateProgress,
    currentVersion,
    newVersion,
    triggerUpdate,
    dismissUpdate,
    checkForUpdates,
    lastUpdateCheck,
    updateError,
    isManualCheck,
  }

  return (
    <UpdateContext.Provider value={contextValue}>
      {children}
    </UpdateContext.Provider>
  )
}