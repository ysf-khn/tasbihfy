// Service Worker Analytics and Performance Monitoring

export interface SWPerformanceMetrics {
  cacheHits: number
  cacheMisses: number
  networkRequests: number
  failedRequests: number
  averageResponseTime: number
  cacheSize: {
    [cacheName: string]: number
  }
  lastUpdated: Date
  version: string | null
}

export interface CachePerformance {
  url: string
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate'
  hitType: 'cache' | 'network' | 'fallback'
  responseTime: number
  timestamp: Date
}

class ServiceWorkerAnalytics {
  private metrics: SWPerformanceMetrics
  private performanceBuffer: CachePerformance[] = []
  private readonly MAX_BUFFER_SIZE = 100
  private readonly STORAGE_KEY = 'sw-analytics'

  constructor() {
    this.metrics = this.loadMetrics()
  }

  private loadMetrics(): SWPerformanceMetrics {
    if (typeof window === 'undefined') {
      return this.getDefaultMetrics()
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
        }
      }
    } catch (error) {
      console.error('[SW Analytics] Failed to load metrics:', error)
    }

    return this.getDefaultMetrics()
  }

  private getDefaultMetrics(): SWPerformanceMetrics {
    return {
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheSize: {},
      lastUpdated: new Date(),
      version: null,
    }
  }

  private saveMetrics(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.metrics))
    } catch (error) {
      console.error('[SW Analytics] Failed to save metrics:', error)
    }
  }

  // Record a cache hit
  recordCacheHit(url: string, responseTime: number, strategy: CachePerformance['strategy'] = 'cache-first'): void {
    this.metrics.cacheHits++
    this.updateAverageResponseTime(responseTime)

    this.addToBuffer({
      url,
      strategy,
      hitType: 'cache',
      responseTime,
      timestamp: new Date(),
    })

    this.saveMetrics()
  }

  // Record a cache miss
  recordCacheMiss(url: string, responseTime: number, strategy: CachePerformance['strategy'] = 'network-first'): void {
    this.metrics.cacheMisses++
    this.metrics.networkRequests++
    this.updateAverageResponseTime(responseTime)

    this.addToBuffer({
      url,
      strategy,
      hitType: 'network',
      responseTime,
      timestamp: new Date(),
    })

    this.saveMetrics()
  }

  // Record a failed request
  recordFailedRequest(url: string): void {
    this.metrics.failedRequests++
    this.saveMetrics()
  }

  // Update average response time
  private updateAverageResponseTime(responseTime: number): void {
    const totalRequests = this.metrics.cacheHits + this.metrics.networkRequests
    const currentAverage = this.metrics.averageResponseTime || 0

    this.metrics.averageResponseTime =
      (currentAverage * (totalRequests - 1) + responseTime) / totalRequests
  }

  // Add to performance buffer
  private addToBuffer(performance: CachePerformance): void {
    this.performanceBuffer.push(performance)

    if (this.performanceBuffer.length > this.MAX_BUFFER_SIZE) {
      this.performanceBuffer.shift()
    }
  }

  // Get cache size information
  async updateCacheSize(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        const cacheSize: { [key: string]: number } = {}

        for (const name of cacheNames) {
          const cache = await caches.open(name)
          const keys = await cache.keys()
          cacheSize[name] = keys.length
        }

        this.metrics.cacheSize = cacheSize
        this.metrics.lastUpdated = new Date()
        this.saveMetrics()
      } catch (error) {
        console.error('[SW Analytics] Failed to get cache size:', error)
      }
    }
  }

  // Get current metrics
  getMetrics(): SWPerformanceMetrics {
    return { ...this.metrics }
  }

  // Get performance buffer
  getPerformanceBuffer(): CachePerformance[] {
    return [...this.performanceBuffer]
  }

  // Get cache hit rate
  getCacheHitRate(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses
    if (total === 0) return 0
    return (this.metrics.cacheHits / total) * 100
  }

  // Get failure rate
  getFailureRate(): number {
    const total = this.metrics.networkRequests + this.metrics.failedRequests
    if (total === 0) return 0
    return (this.metrics.failedRequests / total) * 100
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = this.getDefaultMetrics()
    this.performanceBuffer = []
    this.saveMetrics()
  }

  // Get analytics summary
  getSummary(): {
    cacheHitRate: number
    failureRate: number
    averageResponseTime: number
    totalRequests: number
    totalCacheEntries: number
    lastUpdated: Date
  } {
    const totalCacheEntries = Object.values(this.metrics.cacheSize).reduce((sum, count) => sum + count, 0)

    return {
      cacheHitRate: this.getCacheHitRate(),
      failureRate: this.getFailureRate(),
      averageResponseTime: this.metrics.averageResponseTime,
      totalRequests: this.metrics.cacheHits + this.metrics.networkRequests,
      totalCacheEntries,
      lastUpdated: this.metrics.lastUpdated,
    }
  }

  // Send analytics to server (optional)
  async sendAnalytics(): Promise<void> {
    try {
      const summary = this.getSummary()

      // Send to your analytics endpoint
      await fetch('/api/analytics/sw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...summary,
          version: this.metrics.version,
          performanceSample: this.performanceBuffer.slice(-10), // Last 10 entries
        }),
      })
    } catch (error) {
      console.error('[SW Analytics] Failed to send analytics:', error)
    }
  }
}

// Singleton instance
export const swAnalytics = typeof window !== 'undefined' ? new ServiceWorkerAnalytics() : null

// Hook for React components
export function useSWAnalytics() {
  if (!swAnalytics) {
    return {
      metrics: null,
      summary: null,
      updateCacheSize: async () => {},
      resetMetrics: () => {},
    }
  }

  return {
    metrics: swAnalytics.getMetrics(),
    summary: swAnalytics.getSummary(),
    updateCacheSize: () => swAnalytics.updateCacheSize(),
    resetMetrics: () => swAnalytics.resetMetrics(),
  }
}