import { Metadata } from "next";
import StructuredData from "@/components/seo/StructuredData";
import MorningAdhkarClient from "./MorningAdhkarClient";

export const metadata: Metadata = {
  title: "Morning Adhkar (أذكار الصباح) - Complete Morning Remembrance | Tasbihfy",
  description: "Complete collection of authentic morning adhkar (أذكار الصباح) with Arabic text, transliteration, and English translation. Start your day with protection and blessings through morning remembrance.",
  keywords: [
    "morning adhkar",
    "adhkar al sabah",
    "morning remembrance",
    "morning dua",
    "morning prayers islam",
    "azkar al sabah",
    "morning dhikr",
    "islamic morning routine",
    "protection duas",
    "daily adhkar",
    "muslim morning prayers",
    "fortress of muslim",
  ],
  openGraph: {
    title: "Morning Adhkar - Complete Morning Remembrance",
    description: "Start your day with authentic morning adhkar. Complete collection with Arabic, transliteration, and translation.",
    url: "/morning-adhkar",
    type: "article",
    images: [
      {
        url: "/api/og/morning-adhkar",
        width: 1200,
        height: 630,
        alt: "Morning Adhkar - أذكار الصباح",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Morning Adhkar - أذكار الصباح",
    description: "Complete authentic morning remembrance with Arabic text and translation.",
  },
  alternates: {
    canonical: "/morning-adhkar",
  },
};

export default function MorningAdhkarPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";

  // Article structured data
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Morning Adhkar (أذكار الصباح) - Complete Morning Remembrance",
    "description": "Comprehensive guide to morning adhkar including all authentic supplications with Arabic text, transliteration, translation, and references.",
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
      "@id": `${baseUrl}/morning-adhkar`,
    },
  };

  // FAQ structured data
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What time should I recite morning adhkar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Morning adhkar should be recited after Fajr prayer until sunrise. The best time is immediately after completing the Fajr prayer, though they can be recited any time before noon if missed.",
        },
      },
      {
        "@type": "Question",
        "name": "What are the benefits of morning adhkar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Morning adhkar provides protection from evil, brings blessings for the day, increases provision (rizq), protects from anxiety and depression, and strengthens one's connection with Allah throughout the day.",
        },
      },
      {
        "@type": "Question",
        "name": "Can I recite morning adhkar in my own language?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "While it's best to recite in Arabic as the Prophet (PBUH) did, you can make personal dua in your own language. Learning the Arabic gradually with understanding is recommended for the prescribed adhkar.",
        },
      },
      {
        "@type": "Question",
        "name": "How long does it take to complete morning adhkar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Completing the full morning adhkar typically takes 10-15 minutes. You can start with essential ones if time is limited and gradually add more as you build the habit.",
        },
      },
    ],
  };

  // HowTo structured data
  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Perform Morning Adhkar",
    "description": "Step-by-step guide to performing morning remembrance (adhkar al-sabah) properly.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Complete Fajr Prayer",
        "text": "Perform your obligatory Fajr prayer first.",
      },
      {
        "@type": "HowToStep",
        "name": "Sit Facing Qibla",
        "text": "Remain seated after prayer, preferably facing the Qibla.",
      },
      {
        "@type": "HowToStep",
        "name": "Begin with Ayatul Kursi",
        "text": "Start with reciting Ayatul Kursi once for protection.",
      },
      {
        "@type": "HowToStep",
        "name": "Recite Morning Supplications",
        "text": "Go through each morning dhikr with presence of heart, following the prescribed count.",
      },
      {
        "@type": "HowToStep",
        "name": "Make Personal Dua",
        "text": "Conclude with personal supplications for the day ahead.",
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
        "name": "Morning Adhkar",
        "item": `${baseUrl}/morning-adhkar`,
      },
    ],
  };

  return (
    <>
      <StructuredData data={articleData} />
      <StructuredData data={faqData} />
      <StructuredData data={howToData} />
      <StructuredData data={breadcrumbData} />
      <MorningAdhkarClient />
    </>
  );
}