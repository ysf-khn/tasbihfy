// Batched sync manager for optimized session updates
// Queues updates and sends them in batches to reduce API calls

export interface SyncUpdate {
  type: 'session_update' | 'session_create'
  sessionId?: string
  dhikrId: string
  count: number
  timestamp: number
  completed?: boolean
}

interface SyncManagerConfig {
  batchDelayMs: number
  maxQueueSize: number
}

const DEFAULT_CONFIG: SyncManagerConfig = {
  batchDelayMs: 2000,  // 2 second delay before sending batch
  maxQueueSize: 10,    // Max items before forcing sync
}

class SyncManager {
  private queue: SyncUpdate[] = []
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private config: SyncManagerConfig
  private isSyncing = false

  constructor(config: Partial<SyncManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Add an update to the sync queue
   * Deduplicates updates for the same session, keeping only the latest
   */
  addToQueue(update: SyncUpdate): void {
    // Deduplicate: remove any existing update for the same session
    if (update.sessionId) {
      this.queue = this.queue.filter(
        item => item.sessionId !== update.sessionId
      )
    } else {
      // For session_create, deduplicate by dhikrId
      this.queue = this.queue.filter(
        item => !(item.type === 'session_create' && item.dhikrId === update.dhikrId)
      )
    }

    this.queue.push(update)

    // Check if we need to sync immediately due to queue size
    if (this.queue.length >= this.config.maxQueueSize) {
      this.flushSync()
      return
    }

    // Reset the batch timer
    this.scheduleBatch()
  }

  /**
   * Schedule a batch sync after the configured delay
   */
  private scheduleBatch(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = setTimeout(() => {
      this.flushSync()
    }, this.config.batchDelayMs)
  }

  /**
   * Immediately flush all queued updates to the server
   * Call this on page hide/beforeunload for reliability
   */
  async flushSync(): Promise<boolean> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    if (this.queue.length === 0 || this.isSyncing) {
      return true
    }

    this.isSyncing = true
    const updates = [...this.queue]
    this.queue = []

    try {
      const response = await fetch('/api/sessions/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) {
        // Re-queue failed updates
        this.queue = [...updates, ...this.queue]
        console.error('Batch sync failed:', response.status)
        return false
      }

      console.log(`✅ Synced ${updates.length} updates`)
      return true
    } catch (error) {
      // Re-queue failed updates
      this.queue = [...updates, ...this.queue]
      console.error('Batch sync error:', error)
      return false
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Flush using sendBeacon for beforeunload reliability
   * Returns true if beacon was sent (does not guarantee delivery)
   */
  flushWithBeacon(): boolean {
    if (this.queue.length === 0) {
      return true
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    const updates = [...this.queue]
    this.queue = []

    const blob = new Blob([JSON.stringify({ updates })], {
      type: 'application/json',
    })

    const sent = navigator.sendBeacon('/api/sessions/batch', blob)

    if (!sent) {
      // Re-queue if beacon failed
      this.queue = [...updates, ...this.queue]
    } else {
      console.log(`📡 Beacon sent ${updates.length} updates`)
    }

    return sent
  }

  /**
   * Get the current queue length
   */
  getQueueLength(): number {
    return this.queue.length
  }

  /**
   * Check if there are pending updates
   */
  hasPendingUpdates(): boolean {
    return this.queue.length > 0
  }

  /**
   * Clear all pending updates (use with caution)
   */
  clearQueue(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    this.queue = []
  }
}

// Export singleton instance
export const syncManager = new SyncManager()

// Export class for testing/custom instances
export { SyncManager }
