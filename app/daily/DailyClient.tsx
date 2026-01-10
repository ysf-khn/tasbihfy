"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import type { Dhikr, DhikrSession } from "@/types/models";
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

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-base-content/70">
            {progressPercentage >= 100 ? (
              <span className="text-success font-medium">✓ Completed</span>
            ) : (
              <span>
                {dhikr.targetCount - currentCount} remaining
              </span>
            )}
          </div>
          <div className="text-sm text-base-content/70">
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DailyClient() {
  const { user } = useAuth();
  const [dhikrs, setDhikrs] = useState<DhikrWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDhikrs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dhikrs");
      if (!response.ok) throw new Error("Failed to fetch dhikrs");
      const data = await response.json();
      setDhikrs(data);
    } catch (err) {
      setError("Failed to load dhikrs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDhikrs();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Calculate daily stats
  const totalDhikrs = dhikrs.length;
  const completedDhikrs = dhikrs.filter((dhikr) => {
    const currentSession = dhikr.sessions[0];
    const currentCount = currentSession?.currentCount || 0;
    return currentCount >= dhikr.targetCount;
  }).length;
  const totalTargetCount = dhikrs.reduce((sum, dhikr) => sum + dhikr.targetCount, 0);
  const totalCurrentCount = dhikrs.reduce((sum, dhikr) => {
    const currentSession = dhikr.sessions[0];
    return sum + (currentSession?.currentCount || 0);
  }, 0);

  const overallProgress = totalTargetCount > 0 ? (totalCurrentCount / totalTargetCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-base-200 pb-16">
      <UnifiedHeader title="Daily Progress" showSignIn={true} />

      <div className="container mx-auto px-4 py-6 space-y-6 pt-4">
        {!user ? (
          <div className="text-center py-16 space-y-6">
            <div className="space-y-3">
              <Bars3Icon className="w-16 h-16 text-base-content/40 mx-auto" />
              <h3 className="text-2xl font-bold text-base-content">
                Track Your Progress
              </h3>
              <p className="text-base-content/70 max-w-md mx-auto">
                Sign in to track your daily dhikr progress, set goals, and view
                your spiritual journey analytics.
              </p>
            </div>
            <div className="space-y-4">
              <a href="/login" className="btn btn-primary">
                Sign In to Track Progress
              </a>
              <p className="text-sm text-base-content/60">
                Don't have an account?{" "}
                <a href="/register" className="link link-primary">
                  Create one for free
                </a>
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="text-base-content/70">Loading your progress...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="alert alert-error max-w-md mx-auto">
              <h3 className="font-bold">Error</h3>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        ) : dhikrs.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="space-y-3">
              <Bars3Icon className="w-16 h-16 text-base-content/40 mx-auto" />
              <h3 className="text-2xl font-bold text-base-content">
                No Dhikrs Yet
              </h3>
              <p className="text-base-content/70 max-w-md mx-auto">
                Create your first dhikr to start tracking your daily progress.
              </p>
            </div>
            <a href="/" className="btn btn-primary">
              Create Your First Dhikr
            </a>
          </div>
        ) : (
          <>
            {/* Daily Summary */}
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-base-content">
                  Today's Summary
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-primary">
                      {completedDhikrs}
                    </div>
                    <div className="text-sm text-base-content/70">
                      Completed
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-base-content">
                      {totalDhikrs}
                    </div>
                    <div className="text-sm text-base-content/70">
                      Total Dhikrs
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-secondary">
                      {totalCurrentCount}
                    </div>
                    <div className="text-sm text-base-content/70">
                      Count Today
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-accent">
                      {Math.round(overallProgress)}%
                    </div>
                    <div className="text-sm text-base-content/70">
                      Progress
                    </div>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/70">Overall Progress</span>
                    <span className="text-base-content/70">
                      {totalCurrentCount} / {totalTargetCount}
                    </span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-3">
                    <div
                      className="bg-primary rounded-full h-3 transition-all duration-500"
                      style={{ width: `${Math.min(overallProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Dhikr Progress */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-base-content">
                Individual Progress
              </h2>
              <div className="space-y-4">
                {dhikrs.map((dhikr) => (
                  <DailyDhikrCard key={dhikr.id} dhikr={dhikr} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-base-content">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="/"
                  className="btn btn-outline btn-lg justify-start"
                >
                  Continue Dhikr
                </a>
                <a
                  href="/?instant=true"
                  className="btn btn-secondary btn-lg justify-start"
                >
                  Instant Tasbih
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}