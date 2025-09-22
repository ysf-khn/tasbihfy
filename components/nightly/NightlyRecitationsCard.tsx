'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSunsetTime } from '@/hooks/useSunsetTime';
import { loadProgress } from '@/data/nightly-recitations';

export default function NightlyRecitationsCard() {
  const { isAfterSunset, nextMaghribIn, loading } = useSunsetTime();
  const [progress, setProgress] = useState<{ completed: boolean; currentIndex: number } | null>(null);

  useEffect(() => {
    const savedProgress = loadProgress();
    if (savedProgress) {
      setProgress({
        completed: savedProgress.completedToday,
        currentIndex: savedProgress.currentIndex
      });
    }
  }, []);

  // Don't show if loading or before sunset
  if (loading || !isAfterSunset) {
    return null;
  }

  return (
    <Link href="/nightly-recitations" className="block w-full">
      <div className="card bg-base-100 hover:bg-base-200 transition-colors duration-200 cursor-pointer border border-base-300">
        <div className="card-body p-4">
          <div className="flex items-center gap-4">
            {/* Moon Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-base-content">
                Nightly Recitations
              </h3>
              <p className="text-sm text-base-content/70 mt-1">
                {progress?.completed
                  ? 'Completed tonight ✓'
                  : progress && progress.currentIndex > 0
                  ? `Continue from verse ${progress.currentIndex + 1}/48`
                  : 'Start your nightly protection'}
              </p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-base-content/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          {/* Progress indicator */}
          {progress && progress.currentIndex > 0 && !progress.completed && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-base-content/60 mb-1">
                <span>Progress</span>
                <span>{Math.round((progress.currentIndex / 48) * 100)}%</span>
              </div>
              <progress
                className="progress progress-primary h-1 w-full"
                value={progress.currentIndex}
                max="48"
              ></progress>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}