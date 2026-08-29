"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import Link from "next/link";
import { getHadithOfTheDay, type Hadith } from "@/lib/hadith-utils";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import type { PrayerTimesData, PrayerTime } from "@/types/prayer";
import {
  BookOpenIcon,
  DocumentTextIcon,
  SparklesIcon,
  HeartIcon,
  SunIcon,
  MoonIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import NightlyRecitationsCard from "@/components/nightly/NightlyRecitationsCard";
import TodayStrip from "@/components/home/TodayStrip";
import SeasonalAdhkar from "@/components/home/SeasonalAdhkar";
import PrayerTimetableCompact from "@/components/prayer/PrayerTimetableCompact";

/**
 * Everything the primary navigation does NOT already reach. Tasbih, Prayer
 * Times and Quran used to sit here as large cards, but the mobile bottom nav
 * and the desktop header nav both carry them, so they were pure duplication
 * that pushed the genuinely undiscoverable pages below the fold.
 */
const explore = [
  { title: "Duas", href: "/duas", icon: DocumentTextIcon },
  { title: "99 Names", href: "/99-names", icon: HeartIcon },
  { title: "Morning Adhkar", href: "/morning-adhkar", icon: SunIcon },
  { title: "Evening Adhkar", href: "/evening-adhkar", icon: MoonIcon },
  { title: "Ayatul Kursi", href: "/ayatul-kursi", icon: BookOpenIcon },
];

interface HeroBandProps {
  prayerData: PrayerTimesData | null;
  loading: boolean;
  error: string | null;
  nextPrayer: { prayer: PrayerTime; timeUntil: string } | null;
}

function HeroBand({ prayerData, loading, error, nextPrayer }: HeroBandProps) {
  // Sunrise is in the timetable but isn't a prayer, so it stays out of the strip
  const strip = (prayerData?.prayers ?? []).filter(
    (p) => p.name !== "shurooq"
  );

  return (
    <Link href="/prayer-times" className="block">
      <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-content">
        <div
          className="absolute inset-0 pattern-star pattern-fade-top"
          aria-hidden="true"
        />
        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          {loading ? (
            <div className="flex items-center gap-3 py-4">
              <div className="loading loading-spinner loading-sm" />
              <span className="text-sm opacity-80">
                Loading prayer times...
              </span>
            </div>
          ) : error ? (
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

          {/* The band had a wide empty middle on desktop; the day's five
              prayers fill it without costing any vertical space. */}
          {strip.length > 0 && (
            <div className="hidden sm:flex items-stretch justify-between gap-2 mt-5 pt-4 border-t border-primary-content/20">
              {strip.map((prayer) => (
                <div
                  key={prayer.name}
                  className={`flex flex-col items-center flex-1 rounded-lg py-1.5 ${
                    prayer.isNext
                      ? "bg-primary-content/10"
                      : prayer.isPast
                      ? "opacity-45"
                      : "opacity-80"
                  }`}
                >
                  <span className="text-[0.65rem] uppercase tracking-[0.14em] capitalize">
                    {prayer.name}
                  </span>
                  <span className="text-sm font-semibold tabular-nums mt-0.5">
                    {prayer.time}
                  </span>
                </div>
              ))}
            </div>
          )}

          {prayerData?.hijri && (
            <div className="mt-4 border-t border-primary-content/20 pt-3 sm:border-t-0 sm:pt-0 flex items-center justify-between text-xs">
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
          {/* Left-aligned and upright: centred italic is fine for one line and
              punishing for four. The gold ornament carries the decoration. */}
          <blockquote className="text-base-content leading-relaxed">
            &ldquo;{hadith.text}&rdquo;
          </blockquote>
          <cite className="mt-3 block text-sm text-base-content/60 not-italic">
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

function GuestPrompt() {
  return (
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
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);

  // One instance for the whole page — the band, the strip and the sidebar
  // timetable all read from it rather than each firing their own fetch.
  const { prayerData, loading, error, nextPrayer } = usePrayerTimes();

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
          <div className="lg:col-span-2 space-y-6">
            <HeroBand
              prayerData={prayerData}
              loading={loading}
              error={error}
              nextPrayer={nextPrayer}
            />

            <TodayStrip user={user} />

            {/* Near the top, where a guest will actually see it — it used to
                sit below every card on the page. */}
            {!user && <GuestPrompt />}

            <SeasonalAdhkar prayerData={prayerData} />

            {/* Shows only after sunset */}
            <NightlyRecitationsCard />

            {/* Hadith (mobile — the sidebar carries it on desktop) */}
            <div className="lg:hidden">
              <HadithCard hadith={dailyHadith} />
            </div>

            <div className="space-y-5 pt-2">
              <h2 className="heading-ornate text-xl lg:text-2xl font-bold text-base-content">
                Explore
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {explore.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className="group card bg-base-100 border border-base-300 hover:border-secondary/50 transition-colors duration-200 cursor-pointer h-full">
                        <div className="card-body p-3 sm:p-4 items-center text-center gap-2">
                          <span className="star-8 bg-primary/10 text-primary w-10 h-10 shrink-0 flex items-center justify-center">
                            <span className="flex items-center justify-center">
                              <IconComponent className="w-5 h-5" />
                            </span>
                          </span>
                          <h3 className="font-semibold text-xs sm:text-sm leading-tight text-balance">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Area (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <PrayerTimetableCompact
                prayerData={prayerData}
                loading={loading}
              />
              <HadithCard hadith={dailyHadith} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
