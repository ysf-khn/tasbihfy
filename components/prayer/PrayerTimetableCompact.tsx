"use client";

import Link from "next/link";
import { MapPinIcon } from "@heroicons/react/24/outline";
import type { PrayerTimesData } from "@/types/prayer";

interface PrayerTimetableCompactProps {
  prayerData: PrayerTimesData | null;
  loading: boolean;
}

/**
 * The whole day at a glance, for the desktop sidebar. The hero band only has
 * room for the next prayer; the sidebar column had space going spare.
 */
export default function PrayerTimetableCompact({
  prayerData,
  loading,
}: PrayerTimetableCompactProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 space-y-3">
        <div className="h-3 w-24 rounded bg-base-300 animate-pulse" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-6 rounded bg-base-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!prayerData?.prayers?.length) {
    return null;
  }

  return (
    <Link href="/prayer-times" className="block">
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 hover:border-secondary/50 transition-colors duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-base-content/50">
            Today&apos;s Prayers
          </span>
          {prayerData.location && (
            <span className="flex items-center gap-1 text-xs text-base-content/50 truncate max-w-[8rem]">
              <MapPinIcon className="w-3 h-3 shrink-0" />
              {prayerData.location.name}
            </span>
          )}
        </div>

        <ul className="space-y-0.5">
          {prayerData.prayers.map((prayer) => (
            <li
              key={prayer.name}
              className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm ${
                prayer.isNext
                  ? "bg-primary/10 text-primary font-semibold"
                  : prayer.isPast
                  ? "text-base-content/40"
                  : "text-base-content/80"
              }`}
            >
              <span className="flex items-center gap-2 capitalize">
                {prayer.isNext && (
                  <span className="ornament-diamond" />
                )}
                {prayer.name}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-arabic text-xs opacity-60">
                  {prayer.arabicName}
                </span>
                <span className="tabular-nums">{prayer.time}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
