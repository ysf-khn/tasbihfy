"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import { PrayerTimesData, PrayerTime } from '@/types/prayer';

interface UsePrayerTimesResult {
  prayerData: PrayerTimesData | null;
  loading: boolean;
  error: string | null;
  nextPrayer: {
    prayer: PrayerTime;
    timeUntil: string;
    timeRemaining: number; // in milliseconds
  } | null;
  refreshPrayerTimes: () => Promise<void>;
}

interface CachedPrayerData {
  data: PrayerTimesData;
  lastFetched: number;
  date: string;
}

const CACHE_KEY = 'tasbihfy-prayer-times';
const LOCATION_KEY = 'tasbihfy-prayer-location';
const CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours

export function usePrayerTimes(): UsePrayerTimesResult {
  const { data: session } = useSession();
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<{
    prayer: PrayerTime;
    timeUntil: string;
    timeRemaining: number;
  } | null>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Get cached prayer data
  const getCachedData = useCallback((): CachedPrayerData | null => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cachedData: CachedPrayerData = JSON.parse(cached);
      const today = new Date().toDateString();

      // Check if cache is valid (same day and not expired)
      if (cachedData.date === today &&
          Date.now() - cachedData.lastFetched < CACHE_DURATION) {
        return cachedData;
      }

      return null;
    } catch (error) {
      console.error('Failed to parse cached prayer data:', error);
      return null;
    }
  }, []);

  // Save data to cache
  const saveToCache = useCallback((data: PrayerTimesData) => {
    if (typeof window === 'undefined') return;

    try {
      const cacheData: CachedPrayerData = {
        data,
        lastFetched: Date.now(),
        date: new Date().toDateString()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      // Also save to the old format for useSunsetTime compatibility
      if (data.prayers) {
        const timesForSunset = {
          fajr: data.prayers.find(p => p.name === 'fajr')?.time || '',
          dhuhr: data.prayers.find(p => p.name === 'dhuhr')?.time || '',
          asr: data.prayers.find(p => p.name === 'asr')?.time || '',
          maghrib: data.prayers.find(p => p.name === 'maghrib')?.time || '',
          isha: data.prayers.find(p => p.name === 'isha')?.time || '',
          date: new Date().toDateString()
        };
        localStorage.setItem('prayerTimes', JSON.stringify(timesForSunset));
      }
    } catch (error) {
      console.error('Failed to save prayer data to cache:', error);
    }
  }, []);

  // Get saved location
  const getSavedLocation = useCallback(async (): Promise<string | null> => {
    if (!session?.user) {
      // Guest mode: check localStorage
      try {
        return localStorage.getItem(LOCATION_KEY);
      } catch (error) {
        console.error('Failed to get location from localStorage:', error);
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
  }, [session?.user]);

  // Fetch prayer times from API
  const fetchPrayerTimes = useCallback(async (locationQuery?: string) => {
    try {
      setLoading(true);
      setError(null);

      let location = locationQuery;
      if (!location) {
        location = await getSavedLocation() ?? undefined;
      }

      if (!location) {
        // Try to get user's location via geolocation
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: false
            });
          });

          // Reverse geocode coordinates to get city name
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            const geocodeResponse = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
            if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json();
              location = geocodeData.city;
            }
          } catch (geocodeError) {
            console.warn('Geocoding failed, falling back to coordinates:', geocodeError);
          }

          // Fallback to coordinates if geocoding failed
          if (!location) {
            location = `${lat},${lon}`;
          }
        } else {
          throw new Error('Location access denied. Please set your location in Settings.');
        }
      }

      const searchParams = new URLSearchParams();
      if (location) {
        searchParams.append('location', location);
      }

      const response = await fetch(`/api/prayer-times?${searchParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch prayer times');
      }

      const data: PrayerTimesData = await response.json();
      setPrayerData(data);
      saveToCache(data);

      // Save location if successful
      if (data.location && typeof window !== 'undefined') {
        if (!session?.user) {
          localStorage.setItem(LOCATION_KEY, data.location.name);
        } else {
          // Save to database for authenticated users
          try {
            await fetch('/api/prayer-times/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: data.location.name,
                latitude: data.location.latitude,
                longitude: data.location.longitude,
                timezone: data.location.timezone,
                country: data.location.country,
              }),
            });
          } catch (error) {
            console.error('Failed to save location to database:', error);
          }
        }
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch prayer times');
      console.error('Error fetching prayer times:', err);
    } finally {
      setLoading(false);
    }
  }, [getSavedLocation, saveToCache, session?.user]);

  // Calculate next prayer
  const calculateNextPrayer = useCallback(() => {
    if (!prayerData?.prayers) {
      setNextPrayer(null);
      return;
    }

    const now = currentTime;
    const today = now.toDateString();

    // Filter out sunrise as it's not a prayer time
    const prayerTimes = prayerData.prayers.filter(p => p.name !== 'shurooq');

    let nextPrayerInfo = null;
    let minTimeDiff = Infinity;

    prayerTimes.forEach((prayer) => {
      const prayerDateTime = new Date(`${today} ${prayer.time}`);

      // Handle 12-hour format
      if (prayer.time.includes('am') || prayer.time.includes('pm')) {
        const [time, period] = prayer.time.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let adjustedHours = hours;

        if (period === 'pm' && hours !== 12) {
          adjustedHours += 12;
        } else if (period === 'am' && hours === 12) {
          adjustedHours = 0;
        }

        prayerDateTime.setHours(adjustedHours, minutes, 0, 0);
      }

      const timeDiff = prayerDateTime.getTime() - now.getTime();

      if (timeDiff > 0 && timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        nextPrayerInfo = prayer;
      }
    });

    // If no prayer found for today, next is Fajr tomorrow
    if (!nextPrayerInfo) {
      const fajr = prayerTimes.find(p => p.name === 'fajr');
      if (fajr) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const fajrTomorrow = new Date(`${tomorrow.toDateString()} ${fajr.time}`);

        if (fajr.time.includes('am') || fajr.time.includes('pm')) {
          const [time, period] = fajr.time.split(' ');
          const [hours, minutes] = time.split(':').map(Number);
          let adjustedHours = hours;

          if (period === 'pm' && hours !== 12) {
            adjustedHours += 12;
          } else if (period === 'am' && hours === 12) {
            adjustedHours = 0;
          }

          fajrTomorrow.setHours(adjustedHours, minutes, 0, 0);
        }

        nextPrayerInfo = fajr;
        minTimeDiff = fajrTomorrow.getTime() - now.getTime();
      }
    }

    if (nextPrayerInfo && minTimeDiff > 0) {
      const hours = Math.floor(minTimeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((minTimeDiff % (1000 * 60 * 60)) / (1000 * 60));

      let timeUntil = '';
      if (hours > 0) {
        timeUntil = `${hours}h ${minutes}m`;
      } else {
        timeUntil = `${minutes}m`;
      }

      setNextPrayer({
        prayer: nextPrayerInfo,
        timeUntil,
        timeRemaining: minTimeDiff
      });
    } else {
      setNextPrayer(null);
    }
  }, [prayerData, currentTime]);

  // Load prayer times on mount
  useEffect(() => {
    const loadPrayerTimes = async () => {
      // First, try to load from cache
      const cached = getCachedData();
      if (cached) {
        setPrayerData(cached.data);
        setLoading(false);
        return;
      }

      // If no valid cache, fetch from API
      await fetchPrayerTimes();
    };

    loadPrayerTimes();
  }, [getCachedData, fetchPrayerTimes]);

  // Calculate next prayer when data changes
  useEffect(() => {
    calculateNextPrayer();
  }, [calculateNextPrayer]);

  const refreshPrayerTimes = useCallback(async () => {
    await fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  return {
    prayerData,
    loading,
    error,
    nextPrayer,
    refreshPrayerTimes
  };
}