"use client";

import PrayerTimesList from "@/components/prayer/PrayerTimesList";
import LocationDisplay from "@/components/prayer/LocationDisplay";
import QiblaDirection from "@/components/prayer/QiblaDirection";
import NextPrayer from "@/components/prayer/NextPrayer";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

export default function PrayerClient() {
  const { prayerData, loading, error, refreshPrayerTimes } = usePrayerTimes();

  const handleLocationSearch = async (locationQuery: string) => {
    // This would need to be implemented in the hook if we want manual location search
    // For now, we'll just refresh with the current logic
    await refreshPrayerTimes();
  };

  return (
    <div className="min-h-screen bg-base-200">
      <UnifiedHeader showSignIn={true} />

      <div className="container mx-auto px-4 py-6 lg:py-4 max-w-7xl space-y-6 lg:space-y-4">
        {/* Header Section */}
        <div className="text-center space-y-2 lg:space-y-1">
          <h1 className="text-3xl lg:text-2xl font-bold text-base-content">Prayer Times</h1>
          <p className="text-base-content/70 lg:text-sm lg:hidden">
            Stay connected to your daily prayers
          </p>
        </div>

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

        {/* Prayer Times Content */}
        {prayerData && !loading && (
          <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
            {/* Main Content - Prayer Times */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-4">
              {/* Location Display */}
              {prayerData.location && (
                <LocationDisplay
                  currentLocation={prayerData.location.name}
                  onLocationChange={handleLocationSearch}
                  loading={loading}
                />
              )}

              {/* Prayer Times List */}
              {prayerData.prayers && (
                <PrayerTimesList
                  prayers={prayerData.prayers}
                />
              )}

              {/* Qibla Direction (Mobile Only) */}
              {prayerData.qiblaDirection && (
                <QiblaDirection direction={prayerData.qiblaDirection} />
              )}
            </div>

            {/* Sidebar - Next Prayer and Weather */}
            <div className="space-y-6 lg:space-y-4">
              {/* Next Prayer Card */}
              {prayerData.prayers && (
                <div className="sticky top-24">
                  <NextPrayer prayers={prayerData.prayers} />
                </div>
              )}

              {/* Weather Info */}
              {prayerData.weather && (
                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body">
                    <h3 className="card-title text-lg">Weather</h3>
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-2xl font-bold">{prayerData.weather.temperature}°</p>
                        <p className="text-sm text-base-content/70">Temperature</p>
                      </div>
                      {prayerData.weather.pressure && (
                        <div>
                          <p className="text-lg font-semibold">{prayerData.weather.pressure} hPa</p>
                          <p className="text-sm text-base-content/70">Pressure</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Refresh Button */}
              <div className="text-center lg:text-left">
                <button
                  onClick={refreshPrayerTimes}
                  className="btn btn-outline btn-sm w-full lg:w-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}