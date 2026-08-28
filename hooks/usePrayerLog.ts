"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { TrackedPrayer } from "@/types/models";

const GUEST_STORAGE_KEY = "prayer_log";
const HISTORY_DAYS = 60;

export const TRACKED_PRAYERS: TrackedPrayer[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

type LogMap = Record<string, TrackedPrayer[]>;

function localDateString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function readGuestLogs(): LogMap {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeGuestLogs(logs: LogMap) {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // localStorage unavailable — state stays in memory
  }
}

/** Consecutive days (ending today or yesterday) with all 5 prayers logged */
export function computePrayerStreak(logs: LogMap): number {
  let streak = 0;
  // A day still in progress shouldn't break the streak: start from today if
  // complete, otherwise from yesterday.
  const todayComplete = (logs[localDateString()] ?? []).length >= 5;
  let offset = todayComplete ? 0 : 1;

  for (;;) {
    const date = localDateString(daysAgo(offset));
    if ((logs[date] ?? []).length >= 5) {
      streak++;
      offset++;
    } else {
      break;
    }
  }
  return streak;
}

export function usePrayerLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogMap>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      if (!user) {
        setLogs(readGuestLogs());
        setIsLoading(false);
        return;
      }
      try {
        const from = localDateString(daysAgo(HISTORY_DAYS));
        const to = localDateString();
        const response = await fetch(`/api/prayer-log?from=${from}&to=${to}`);
        if (!response.ok) throw new Error("Failed to load prayer log");
        const data = await response.json();
        if (cancelled) return;
        const map: LogMap = {};
        for (const log of data.logs ?? []) {
          (map[log.date] ??= []).push(log.prayer);
        }
        setLogs(map);
      } catch (error) {
        console.error("Failed to load prayer log:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const togglePrayer = useCallback(
    async (prayer: TrackedPrayer, date: string = localDateString()) => {
      // Optimistic local update for both guest and authed users
      setLogs((prev) => {
        const dayLogs = prev[date] ?? [];
        const next = {
          ...prev,
          [date]: dayLogs.includes(prayer)
            ? dayLogs.filter((p) => p !== prayer)
            : [...dayLogs, prayer],
        };
        if (!user) writeGuestLogs(next);
        return next;
      });

      if (user) {
        try {
          const response = await fetch("/api/prayer-log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, prayer }),
          });
          if (!response.ok) throw new Error("Toggle failed");
        } catch (error) {
          console.error("Failed to sync prayer log:", error);
          // Roll back the optimistic update
          setLogs((prev) => {
            const dayLogs = prev[date] ?? [];
            return {
              ...prev,
              [date]: dayLogs.includes(prayer)
                ? dayLogs.filter((p) => p !== prayer)
                : [...dayLogs, prayer],
            };
          });
        }
      }
    },
    [user]
  );

  const today = localDateString();
  const todayLogs = logs[today] ?? [];
  const streak = useMemo(() => computePrayerStreak(logs), [logs]);

  return {
    logs,
    todayLogs,
    streak,
    isLoading,
    togglePrayer,
    isPrayerLogged: (prayer: TrackedPrayer) => todayLogs.includes(prayer),
  };
}
