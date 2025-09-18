import { Metadata } from "next";
import { parseLocationSlug } from "@/lib/url-utils";
import { pageMetadata } from "@/lib/metadata-utils";
import PrayerClient from "./PrayerClient";

// Generate metadata for each location
export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location } = await params;
  const locationName = parseLocationSlug(location);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";
  const pageUrl = `${baseUrl}/prayer-times/${location}`;

  return {
    title: `Prayer Times & Qibla Direction for ${locationName} | Tasbihfy`,
    description: `Get accurate prayer times for Fajr, Dhuhr, Asr, Maghrib, and Isha with Qibla compass direction for ${locationName}. Never miss a prayer with notifications.`,
    keywords: [
      "prayer times",
      "salah times",
      "namaz times",
      "qibla direction",
      "islamic prayer",
      "fajr",
      "dhuhr",
      "asr",
      "maghrib",
      "isha",
      locationName.toLowerCase(),
      "muslim prayer schedule",
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `Prayer Times for ${locationName} - Tasbihfy`,
      description: `Accurate prayer times for ${locationName} with Qibla direction. Get notifications for all 5 daily prayers.`,
      url: pageUrl,
      type: "website",
      siteName: "Tasbihfy",
      images: [
        {
          url: `${baseUrl}/icons/icon-512x512.png`,
          width: 512,
          height: 512,
          alt: "Tasbihfy - Prayer Times",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `Prayer Times for ${locationName}`,
      description: `Accurate prayer times for ${locationName} with Qibla direction.`,
      images: [`${baseUrl}/icons/icon-512x512.png`],
    },
  };
}

export default function PrayerTimesPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  return <PrayerClient />;
}