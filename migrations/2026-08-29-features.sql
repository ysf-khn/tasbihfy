-- Run this in the Supabase SQL editor (Dashboard → SQL Editor).
-- Adds: prayer tracking, hijri/raw prayer-time cache columns,
-- per-prayer notification prefs, and the DailyProgress table.

-- Prayer tracking (mark prayers as prayed)
CREATE TABLE IF NOT EXISTS "PrayerLog" (
  id text PRIMARY KEY,
  "userId" text NOT NULL,
  date date NOT NULL,
  prayer text NOT NULL CHECK (prayer IN ('fajr','dhuhr','asr','maghrib','isha')),
  "prayedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("userId", date, prayer)
);
CREATE INDEX IF NOT EXISTS prayerlog_user_date ON "PrayerLog" ("userId", date);

-- Prayer time cache: hijri date + raw 24-hour timings (for notifications)
ALTER TABLE "PrayerTimeCache" ADD COLUMN IF NOT EXISTS hijri jsonb;
ALTER TABLE "PrayerTimeCache" ADD COLUMN IF NOT EXISTS raw jsonb;

-- Per-prayer push notification preferences
ALTER TABLE "ReminderPreferences" ADD COLUMN IF NOT EXISTS "prayerNotifications" jsonb;
ALTER TABLE "ReminderPreferences" ADD COLUMN IF NOT EXISTS "lastPrayerNotificationKey" text;

-- Daily dhikr progress (streaks/history). The TS types referenced this table
-- but it may not exist in the database yet.
CREATE TABLE IF NOT EXISTS "DailyProgress" (
  id text PRIMARY KEY,
  "userId" text NOT NULL,
  "dhikrId" text NOT NULL,
  date date NOT NULL,
  "targetCount" int NOT NULL,
  "currentCount" int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("userId", "dhikrId", date)
);
CREATE INDEX IF NOT EXISTS dailyprogress_user_date ON "DailyProgress" ("userId", date);
