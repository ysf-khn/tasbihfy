"use client";

import Link from "next/link";
import {
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import type { PrayerTimesData } from "@/types/prayer";

/**
 * Morning and Evening adhkar have a window, so they shouldn't sit in the grid
 * as permanent equals. Surface whichever one is actually in season, the way
 * NightlyRecitationsCard already does for after sunset.
 *
 * Derived from the prayer timetable rather than the clock, so it follows the
 * user's real Fajr/Asr rather than a guess at what "morning" means. Renders
 * nothing until prayer data has loaded, which also keeps it off the server.
 */
export default function SeasonalAdhkar({
  prayerData,
}: {
  prayerData: PrayerTimesData | null;
}) {
  const prayers = prayerData?.prayers;
  if (!prayers?.length) return null;

  const at = (name: string) => prayers.find((p) => p.name === name);
  const fajr = at("fajr");
  const dhuhr = at("dhuhr");
  const asr = at("asr");
  const maghrib = at("maghrib");

  let season: {
    title: string;
    blurb: string;
    href: string;
    icon: typeof SunIcon;
  } | null = null;

  if (fajr?.isPast && dhuhr && !dhuhr.isPast) {
    season = {
      title: "Morning Adhkar",
      blurb: `Recite before Dhuhr at ${dhuhr.time}`,
      href: "/morning-adhkar",
      icon: SunIcon,
    };
  } else if (asr?.isPast && maghrib && !maghrib.isPast) {
    season = {
      title: "Evening Adhkar",
      blurb: `Recite before Maghrib at ${maghrib.time}`,
      href: "/evening-adhkar",
      icon: MoonIcon,
    };
  }

  if (!season) return null;

  const Icon = season.icon;

  return (
    <Link href={season.href} className="block">
      <div className="group rounded-2xl border border-secondary/40 bg-base-100 p-5 flex items-center gap-4 hover:border-secondary transition-colors duration-200">
        <span className="star-8 bg-secondary/15 text-secondary w-11 h-11 shrink-0 flex items-center justify-center">
          <span className="flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </span>
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base-content">{season.title}</div>
          <div className="text-sm text-base-content/65">{season.blurb}</div>
        </div>
        <ChevronRightIcon className="w-4 h-4 text-base-content/30 group-hover:text-secondary transition-colors" />
      </div>
    </Link>
  );
}
