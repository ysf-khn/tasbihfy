"use client";

import { useState, useEffect } from 'react';
import { PrayerTime } from '@/types/prayer';

interface NextPrayerProps {
  prayers: PrayerTime[];
}

export default function NextPrayer({ prayers }: NextPrayerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getNextPrayerInfo = () => {
    const now = currentTime;
    const today = now.toDateString();
    
    // Filter out sunrise as it's not a prayer time
    const prayerTimes = prayers.filter(p => p.name !== 'shurooq');
    
    let nextPrayer = null;
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
        nextPrayer = prayer;
      }
    });

    // If no prayer found for today, next is Fajr tomorrow
    if (!nextPrayer) {
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
        
        nextPrayer = fajr;
        minTimeDiff = fajrTomorrow.getTime() - now.getTime();
      }
    }

    return { nextPrayer, timeDiff: minTimeDiff };
  };

  useEffect(() => {
    const { timeDiff } = getNextPrayerInfo();
    
    if (timeDiff > 0) {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      if (hours > 0) {
        setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeUntilNext(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilNext(`${seconds}s`);
      }
    } else {
      setTimeUntilNext('');
    }
  }, [currentTime, prayers]);

  const { nextPrayer } = getNextPrayerInfo();

  if (!nextPrayer) {
    return null;
  }

  return (
    <div className="card bg-primary text-primary-content shadow-lg border-0 relative overflow-hidden">
      <div className="absolute inset-0 pattern-star pattern-fade-edges [--pattern-tile:64px]" aria-hidden="true" />

      {/* A banner rather than a column: the times grid below already names the
          next prayer, so this only has to carry the countdown, and a tall card
          beside that grid left a third of the page empty. */}
      <div className="card-body relative flex-row flex-wrap items-center justify-between gap-x-8 gap-y-4 p-5">
        <div className="flex items-center gap-4">
          <span className="text-4xl font-arabic font-bold leading-none">
            {nextPrayer.arabicName}
          </span>
          <span>
            <span className="block text-xs font-medium uppercase tracking-widest text-primary-content/70">
              Next Prayer
            </span>
            <span className="block text-lg font-medium capitalize">
              {nextPrayer.name}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block text-xs font-medium uppercase tracking-widest text-primary-content/70">
              At
            </span>
            <span className="block text-2xl font-bold tabular-nums">
              {nextPrayer.time}
            </span>
          </div>

          {timeUntilNext && (
            <div className="rounded-xl border border-base-300/30 bg-base-300/20 px-4 py-2 text-right backdrop-blur-sm">
              <span className="block text-xs font-medium uppercase tracking-widest text-primary-content/70">
                Time Remaining
              </span>
              <span className="block text-2xl font-mono font-bold tabular-nums tracking-wider">
                {timeUntilNext}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
