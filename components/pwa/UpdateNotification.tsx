'use client'

import { useState, useEffect } from 'react'

export default function UpdateNotification() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for new service worker waiting
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker installed and ready
                setShowUpdatePrompt(true)
              }
            })
          }
        })
      })

      // Check if there's already a waiting worker
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) {
          setShowUpdatePrompt(true)
        }
      })
    }
  }, [])

  const handleUpdateNow = () => {
    // Skip waiting and reload
    navigator.serviceWorker.ready.then(registration => {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
    })

    // Listen for controller change and reload
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }

  const handleUpdateLater = () => {
    setShowUpdatePrompt(false)
    // Show again after 30 minutes
    setTimeout(() => {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) {
          setShowUpdatePrompt(true)
        }
      })
    }, 30 * 60 * 1000)
  }

  if (!showUpdatePrompt) {
    return null
  }

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
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleUpdateLater}
              className="btn btn-ghost btn-xs"
            >
              Later
            </button>
            <button
              onClick={handleUpdateNow}
              className="btn btn-primary btn-xs"
            >
              Update Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}