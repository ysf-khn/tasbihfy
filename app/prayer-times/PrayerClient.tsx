"use client";

import PrayerTimesList from "@/components/prayer/PrayerTimesList";
import LocationDisplay from "@/components/prayer/LocationDisplay";
import QiblaDirection from "@/components/prayer/QiblaDirection";
import NextPrayer from "@/components/prayer/NextPrayer";
import CalculationNote from "@/components/prayer/CalculationNote";
import MonthlyTimetable from "@/components/prayer/MonthlyTimetable";
import PrayerTracker from "@/components/prayer/PrayerTracker";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useState } from "react";

export default function PrayerClient() {
  const { prayerData, loading, error, refreshPrayerTimes } = usePrayerTimes();
  const [view, setView] = useState<"today" | "monthly">("today");

  const handleLocationSearch = async (locationQuery: string) => {
    // This would need to be implemented in the hook if we want manual location search
    // For now, we'll just refresh with the current logic
    await refreshPrayerTimes();
  };

  return (
    <div className="min-h-screen bg-base-200">
      <UnifiedHeader showSignIn={true} />

      <div className="container mx-auto px-4 py-6 lg:py-4 max-w-4xl space-y-6 lg:space-y-4">
        {/* Header Section */}
        <div className="text-center space-y-2 lg:space-y-1">
          <h1 className="heading-ornate-center text-3xl lg:text-2xl font-bold text-base-content">Prayer Times</h1>
          {prayerData?.hijri ? (
            <p className="text-base-content/70 text-sm">
              {prayerData.hijri.day} {prayerData.hijri.monthEn}{" "}
              {prayerData.hijri.year} AH
            </p>
          ) : (
            <p className="text-base-content/70 lg:text-sm lg:hidden">
              Stay connected to your daily prayers
            </p>
          )}
        </div>

        {/* Control bar: everything that acts on the page, on one line, so the
            location no longer floats mid-page and Refresh isn't orphaned. */}
        {prayerData && !loading && (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
            {prayerData.location ? (
              <LocationDisplay
                currentLocation={prayerData.location.name}
                onLocationChange={handleLocationSearch}
                loading={loading}
              />
            ) : (
              <div className="hidden sm:block" />
            )}

            <div className="flex items-center gap-2">
              <div className="tabs tabs-boxed">
                <button
                  className={`tab ${view === "today" ? "tab-active" : ""}`}
                  onClick={() => setView("today")}
                >
                  Today
                </button>
                <button
                  className={`tab ${view === "monthly" ? "tab-active" : ""}`}
                  onClick={() => setView("monthly")}
                >
                  Monthly
                </button>
              </div>

              <button
                onClick={refreshPrayerTimes}
                className="btn btn-ghost btn-sm btn-circle"
                disabled={loading}
                title="Refresh prayer times"
                aria-label="Refresh prayer times"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="text-base-content/70">Loading prayer times...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="alert alert-error shadow-lg max-w-md mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Error loading prayer times</h3>
              <div className="text-xs">{error}</div>
            </div>
            <button
              onClick={refreshPrayerTimes}
              className="btn btn-sm btn-outline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Monthly View */}
        {prayerData && !loading && view === "monthly" && (
          <MonthlyTimetable location={prayerData.location} />
        )}

        {/* Prayer Times Content */}
        {prayerData && !loading && view === "today" && (
          <div className="space-y-6 lg:space-y-4">
            {/* Next Prayer (desktop only: on mobile the countdown lives on the
                next prayer's tile in the times card) */}
            {prayerData.prayers && (
              <div className="hidden lg:block">
                <NextPrayer prayers={prayerData.prayers} />
              </div>
            )}

            {prayerData.prayers && <PrayerTimesList prayers={prayerData.prayers} />}

            <PrayerTracker />

            {prayerData.qiblaDirection && (
              <QiblaDirection direction={prayerData.qiblaDirection} />
            )}

            <CalculationNote calculation={prayerData.calculation} />
          </div>
        )}

      </div>
    </div>
  );
}