-- Run this in the Supabase SQL editor (Dashboard → SQL Editor).
-- Stores the resolved display name alongside a cached prayer-time row.
--
-- Why: the cache key is now the rounded coordinate pair ("24.86,67.01"), so a
-- cache hit on the coordinate path had nothing but the key to show as the
-- location name. The row already carries lat/lng and country; this adds the
-- city label so the reverse geocode is needed once per location, ever.

ALTER TABLE "PrayerTimeCache" ADD COLUMN IF NOT EXISTS "locationName" text;

-- The route looks up the newest row for a location key.
CREATE INDEX IF NOT EXISTS prayertimecache_query_date
  ON "PrayerTimeCache" ("locationQuery", date DESC);
