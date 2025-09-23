import { Metadata } from "next";
import { names99Allah } from "@/data/99-names";
import Names99Client from "./Names99Client";
import StructuredData from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "99 Names of Allah (Asma ul Husna) - Complete List with Meanings | Tasbihfy",
  description: "Explore all 99 Beautiful Names of Allah (Asma ul Husna) with Arabic text, transliteration, English meanings, and spiritual benefits. Perfect for dhikr and meditation.",
  keywords: [
    "99 names of allah",
    "asma ul husna",
    "beautiful names allah",
    "allah names meaning",
    "islamic names",
    "dhikr",
    "muslim prayer",
    "arabic names allah",
    "asma husna list",
    "99 names benefits",
    "allah attributes",
    "islamic meditation",
  ],
  openGraph: {
    title: "99 Names of Allah (Asma ul Husna) - Complete Collection",
    description: "Discover the 99 Beautiful Names of Allah with meanings, benefits, and audio pronunciation. Perfect for Islamic dhikr and spiritual reflection.",
    type: "website",
    images: [
      {
        url: "/api/og/99-names",
        width: 1200,
        height: 630,
        alt: "99 Names of Allah - Asma ul Husna",
      },
    ],
  },
};

export default function Names99Page() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";

  // Structured data for the 99 Names collection
  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${baseUrl}/99-names`,
    "url": `${baseUrl}/99-names`,
    "name": "99 Names of Allah (Asma ul Husna)",
    "description": "Complete collection of the 99 Beautiful Names of Allah with Arabic text, transliteration, meanings, and spiritual benefits.",
    "inLanguage": ["en", "ar"],
    "isPartOf": {
      "@type": "WebSite",
      "name": "Tasbihfy",
      "url": baseUrl,
    },
    "about": {
      "@type": "Thing",
      "name": "99 Names of Allah",
      "alternateName": "Asma ul Husna",
      "description": "The 99 Beautiful Names and Attributes of Allah in Islamic tradition",
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": 99,
      "itemListElement": names99Allah.slice(0, 10).map((name, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Thing",
          "name": name.transliteration,
          "alternateName": name.arabic,
          "description": name.meaning,
          "url": `${baseUrl}/99-names/${name.slug}`,
        },
      })),
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tasbihfy",
      "url": baseUrl,
    },
  };

  // FAQ structured data
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What are the 99 Names of Allah?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The 99 Names of Allah, known as Asma ul Husna in Arabic, are the beautiful names and attributes of Allah mentioned in the Quran and Hadith. Each name represents a unique aspect of Allah's divine nature and attributes.",
        },
      },
      {
        "@type": "Question",
        "name": "What are the benefits of reciting the 99 Names of Allah?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Reciting the 99 Names of Allah brings numerous spiritual benefits including increased faith, protection, blessings, and closeness to Allah. Each name has specific benefits when recited with sincere intention and understanding.",
        },
      },
      {
        "@type": "Question",
        "name": "How should I recite the 99 Names of Allah?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The 99 Names can be recited individually or together, with contemplation of their meanings. It's recommended to recite them with proper pronunciation, understanding of meanings, and sincere intention for spiritual benefit.",
        },
      },
    ],
  };

  return (
    <>
      <StructuredData data={collectionStructuredData} />
      <StructuredData data={faqData} />
      <Names99Client />
    </>
  );
}