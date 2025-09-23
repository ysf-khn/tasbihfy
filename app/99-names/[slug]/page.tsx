import { Metadata } from "next";
import { notFound } from "next/navigation";
import { names99Allah, findNameBySlug } from "@/data/99-names";
import StructuredData from "@/components/seo/StructuredData";
import NameDetailClient from "./NameDetailClient";

// Generate metadata for each name
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = findNameBySlug(slug);

  if (!name) {
    return {
      title: "Name Not Found",
      description: "The requested name of Allah could not be found.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";
  const pageUrl = `${baseUrl}/99-names/${slug}`;

  return {
    title: `${name.transliteration} (${name.arabic}) - ${name.meaning} | 99 Names of Allah`,
    description: `Learn about ${name.transliteration} - ${name.meaning}. ${name.description} Discover the spiritual benefits and meaning of this beautiful name of Allah.`,
    keywords: [
      "99 names of allah",
      "asma ul husna",
      name.transliteration.toLowerCase(),
      name.meaning.toLowerCase(),
      "allah names meaning",
      "islamic dhikr",
      "muslim prayer",
      "spiritual benefits",
      "allah attributes",
      `${name.transliteration} meaning`,
      `${name.transliteration} benefits`,
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${name.transliteration} - ${name.meaning}`,
      description: `${name.description} Learn about the spiritual benefits and meaning of ${name.transliteration}, one of the 99 Beautiful Names of Allah.`,
      url: pageUrl,
      type: "article",
      siteName: "Tasbihfy",
      images: [
        {
          url: `${baseUrl}/api/og/99-names/${slug}`,
          width: 1200,
          height: 630,
          alt: `${name.transliteration} - ${name.meaning}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name.transliteration} - ${name.meaning}`,
      description: `${name.description}`,
      images: [`${baseUrl}/api/og/99-names/${slug}`],
    },
  };
}

// Generate static params for all names
export async function generateStaticParams() {
  return names99Allah.map((name) => ({
    slug: name.slug,
  }));
}

export default async function NameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = findNameBySlug(slug);

  if (!name) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";
  const pageUrl = `${baseUrl}/99-names/${slug}`;

  // Structured data for this name
  const nameStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": pageUrl,
    "url": pageUrl,
    "headline": `${name.transliteration} - ${name.meaning}`,
    "description": name.description,
    "inLanguage": ["en", "ar"],
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
        "width": 512,
        "height": 512,
      },
    },
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString(),
    "articleSection": "99 Names of Allah",
    "keywords": [
      "99 names of allah",
      "asma ul husna",
      name.transliteration.toLowerCase(),
      name.meaning.toLowerCase(),
    ],
    "about": {
      "@type": "Thing",
      "name": name.transliteration,
      "alternateName": name.arabic,
      "description": name.meaning,
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "Tasbihfy",
      "url": baseUrl,
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
        "name": "99 Names of Allah",
        "item": `${baseUrl}/99-names`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": name.transliteration,
        "item": pageUrl,
      },
    ],
  };

  // FAQ structured data for this name
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What does ${name.transliteration} mean?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${name.transliteration} means "${name.meaning}". ${name.description}`,
        },
      },
      {
        "@type": "Question",
        "name": `What are the benefits of reciting ${name.transliteration}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": name.benefits,
        },
      },
      {
        "@type": "Question",
        "name": `How do you pronounce ${name.transliteration}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${name.transliteration} is pronounced as written in the transliteration. The Arabic text is ${name.arabic}.`,
        },
      },
    ],
  };

  return (
    <>
      <StructuredData data={nameStructuredData} />
      <StructuredData data={breadcrumbData} />
      <StructuredData data={faqData} />
      <NameDetailClient name={name} />
    </>
  );
}