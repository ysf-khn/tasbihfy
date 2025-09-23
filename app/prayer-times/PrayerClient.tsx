"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { PrayerTimesData } from "@/types/prayer";
import PrayerTimesList from "@/components/prayer/PrayerTimesList";
import LocationDisplay from "@/components/prayer/LocationDisplay";
import QiblaDirection from "@/components/prayer/QiblaDirection";
import NextPrayer from "@/components/prayer/NextPrayer";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import { reverseGeocode } from "@/lib/geocoding";

export default function PrayerClient() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("");

  // Fetch saved user location from database or localStorage
  const fetchSavedLocation = async () => {
    if (!session?.user) {
      // Guest mode: check localStorage
      try {
        const savedLocation = localStorage.getItem('tasbihfy-prayer-location');
        return savedLocation;
      } catch (error) {
        console.error('Failed to fetch location from localStorage:', error);
        return null;
      }
    }

    // Authenticated user: check database
    try {
      const response = await fetch('/api/prayer-times/location');
      if (response.ok) {
        const locationData = await response.json();
        return locationData.name;
      }
    } catch (error) {
      console.error('Failed to fetch saved location:', error);
    }
    return null;
  };

  // Save user location to database or localStorage
  const saveUserLocation = async (locationData: PrayerTimesData) => {
    if (!locationData.location) return;

    if (!session?.user) {
      // Guest mode: save to localStorage
      try {
        localStorage.setItem('tasbihfy-prayer-location', locationData.location.name);
      } catch (error) {
        console.error('Failed to save location to localStorage:', error);
      }
      return;
    }

    // Authenticated user: save to database
    try {
      await fetch('/api/prayer-times/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: locationData.location.name,
          latitude: locationData.location.latitude,
          longitude: locationData.location.longitude,
          timezone: locationData.location.timezone,
          country: locationData.location.country,
        }),
      });
    } catch (error) {
      console.error('Failed to save location to database:', error);
    }
  };

  // Fetch prayer times from API
  const fetchPrayerTimes = async (locationQuery?: string) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (locationQuery) {
        searchParams.append('location', locationQuery);
      }

      const response = await fetch(`/api/prayer-times?${searchParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch prayer times');
      }

      const data: PrayerTimesData = await response.json();
      setPrayerData(data);

      // Save the location if prayer times were fetched successfully
      if (data.location) {
        await saveUserLocation(data);
        setLocation(data.location.name);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prayer times';
      setError(errorMessage);
      console.error('Prayer times error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle location search
  const handleLocationSearch = (locationQuery: string) => {
    fetchPrayerTimes(locationQuery);
  };

  // Auto-detect user location
  const autoDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const locationName = await reverseGeocode(latitude, longitude);
          await fetchPrayerTimes(`${latitude},${longitude}`);
        } catch (err) {
          setError('Failed to detect location');
          setLoading(false);
        }
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Initial load effect
  useEffect(() => {
    const initializePrayerTimes = async () => {
      if (isSessionLoading) return;

      try {
        // First try to get saved location
        const savedLocation = await fetchSavedLocation();

        if (savedLocation) {
          setLocation(savedLocation);
          await fetchPrayerTimes(savedLocation);
        } else {
          // No saved location, try auto-detect
          autoDetectLocation();
        }
      } catch (err) {
        console.error('Failed to initialize prayer times:', err);
        setLoading(false);
      }
    };

    initializePrayerTimes();
  }, [session, isSessionLoading]);

  // Loading state
  if (loading && !prayerData) {
    return (
      <div className="min-h-screen bg-base-200">
        <UnifiedHeader title="Prayer Times" showSignIn={true} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="text-base-content/70">
              {location ? `Loading prayer times for ${location}...` : 'Detecting your location...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !prayerData) {
    return (
      <div className="min-h-screen bg-base-200">
        <UnifiedHeader title="Prayer Times" showSignIn={true} />
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
                onClick={autoDetectLocation}
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : null}
                Try Auto-Detect Location
              </button>

              <LocationDisplay
                currentLocation={location || ""}
                onLocationChange={handleLocationSearch}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-base-200 pb-16">
      <UnifiedHeader title="Prayer Times" showSignIn={true} />

      <div className="container mx-auto px-4 py-6 space-y-6 pt-4">
        {/* Location Display and Search */}
        <LocationDisplay
          currentLocation={prayerData?.location?.name || ""}
          onLocationChange={handleLocationSearch}
          loading={loading}
        />

        {prayerData && (
          <>
            {/* Next Prayer */}
            <NextPrayer prayers={prayerData.prayers} />

            {/* Prayer Times List */}
            <PrayerTimesList prayers={prayerData.prayers} />

            {/* Qibla Direction */}
            <QiblaDirection direction={prayerData.qiblaDirection} />
          </>
        )}

        {loading && prayerData && (
          <div className="text-center py-4">
            <div className="loading loading-spinner loading-sm text-primary"></div>
            <p className="text-sm text-base-content/70 mt-2">Updating prayer times...</p>
          </div>
        )}
      </div>
    </div>
  );
}