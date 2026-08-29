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
  MapPinIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import NightlyRecitationsCard from "@/components/nightly/NightlyRecitationsCard";

// Feature cards data
const features = [
  {
    id: "dhikr",
    title: "Tasbih Counter",
    description: "Track your daily remembrance",
    icon: SparklesIcon,
    href: "/dhikr",
  },
  {
    id: "prayer",
    title: "Prayer Times",
    description: "Never miss a prayer",
    icon: ClockIcon,
    href: "/prayer-times",
  },
  {
    id: "quran",
    title: "Quran",
    description: "Read with audio & translations",
    icon: BookOpenIcon,
    href: "/quran",
  },
  {
    id: "duas",
    title: "Duas",
    description: "Daily supplications collection",
    icon: DocumentTextIcon,
    href: "/duas",
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

function HeroBand() {
  const {
    prayerData,
    loading: prayerLoading,
    error: prayerError,
    nextPrayer,
  } = usePrayerTimes();

  return (
    <Link href="/prayer-times" className="block">
      <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-content">
        <div className="absolute inset-0 pattern-star pattern-fade-top" aria-hidden="true" />
        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          {prayerLoading ? (
            <div className="flex items-center gap-3 py-4">
              <div className="loading loading-spinner loading-sm" />
              <span className="text-sm opacity-80">
                Loading prayer times...
              </span>
            </div>
          ) : prayerError ? (
            <div className="py-4">
              <div className="font-semibold">Prayer times unavailable</div>
              <div className="text-sm opacity-75 mt-1">
                Tap to set your location
              </div>
            </div>
          ) : nextPrayer ? (
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] opacity-75">
                  Next Prayer
                </div>
                <div className="mt-1 text-3xl sm:text-4xl font-bold capitalize">
                  {nextPrayer.prayer.name}
                </div>
                <div className="mt-1 text-sm opacity-85">
                  in {nextPrayer.timeUntil}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold tabular-nums">
                  {nextPrayer.prayer.time}
                </div>
                {prayerData?.location && (
                  <div className="mt-1 flex items-center justify-end gap-1 text-xs opacity-75">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    {prayerData.location.name}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="font-semibold">Prayer times</div>
              <div className="text-sm opacity-75 mt-1">
                Tap to set your location
              </div>
            </div>
          )}

          {prayerData?.hijri && (
            <div className="mt-4 border-t border-primary-content/20 pt-3 flex items-center justify-between text-xs">
              <span className="opacity-85">
                {prayerData.hijri.day} {prayerData.hijri.monthEn}{" "}
                {prayerData.hijri.year} AH
              </span>
              <span className="opacity-60">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function HadithCard({ hadith }: { hadith: Hadith | null }) {
  return (
    <div className="frame-gold rounded-2xl bg-base-100 p-6 sm:p-7">
      <div className="ornament-divider mb-4">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]">
          Hadith of the Day
        </span>
      </div>
      {hadith ? (
        <>
          <blockquote className="text-base-content leading-relaxed italic text-center">
            &ldquo;{hadith.text}&rdquo;
          </blockquote>
          <cite className="mt-3 block text-center text-sm text-base-content/60 not-italic">
            — {hadith.source}
          </cite>
        </>
      ) : (
        <div className="flex items-center justify-center py-4">
          <div className="loading loading-spinner loading-md text-primary" />
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);

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
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <HeroBand />

            {/* Hadith (mobile — sidebar carries it on desktop) */}
            <div className="lg:hidden">
              <HadithCard hadith={dailyHadith} />
            </div>

            {/* Nightly Recitations Card - Shows only after sunset */}
            <NightlyRecitationsCard />

            {/* Main Features Grid */}
            <div className="space-y-5">
              <h2 className="heading-ornate text-xl lg:text-2xl font-bold text-base-content">
                Your Companion
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <Link key={feature.id} href={feature.href}>
                      <div className="group card bg-base-100 border border-base-300 hover:border-secondary/50 transition-colors duration-200 cursor-pointer h-full">
                        <div className="card-body flex-row items-center gap-4">
                          <span className="star-8 bg-primary/10 text-primary w-11 h-11 shrink-0 flex items-center justify-center">
                            <span className="flex items-center justify-center">
                              <IconComponent className="w-5 h-5" />
                            </span>
                          </span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg">
                              {feature.title}
                            </h3>
                            <p className="text-base-content/65 text-sm">
                              {feature.description}
                            </p>
                          </div>
                          <ChevronRightIcon className="w-4 h-4 text-base-content/30 group-hover:text-secondary transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Access */}
            <div className="space-y-5">
              <h2 className="heading-ornate text-xl lg:text-2xl font-bold text-base-content">
                Quick Access
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickAccess.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className="card bg-base-100 border border-base-300 hover:border-secondary/50 transition-colors duration-200 cursor-pointer h-full">
                        <div className="card-body p-4 items-center text-center">
                          <IconComponent className="w-7 h-7 text-primary/70 mb-1" />
                          <h4 className="font-semibold text-sm">
                            {item.title}
                          </h4>
                          <p className="text-xs text-base-content/55">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Guest Mode Encouragement */}
            {!user && (
              <div className="rounded-2xl border border-secondary/40 bg-base-100 p-5 flex items-center gap-4">
                <span className="star-8 bg-secondary/15 text-secondary w-10 h-10 shrink-0 flex items-center justify-center">
                  <span className="flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5" />
                  </span>
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-base-content">
                    Keep your progress
                  </div>
                  <div className="text-sm text-base-content/65">
                    Sign in to sync your dhikr and prayers across devices.
                  </div>
                </div>
                <Link href="/login" className="btn btn-primary btn-sm">
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar Area (desktop) */}
          <div className="hidden lg:block space-y-6">
            <div className="sticky top-24">
              <HadithCard hadith={dailyHadith} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
