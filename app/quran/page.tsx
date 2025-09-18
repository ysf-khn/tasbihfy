import { Metadata } from "next";
import StructuredData from "@/components/seo/StructuredData";
import QuranClient from "./QuranClient";

export const metadata: Metadata = {
  title: "Read Quran Online - All 114 Surahs with Translation and Recitation",
  description:
    "Read the complete Holy Quran with Arabic text, transliteration, and multiple translations. Features 114 surahs with audio recitation, bookmarks, and search functionality.",
  keywords: [
    "quran",
    "holy quran",
    "al quran",
    "islamic",
    "arabic",
    "surah",
    "verses",
    "translation",
    "transliteration",
    "recitation",
    "audio",
    "online quran",
    "quran reader",
    "muslim",
    "islam",
  ],
  alternates: {
    canonical: "/quran",
  },
  openGraph: {
    title: "Read Quran Online - All 114 Surahs with Translation and Recitation",
    description:
      "Read the complete Holy Quran with Arabic text, transliteration, and multiple translations. 114 surahs with audio recitation.",
    url: "/quran",
    type: "website",
    siteName: "Tasbihfy",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Tasbihfy - Quran Reader",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Read Quran Online - All 114 Surahs with Translation and Recitation",
    description:
      "Read the complete Holy Quran with Arabic text, transliteration, and multiple translations. 114 surahs with audio recitation.",
    images: ["/icons/icon-512x512.png"],
  },
};

export default function QuranPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";

  // Structured data for Quran page
  const quranStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Read Quran Online - All 114 Surahs with Translation and Recitation",
    description:
      "Read the complete Holy Quran with Arabic text, transliteration, and multiple translations. Features 114 surahs with audio recitation.",
    url: `${baseUrl}/quran`,
    mainEntity: {
      "@type": "Book",
      name: "The Holy Quran",
      author: {
        "@type": "Person",
        name: "Prophet Muhammad (PBUH)",
      },
      inLanguage: "ar",
      numberOfPages: "604",
      bookFormat: "https://schema.org/EBook",
      genre: "Religious Text",
      about: {
        "@type": "Thing",
        name: "Islam",
        description: "The religion of Islam",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "Tasbihfy App",
      url: baseUrl,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Tasbihfy",
      url: baseUrl,
    },
    breadcrumb: {
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
      ],
    },
  };

  return (
    <>
      <StructuredData data={quranStructuredData} />
      <QuranClient />
    </>
  );
}
