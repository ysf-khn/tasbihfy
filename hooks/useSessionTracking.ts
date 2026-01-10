"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import type { Dhikr, DhikrSession } from '@/types/models'
import { GuestStorage, type GuestDhikr, type GuestSession } from '@/lib/guestStorage'
import { syncManager } from '@/lib/sync-manager'

interface SessionWithDhikr extends DhikrSession {
  dhikr: Dhikr
}

interface TempDhikr {
  id: string
  name: string
  targetCount: number
  arabic?: string
  source?: string
}

interface UseSessionTrackingProps {
  dhikrId: string | null
  tempDhikr?: TempDhikr | null
  autoSaveInterval?: number // in milliseconds
}

export function useSessionTracking({
  dhikrId,
  tempDhikr,
  autoSaveInterval = 5000
}: UseSessionTrackingProps) {
  const [session, setSession] = useState<SessionWithDhikr | null>(null)
  const [dhikr, setDhikr] = useState<Dhikr | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [localCount, setLocalCount] = useState(0)
  const [lastSavedCount, setLastSavedCount] = useState(0)
  const { user } = useAuth()
  const lastQueuedCountRef = useRef<number>(0)

  // Load existing session
  const loadSession = useCallback(async () => {
    // Handle temporary dhikr sessions
    if (tempDhikr) {
      setDhikr({
        id: tempDhikr.id,
        name: tempDhikr.name,
        targetCount: tempDhikr.targetCount,
        userId: user?.id || '',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Dhikr)

      // Load count from localStorage for temp dhikr
      const storageKey = `temp-dhikr-${tempDhikr.name}`
      const stored = localStorage.getItem(storageKey)
      const savedCount = stored ? parseInt(stored) : 0

      setLocalCount(savedCount)
      setLastSavedCount(savedCount)
      setIsLoading(false)
      return
    }

    if (!dhikrId) {
      setSession(null)
      setDhikr(null)
      setLocalCount(0)
      setLastSavedCount(0)
      setIsLoading(false)
      return
    }

    // Guest mode: use localStorage
    if (!user) {
      try {
        // Load guest dhikr
        const guestDhikrs = GuestStorage.getDhikrs()
        const guestDhikr = guestDhikrs.find(d => d.id === dhikrId)

        if (!guestDhikr) {
          setError('Dhikr not found')
          setIsLoading(false)
          return
        }

        setDhikr({
          id: guestDhikr.id,
          name: guestDhikr.name,
          targetCount: guestDhikr.targetCount,
          userId: '',
          isFavorite: false,
          arabicText: guestDhikr.arabicText,
          transliteration: guestDhikr.transliteration,
          createdAt: new Date(guestDhikr.createdAt),
          updatedAt: new Date(guestDhikr.createdAt)
        } as Dhikr)

        // Load guest session
        const guestSession = GuestStorage.getSession(dhikrId)
        const currentCount = guestSession?.currentCount || 0

        setLocalCount(currentCount)
        setLastSavedCount(currentCount)
        setSession(null) // No database session for guests
        setIsLoading(false)
        return
      } catch (err) {
        console.error('Error loading guest session:', err)
        setError('Failed to load session')
        setIsLoading(false)
        return
      }
    }

    try {
      setError(null)

      // First check localStorage for latest count
      let localData = null
      try {
        const stored = localStorage.getItem(`dhikr-session-${dhikrId}-${user.id}`)
        if (stored) {
          localData = JSON.parse(stored)
        }
      } catch (e) {
        console.warn('Failed to parse localStorage data:', e)
      }

      // Then fetch from database
      const response = await fetch(`/api/sessions?dhikrId=${dhikrId}`)

      if (response.ok) {
        const data = await response.json()
        setDhikr(data.dhikr)

        if (data.session) {
          // Session exists in database
          setSession({ ...data.session, dhikr: data.dhikr })

          // Use newer count between localStorage and database
          const dbCount = data.session.currentCount
          const localCount = localData?.count || 0
          const dbUpdated = new Date(data.session.updatedAt).getTime()
          const localUpdated = localData?.lastUpdated || 0

          if (localUpdated > dbUpdated && localCount > dbCount) {
            console.log('Using localStorage count (newer):', localCount)
            setLocalCount(localCount)
            setLastSavedCount(dbCount) // Mark as unsaved
            lastQueuedCountRef.current = localCount
          } else {
            console.log('Using database count:', dbCount)
            setLocalCount(dbCount)
            setLastSavedCount(dbCount)
            lastQueuedCountRef.current = dbCount
          }
        } else {
          // No session in database, use localStorage if available
          setSession(null)
          const localCount = localData?.count || 0
          setLocalCount(localCount)
          setLastSavedCount(0) // Mark as unsaved if we have local data
          lastQueuedCountRef.current = localCount
        }
      } else {
        throw new Error('Failed to load session')
      }
    } catch (err) {
      console.error('Error loading session:', err)
      setError('Failed to load session')
    } finally {
      setIsLoading(false)
    }
  }, [dhikrId, user, tempDhikr])

  // Queue update using sync manager
  const queueUpdate = useCallback((count: number, targetCount: number) => {
    if (!dhikrId || !user) return

    // Don't queue if count hasn't changed
    if (count === lastQueuedCountRef.current) return
    lastQueuedCountRef.current = count

    if (session) {
      // Update existing session
      syncManager.addToQueue({
        type: 'session_update',
        sessionId: session.id,
        dhikrId,
        count,
        timestamp: Date.now(),
        completed: count >= targetCount
      })
    } else {
      // Create new session
      syncManager.addToQueue({
        type: 'session_create',
        dhikrId,
        count,
        timestamp: Date.now(),
        completed: count >= targetCount
      })
    }
  }, [dhikrId, user, session])

  // Create new session (immediate, for backwards compatibility)
  const createSession = useCallback(async (count = 0) => {
    if (!dhikrId || !user) return null

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dhikrId,
          currentCount: count
        })
      })

      if (!response.ok) throw new Error('Failed to create session')

      const newSession = await response.json()
      setSession(newSession)
      setLastSavedCount(count)
      lastQueuedCountRef.current = count
      return newSession
    } catch (err) {
      console.error('Error creating session:', err)
      setError('Failed to create session')
      return null
    }
  }, [dhikrId, user])

  // Update session (immediate, for backwards compatibility)
  const updateSession = useCallback(async (sessionId: string, count: number) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCount: count
        })
      })

      if (!response.ok) throw new Error('Failed to update session')

      const updatedSession = await response.json()
      setSession(updatedSession)
      setLastSavedCount(count)
      lastQueuedCountRef.current = count
      return updatedSession
    } catch (err) {
      console.error('Error updating session:', err)
      setError('Failed to save progress')
      return null
    }
  }, [])

  // Save current count to database (uses batched sync)
  const saveProgress = useCallback(async (count?: number) => {
    const countToSave = count !== undefined ? count : localCount

    if (countToSave === lastSavedCount) return // No changes to save

    const targetCount = session?.dhikr?.targetCount || dhikr?.targetCount || 0
    queueUpdate(countToSave, targetCount)
  }, [localCount, lastSavedCount, session, dhikr, queueUpdate])

  // Increment count
  const incrementCount = useCallback(() => {
    setLocalCount(prev => {
      const newCount = prev + 1

      // For guests, immediately save to localStorage
      if (!user && dhikrId && dhikr) {
        GuestStorage.updateSessionCount(dhikrId, newCount, dhikr.targetCount)
      }

      return newCount
    })
  }, [user, dhikrId, dhikr])

  // Reset count
  const resetCount = useCallback(async () => {
    setLocalCount(0)
    lastQueuedCountRef.current = 0

    if (!user && dhikrId) {
      // Guest mode: reset in localStorage
      GuestStorage.resetSession(dhikrId)
    } else if (session) {
      // User mode: reset in database immediately
      await updateSession(session.id, 0)
    }
  }, [session, updateSession, user, dhikrId])

  // Save to localStorage instantly on count change and queue for batched sync
  useEffect(() => {
    // For temporary dhikrs, save to different localStorage key
    if (tempDhikr) {
      const storageKey = `temp-dhikr-${tempDhikr.name}`
      localStorage.setItem(storageKey, localCount.toString())
      return
    }

    if (!dhikrId) return

    // For guests, localStorage is already handled in incrementCount
    if (!user) return

    // For authenticated users, keep the existing localStorage backup
    const localData = {
      count: localCount,
      lastUpdated: Date.now(),
      sessionId: session?.id || null
    }

    localStorage.setItem(`dhikr-session-${dhikrId}-${user.id}`, JSON.stringify(localData))

    // Queue update for batched sync (with debouncing handled by sync manager)
    const targetCount = session?.dhikr?.targetCount || dhikr?.targetCount || 0
    queueUpdate(localCount, targetCount)
  }, [localCount, dhikrId, user, session, tempDhikr, dhikr, queueUpdate])

  // Load session on mount
  useEffect(() => {
    loadSession()
  }, [loadSession])

  // Save on important events
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use sendBeacon via sync manager for reliability
      if (user && syncManager.hasPendingUpdates()) {
        syncManager.flushWithBeacon()
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && user) {
        // Flush sync immediately when page becomes hidden
        syncManager.flushSync()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      // Flush on unmount if needed (only for authenticated users)
      if (user && syncManager.hasPendingUpdates()) {
        syncManager.flushSync().catch(console.error)
      }
    }
  }, [user])

  const targetCount = session?.dhikr?.targetCount || dhikr?.targetCount || 0
  const dhikrName = session?.dhikr?.name || dhikr?.name || ''
  const isComplete = targetCount > 0 && localCount >= targetCount
  // For guests, consider changes always saved since localStorage is immediate
  const hasUnsavedChanges = user ? syncManager.hasPendingUpdates() || localCount !== lastSavedCount : false

  return {
    session,
    localCount,
    isComplete,
    isLoading,
    error,
    hasUnsavedChanges,
    incrementCount,
    resetCount,
    saveProgress: () => saveProgress(),
    dhikrName,
    targetCount,
    arabicText: dhikr?.arabicText,
    transliteration: dhikr?.transliteration
  }
}
