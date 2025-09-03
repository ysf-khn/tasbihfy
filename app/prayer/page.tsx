"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { PrayerTimesData } from "@/types/prayer";
import PrayerTimesList from "@/components/prayer/PrayerTimesList";
import LocationDisplay from "@/components/prayer/LocationDisplay";
import QiblaDirection from "@/components/prayer/QiblaDirection";
import NextPrayer from "@/components/prayer/NextPrayer";
import { reverseGeocode } from "@/lib/geocoding";

export default function PrayerTimesPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("");

  // Fetch saved user location from database
  const fetchSavedLocation = async () => {
    if (!session?.user) return null;
    
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

  // Save user location to database
  const saveUserLocation = async (locationData: PrayerTimesData) => {
    if (!session?.user || !locationData.location) return;
    
    try {
      await fetch('/api/prayer-times/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: locationData.location.name,
          latitude: locationData.location.latitude,
          longitude: locationData.location.longitude,
          timezone: locationData.location.timezone,
          country: locationData.location.country,
          countryCode: locationData.location.countryCode,
        }),
      });
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  const fetchPrayerTimes = async (locationQuery: string, shouldSaveLocation = false) => {
    if (!locationQuery) {
      setError("Please select a location");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/prayer-times?location=${encodeURIComponent(locationQuery)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch prayer times");
      }

      const data: PrayerTimesData = await response.json();
      setPrayerData(data);
      
      // Save location if requested (when user actively selects a new location)
      if (shouldSaveLocation) {
        await saveUserLocation(data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch prayer times"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeLocation = async () => {
      // First, try to get saved location from database
      const savedLocation = await fetchSavedLocation();
      if (savedLocation) {
        setLocation(savedLocation);
        fetchPrayerTimes(savedLocation);
        return;
      }

      // If no saved location, auto-detect via geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;

              // Reverse geocode to get city name
              const geocodeResult = await reverseGeocode(latitude, longitude);

              // Use the city name instead of coordinates
              const cityName = geocodeResult.city;
              setLocation(cityName);
              fetchPrayerTimes(cityName, true); // Save this auto-detected location
            } catch (error) {
              console.error("Reverse geocoding error:", error);

              // Fallback to default location if reverse geocoding fails
              const defaultLocation = "London";
              setLocation(defaultLocation);
              fetchPrayerTimes(defaultLocation);
            }
          },
          () => {
            // Fallback to default location if geolocation fails
            const defaultLocation = "London";
            setLocation(defaultLocation);
            fetchPrayerTimes(defaultLocation);
          }
        );
      } else {
        const defaultLocation = "London";
        setLocation(defaultLocation);
        fetchPrayerTimes(defaultLocation);
      }
    };

    if (session?.user) {
      initializeLocation();
    }
  }, [session?.user]);

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    fetchPrayerTimes(newLocation, true); // Save the user-selected location
  };

  // Show loading state while session is being fetched
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-base-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-base-content mb-4">
              Prayer Times
            </h1>
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login required if no session after loading
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-base-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-base-content mb-4">
              Prayer Times
            </h1>
            <p className="text-base-content/60">
              Please log in to access prayer times
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Prayer Times
          </h1>
          <p className="text-base-content/60">
            {prayerData?.date &&
              new Date(prayerData.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
          </p>
        </div>

        {/* Location Display - show when location exists, or show selector when no location */}
        <LocationDisplay
          currentLocation={location}
          onLocationChange={handleLocationChange}
          loading={loading}
        />

        {/* Error State */}
        {error && (
          <div className="alert alert-error">
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
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {/* Prayer Times Content */}
        {prayerData && !loading && (
          <>
            {/* Next Prayer */}
            <NextPrayer prayers={prayerData.prayers} />

            {/* Main Prayer Times */}
            <PrayerTimesList prayers={prayerData.prayers} />

            {/* Weather and Qibla */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Qibla Direction */}
              <QiblaDirection direction={prayerData.qiblaDirection} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
