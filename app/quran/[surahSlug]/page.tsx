import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getSurahInfo } from "@/data/surah-names";
import { parseSurahSlug, generateSurahSlug } from "@/lib/url-utils";
import StructuredData from "@/components/seo/StructuredData";
import QuranClient from "./QuranClient";

// Generate metadata for each surah
export async function generateMetadata({
  params,
}: {
  params: Promise<{ surahSlug: string }>;
}): Promise<Metadata> {
  const { surahSlug } = await params;
  const surahId = parseSurahSlug(surahSlug);
  const surahInfo = surahId ? getSurahInfo(surahId) : null;

  if (!surahInfo || !surahId || surahId < 1 || surahId > 114) {
    return {
      title: "Surah Not Found",
      description: "The requested Quran surah could not be found.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";
  const surahUrl = `${baseUrl}/quran/${generateSurahSlug(surahId)}`;

  return {
    title: `${surahInfo.name} (${surahInfo.translatedName})`,
    description: `Read Surah ${surahInfo.name} (${surahInfo.translatedName}) from the Holy Quran. ${surahInfo.versesCount} verses revealed in ${surahInfo.revelationPlace}. Available with Arabic text, transliteration, and multiple translations.`,
    keywords: [
      "quran",
      "surah",
      surahInfo.name.toLowerCase(),
      surahInfo.translatedName.toLowerCase(),
      "arabic",
      "islamic",
      "holy book",
      "verses",
      "translation",
      "recitation",
      surahInfo.revelationPlace,
    ],
    alternates: {
      canonical: surahUrl,
    },
    openGraph: {
      title: `Surah ${surahInfo.name} (${surahInfo.translatedName}) - Quran`,
      description: `Read Surah ${surahInfo.name} from the Holy Quran. ${surahInfo.versesCount} verses revealed in ${surahInfo.revelationPlace}.`,
      url: surahUrl,
      type: "article",
      siteName: "Tasbihfy",
      images: [
        {
          url: `${baseUrl}/icons/icon-512x512.png`,
          width: 512,
          height: 512,
          alt: "Tasbihfy - Quran Reader",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `Surah ${surahInfo.name} (${surahInfo.translatedName})`,
      description: `Read Surah ${surahInfo.name} from the Holy Quran. ${surahInfo.versesCount} verses revealed in ${surahInfo.revelationPlace}.`,
      images: [`${baseUrl}/icons/icon-512x512.png`],
    },
  };
}

// Generate static params for all surahs
export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    surahSlug: generateSurahSlug(i + 1),
  }));
}

// Server component that handles metadata and structured data
export default async function SurahPage({
  params,
}: {
  params: Promise<{ surahSlug: string }>;
}) {
  const { surahSlug } = await params;
  const surahId = parseSurahSlug(surahSlug);
  const surahInfo = surahId ? getSurahInfo(surahId) : null;

  if (!surahInfo || !surahId || surahId < 1 || surahId > 114) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";

  // Structured data for this Quran surah
  const surahStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Surah ${surahInfo.name} (${surahInfo.translatedName})`,
    description: `Surah ${surahInfo.name} from the Holy Quran. ${surahInfo.versesCount} verses revealed in ${surahInfo.revelationPlace}. Read with Arabic text, transliteration, and translations.`,
    author: {
      "@type": "Organization",
      name: "Tasbihfy App",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Tasbihfy App",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icons/icon-512x512.png`,
        width: 512,
        height: 512,
      },
    },
    url: `${baseUrl}/quran/${generateSurahSlug(surahId)}`,
    mainEntityOfPage: `${baseUrl}/quran/${generateSurahSlug(surahId)}`,
    datePublished: "2024-01-01",
    dateModified: new Date().toISOString(),
    image: {
      "@type": "ImageObject",
      url: `${baseUrl}/icons/icon-512x512.png`,
      width: 512,
      height: 512,
    },
    articleSection: "Holy Quran",
    keywords: [
      "quran",
      "surah",
      surahInfo.name.toLowerCase(),
      surahInfo.translatedName.toLowerCase(),
      "arabic",
      "islamic",
      "holy book",
      surahInfo.revelationPlace,
    ],
    inLanguage: ["en", "ar"],
    isPartOf: {
      "@type": "WebSite",
      name: "Tasbihfy",
      url: baseUrl,
    },
    about: {
      "@type": "Thing",
      name: "Holy Quran",
      description: "The holy book of Islam",
    },
    mentions: {
      "@type": "Book",
      name: "The Holy Quran",
      author: {
        "@type": "Person",
        name: "Prophet Muhammad (PBUH)",
      },
      inLanguage: "ar",
    },
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Quran",
        item: `${baseUrl}/quran`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Surah ${surahInfo.name}`,
        item: `${baseUrl}/quran/${generateSurahSlug(surahId)}`,
      },
    ],
  };

  return (
    <>
      <StructuredData data={surahStructuredData} />
      <StructuredData data={breadcrumbStructuredData} />
      <QuranClient surahId={surahId} />
    </>
  );
}
