"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { PrayerTimesData } from "@/types/prayer";
import PrayerTimesList from "@/components/prayer/PrayerTimesList";
import QiblaDirection from "@/components/prayer/QiblaDirection";
import NextPrayer from "@/components/prayer/NextPrayer";
import UnifiedHeader from "@/components/ui/UnifiedHeader";

interface CityData {
  name: string;
  country: string;
  slug: string;
  countrySlug: string;
  lat: number;
  lng: number;
}

interface PrayerTimesLocationClientProps {
  cityData: CityData;
  initialLocation: string;
}

export default function PrayerTimesLocationClient({
  cityData,
  initialLocation
}: PrayerTimesLocationClientProps) {
  const { data: session } = useSession();
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch prayer times for this specific location
  useEffect(() => {
    const fetchLocationPrayerTimes = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/prayer-times?location=${encodeURIComponent(cityData.name)}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch prayer times');
        }

        const data: PrayerTimesData = await response.json();
        setPrayerData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prayer times';
        setError(errorMessage);
        console.error('Prayer times error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationPrayerTimes();
  }, [initialLocation, cityData.name]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <UnifiedHeader
          title={`Prayer Times - ${cityData.name}, ${cityData.country}`}
          showSignIn={true}
        />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="text-base-content/70">
              Loading prayer times for {cityData.name}, {cityData.country}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-base-200">
        <UnifiedHeader
          title={`Prayer Times - ${cityData.name}, ${cityData.country}`}
          showSignIn={true}
        />
        <div className="container mx-auto px-4 py-6 pt-8">
          <div className="text-center space-y-6">
            <div className="alert alert-error max-w-md mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">Unable to load prayer times</h3>
                <div className="text-xs">{error}</div>
              </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-base-200 pb-16">
      <UnifiedHeader
        title={`Prayer Times - ${cityData.name}, ${cityData.country}`}
        showSignIn={true}
      />

      <div className="container mx-auto px-4 py-6 space-y-6 pt-4">
        {/* Location Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-base-content">
            Prayer Times for {cityData.name}
          </h1>
          <p className="text-base-content/70">
            {cityData.country} • Today's Schedule
          </p>
        </div>

        {prayerData && (
          <>
            {/* Next Prayer */}
            <NextPrayer prayers={prayerData.prayers} />

            {/* Prayer Times List */}
            <PrayerTimesList prayers={prayerData.prayers} />

            {/* Qibla Direction */}
            <QiblaDirection direction={prayerData.qiblaDirection} />

            {/* Additional Info */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <h3 className="font-semibold text-base-content mb-3">About Prayer Times in {cityData.name}</h3>
                <div className="space-y-2 text-sm text-base-content/70">
                  <p>
                    Prayer times are calculated using precise astronomical methods for {cityData.name}, {cityData.country}.
                  </p>
                  <p>
                    Coordinates: {cityData.lat.toFixed(4)}°, {cityData.lng.toFixed(4)}°
                  </p>
                  <p>
                    Times are updated daily and account for your exact location.
                  </p>
                </div>
              </div>
            </div>

            {/* Related Links */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <h3 className="font-semibold text-base-content mb-3">Explore More</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <a href="/quran" className="btn btn-sm btn-outline">
                    Read Quran
                  </a>
                  <a href="/duas" className="btn btn-sm btn-outline">
                    Daily Duas
                  </a>
                  <a href="/" className="btn btn-sm btn-outline">
                    Dhikr Counter
                  </a>
                  <a href="/settings" className="btn btn-sm btn-outline">
                    Notifications
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}