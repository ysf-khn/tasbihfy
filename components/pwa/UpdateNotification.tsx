'use client'

import { useServiceWorkerUpdate } from './ServiceWorkerRegistration'
import { useState, useEffect } from 'react'

export default function UpdateNotification() {
  const {
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
  } = useServiceWorkerUpdate()

  const [showDetails, setShowDetails] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Auto-update countdown
  useEffect(() => {
    if (countdown === null || countdown <= 0) return

    const timer = setTimeout(() => {
      setCountdown(prev => prev !== null ? prev - 1 : null)
    }, 1000)

    if (countdown === 0) {
      triggerUpdate()
    }

    return () => clearTimeout(timer)
  }, [countdown, triggerUpdate])

  const handleUpdateNow = () => {
    setCountdown(null)
    triggerUpdate()
  }

  const handleUpdateLater = () => {
    setCountdown(null)
    dismissUpdate()
  }

  const handleAutoUpdate = () => {
    setCountdown(10) // 10 second countdown
  }

  // Don't show anything if no update available
  if (!updateAvailable && updateProgress === 'idle') {
    return null
  }

  // Show error state
  if (updateError) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
        <div className="alert alert-error shadow-lg max-w-md w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm">Update check failed</p>
              <p className="text-xs opacity-70">{updateError}</p>
            </div>
          </div>
          <button
            onClick={() => checkForUpdates(true)}
            className="btn btn-ghost btn-xs"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show loading state (only for manual checks)
  if (updateProgress === 'checking' && isManualCheck) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
        <div className="alert shadow-lg max-w-md w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <span className="loading loading-spinner loading-sm"></span>
            <p className="text-sm">Checking for updates...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show downloading state
  if (updateProgress === 'downloading') {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
        <div className="alert alert-info shadow-lg max-w-md w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <span className="loading loading-spinner loading-sm"></span>
            <div>
              <p className="text-sm font-semibold">Downloading Update</p>
              <p className="text-xs opacity-70">Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show update available notification
  return (
    <div className="toast toast-bottom toast-center z-50">
      <div className="alert alert-info shadow-lg max-w-md w-full sm:w-auto">
        <div className="w-full">
          <div className="flex items-start gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 flex-shrink-0"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Update Available</h3>
              <p className="text-xs opacity-90">
                A new version of Tasbihfy is ready to install
              </p>

              {/* Version details */}
              {showDetails && (
                <div className="mt-2 p-2 bg-base-200 rounded-lg text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-70">Current:</span>
                    <span className="font-mono">{currentVersion?.slice(0, 12) || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="opacity-70">New:</span>
                    <span className="font-mono text-success">{newVersion?.slice(0, 12) || 'Unknown'}</span>
                  </div>
                  {lastUpdateCheck && (
                    <div className="flex justify-between mt-1">
                      <span className="opacity-70">Checked:</span>
                      <span>{lastUpdateCheck.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Countdown */}
              {countdown !== null && (
                <div className="mt-2 p-2 bg-warning/20 rounded-lg">
                  <p className="text-xs text-center">
                    Updating in <span className="font-bold">{countdown}</span> seconds...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="btn btn-ghost btn-xs"
            >
              {showDetails ? 'Hide' : 'Details'}
            </button>

            {countdown === null ? (
              <>
                <button
                  onClick={handleUpdateLater}
                  className="btn btn-ghost btn-xs"
                >
                  Later
                </button>
                <button
                  onClick={handleAutoUpdate}
                  className="btn btn-warning btn-xs"
                >
                  Auto-update
                </button>
                <button
                  onClick={handleUpdateNow}
                  className="btn btn-primary btn-xs"
                >
                  Update Now
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCountdown(null)}
                  className="btn btn-ghost btn-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateNow}
                  className="btn btn-primary btn-xs"
                >
                  Update Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}