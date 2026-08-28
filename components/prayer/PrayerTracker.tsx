"use client";

import { CheckIcon, FireIcon } from "@heroicons/react/24/solid";
import { usePrayerLog, TRACKED_PRAYERS } from "@/hooks/usePrayerLog";
import { PRAYER_NAMES } from "@/types/prayer";

export default function PrayerTracker() {
  const { streak, isLoading, togglePrayer, isPrayerLogged } = usePrayerLog();

  if (isLoading) return null;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-2">
          <h2 className="card-title text-xl">Prayer Tracker</h2>
          {streak > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-warning/15 text-warning">
              <FireIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {streak} day{streak === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>

        <p className="text-sm text-base-content/60 mb-3">
          Tap to mark each prayer you've completed today
        </p>

        <div className="grid grid-cols-5 gap-2">
          {TRACKED_PRAYERS.map((prayer) => {
            const logged = isPrayerLogged(prayer);
            return (
              <button
                key={prayer}
                onClick={() => togglePrayer(prayer)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  logged
                    ? "bg-success/15 border-success text-success"
                    : "bg-base-100 border-base-300 text-base-content/70 hover:border-base-content/30"
                }`}
                aria-pressed={logged}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    logged
                      ? "bg-success border-success text-success-content"
                      : "border-base-300"
                  }`}
                >
                  {logged && <CheckIcon className="w-5 h-5" />}
                </div>
                <span className="text-xs font-medium capitalize">
                  {PRAYER_NAMES[prayer].english}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
