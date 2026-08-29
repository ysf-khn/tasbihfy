"use client";

import { CheckIcon } from "@heroicons/react/24/solid";
import { usePrayerLog, TRACKED_PRAYERS } from "@/hooks/usePrayerLog";
import { PRAYER_NAMES } from "@/types/prayer";

/**
 * The five checkboxes from the Prayer Tracker, compacted onto the bottom edge
 * of the home band. Logging is a five-times-a-day action, so charging a
 * navigation to /prayer-times for it was the wrong trade; the full card stays
 * there for the streak and the history it implies.
 *
 * Shares `usePrayerLog` with that card, so the two never disagree. No streak
 * chip here on purpose: the strip directly below already shows a fire badge for
 * the dhikr streak, and two identical badges counting different things read as
 * one broken number.
 */
export default function PrayerCheckRow() {
  const { isLoading, togglePrayer, isPrayerLogged } = usePrayerLog();

  if (isLoading) return null;

  return (
    <div className="relative border-t border-primary-content/20 px-5 py-3 sm:px-8">
      <div className="hidden sm:block text-[0.65rem] uppercase tracking-[0.2em] opacity-70 mb-1.5">
        Prayed today
      </div>

      <div className="flex items-stretch justify-between gap-2">
        {TRACKED_PRAYERS.map((prayer) => {
          const logged = isPrayerLogged(prayer);
          const label = PRAYER_NAMES[prayer].english;

          return (
            <button
              key={prayer}
              onClick={() => togglePrayer(prayer)}
              className="flex flex-1 flex-col items-center gap-1 rounded-lg py-1 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-content"
              aria-pressed={logged}
              aria-label={`Mark ${label} as prayed`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${
                  logged
                    ? "border-primary-content bg-primary-content text-primary"
                    : "border-primary-content/40 text-transparent"
                }`}
              >
                <CheckIcon className="h-4 w-4" />
              </span>

              {/* On desktop the timetable strip right above already names each
                  column, so repeating the names here would just be noise. */}
              <span
                className={`text-[0.6rem] uppercase tracking-[0.14em] capitalize sm:hidden ${
                  logged ? "opacity-100" : "opacity-70"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
