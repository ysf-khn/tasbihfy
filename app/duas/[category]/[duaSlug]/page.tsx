import { notFound } from "next/navigation";
import { Metadata } from "next";
import hisnulMuslim from "@/data/hisnul-muslim-complete.json";
import { duaCategories, parseDuaSlug, generateDuaSlug, createSlug } from "@/lib/url-utils";
import ChapterClient from "./ChapterClient";
import StructuredData from "@/components/seo/StructuredData";

// Generate metadata for each dua chapter
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; duaSlug: string }>;
}): Promise<Metadata> {
  const { category, duaSlug } = await params;

  // Find the chapter by matching category and slug
  const chapter = hisnulMuslim.chapters.find((c) => {
    const chapterCategory = duaCategories[c.id as keyof typeof duaCategories] || "general";
    const chapterSlug = createSlug(c.title);
    return chapterCategory === category && chapterSlug === duaSlug;
  });

  if (!chapter) {
    return {
      title: "Dua Not Found",
      description: "The requested dua chapter could not be found.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";
  const chapterUrl = `${baseUrl}/duas/${category}/${duaSlug}`;

  return {
    title: `${chapter.title} - Islamic Duas from Hisnul Muslim | Tasbihfy`,
    description: `Read authentic Islamic duas for ${chapter.title}. Contains ${chapter.duas.length} supplications with Arabic text, transliteration, and English translation from Hisnul Muslim.`,
    keywords: [
      "dua",
      "duas",
      "islamic prayer",
      "hisnul muslim",
      "supplication",
      "dhikr",
      chapter.title.toLowerCase(),
      category,
      "arabic",
      "muslim",
      "prayer",
    ],
    alternates: {
      canonical: chapterUrl,
    },
    openGraph: {
      title: `${chapter.title} - Islamic Duas`,
      description: `Authentic Islamic duas for ${chapter.title}. Contains ${chapter.duas.length} supplications with Arabic text and translations.`,
      url: chapterUrl,
      type: "article",
      siteName: "Tasbihfy",
      images: [
        {
          url: `${baseUrl}/icons/icon-512x512.png`,
          width: 512,
          height: 512,
          alt: "Tasbihfy - Islamic Duas Collection",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${chapter.title} - Islamic Duas`,
      description: `Authentic Islamic duas for ${chapter.title}. Contains ${chapter.duas.length} supplications with Arabic text and translations.`,
      images: [`${baseUrl}/icons/icon-512x512.png`],
    },
  };
}

// Generate static params for all chapters
export async function generateStaticParams() {
  return hisnulMuslim.chapters.map((chapter) => {
    const category = duaCategories[chapter.id as keyof typeof duaCategories] || "general";
    const duaSlug = createSlug(chapter.title);
    return {
      category,
      duaSlug,
    };
  });
}

// Server component that fetches the chapter data
export default async function DuaChapterPage({
  params,
}: {
  params: Promise<{ category: string; duaSlug: string }>;
}) {
  const { category, duaSlug } = await params;

  // Find the chapter by matching category and slug
  const chapter = hisnulMuslim.chapters.find((c) => {
    const chapterCategory = duaCategories[c.id as keyof typeof duaCategories] || "general";
    const chapterSlug = createSlug(c.title);
    return chapterCategory === category && chapterSlug === duaSlug;
  });

  if (!chapter) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";

  // Structured data for this duas chapter
  const chapterStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: chapter.title,
    description: `Collection of Islamic duas for ${chapter.title}. Contains ${chapter.duas.length} authentic supplications with Arabic text, transliteration, and English translation.`,
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
    url: `${baseUrl}/duas/${category}/${duaSlug}`,
    mainEntityOfPage: `${baseUrl}/duas/${category}/${duaSlug}`,
    datePublished: "2024-01-01",
    dateModified: new Date().toISOString(),
    image: {
      "@type": "ImageObject",
      url: `${baseUrl}/icons/icon-512x512.png`,
      width: 512,
      height: 512,
    },
    articleSection: `Islamic Duas - ${category}`,
    keywords: [
      "dua",
      "duas",
      "islamic prayer",
      "hisnul muslim",
      "supplication",
      chapter.title.toLowerCase(),
      category,
    ],
    inLanguage: ["en", "ar"],
    isPartOf: {
      "@type": "WebSite",
      name: "Tasbihfy",
      url: baseUrl,
    },
  };

  // Pass the chapter data to the client component
  return (
    <>
      <StructuredData data={chapterStructuredData} />
      <ChapterClient chapter={chapter} />
    </>
  );
}