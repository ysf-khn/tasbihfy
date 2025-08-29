"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import PageHeader from "@/components/ui/PageHeader";
import type { Dhikr, DhikrSession } from "@prisma/client";
import { Bars3Icon } from "@heroicons/react/24/outline";

interface DhikrWithSession extends Dhikr {
  sessions: DhikrSession[];
}

interface DailyDhikrCardProps {
  dhikr: DhikrWithSession;
}

function DailyDhikrCard({ dhikr }: DailyDhikrCardProps) {
  const currentSession = dhikr.sessions[0];
  const currentCount = currentSession?.currentCount || 0;
  const progress =
    dhikr.targetCount > 0 ? (currentCount / dhikr.targetCount) * 100 : 0;
  const progressPercentage = Math.min(progress, 100);

  return (
    <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200">
      <div className="space-y-4">
        {/* Dhikr Name and Target */}
        <div>
          <h3 className="text-lg font-semibold text-base-content">
            {dhikr.name}
          </h3>
          <p className="text-sm text-base-content/60">
            Target: {dhikr.targetCount}
          </p>
        </div>

        {/* Progress Bar and Count */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-base-200 rounded-full h-3">
                <div
                  className="bg-primary rounded-full h-3 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-base-content font-semibold min-w-fit">
                {currentCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DailyPage() {
  const [dhikrs, setDhikrs] = useState<DhikrWithSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const fetchDhikrs = async () => {
    try {
      const response = await fetch("/api/dhikrs");
      if (!response.ok) throw new Error("Failed to fetch dhikrs");
      const data = await response.json();
      setDhikrs(data);
    } catch (err) {
      setError("Failed to load dhikrs");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDhikrs();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/70 animate-pulse">
            Loading daily progress...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="flex flex-col justify-center items-center min-h-screen p-4">
          <div className="max-w-md mx-auto">
            <div className="alert alert-error shadow-lg">
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
                <h3 className="font-bold">Oops!</h3>
                <div className="text-xs">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <PageHeader />
      <div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-base-content mb-6">Daily Adhkars</h2>
          {dhikrs.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 space-y-4">
              <h3 className="text-xl font-bold text-base-content">
                No dhikrs yet
              </h3>
              <p className="text-base-content/70 text-center">
                Add some dhikrs from the home screen to track your daily
                progress
              </p>
            </div>
          ) : (
            dhikrs.map((dhikr) => (
              <DailyDhikrCard key={dhikr.id} dhikr={dhikr} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
