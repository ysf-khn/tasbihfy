// POST /api/cron/send-reminders
// Invoked by the Worker's scheduled() handler every 5 minutes.
// Requires `Authorization: Bearer ${CRON_SECRET}`.

import { NextRequest, NextResponse } from "next/server";
import {
  sendPushNotification,
  validatePushSubscription,
  isVapidConfigured,
} from "@/lib/notifications/push-service";
import {
  getEligibleReminderUsers,
  getPrayerNotificationUsers,
  getPrayerLocation,
  getCachedPrayerTimes,
  cachePrayerTimes,
  clearPushSubscription,
  updateLastReminderSent,
  updateLastPrayerNotificationKey,
} from "@/lib/supabase-queries";
import { fetchPrayerTimings } from "@/lib/prayer/aladhan";
import { getCalculationRules } from "@/lib/prayer/calculation-methods";
import type { RawPrayerTimings } from "@/types/prayer";
import type { TrackedPrayer } from "@/types/models";

export const dynamic = "force-dynamic";

// Send if now >= reminderTime and within this window (cron ticks every 5 min)
const SEND_WINDOW_MINUTES = 10;

function getLocalParts(now: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((p) => [p.type, p.value])
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10),
  };
}

function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isVapidConfigured()) {
    return NextResponse.json(
      { error: "VAPID not configured" },
      { status: 503 }
    );
  }

  const now = new Date();
  const stats = {
    eligible: 0,
    sent: 0,
    failed: 0,
    expired: 0,
    prayerEligible: 0,
    prayerSent: 0,
    prayerFailed: 0,
  };

  let users;
  try {
    users = await getEligibleReminderUsers();
  } catch (error) {
    console.error("[cron] Failed to load reminder preferences:", error);
    return NextResponse.json(
      { error: "Failed to load preferences" },
      { status: 500 }
    );
  }

  for (const prefs of users) {
    try {
      if (!validatePushSubscription(prefs.pushSubscription)) continue;

      let local;
      try {
        local = getLocalParts(now, prefs.timezone);
      } catch {
        // Invalid IANA timezone stored — skip rather than crash the batch
        continue;
      }

      const reminderMinutes = parseTimeToMinutes(prefs.reminderTime);
      if (reminderMinutes === null) continue;

      const withinWindow =
        local.minutes >= reminderMinutes &&
        local.minutes < reminderMinutes + SEND_WINDOW_MINUTES;
      if (!withinWindow) continue;

      // Already sent today (in the user's timezone)?
      if (prefs.lastReminderSent) {
        const lastSentLocal = getLocalParts(prefs.lastReminderSent, prefs.timezone);
        if (lastSentLocal.date === local.date) continue;
      }

      stats.eligible++;

      const result = await sendPushNotification(prefs.pushSubscription, {
        title: "Time for Dhikr 📿",
        body: "Take a moment to remember Allah. Start your daily dhikr now.",
        tag: "daily-reminder",
        url: "/dhikr",
      });

      if (result.ok) {
        stats.sent++;
        await updateLastReminderSent(prefs.userId, now);
      } else if (result.expired) {
        stats.expired++;
        await clearPushSubscription(prefs.userId);
      } else {
        stats.failed++;
      }
    } catch (error) {
      stats.failed++;
      console.error(`[cron] Reminder failed for user ${prefs.userId}:`, error);
    }
  }

  // ===== Per-prayer notifications =====
  try {
    const prayerUsers = await getPrayerNotificationUsers();
    // One Aladhan/cache lookup per unique location per tick
    const timingsByLocation = new Map<string, RawPrayerTimings | null>();

    for (const prefs of prayerUsers) {
      try {
        if (!validatePushSubscription(prefs.pushSubscription)) continue;
        const enabled = prefs.prayerNotifications?.prayers;
        if (!enabled) continue;

        const location = await getPrayerLocation(prefs.userId);
        if (!location?.latitude || !location?.longitude) continue;

        const timezone = location.timezone || prefs.timezone;
        let local;
        try {
          local = getLocalParts(now, timezone);
        } catch {
          continue;
        }

        // Today's raw (24-hour) timings for this location, from cache or Aladhan
        const locationKey = `${location.latitude},${location.longitude}`;
        const cacheMapKey = `${locationKey}|${local.date}`;
        let raw = timingsByLocation.get(cacheMapKey);

        if (raw === undefined) {
          const [y, m, d] = local.date.split("-").map(Number);
          const localDate = new Date(Date.UTC(y, m - 1, d));
          try {
            const cached = await getCachedPrayerTimes(locationKey, localDate);
            if (cached?.raw) {
              raw = cached.raw as unknown as RawPrayerTimings;
            } else {
              const timings = await fetchPrayerTimings(
                Number(location.latitude),
                Number(location.longitude),
                localDate,
                getCalculationRules(location.countryCode)
              );
              raw = timings.raw;
              if (!cached) {
                await cachePrayerTimes({
                  locationQuery: locationKey,
                  date: localDate,
                  fajr: timings.fajr,
                  shurooq: timings.shurooq,
                  dhuhr: timings.dhuhr,
                  asr: timings.asr,
                  maghrib: timings.maghrib,
                  isha: timings.isha,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  timezone: timings.timezone,
                  country: location.country,
                  countryCode: location.countryCode,
                  hijri: timings.hijri as unknown as Record<string, unknown> | null,
                  raw: timings.raw as unknown as Record<string, string>,
                }).catch(() => {});
              }
            }
          } catch (error) {
            console.error(`[cron] Prayer timings failed for ${locationKey}:`, error);
            raw = null;
          }
          timingsByLocation.set(cacheMapKey, raw ?? null);
        }
        if (!raw) continue;

        const prayerNames: TrackedPrayer[] = [
          "fajr",
          "dhuhr",
          "asr",
          "maghrib",
          "isha",
        ];
        const displayNames: Record<TrackedPrayer, string> = {
          fajr: "Fajr",
          dhuhr: "Dhuhr",
          asr: "Asr",
          maghrib: "Maghrib",
          isha: "Isha",
        };

        for (const prayer of prayerNames) {
          if (!enabled[prayer]) continue;

          const prayerMinutes = parseTimeToMinutes(raw[prayer]);
          if (prayerMinutes === null) continue;

          const withinWindow =
            local.minutes >= prayerMinutes &&
            local.minutes < prayerMinutes + SEND_WINDOW_MINUTES;
          if (!withinWindow) continue;

          const dedupeKey = `${local.date}:${prayer}`;
          if (prefs.lastPrayerNotificationKey === dedupeKey) continue;

          stats.prayerEligible++;

          const result = await sendPushNotification(prefs.pushSubscription, {
            title: `Time for ${displayNames[prayer]} 🕌`,
            body: `${displayNames[prayer]} prayer time has arrived.`,
            tag: `prayer-${prayer}`,
            url: "/prayer-times",
          });

          if (result.ok) {
            stats.prayerSent++;
            await updateLastPrayerNotificationKey(prefs.userId, dedupeKey);
          } else if (result.expired) {
            stats.expired++;
            await clearPushSubscription(prefs.userId);
          } else {
            stats.prayerFailed++;
          }
          // At most one prayer notification per user per tick
          break;
        }
      } catch (error) {
        stats.prayerFailed++;
        console.error(
          `[cron] Prayer notification failed for user ${prefs.userId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("[cron] Prayer notification pass failed:", error);
  }

  return NextResponse.json({ success: true, stats });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
