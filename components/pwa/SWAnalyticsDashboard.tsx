'use client'

import { useState, useEffect } from 'react'
import { useSWAnalytics } from '@/lib/sw-analytics'
import { useServiceWorkerUpdate } from './ServiceWorkerRegistration'

export default function SWAnalyticsDashboard() {
  const { metrics, summary, updateCacheSize, resetMetrics } = useSWAnalytics()
  const { currentVersion, lastUpdateCheck, checkForUpdates } = useServiceWorkerUpdate()
  const [isOpen, setIsOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      handleRefresh()
    }
  }, [isOpen])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await updateCacheSize()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  if (!metrics || !summary) {
    return null
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 btn btn-circle btn-sm btn-ghost opacity-50 hover:opacity-100 z-40"
        title="Service Worker Analytics"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>

      {/* Analytics Dashboard */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 w-80 max-h-[70vh] bg-base-100 rounded-lg shadow-2xl border border-base-300 z-40 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-base-300">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">SW Performance</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className={`btn btn-ghost btn-xs ${isRefreshing ? 'loading' : ''}`}
                  disabled={isRefreshing}
                >
                  {!isRefreshing && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-xs"
                >
                  ✕
                </button>
              </div>
            </div>
            {currentVersion && (
              <p className="text-xs opacity-70 mt-1 font-mono">
                v{currentVersion.slice(0, 12)}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-4 space-y-4">
            {/* Cache Performance */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold opacity-70">Cache Performance</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-base-200 rounded p-2">
                  <div className="text-xs opacity-70">Hit Rate</div>
                  <div className="text-lg font-bold text-success">
                    {summary.cacheHitRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-base-200 rounded p-2">
                  <div className="text-xs opacity-70">Avg Response</div>
                  <div className="text-lg font-bold">
                    {formatTime(summary.averageResponseTime)}
                  </div>
                </div>
              </div>
            </div>

            {/* Request Statistics */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold opacity-70">Request Statistics</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-70">Cache Hits:</span>
                  <span className="font-mono">{metrics.cacheHits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Cache Misses:</span>
                  <span className="font-mono">{metrics.cacheMisses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Network Requests:</span>
                  <span className="font-mono">{metrics.networkRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Failed Requests:</span>
                  <span className="font-mono text-error">{metrics.failedRequests}</span>
                </div>
              </div>
            </div>

            {/* Cache Sizes */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold opacity-70">Cache Storage</h4>
              <div className="space-y-1">
                {Object.entries(metrics.cacheSize).map(([name, count]) => (
                  <div key={name} className="flex justify-between text-xs">
                    <span className="opacity-70 truncate max-w-[60%]">{name}:</span>
                    <span className="font-mono">{count} items</span>
                  </div>
                ))}
                {Object.keys(metrics.cacheSize).length === 0 && (
                  <p className="text-xs opacity-50">No cache data available</p>
                )}
              </div>
              <div className="pt-1 border-t border-base-300">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Total Entries:</span>
                  <span>{summary.totalCacheEntries}</span>
                </div>
              </div>
            </div>

            {/* Update Information */}
            {lastUpdateCheck && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold opacity-70">Update Status</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-70">Last Check:</span>
                    <span>{lastUpdateCheck.toLocaleTimeString()}</span>
                  </div>
                  <button
                    onClick={() => checkForUpdates(true)}
                    className="btn btn-xs btn-ghost w-full"
                  >
                    Check for Updates
                  </button>
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-xs opacity-50 text-center pt-2 border-t border-base-300">
              Last updated: {summary.lastUpdated.toLocaleTimeString()}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-base-300">
            <button
              onClick={() => {
                if (confirm('Reset all performance metrics?')) {
                  resetMetrics()
                  handleRefresh()
                }
              }}
              className="btn btn-error btn-xs btn-outline w-full"
            >
              Reset Metrics
            </button>
          </div>
        </div>
      )}
    </>
  )
}