'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      // Automatically redirect when back online
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Offline Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-base-300 flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-base-content opacity-60" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 5.636l-12.728 12.728m0 0L12 12m-6.364 6.364L12 12m6.364-6.364L12 12"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.111 16.404a5.5 5.5 0 017.778-7.778M12 2.25A9.75 9.75 0 002.25 12 9.75 9.75 0 0012 21.75 9.75 9.75 0 0021.75 12 9.75 9.75 0 0012 2.25z"
              />
            </svg>
          </div>
        </div>

        {/* Status Messages */}
        {isOnline ? (
          <div className="space-y-4">
            <div className="alert alert-success">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Connected! Redirecting to app...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-base-content">You're Offline</h1>
            
            <div className="alert alert-warning">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>No internet connection available</span>
            </div>

            <p className="text-base-content/70">
              Don't worry! You can still use the Dhikr counter app while offline. 
              Your dhikr counts will be saved locally and synced when you're back online.
            </p>

            {/* Offline Features */}
            <div className="bg-base-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold mb-2 text-center">Available Offline:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Count dhikr with any saved phrases
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  View progress and session history
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Create new dhikr sessions
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  All data will sync when online
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link 
                href="/" 
                className="btn btn-primary w-full"
              >
                Continue with Dhikr Counter
              </Link>
              
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-outline w-full"
              >
                Try Again
              </button>
            </div>

            {/* Connection Tips */}
            <details className="collapse collapse-arrow bg-base-200">
              <summary className="collapse-title text-sm font-medium">
                Connection Tips
              </summary>
              <div className="collapse-content text-sm space-y-2">
                <p>• Check your Wi-Fi or mobile data connection</p>
                <p>• Try moving to a location with better signal</p>
                <p>• Restart your device's network connection</p>
                <p>• The app will automatically reconnect when possible</p>
              </div>
            </details>
          </div>
        )}

        {/* App Logo */}
        <div className="flex justify-center mt-8">
          <div className="text-4xl">📿</div>
        </div>
      </div>
    </div>
  )
}