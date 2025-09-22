import { useState, useEffect } from 'react';

interface SunsetTimeData {
  isAfterSunset: boolean;
  maghribTime: string | null;
  nextMaghribIn: string | null;
  loading: boolean;
}

export function useSunsetTime(): SunsetTimeData {
  const [data, setData] = useState<SunsetTimeData>({
    isAfterSunset: false,
    maghribTime: null,
    nextMaghribIn: null,
    loading: true
  });

  useEffect(() => {
    const checkSunsetTime = () => {
      try {
        // Check localStorage for today's prayer times
        const storedPrayerTimes = localStorage.getItem('prayerTimes');

        if (storedPrayerTimes) {
          const prayerData = JSON.parse(storedPrayerTimes);
          const today = new Date().toDateString();

          // Check if stored data is for today
          if (prayerData.date === today && prayerData.maghrib) {
            const now = new Date();
            const [hours, minutes] = prayerData.maghrib.split(':').map(Number);
            const maghribTime = new Date();
            maghribTime.setHours(hours, minutes, 0, 0);

            const isAfterSunset = now >= maghribTime;

            // Calculate time until next Maghrib
            let nextMaghribIn = null;
            if (!isAfterSunset) {
              const diff = maghribTime.getTime() - now.getTime();
              const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
              const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              nextMaghribIn = `${hoursUntil}h ${minutesUntil}m`;
            }

            setData({
              isAfterSunset,
              maghribTime: prayerData.maghrib,
              nextMaghribIn,
              loading: false
            });
            return;
          }
        }

        // Fallback: Check if it's between 6 PM and 6 AM (rough sunset estimate)
        const hour = new Date().getHours();
        const isAfterSunset = hour >= 18 || hour < 6;

        setData({
          isAfterSunset,
          maghribTime: null,
          nextMaghribIn: null,
          loading: false
        });
      } catch (error) {
        console.error('Error checking sunset time:', error);
        // Fallback to time-based check
        const hour = new Date().getHours();
        setData({
          isAfterSunset: hour >= 18 || hour < 6,
          maghribTime: null,
          nextMaghribIn: null,
          loading: false
        });
      }
    };

    // Check immediately
    checkSunsetTime();

    // Update every minute
    const interval = setInterval(checkSunsetTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return data;
}

// Helper to store prayer times when fetched
export function storePrayerTimes(times: {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}): void {
  const data = {
    ...times,
    date: new Date().toDateString()
  };
  localStorage.setItem('prayerTimes', JSON.stringify(data));
}