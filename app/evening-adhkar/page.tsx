import { Metadata } from "next";
import StructuredData from "@/components/seo/StructuredData";
import EveningAdhkarClient from "./EveningAdhkarClient";

export const metadata: Metadata = {
  title: "Evening Adhkar (أذكار المساء) - Complete Evening Remembrance | Tasbihfy",
  description: "Complete collection of authentic evening adhkar (أذكار المساء) with Arabic text, transliteration, and English translation. End your day with protection and peace through evening remembrance.",
  keywords: [
    "evening adhkar",
    "adhkar al masa",
    "evening remembrance",
    "evening dua",
    "evening prayers islam",
    "azkar al masa",
    "evening dhikr",
    "islamic evening routine",
    "night protection duas",
    "daily adhkar",
    "muslim evening prayers",
    "fortress of muslim",
  ],
  openGraph: {
    title: "Evening Adhkar - Complete Evening Remembrance",
    description: "End your day with authentic evening adhkar. Complete collection with Arabic, transliteration, and translation.",
    url: "/evening-adhkar",
    type: "article",
    images: [
      {
        url: "/api/og/evening-adhkar",
        width: 1200,
        height: 630,
        alt: "Evening Adhkar - أذكار المساء",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Evening Adhkar - أذكار المساء",
    description: "Complete authentic evening remembrance with Arabic text and translation.",
  },
  alternates: {
    canonical: "/evening-adhkar",
  },
};

export default function EveningAdhkarPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";

  // Article structured data
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Evening Adhkar (أذكار المساء) - Complete Evening Remembrance",
    "description": "Comprehensive guide to evening adhkar including all authentic supplications with Arabic text, transliteration, translation, and references.",
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
      "@id": `${baseUrl}/evening-adhkar`,
    },
  };

  // FAQ structured data
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What time should I recite evening adhkar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evening adhkar should be recited after Asr prayer until Maghrib. The best time is before sunset, though they can be recited any time in the evening if missed.",
        },
      },
      {
        "@type": "Question",
        "name": "What are the benefits of evening adhkar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evening adhkar provides protection through the night, peaceful sleep, protection from nightmares and evil, forgiveness of sins, and strengthens faith before ending the day.",
        },
      },
      {
        "@type": "Question",
        "name": "Can I recite evening adhkar in my own language?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "While it's best to recite in Arabic as the Prophet (PBUH) did, you can make personal dua in your own language. Learning the Arabic gradually with understanding is recommended for the prescribed adhkar.",
        },
      },
      {
        "@type": "Question",
        "name": "What if I miss the evening adhkar time?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If you miss the ideal time (after Asr), you can still recite them before sleeping. The important thing is to maintain the habit of remembering Allah in the evening.",
        },
      },
    ],
  };

  // HowTo structured data
  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Perform Evening Adhkar",
    "description": "Step-by-step guide to performing evening remembrance (adhkar al-masa) properly.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Best Time After Asr",
        "text": "Ideally perform after Asr prayer before Maghrib.",
      },
      {
        "@type": "HowToStep",
        "name": "Find a Quiet Place",
        "text": "Choose a peaceful spot for concentration.",
      },
      {
        "@type": "HowToStep",
        "name": "Begin with Ayatul Kursi",
        "text": "Start with reciting Ayatul Kursi for night protection.",
      },
      {
        "@type": "HowToStep",
        "name": "Recite Evening Supplications",
        "text": "Go through each evening dhikr with presence of heart, following the prescribed count.",
      },
      {
        "@type": "HowToStep",
        "name": "End with Personal Dua",
        "text": "Conclude with personal supplications for protection through the night.",
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
        "name": "Evening Adhkar",
        "item": `${baseUrl}/evening-adhkar`,
      },
    ],
  };

  return (
    <>
      <StructuredData data={articleData} />
      <StructuredData data={faqData} />
      <StructuredData data={howToData} />
      <StructuredData data={breadcrumbData} />
      <EveningAdhkarClient />
    </>
  );
}