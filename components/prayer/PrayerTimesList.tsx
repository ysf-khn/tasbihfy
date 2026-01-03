"use client";

import { useState, useEffect } from 'react';
import { PrayerTime } from '@/types/prayer';

interface PrayerTimesListProps {
  prayers: PrayerTime[];
}

export default function PrayerTimesList({ prayers }: PrayerTimesListProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getPrayerStatus = (prayerTime: string) => {
    const now = currentTime;
    const today = now.toDateString();
    const prayerDateTime = new Date(`${today} ${prayerTime}`);
    
    // Handle 24-hour format vs 12-hour format
    if (prayerTime.includes('am') || prayerTime.includes('pm')) {
      const [time, period] = prayerTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let adjustedHours = hours;
      
      if (period === 'pm' && hours !== 12) {
        adjustedHours += 12;
      } else if (period === 'am' && hours === 12) {
        adjustedHours = 0;
      }
      
      prayerDateTime.setHours(adjustedHours, minutes, 0, 0);
    }

    const isPast = now > prayerDateTime;
    const timeDiff = Math.abs(now.getTime() - prayerDateTime.getTime());
    const isClose = timeDiff <= 30 * 60 * 1000; // Within 30 minutes

    return { isPast, isClose, timeDiff };
  };

  const getNextPrayer = () => {
    const now = currentTime;
    let nextPrayer = null;
    let minTimeDiff = Infinity;

    prayers.forEach((prayer) => {
      if (prayer.name === 'shurooq') return; // Skip sunrise as it's not a prayer time
      
      const { isPast, timeDiff } = getPrayerStatus(prayer.time);
      
      if (!isPast && timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        nextPrayer = prayer;
      }
    });

    // If no prayer found for today, next is Fajr tomorrow
    if (!nextPrayer) {
      nextPrayer = prayers.find(p => p.name === 'fajr') || null;
    }

    return nextPrayer;
  };

  const nextPrayer = getNextPrayer();

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-xl lg:text-2xl mb-4 lg:mb-6">Today's Prayer Times</h2>
        
        <div className="space-y-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
          {prayers.map((prayer, index) => {
            const { isPast, isClose } = getPrayerStatus(prayer.time);
            const isNext = nextPrayer?.name === prayer.name;
            const isNotPrayer = prayer.name === 'shurooq';

            return (
              <div
                key={prayer.name}
                className={`p-4 lg:p-3 rounded-xl border transition-all duration-200 text-center lg:text-center relative ${
                  isNext && !isNotPrayer
                    ? 'bg-primary text-primary-content border-primary'
                    : isPast
                    ? 'bg-base-200 text-base-content/70 border-base-300'
                    : isClose && !isNotPrayer
                    ? 'bg-warning text-warning-content border-warning'
                    : isNotPrayer
                    ? 'bg-accent text-accent-content border-accent'
                    : 'bg-base-100 text-base-content border-base-300 hover:border-base-content/20'
                } flex items-center justify-between lg:block lg:flex-none lg:justify-start lg:items-start`}
              >
                {/* Mobile Layout */}
                <div className="flex items-center space-x-4 lg:hidden">
                  {/* Prayer Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isNext && !isNotPrayer
                      ? 'bg-primary-content/20'
                      : isPast && !isNotPrayer
                      ? 'bg-base-300'
                      : isNotPrayer
                      ? 'bg-accent-content/20'
                      : 'bg-base-200 border border-base-300'
                  }`}>
                    {isNotPrayer ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2L15.09 8.26L22 9L16 14.74L17.18 21.02L10 17.77L2.82 21.02L4 14.74L-2 9L4.91 8.26L10 2Z" />
                      </svg>
                    ) : isPast ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className={`w-4 h-4 rounded-full ${
                        isNext ? 'bg-current animate-pulse' : 'bg-current opacity-50'
                      }`}></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-xl font-arabic font-bold mb-1">
                      {prayer.arabicName}
                    </div>
                    <div className="text-sm capitalize font-medium opacity-80">
                      {prayer.name}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 lg:hidden">
                  <div className="text-2xl font-bold tabular-nums text-right">
                    {prayer.time}
                  </div>

                  <div className="flex space-x-2">
                    {isNext && !isNotPrayer && (
                      <div className="flex items-center px-2 py-1 rounded-full bg-primary-content text-primary">
                        <div className="w-1.5 h-1.5 bg-current rounded-full mr-1.5 animate-pulse"></div>
                        <span className="text-xs font-semibold">NEXT</span>
                      </div>
                    )}

                    {isNotPrayer && (
                      <div className="flex items-center px-2 py-1 rounded-full bg-accent-content text-accent">
                        <span className="text-xs font-semibold">SUNRISE</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Layout - Compact Vertical */}
                <div className="hidden lg:block">
                  {/* Status Indicator */}
                  <div className="flex justify-center mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isNext && !isNotPrayer
                        ? 'bg-primary-content/20'
                        : isPast && !isNotPrayer
                        ? 'bg-base-300'
                        : isNotPrayer
                        ? 'bg-accent-content/20'
                        : 'bg-base-200 border border-base-300'
                    }`}>
                      {isNotPrayer ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2L15.09 8.26L22 9L16 14.74L17.18 21.02L10 17.77L2.82 21.02L4 14.74L-2 9L4.91 8.26L10 2Z" />
                        </svg>
                      ) : isPast ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className={`w-3 h-3 rounded-full ${
                          isNext ? 'bg-current animate-pulse' : 'bg-current opacity-50'
                        }`}></div>
                      )}
                    </div>
                  </div>

                  {/* Arabic Name */}
                  <div className="text-lg font-arabic font-bold mb-1 leading-tight">
                    {prayer.arabicName}
                  </div>

                  {/* English Name */}
                  <div className="text-sm capitalize font-medium opacity-80 mb-2">
                    {prayer.name}
                  </div>

                  {/* Time */}
                  <div className="text-xl font-bold tabular-nums mb-2">
                    {prayer.time}
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-center">
                    {isNext && !isNotPrayer && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full bg-primary-content text-primary">
                        <div className="w-1 h-1 bg-current rounded-full mr-1 animate-pulse"></div>
                        <span className="text-xs font-semibold">NEXT</span>
                      </div>
                    )}

                    {isNotPrayer && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full bg-accent-content text-accent">
                        <span className="text-xs font-semibold">SUNRISE</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="divider lg:hidden"></div>

        <div className="text-center text-sm text-base-content/60 lg:hidden">
          Current time: {currentTime.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}