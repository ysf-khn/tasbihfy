import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cities, findCity, popularSearchTerms } from "@/data/cities";
import StructuredData from "@/components/seo/StructuredData";
import PrayerTimesLocationClient from "./PrayerTimesLocationClient";

// Generate metadata for each city
export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; city: string }>;
}): Promise<Metadata> {
  const { country, city } = await params;
  const cityData = findCity(country, city);

  if (!cityData) {
    return {
      title: "Prayer Times Not Found",
      description: "The requested prayer times location could not be found.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";
  const pageUrl = `${baseUrl}/prayer-times/${country}/${city}`;

  // Get popular search terms for this country
  const countrySearchTerms = popularSearchTerms[country as keyof typeof popularSearchTerms] || [
    `prayer times ${cityData.name}`,
    `salah times ${cityData.name}`,
    `namaz times ${cityData.name}`,
  ];

  return {
    title: `Prayer Times ${cityData.name}, ${cityData.country} - Accurate Salah Times | Tasbihfy`,
    description: `Get precise prayer times for ${cityData.name}, ${cityData.country}. Daily Fajr, Dhuhr, Asr, Maghrib, and Isha times with Qibla direction. Never miss a prayer with our Islamic prayer schedule.`,
    keywords: [
      "prayer times",
      "salah times",
      "namaz times",
      "islamic prayer",
      "muslim prayer times",
      "fajr time",
      "dhuhr time",
      "asr time",
      "maghrib time",
      "isha time",
      "qibla direction",
      "prayer schedule",
      cityData.name.toLowerCase(),
      cityData.country.toLowerCase(),
      country,
      ...countrySearchTerms.map(term => term.split(' ').pop() || ''),
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `Prayer Times ${cityData.name}, ${cityData.country} - Tasbihfy`,
      description: `Accurate Islamic prayer times for ${cityData.name}. Get daily Fajr, Dhuhr, Asr, Maghrib & Isha times with precise Qibla direction.`,
      url: pageUrl,
      type: "website",
      siteName: "Tasbihfy",
      locale: "en_US",
      images: [
        {
          url: `${baseUrl}/api/og/prayer-times?city=${encodeURIComponent(cityData.name)}&country=${encodeURIComponent(cityData.country)}`,
          width: 1200,
          height: 630,
          alt: `Prayer Times for ${cityData.name}, ${cityData.country}`,
        },
        {
          url: `${baseUrl}/icons/icon-512x512.png`,
          width: 512,
          height: 512,
          alt: "Tasbihfy - Prayer Times",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Prayer Times ${cityData.name}, ${cityData.country}`,
      description: `Accurate Islamic prayer times for ${cityData.name} with Qibla direction.`,
      images: [`${baseUrl}/api/og/prayer-times?city=${encodeURIComponent(cityData.name)}&country=${encodeURIComponent(cityData.country)}`],
    },
  };
}

// Generate static params for all cities
export async function generateStaticParams() {
  return cities.map((city) => ({
    country: city.countrySlug,
    city: city.slug,
  }));
}

export default async function PrayerTimesLocationPage({
  params,
}: {
  params: Promise<{ country: string; city: string }>;
}) {
  const { country, city } = await params;
  const cityData = findCity(country, city);

  if (!cityData) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";
  const pageUrl = `${baseUrl}/prayer-times/${country}/${city}`;

  // Structured data for prayer times page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": pageUrl,
    "url": pageUrl,
    "name": `Prayer Times ${cityData.name}, ${cityData.country}`,
    "description": `Accurate Islamic prayer times for ${cityData.name}, ${cityData.country}. Daily Fajr, Dhuhr, Asr, Maghrib, and Isha times.`,
    "inLanguage": "en-US",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Tasbihfy",
      "url": baseUrl,
    },
    "about": {
      "@type": "Thing",
      "name": "Islamic Prayer Times",
      "description": "Daily prayer schedule for Muslims",
    },
    "mainEntity": {
      "@type": "Place",
      "name": cityData.name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": cityData.name,
        "addressCountry": cityData.country,
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": cityData.lat,
        "longitude": cityData.lng,
      },
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tasbihfy",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/icons/icon-512x512.png`,
        "width": 512,
        "height": 512,
      },
    },
  };

  // Breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Prayer Times",
        "item": `${baseUrl}/prayer-times`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": cityData.country,
        "item": `${baseUrl}/prayer-times/${country}`,
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": cityData.name,
        "item": pageUrl,
      },
    ],
  };

  // FAQ structured data for common prayer time questions
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What are the prayer times in ${cityData.name} today?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The prayer times in ${cityData.name}, ${cityData.country} are calculated based on precise astronomical calculations. You can find today's Fajr, Dhuhr, Asr, Maghrib, and Isha prayer times on this page, updated daily.`,
        },
      },
      {
        "@type": "Question",
        "name": `How accurate are the prayer times for ${cityData.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Our prayer times for ${cityData.name} are calculated using precise geographical coordinates and follow standard Islamic calculation methods. The times are accurate to the minute and account for your exact location.`,
        },
      },
      {
        "@type": "Question",
        "name": `What is the Qibla direction from ${cityData.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The Qibla direction from ${cityData.name} points toward the Kaaba in Mecca, Saudi Arabia. You can find the exact compass bearing on this page along with the prayer times.`,
        },
      },
    ],
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData data={breadcrumbData} />
      <StructuredData data={faqData} />
      <PrayerTimesLocationClient
        cityData={cityData}
        initialLocation={`${cityData.lat},${cityData.lng}`}
      />
    </>
  );
}