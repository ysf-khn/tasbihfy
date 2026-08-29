"use client";

import { useEffect, useState } from "react";
import { GuestStorage } from "@/lib/guestStorage";
import {
  computeStreak,
  daysAgo,
  localDateString,
} from "@/lib/daily-stats";

/** Enough history to resolve a streak without pulling the whole archive */
const STREAK_WINDOW_DAYS = 60;

export interface TodaySummary {
  /** Dhikr counted today, across every dhikr */
  todayCount: number;
  /** Consecutive days with activity, ending today or yesterday */
  streak: number;
  /** Deep link back into the most recently touched dhikr, or the list */
  resumeHref: string;
  /** Name of that dhikr, when there is one */
  resumeName: string | null;
  loading: boolean;
}

const EMPTY: TodaySummary = {
  todayCount: 0,
  streak: 0,
  resumeHref: "/dhikr",
  resumeName: null,
  loading: true,
};

/**
 * Today's dhikr activity for the home screen.
 *
 * Signed-in users come from the database; guests come from localStorage, which
 * is why this can't just call the API — /api/daily-progress 401s for them.
 */
export function useTodaySummary(user: unknown): TodaySummary {
  const [summary, setSummary] = useState<TodaySummary>(EMPTY);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) {
        const totals = GuestStorage.getDailyTotals();
        const dhikrs = GuestStorage.getDhikrs().sort(
          (a, b) => b.createdAt - a.createdAt
        );
        const recent = dhikrs[0];
        if (cancelled) return;
        setSummary({
          todayCount: totals[localDateString()] ?? 0,
          streak: computeStreak(totals),
          resumeHref: recent ? `/dhikr?dhikr=${recent.id}` : "/dhikr",
          resumeName: recent?.name ?? null,
          loading: false,
        });
        return;
      }

      try {
        const from = localDateString(daysAgo(STREAK_WINDOW_DAYS));
        const to = localDateString();
        const [progressRes, dhikrsRes] = await Promise.all([
          fetch(`/api/daily-progress?from=${from}&to=${to}`),
          fetch("/api/dhikrs"),
        ]);

        const totals: Record<string, number> = {};
        if (progressRes.ok) {
          const data = await progressRes.json();
          for (const row of data.progress ?? []) {
            totals[row.date] = (totals[row.date] || 0) + row.currentCount;
          }
        }

        let recent: { id: string; name: string } | null = null;
        if (dhikrsRes.ok) {
          const dhikrs = await dhikrsRes.json();
          if (Array.isArray(dhikrs) && dhikrs.length > 0) {
            const sorted = [...dhikrs].sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            );
            recent = { id: sorted[0].id, name: sorted[0].name };
          }
        }

        if (cancelled) return;
        setSummary({
          todayCount: totals[localDateString()] ?? 0,
          streak: computeStreak(totals),
          resumeHref: recent ? `/dhikr?dhikr=${recent.id}` : "/dhikr",
          resumeName: recent?.name ?? null,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to load today's dhikr summary:", error);
        if (!cancelled) setSummary((prev) => ({ ...prev, loading: false }));
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return summary;
}
