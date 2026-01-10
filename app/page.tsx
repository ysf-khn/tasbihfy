"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import Link from "next/link";
import { getHadithOfTheDay, type Hadith } from "@/lib/hadith-utils";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import {
  ClockIcon,
  BookOpenIcon,
  DocumentTextIcon,
  SparklesIcon,
  HeartIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import {
  ClockIcon as ClockIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
} from "@heroicons/react/24/solid";

// Feature cards data
const features = [
  {
    id: "dhikr",
    title: "Tasbih Counter",
    description: "Track your daily remembrance",
    icon: SparklesIcon,
    activeIcon: SparklesIcon,
    href: "/dhikr",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "prayer",
    title: "Prayer Times",
    description: "Never miss a prayer",
    icon: ClockIcon,
    activeIcon: ClockIconSolid,
    href: "/prayer-times",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: "quran",
    title: "Quran",
    description: "Read with audio & translations",
    icon: BookOpenIcon,
    activeIcon: BookOpenIconSolid,
    href: "/quran",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: "duas",
    title: "Duas",
    description: "Daily supplications collection",
    icon: DocumentTextIcon,
    activeIcon: DocumentTextIconSolid,
    href: "/duas",
    color: "text-info",
    bgColor: "bg-info/10",
  },
];

// Quick access items
const quickAccess = [
  {
    title: "99 Names",
    description: "Allah's beautiful names",
    href: "/99-names",
    icon: HeartIcon,
  },
  {
    title: "Morning Adhkar",
    description: "Start your day right",
    href: "/morning-adhkar",
    icon: SunIcon,
  },
  {
    title: "Evening Adhkar",
    description: "End your day peacefully",
    href: "/evening-adhkar",
    icon: MoonIcon,
  },
  {
    title: "Ayatul Kursi",
    description: "The throne verse",
    href: "/ayatul-kursi",
    icon: BookOpenIcon,
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);
  const {
    prayerData,
    loading: prayerLoading,
    error: prayerError,
    nextPrayer,
  } = usePrayerTimes();

  // Load daily hadith
  useEffect(() => {
    const hadith = getHadithOfTheDay();
    setDailyHadith(hadith);
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      <UnifiedHeader showSignIn={true} />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
          {/* Main Content Area - Features and Quick Access */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mobile: Hadith and Prayer at top */}
            <div className="lg:hidden space-y-6">
              {/* Daily Hadith (Mobile) */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-lg text-primary">
                    Hadith of the Day
                  </h2>
                  {dailyHadith ? (
                    <>
                      <blockquote className="text-base-content italic">
                        "{dailyHadith.text}"
                      </blockquote>
                      <cite className="text-base-content/70 text-sm">
                        — {dailyHadith.source}
                      </cite>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <div className="loading loading-spinner loading-md text-primary"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Prayer (Mobile) */}
              {prayerLoading ? (
                <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-center">
                    <div className="loading loading-spinner loading-sm text-primary"></div>
                    <span className="ml-2 text-sm text-base-content/70">
                      Loading prayer times...
                    </span>
                  </div>
                </div>
              ) : prayerError ? (
                <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-error"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01"
                      />
                    </svg>
                    <span className="text-sm font-medium text-error">
                      Prayer times unavailable
                    </span>
                  </div>
                </div>
              ) : nextPrayer ? (
                <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
                  <div className="space-y-1">
                    <div className="font-bold text-base-content">
                      Next Prayer:{" "}
                      <span className="capitalize font-bold text-primary">
                        {nextPrayer.prayer.name}
                      </span>{" "}
                      ({nextPrayer.prayer.time})
                    </div>
                    <div className="text-sm text-base-content/70">
                      in {nextPrayer.timeUntil}
                      {prayerData?.location && (
                        <span> | {prayerData.location.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Main Features Grid */}
            <div className="space-y-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-base-content">
                Explore Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {features.map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <Link key={feature.id} href={feature.href}>
                      <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer h-full">
                        <div className="card-body">
                          <div className="flex items-start space-x-4">
                            <div
                              className={`p-3 rounded-lg ${feature.bgColor}`}
                            >
                              <IconComponent
                                className={`w-6 h-6 ${feature.color}`}
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg lg:text-xl">
                                {feature.title}
                              </h3>
                              <p className="text-base-content/70 text-sm lg:text-base">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Access */}
            <div className="space-y-6">
              <h2 className="text-xl lg:text-2xl font-bold text-base-content">
                Quick Access
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {quickAccess.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                        <div className="card-body p-4 text-center">
                          <IconComponent className="w-8 h-8 mx-auto text-base-content/70 mb-2" />
                          <h4 className="font-semibold text-sm lg:text-base">
                            {item.title}
                          </h4>
                          <p className="text-xs lg:text-sm text-base-content/60 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Guest Mode Encouragement (Main Content) */}
            {!user && (
              <div className="alert alert-info">
                <SparklesIcon className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Enhanced Experience</div>
                  <div className="text-sm opacity-80">
                    Sign in to sync your progress across devices and unlock
                    advanced features.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area - Hadith and Prayer */}
          <div className="hidden lg:block space-y-6">
            {/* Daily Hadith (Sidebar) */}
            <div className="card bg-base-100 shadow-xl sticky top-24">
              <div className="card-body">
                <h2 className="card-title text-lg text-primary">
                  Hadith of the Day
                </h2>
                {dailyHadith ? (
                  <>
                    <blockquote className="text-base-content italic text-sm">
                      "{dailyHadith.text}"
                    </blockquote>
                    <cite className="text-base-content/70 text-xs">
                      — {dailyHadith.source}
                    </cite>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <div className="loading loading-spinner loading-md text-primary"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Prayer (Sidebar) */}
            {prayerLoading ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
                <div className="flex items-center justify-center">
                  <div className="loading loading-spinner loading-sm text-primary"></div>
                  <span className="ml-2 text-sm text-base-content/70">
                    Loading prayer times...
                  </span>
                </div>
              </div>
            ) : prayerError ? (
              <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-error"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01"
                    />
                  </svg>
                  <span className="text-sm font-medium text-error">
                    Prayer times unavailable
                  </span>
                </div>
              </div>
            ) : nextPrayer ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-4">
                <div className="space-y-2">
                  <div className="font-bold text-base-content">
                    Next Prayer:{" "}
                    <span className="capitalize font-bold text-primary">
                      {nextPrayer.prayer.name}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {nextPrayer.prayer.time}
                  </div>
                  <div className="text-sm text-base-content/70">
                    in {nextPrayer.timeUntil}
                  </div>
                  {prayerData?.location && (
                    <div className="text-xs text-base-content/50">
                      📍 {prayerData.location.name}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
