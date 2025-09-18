'use client'

import { useServiceWorkerUpdate } from './ServiceWorkerRegistration'

export default function UpdateNotification() {
  const { updateAvailable, triggerUpdate, dismissUpdate } = useServiceWorkerUpdate()

  if (!updateAvailable) {
    return null
  }

  return (
    <div className="toast toast-bottom toast-center z-50">
      <div className="alert alert-info shadow-lg">
        <div className="flex items-center gap-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-download"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          <div>
            <h3 className="font-semibold text-sm">Update Available</h3>
            <p className="text-xs opacity-90">A new version is ready to install</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={dismissUpdate}
            className="btn btn-ghost btn-xs"
          >
            Later
          </button>
          <button
            onClick={triggerUpdate}
            className="btn btn-primary btn-xs"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
}