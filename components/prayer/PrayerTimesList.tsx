"use client";

import { useState, useEffect } from 'react';
import { PrayerTime } from '@/types/prayer';

interface PrayerTimesListProps {
  prayers: PrayerTime[];
}

/** Resolve a "5:42 am" style string against a given day. */
function toDateTime(day: Date, prayerTime: string): Date {
  const dateTime = new Date(`${day.toDateString()} ${prayerTime}`);

  // Handle 24-hour format vs 12-hour format
  if (prayerTime.includes('am') || prayerTime.includes('pm')) {
    const [time, period] = prayerTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let adjustedHours = hours;

    if (period === 'pm' && hours !== 12) {
      adjustedHours += 12;
    } else if (period === 'am' && hours === 12) {
      adjustedHours = 0;
    }

    dateTime.setHours(adjustedHours, minutes, 0, 0);
  }

  return dateTime;
}

function formatCountdown(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function PrayerTimesList({ prayers }: PrayerTimesListProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const now = currentTime;
  const schedule = prayers
    .map((prayer) => ({ prayer, at: toDateTime(now, prayer.time) }))
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  /**
   * The prayer whose window we're standing in — the one you'd actually be
   * praying right now, which is what the card should point at. Fajr's window
   * closes at sunrise, so between sunrise and Dhuhr no prayer is in effect and
   * nothing is marked current. Before the day's first entry, last night's Isha
   * is still running.
   */
  const started = schedule.filter((entry) => entry.at <= now);
  const inEffect =
    started.length > 0
      ? started[started.length - 1]
      : schedule.filter((entry) => entry.prayer.name !== 'shurooq').pop();
  const currentName =
    inEffect && inEffect.prayer.name !== 'shurooq' ? inEffect.prayer.name : null;

  // Sunrise isn't a prayer, so it never counts as the one coming up.
  const upcoming = schedule.find(
    (entry) => entry.at > now && entry.prayer.name !== 'shurooq'
  );

  let nextName: string | null = upcoming?.prayer.name ?? null;
  let timeUntilNext = upcoming ? upcoming.at.getTime() - now.getTime() : 0;

  // Nothing left today: the next prayer is tomorrow's Fajr.
  if (!upcoming) {
    const fajr = prayers.find((prayer) => prayer.name === 'fajr');
    if (fajr) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextName = fajr.name;
      timeUntilNext = toDateTime(tomorrow, fajr.time).getTime() - now.getTime();
    }
  }

  const countdown = timeUntilNext > 0 ? formatCountdown(timeUntilNext) : '';

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h2 className="card-title heading-ornate text-xl lg:text-2xl mb-4 lg:mb-6">Today's Prayer Times</h2>

        <div className="space-y-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
          {schedule.map(({ prayer, at }) => {
            const isNotPrayer = prayer.name === 'shurooq';
            const isCurrent = prayer.name === currentName;
            const isNext = prayer.name === nextName;
            const isPast = at <= now && !isCurrent;

            return (
              <div
                key={prayer.name}
                className={`p-4 lg:p-3 rounded-xl border transition-all duration-200 text-center lg:text-center relative overflow-hidden ${
                  isCurrent
                    ? 'bg-primary text-primary-content border-primary shadow-md'
                    : isNext
                    ? 'bg-base-100 text-base-content border-primary/60 ring-1 ring-primary/25'
                    : isPast
                    ? 'bg-base-200 text-base-content/60 border-base-300'
                    : 'bg-base-100 text-base-content border-base-300'
                } flex items-center justify-between lg:block lg:flex-none lg:justify-start lg:items-start`}
              >
                {/* The lattice marks the prayer in effect at a glance, at every
                    width — it inherits currentColor, so it reads as cream on the
                    evergreen tile. */}
                {isCurrent && (
                  <div
                    className="absolute inset-0 pattern-star pattern-fade-edges [--pattern-tile:56px]"
                    aria-hidden="true"
                  />
                )}

                {/* Mobile Layout */}
                <div className="relative flex-1 text-left lg:hidden">
                  <div className="text-xl font-arabic font-bold mb-1">
                    {prayer.arabicName}
                  </div>
                  <div className="text-sm capitalize font-medium opacity-80">
                    {prayer.name}
                  </div>
                </div>

                <div className="relative flex flex-col items-end space-y-2 lg:hidden">
                  <div className="text-2xl font-bold tabular-nums text-right">
                    {prayer.time}
                  </div>

                  {isCurrent && (
                    <div className="flex items-center px-2 py-1 rounded-full bg-primary-content text-primary">
                      <div className="w-1.5 h-1.5 bg-current rounded-full mr-1.5 animate-pulse"></div>
                      <span className="text-xs font-semibold">NOW</span>
                    </div>
                  )}

                  {isNext && !isCurrent && countdown && (
                    <div className="px-2 py-1 rounded-full border border-primary/40 text-primary">
                      <span className="text-xs font-semibold tabular-nums">
                        in {countdown}
                      </span>
                    </div>
                  )}

                  {isNotPrayer && (
                    <div className="px-2 py-1 rounded-full border border-base-content/20 text-base-content/60">
                      <span className="text-xs font-semibold">SUNRISE</span>
                    </div>
                  )}
                </div>

                {/* Desktop Layout - Compact Vertical */}
                <div className="relative hidden lg:block">
                  {/* Arabic Name */}
                  <div className="text-lg font-arabic font-bold mb-1 leading-tight">
                    {prayer.arabicName}
                  </div>

                  {/* English Name */}
                  <div className="text-sm capitalize font-medium opacity-80 mb-2">
                    {prayer.name}
                  </div>

                  {/* Time */}
                  <div className="text-xl font-bold tabular-nums mb-2">
                    {prayer.time}
                  </div>

                  {/* Status Badge. The row keeps its height when empty so the
                      badged tiles don't sit taller than the rest of the grid.
                      The countdown lives in the banner above on desktop, so the
                      upcoming tile only has to say which one it is. */}
                  <div className="flex justify-center min-h-6">
                    {isCurrent && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full bg-primary-content text-primary">
                        <div className="w-1 h-1 bg-current rounded-full mr-1 animate-pulse"></div>
                        <span className="text-xs font-semibold">NOW</span>
                      </div>
                    )}

                    {isNext && !isCurrent && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full border border-primary/40 text-primary">
                        <span className="text-xs font-semibold">NEXT</span>
                      </div>
                    )}

                    {isNotPrayer && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full border border-base-content/20 text-base-content/60">
                        <span className="text-xs font-semibold">SUNRISE</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="divider lg:hidden"></div>

        <div className="text-center text-sm text-base-content/60 lg:hidden">
          Current time: {currentTime.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
