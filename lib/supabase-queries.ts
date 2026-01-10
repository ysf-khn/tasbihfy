import { createServerClient } from './supabase'
import type {
  Dhikr,
  DhikrSession,
  DhikrWithSessions,
  DhikrSessionWithDhikr,
  PrayerLocation,
  ReminderPreferences,
  PrayerTimeCache
} from '@/types/models'

function generateId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  return `c${timestamp}${randomPart}`
}

// ========== DHIKR QUERIES ==========

export async function getDhikrsForUser(userId: string): Promise<DhikrWithSessions[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('Dhikr')
    .select(`
      *,
      sessions:DhikrSession(*)
    `)
    .eq('userId', userId)
    .order('createdAt', { ascending: false })

  if (error) throw error

  // Filter to only incomplete sessions and take the latest
  return ((data || []) as any[]).map(dhikr => ({
    id: dhikr.id,
    userId: dhikr.userId,
    name: dhikr.name,
    targetCount: dhikr.targetCount,
    isFavorite: dhikr.isFavorite,
    createdAt: new Date(dhikr.createdAt),
    updatedAt: new Date(dhikr.updatedAt),
    arabicText: dhikr.arabicText,
    transliteration: dhikr.transliteration,
    sessions: (dhikr.sessions || [])
      .filter((s: { completed: boolean }) => !s.completed)
      .sort((a: { startedAt: string }, b: { startedAt: string }) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      )
      .slice(0, 1)
      .map((s: Record<string, unknown>) => ({
        id: s.id as string,
        dhikrId: s.dhikrId as string,
        userId: s.userId as string,
        currentCount: s.currentCount as number,
        completed: s.completed as boolean,
        startedAt: new Date(s.startedAt as string),
        completedAt: s.completedAt ? new Date(s.completedAt as string) : null,
        updatedAt: new Date(s.updatedAt as string),
      }))
  }))
}

export async function getDhikrById(id: string, userId: string): Promise<DhikrWithSessions | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('Dhikr')
    .select(`
      *,
      sessions:DhikrSession(*)
    `)
    .eq('id', id)
    .eq('userId', userId)
    .single()

  if (error || !data) return null

  const d = data as any
  return {
    id: d.id,
    userId: d.userId,
    name: d.name,
    targetCount: d.targetCount,
    isFavorite: d.isFavorite,
    createdAt: new Date(d.createdAt),
    updatedAt: new Date(d.updatedAt),
    arabicText: d.arabicText,
    transliteration: d.transliteration,
    sessions: (d.sessions || [])
      .sort((a: { startedAt: string }, b: { startedAt: string }) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      )
      .map((s: Record<string, unknown>) => ({
        id: s.id as string,
        dhikrId: s.dhikrId as string,
        userId: s.userId as string,
        currentCount: s.currentCount as number,
        completed: s.completed as boolean,
        startedAt: new Date(s.startedAt as string),
        completedAt: s.completedAt ? new Date(s.completedAt as string) : null,
        updatedAt: new Date(s.updatedAt as string),
      }))
  }
}

export async function getDhikrByIdSimple(id: string, userId: string): Promise<Dhikr | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('Dhikr')
    .select('*')
    .eq('id', id)
    .eq('userId', userId)
    .single()

  if (error || !data) return null

  const d = data as any
  return {
    id: d.id,
    userId: d.userId,
    name: d.name,
    targetCount: d.targetCount,
    isFavorite: d.isFavorite,
    createdAt: new Date(d.createdAt),
    updatedAt: new Date(d.updatedAt),
    arabicText: d.arabicText,
    transliteration: d.transliteration,
  }
}

export async function createDhikr(data: {
  userId: string
  name: string
  targetCount: number
  arabicText?: string | null
  transliteration?: string | null
}): Promise<Dhikr> {
  const supabase = createServerClient()

  const { data: dhikr, error } = await supabase
    .from('Dhikr')
    .insert({
      id: generateId(),
      userId: data.userId,
      name: data.name,
      targetCount: data.targetCount,
      arabicText: data.arabicText ?? null,
      transliteration: data.transliteration ?? null,
      isFavorite: false,
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: dhikr.id,
    userId: dhikr.userId,
    name: dhikr.name,
    targetCount: dhikr.targetCount,
    isFavorite: dhikr.isFavorite,
    createdAt: new Date(dhikr.createdAt),
    updatedAt: new Date(dhikr.updatedAt),
    arabicText: dhikr.arabicText,
    transliteration: dhikr.transliteration,
  }
}

export async function updateDhikr(
  id: string,
  userId: string,
  data: Partial<Pick<Dhikr, 'name' | 'targetCount' | 'isFavorite'>>
): Promise<{ count: number }> {
  const supabase = createServerClient()

  const { error, count } = await supabase
    .from('Dhikr')
    .update(data)
    .eq('id', id)
    .eq('userId', userId)

  if (error) throw error
  return { count: count || 0 }
}

export async function getDhikrByIdWithoutUserCheck(id: string): Promise<Dhikr | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('Dhikr')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    userId: data.userId,
    name: data.name,
    targetCount: data.targetCount,
    isFavorite: data.isFavorite,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    arabicText: data.arabicText,
    transliteration: data.transliteration,
  }
}

export async function toggleDhikrFavorite(id: string, userId: string): Promise<Dhikr | null> {
  const supabase = createServerClient()

  // First get the current state
  const { data: current, error: fetchError } = await supabase
    .from('Dhikr')
    .select('*')
    .eq('id', id)
    .eq('userId', userId)
    .single()

  if (fetchError || !current) return null

  // Toggle the favorite
  const { data: updated, error: updateError } = await supabase
    .from('Dhikr')
    .update({ isFavorite: !current.isFavorite })
    .eq('id', id)
    .select()
    .single()

  if (updateError) throw updateError

  return {
    id: updated.id,
    userId: updated.userId,
    name: updated.name,
    targetCount: updated.targetCount,
    isFavorite: updated.isFavorite,
    createdAt: new Date(updated.createdAt),
    updatedAt: new Date(updated.updatedAt),
    arabicText: updated.arabicText,
    transliteration: updated.transliteration,
  }
}

export async function deleteDhikr(id: string, userId: string): Promise<{ count: number }> {
  const supabase = createServerClient()

  const { error, count } = await supabase
    .from('Dhikr')
    .delete()
    .eq('id', id)
    .eq('userId', userId)

  if (error) throw error
  return { count: count || 0 }
}

// ========== DHIKR SESSION QUERIES ==========

export async function getActiveSession(dhikrId: string, userId: string): Promise<DhikrSession | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('DhikrSession')
    .select('*')
    .eq('dhikrId', dhikrId)
    .eq('userId', userId)
    .eq('completed', false)
    .order('startedAt', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    dhikrId: data.dhikrId,
    userId: data.userId,
    currentCount: data.currentCount,
    completed: data.completed,
    startedAt: new Date(data.startedAt),
    completedAt: data.completedAt ? new Date(data.completedAt) : null,
    updatedAt: new Date(data.updatedAt),
  }
}

export async function getSessionById(id: string, userId: string): Promise<DhikrSessionWithDhikr | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('DhikrSession')
    .select(`
      *,
      dhikr:Dhikr(*)
    `)
    .eq('id', id)
    .eq('userId', userId)
    .single()

  if (error || !data) return null

  const d = data as any
  return {
    id: d.id,
    dhikrId: d.dhikrId,
    userId: d.userId,
    currentCount: d.currentCount,
    completed: d.completed,
    startedAt: new Date(d.startedAt),
    completedAt: d.completedAt ? new Date(d.completedAt) : null,
    updatedAt: new Date(d.updatedAt),
    dhikr: d.dhikr ? {
      id: d.dhikr.id,
      userId: d.dhikr.userId,
      name: d.dhikr.name,
      targetCount: d.dhikr.targetCount,
      isFavorite: d.dhikr.isFavorite,
      createdAt: new Date(d.dhikr.createdAt),
      updatedAt: new Date(d.dhikr.updatedAt),
      arabicText: d.dhikr.arabicText,
      transliteration: d.dhikr.transliteration,
    } : null as unknown as Dhikr,
  }
}

export async function createDhikrSession(data: {
  dhikrId: string
  userId: string
  currentCount: number
  completed: boolean
}): Promise<DhikrSessionWithDhikr> {
  const supabase = createServerClient()

  const { data: session, error } = await supabase
    .from('DhikrSession')
    .insert({
      id: generateId(),
      dhikrId: data.dhikrId,
      userId: data.userId,
      currentCount: data.currentCount,
      completed: data.completed,
    })
    .select(`
      *,
      dhikr:Dhikr(*)
    `)
    .single()

  if (error) throw error

  const s = session as any
  return {
    id: s.id,
    dhikrId: s.dhikrId,
    userId: s.userId,
    currentCount: s.currentCount,
    completed: s.completed,
    startedAt: new Date(s.startedAt),
    completedAt: s.completedAt ? new Date(s.completedAt) : null,
    updatedAt: new Date(s.updatedAt),
    dhikr: s.dhikr ? {
      id: s.dhikr.id,
      userId: s.dhikr.userId,
      name: s.dhikr.name,
      targetCount: s.dhikr.targetCount,
      isFavorite: s.dhikr.isFavorite,
      createdAt: new Date(s.dhikr.createdAt),
      updatedAt: new Date(s.dhikr.updatedAt),
      arabicText: s.dhikr.arabicText,
      transliteration: s.dhikr.transliteration,
    } : null as unknown as Dhikr,
  }
}

export async function updateDhikrSession(
  id: string,
  userId: string,
  data: {
    currentCount: number
    completed: boolean
    completedAt?: Date | null
  }
): Promise<DhikrSessionWithDhikr> {
  const supabase = createServerClient()

  const updateData: Record<string, unknown> = {
    currentCount: data.currentCount,
    completed: data.completed,
  }

  if (data.completedAt !== undefined) {
    updateData.completedAt = data.completedAt?.toISOString() ?? null
  }

  const { data: session, error } = await supabase
    .from('DhikrSession')
    .update(updateData)
    .eq('id', id)
    .eq('userId', userId)
    .select(`
      *,
      dhikr:Dhikr(*)
    `)
    .single()

  if (error) throw error

  const s = session as any
  return {
    id: s.id,
    dhikrId: s.dhikrId,
    userId: s.userId,
    currentCount: s.currentCount,
    completed: s.completed,
    startedAt: new Date(s.startedAt),
    completedAt: s.completedAt ? new Date(s.completedAt) : null,
    updatedAt: new Date(s.updatedAt),
    dhikr: s.dhikr ? {
      id: s.dhikr.id,
      userId: s.dhikr.userId,
      name: s.dhikr.name,
      targetCount: s.dhikr.targetCount,
      isFavorite: s.dhikr.isFavorite,
      createdAt: new Date(s.dhikr.createdAt),
      updatedAt: new Date(s.dhikr.updatedAt),
      arabicText: s.dhikr.arabicText,
      transliteration: s.dhikr.transliteration,
    } : null as unknown as Dhikr,
  }
}

// ========== PRAYER LOCATION QUERIES ==========

export async function getPrayerLocation(userId: string): Promise<PrayerLocation | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('PrayerLocation')
    .select('*')
    .eq('userId', userId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    userId: data.userId,
    name: data.name,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    country: data.country,
    countryCode: data.countryCode,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  }
}

export async function upsertPrayerLocation(
  userId: string,
  data: {
    name: string
    latitude: string
    longitude: string
    timezone?: string | null
    country?: string | null
    countryCode?: string | null
  }
): Promise<PrayerLocation> {
  const supabase = createServerClient()

  // Check if exists
  const { data: existing } = await supabase
    .from('PrayerLocation')
    .select('id')
    .eq('userId', userId)
    .single()

  let result
  if (existing) {
    const { data: updated, error } = await supabase
      .from('PrayerLocation')
      .update({
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone ?? null,
        country: data.country ?? null,
        countryCode: data.countryCode ?? null,
      })
      .eq('userId', userId)
      .select()
      .single()
    if (error) throw error
    result = updated
  } else {
    const { data: created, error } = await supabase
      .from('PrayerLocation')
      .insert({
        id: generateId(),
        userId,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone ?? null,
        country: data.country ?? null,
        countryCode: data.countryCode ?? null,
      })
      .select()
      .single()
    if (error) throw error
    result = created
  }

  return {
    id: result.id,
    userId: result.userId,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
    country: result.country,
    countryCode: result.countryCode,
    createdAt: new Date(result.createdAt),
    updatedAt: new Date(result.updatedAt),
  }
}

// ========== PRAYER TIME CACHE QUERIES ==========

export async function getCachedPrayerTimes(locationQuery: string, date: Date): Promise<PrayerTimeCache | null> {
  const supabase = createServerClient()
  const dateStr = date.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('PrayerTimeCache')
    .select('*')
    .eq('locationQuery', locationQuery.toLowerCase())
    .eq('date', dateStr)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    locationQuery: data.locationQuery,
    date: new Date(data.date),
    fajr: data.fajr,
    shurooq: data.shurooq,
    dhuhr: data.dhuhr,
    asr: data.asr,
    maghrib: data.maghrib,
    isha: data.isha,
    qiblaDirection: data.qiblaDirection,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    country: data.country,
    countryCode: data.countryCode,
    temperature: data.temperature,
    pressure: data.pressure,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  }
}

export async function cachePrayerTimes(data: {
  locationQuery: string
  date: Date
  fajr: string
  shurooq: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  qiblaDirection?: string | null
  latitude?: string | null
  longitude?: string | null
  timezone?: string | null
  country?: string | null
  countryCode?: string | null
  temperature?: string | null
  pressure?: string | null
}): Promise<PrayerTimeCache> {
  const supabase = createServerClient()

  const now = new Date().toISOString()
  const { data: cache, error } = await supabase
    .from('PrayerTimeCache')
    .insert({
      id: generateId(),
      locationQuery: data.locationQuery.toLowerCase(),
      date: data.date.toISOString().split('T')[0],
      fajr: data.fajr,
      shurooq: data.shurooq,
      dhuhr: data.dhuhr,
      asr: data.asr,
      maghrib: data.maghrib,
      isha: data.isha,
      qiblaDirection: data.qiblaDirection ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      timezone: data.timezone ?? null,
      country: data.country ?? null,
      countryCode: data.countryCode ?? null,
      temperature: data.temperature ?? null,
      pressure: data.pressure ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: cache.id,
    locationQuery: cache.locationQuery,
    date: new Date(cache.date),
    fajr: cache.fajr,
    shurooq: cache.shurooq,
    dhuhr: cache.dhuhr,
    asr: cache.asr,
    maghrib: cache.maghrib,
    isha: cache.isha,
    qiblaDirection: cache.qiblaDirection,
    latitude: cache.latitude,
    longitude: cache.longitude,
    timezone: cache.timezone,
    country: cache.country,
    countryCode: cache.countryCode,
    temperature: cache.temperature,
    pressure: cache.pressure,
    createdAt: new Date(cache.createdAt),
    updatedAt: new Date(cache.updatedAt),
  }
}

export async function deleteOldPrayerCache(locationQuery: string, beforeDate: Date): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('PrayerTimeCache')
    .delete()
    .eq('locationQuery', locationQuery.toLowerCase())
    .lt('date', beforeDate.toISOString().split('T')[0])

  if (error) throw error
}

// ========== REMINDER PREFERENCES QUERIES ==========

export async function getReminderPreferences(userId: string): Promise<ReminderPreferences | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('ReminderPreferences')
    .select('*')
    .eq('userId', userId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    userId: data.userId,
    reminderEnabled: data.reminderEnabled,
    reminderTime: data.reminderTime,
    timezone: data.timezone,
    pushSubscription: data.pushSubscription as Record<string, unknown> | null,
    lastReminderSent: data.lastReminderSent ? new Date(data.lastReminderSent) : null,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  }
}

export async function upsertReminderPreferences(
  userId: string,
  data: {
    reminderEnabled?: boolean
    reminderTime?: string
    timezone?: string
    pushSubscription?: Record<string, unknown> | null
  }
): Promise<ReminderPreferences> {
  const supabase = createServerClient()

  // Check if exists
  const { data: existing } = await supabase
    .from('ReminderPreferences')
    .select('id')
    .eq('userId', userId)
    .single()

  let result
  if (existing) {
    const updateData: Record<string, unknown> = {}
    if (data.reminderEnabled !== undefined) updateData.reminderEnabled = data.reminderEnabled
    if (data.reminderTime !== undefined) updateData.reminderTime = data.reminderTime
    if (data.timezone !== undefined) updateData.timezone = data.timezone
    if (data.pushSubscription !== undefined) updateData.pushSubscription = data.pushSubscription

    const { data: updated, error } = await supabase
      .from('ReminderPreferences')
      .update(updateData)
      .eq('userId', userId)
      .select()
      .single()
    if (error) throw error
    result = updated
  } else {
    const { data: created, error } = await supabase
      .from('ReminderPreferences')
      .insert({
        id: generateId(),
        userId,
        reminderEnabled: data.reminderEnabled ?? false,
        reminderTime: data.reminderTime ?? '09:00',
        timezone: data.timezone ?? 'UTC',
        pushSubscription: data.pushSubscription ?? null,
      })
      .select()
      .single()
    if (error) throw error
    result = created
  }

  return {
    id: result.id,
    userId: result.userId,
    reminderEnabled: result.reminderEnabled,
    reminderTime: result.reminderTime,
    timezone: result.timezone,
    pushSubscription: result.pushSubscription as Record<string, unknown> | null,
    lastReminderSent: result.lastReminderSent ? new Date(result.lastReminderSent) : null,
    createdAt: new Date(result.createdAt),
    updatedAt: new Date(result.updatedAt),
  }
}
