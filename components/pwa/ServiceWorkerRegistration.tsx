'use client'

import { useEffect, createContext, useContext, useState, useCallback } from 'react'

type UpdateContextType = {
  updateAvailable: boolean
  updateProgress: 'idle' | 'checking' | 'downloading' | 'ready' | 'error'
  currentVersion: string | null
  newVersion: string | null
  triggerUpdate: () => void
  dismissUpdate: () => void
  checkForUpdates: () => Promise<void>
  lastUpdateCheck: Date | null
  updateError: string | null
}

const UpdateContext = createContext<UpdateContextType | null>(null)

export function useServiceWorkerUpdate() {
  const context = useContext(UpdateContext)
  if (!context) {
    throw new Error('useServiceWorkerUpdate must be used within ServiceWorkerRegistration')
  }
  return context
}

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000 // Check every hour
const IMMEDIATE_UPDATE_CHECK_INTERVAL = 5 * 60 * 1000 // Check every 5 minutes when update is available

export default function ServiceWorkerRegistration({ children }: { children?: React.ReactNode }) {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateProgress, setUpdateProgress] = useState<UpdateContextType['updateProgress']>('idle')
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [newVersion, setNewVersion] = useState<string | null>(null)
  const [lastUpdateCheck, setLastUpdateCheck] = useState<Date | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

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
  const checkForUpdates = useCallback(async () => {
    if (!registration) return

    try {
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

  // Set up periodic update checks
  useEffect(() => {
    if (!registration) return

    // Initial check after registration
    const initialCheckTimer = setTimeout(() => {
      checkForUpdates()
    }, 5000) // Check 5 seconds after page load

    // Set up periodic checks
    const interval = updateAvailable ? IMMEDIATE_UPDATE_CHECK_INTERVAL : UPDATE_CHECK_INTERVAL
    const intervalId = setInterval(() => {
      checkForUpdates()
    }, interval)

    // Check on visibility change (when tab becomes visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && lastUpdateCheck) {
        const timeSinceLastCheck = Date.now() - lastUpdateCheck.getTime()
        if (timeSinceLastCheck > UPDATE_CHECK_INTERVAL) {
          checkForUpdates()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(initialCheckTimer)
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [registration, updateAvailable, lastUpdateCheck, checkForUpdates])

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
  }

  return (
    <UpdateContext.Provider value={contextValue}>
      {children}
    </UpdateContext.Provider>
  )
}