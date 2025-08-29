'use client'

import { useState, useEffect } from 'react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    // Initial online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      // Show "back online" indicator briefly
      setShowIndicator(true)
      setTimeout(() => setShowIndicator(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Don't show anything if online and no recent change
  if (isOnline && !showIndicator) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center">
      <div className={`
        alert max-w-sm transition-all duration-300
        ${isOnline ? 'alert-success' : 'alert-warning'}
      `}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 117.778-7.778M12 20.5a8.5 8.5 0 118.5-8.5M12 16.5a4.5 4.5 0 114.5-4.5M12 12.5a.5.5 0 11.5-.5" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M8.111 16.404a5.5 5.5 0 117.778-7.778" />
            </svg>
          )}
          <span className="text-sm font-medium">
            {isOnline ? 'Back online!' : 'Offline - data saved locally'}
          </span>
        </div>
        
        {!isOnline && (
          <button 
            onClick={() => setShowIndicator(false)}
            className="btn btn-ghost btn-xs"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}