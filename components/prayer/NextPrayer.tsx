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
    <div className="card bg-primary text-primary-content shadow-lg border-0">
      <div className="card-body text-center p-8">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="p-2 bg-primary-content/10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold tracking-wide">Next Prayer</h2>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-4xl font-arabic font-bold leading-tight">{nextPrayer.arabicName}</div>
            <div className="text-lg font-medium capitalize text-primary-content/90">{nextPrayer.name}</div>
          </div>
          
          <div className="text-3xl font-bold tracking-wide">{nextPrayer.time}</div>
          
          {timeUntilNext && (
            <div className="bg-base-300/20 backdrop-blur-sm rounded-xl p-4 mt-6 border border-base-300/30">
              <div className="text-sm font-medium text-primary-content/80 mb-1">Time Remaining</div>
              <div className="text-2xl font-mono font-bold tracking-wider">{timeUntilNext}</div>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30">
            <div className="w-2 h-2 bg-secondary rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-secondary-content">
              {timeUntilNext ? 'Upcoming' : 'Now'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}