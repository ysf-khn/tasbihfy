import { Metadata } from "next";
import StructuredData from "@/components/seo/StructuredData";
import DuroodShareefClient from "./DuroodShareefClient";

export const metadata: Metadata = {
  title: "Durood Shareef - Salutations upon Prophet Muhammad (PBUH) | Tasbihfy",
  description: "Complete collection of authentic Durood Shareef with Arabic text, transliteration, and English translation. Send blessings upon Prophet Muhammad (PBUH) with various forms of salawat.",
  keywords: [
    "durood shareef",
    "durood sharif",
    "salawat",
    "salutations prophet",
    "durood ibrahim",
    "blessings prophet muhammad",
    "send prayers prophet",
    "durood pak",
    "salat alan nabi",
    "islamic blessings",
    "prophet muhammad pbuh",
    "durood benefits",
  ],
  openGraph: {
    title: "Durood Shareef - Blessings upon Prophet Muhammad (PBUH)",
    description: "Send authentic salutations upon Prophet Muhammad (PBUH). Complete collection with Arabic, transliteration, and translation.",
    url: "/durood-shareef",
    type: "article",
    images: [
      {
        url: "/api/og/durood-shareef",
        width: 1200,
        height: 630,
        alt: "Durood Shareef - صلوات على النبي",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Durood Shareef - صلوات على النبي",
    description: "Send authentic blessings upon Prophet Muhammad (PBUH) with various forms of Durood.",
  },
  alternates: {
    canonical: "/durood-shareef",
  },
};

export default function DuroodShareefPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";

  // Article structured data
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Durood Shareef - Complete Collection of Salutations upon Prophet Muhammad (PBUH)",
    "description": "Comprehensive guide to Durood Shareef including various authentic forms of sending blessings upon Prophet Muhammad (PBUH) with Arabic text, transliteration, translation, and benefits.",
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
      "@id": `${baseUrl}/durood-shareef`,
    },
  };

  // FAQ structured data
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Durood Shareef?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Durood Shareef (also called Salawat) is sending prayers and blessings upon Prophet Muhammad (PBUH). It is a form of worship and remembrance that brings immense spiritual benefits and closeness to the Prophet (PBUH).",
        },
      },
      {
        "@type": "Question",
        "name": "What are the benefits of reciting Durood Shareef?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Prophet (PBUH) said whoever sends one durood upon him, Allah will send ten upon them. Other benefits include closeness to the Prophet on Judgment Day, forgiveness of sins, answered prayers, and spiritual purification.",
        },
      },
      {
        "@type": "Question",
        "name": "When should I recite Durood Shareef?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Durood should be recited whenever the Prophet's name is mentioned, during prayers, on Fridays, between Maghrib and Isha, and as much as possible throughout the day. There's no specific time limit.",
        },
      },
      {
        "@type": "Question",
        "name": "Which is the most complete form of Durood?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Durood Ibrahim is considered the most complete form, as it's recited during Salah. It includes sending prayers upon Prophet Muhammad and his family, comparing it to the prayers sent upon Prophet Ibrahim and his family.",
        },
      },
    ],
  };

  // HowTo structured data
  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Recite Durood Shareef",
    "description": "Guide to properly sending blessings upon Prophet Muhammad (PBUH).",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Choose the Form",
        "text": "Select any authentic form of Durood. Durood Ibrahim is most complete, while simple 'Sallallahu alayhi wa sallam' is also blessed.",
      },
      {
        "@type": "HowToStep",
        "name": "Recite with Love",
        "text": "Recite with love and reverence for the Prophet (PBUH), understanding the meaning.",
      },
      {
        "@type": "HowToStep",
        "name": "Be Consistent",
        "text": "Make it a daily habit. Recite after prayers, on Fridays, and whenever the Prophet's name is mentioned.",
      },
      {
        "@type": "HowToStep",
        "name": "Increase on Friday",
        "text": "Send abundant durood on Fridays, as it has special significance and rewards.",
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
        "name": "Durood Shareef",
        "item": `${baseUrl}/durood-shareef`,
      },
    ],
  };

  return (
    <>
      <StructuredData data={articleData} />
      <StructuredData data={faqData} />
      <StructuredData data={howToData} />
      <StructuredData data={breadcrumbData} />
      <DuroodShareefClient />
    </>
  );
}