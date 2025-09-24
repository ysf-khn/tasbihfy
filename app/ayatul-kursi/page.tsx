import { Metadata } from "next";
import StructuredData from "@/components/seo/StructuredData";
import AyatulKursiClient from "./AyatulKursiClient";

export const metadata: Metadata = {
  title: "Ayatul Kursi (آية الكرسي) - The Throne Verse | Quran 2:255",
  description: "Read Ayatul Kursi with Arabic text, transliteration, English translation, and audio. Learn the benefits and virtues of reciting this powerful verse of protection from the Quran.",
  keywords: [
    "ayatul kursi",
    "ayat al kursi",
    "throne verse",
    "quran 2:255",
    "protection dua",
    "islamic prayer",
    "arabic text",
    "transliteration",
    "benefits of ayatul kursi",
    "verse of the throne",
    "al baqarah 255",
    "most powerful verse quran",
  ],
  openGraph: {
    title: "Ayatul Kursi - The Most Powerful Verse of Protection",
    description: "Recite Ayatul Kursi (Quran 2:255) with Arabic text, translation, and audio. Discover its spiritual benefits and protection.",
    url: "/ayatul-kursi",
    type: "article",
    images: [
      {
        url: "/api/og/verse?surah=2&verse=255",
        width: 1200,
        height: 630,
        alt: "Ayatul Kursi - The Throne Verse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayatul Kursi - The Throne Verse",
    description: "The most powerful verse of protection in the Quran. Read with translation and audio.",
  },
  alternates: {
    canonical: "/ayatul-kursi",
  },
};

export default function AyatulKursiPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";

  // Article structured data for SEO
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Ayatul Kursi (The Throne Verse) - Quran 2:255",
    "description": "Complete guide to Ayatul Kursi including Arabic text, transliteration, translation, benefits, and audio recitation.",
    "author": {
      "@type": "Organization",
      "name": "Tasbihfy",
      "url": baseUrl,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tasbihfy",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/icons/icon-512x512.png`,
      },
    },
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/ayatul-kursi`,
    },
    "image": `${baseUrl}/api/og/verse?surah=2&verse=255`,
  };

  // FAQ structured data
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Ayatul Kursi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ayatul Kursi is verse 255 of Surah Al-Baqarah (Chapter 2) in the Quran. It is considered one of the most powerful verses, describing Allah's sovereignty, knowledge, and power over all creation.",
        },
      },
      {
        "@type": "Question",
        "name": "What are the benefits of reciting Ayatul Kursi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "According to hadith, reciting Ayatul Kursi provides protection from evil, brings peace, and is recommended after prayers, before sleep, and when leaving home. The Prophet (PBUH) called it the greatest verse in the Quran.",
        },
      },
      {
        "@type": "Question",
        "name": "When should I recite Ayatul Kursi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It is recommended to recite Ayatul Kursi after each obligatory prayer, before sleeping, when leaving home, for protection during travel, and in times of fear or anxiety.",
        },
      },
      {
        "@type": "Question",
        "name": "How many times should I recite Ayatul Kursi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "While there's no fixed number, it's recommended to recite it at least once after each prayer and before sleep. Some scholars suggest reciting it 3 times for increased protection.",
        },
      },
    ],
  };

  // HowTo structured data
  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Recite Ayatul Kursi for Protection",
    "description": "Step-by-step guide to properly reciting Ayatul Kursi for spiritual protection and blessings.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Perform Wudu",
        "text": "While not obligatory for dhikr, it's recommended to be in a state of purity.",
      },
      {
        "@type": "HowToStep",
        "name": "Find a Quiet Place",
        "text": "Choose a clean, quiet place where you can focus on your recitation.",
      },
      {
        "@type": "HowToStep",
        "name": "Begin with Intention",
        "text": "Make intention (niyyah) to recite for Allah's pleasure and protection.",
      },
      {
        "@type": "HowToStep",
        "name": "Recite with Understanding",
        "text": "Recite slowly, pondering the meaning of each verse.",
      },
      {
        "@type": "HowToStep",
        "name": "Complete with Dua",
        "text": "After recitation, make dua for protection and blessings.",
      },
    ],
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
        "name": "Ayatul Kursi",
        "item": `${baseUrl}/ayatul-kursi`,
      },
    ],
  };

  return (
    <>
      <StructuredData data={articleData} />
      <StructuredData data={faqData} />
      <StructuredData data={howToData} />
      <StructuredData data={breadcrumbData} />
      <AyatulKursiClient />
    </>
  );
}