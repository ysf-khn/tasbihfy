// These types replace imports from '@prisma/client'

export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Account {
  id: string
  accountId: string
  providerId: string
  userId: string
  password: string | null
  createdAt: Date
  updatedAt: Date
  accessToken: string | null
  accessTokenExpiresAt: Date | null
  idToken: string | null
  refreshToken: string | null
  refreshTokenExpiresAt: Date | null
  scope: string | null
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Verification {
  id: string
  identifier: string
  value: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface Dhikr {
  id: string
  userId: string
  name: string
  targetCount: number
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
  arabicText: string | null
  transliteration: string | null
}

export interface DhikrSession {
  id: string
  dhikrId: string
  userId: string
  currentCount: number
  completed: boolean
  startedAt: Date
  completedAt: Date | null
  updatedAt: Date
}

export interface DailyProgress {
  id: string
  userId: string
  dhikrId: string
  date: Date
  targetCount: number
  currentCount: number
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PrayerLocation {
  id: string
  userId: string
  name: string
  latitude: string
  longitude: string
  timezone: string | null
  country: string | null
  countryCode: string | null
  createdAt: Date
  updatedAt: Date
}

export interface PrayerTimeCache {
  id: string
  locationQuery: string
  date: Date
  fajr: string
  shurooq: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  qiblaDirection: string | null
  latitude: string | null
  longitude: string | null
  timezone: string | null
  country: string | null
  countryCode: string | null
  temperature: string | null
  pressure: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ReminderPreferences {
  id: string
  userId: string
  reminderEnabled: boolean
  reminderTime: string
  timezone: string
  pushSubscription: Record<string, unknown> | null
  lastReminderSent: Date | null
  createdAt: Date
  updatedAt: Date
}

// Extended types with relations (matching Prisma's include behavior)
export interface DhikrWithSessions extends Dhikr {
  sessions: DhikrSession[]
}

export interface DhikrSessionWithDhikr extends DhikrSession {
  dhikr: Dhikr
}

export interface DailyProgressWithDhikr extends DailyProgress {
  dhikr: Dhikr
}
