import type { MetadataRoute } from "next";
import { generateSurahSlug, duaCategories, createSlug } from "@/lib/url-utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";

  // Static routes with their priorities and change frequencies
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/quran`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/duas`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/prayer-times`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/daily`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Generate Quran surah pages with SEO-friendly slugs
  const quranSurahs: MetadataRoute.Sitemap = Array.from(
    { length: 114 },
    (_, i) => ({
      url: `${baseUrl}/quran/${generateSurahSlug(i + 1)}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })
  );

  // Generate duas chapter pages with category structure
  const hisnulMuslim = require("@/data/hisnul-muslim-complete.json");
  const duasChapters: MetadataRoute.Sitemap = hisnulMuslim.chapters.map((chapter: { id: number; title: string }) => {
    const category = duaCategories[chapter.id as keyof typeof duaCategories] || "general";
    const duaSlug = createSlug(chapter.title);
    return {
      url: `${baseUrl}/duas/${category}/${duaSlug}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    };
  });

  // Generate common dhikr pages
  const commonDhikrTypes = [
    "subhanallah-33-times",
    "alhamdulillah-33-times",
    "allahu-akbar-34-times",
    "la-illaha-illa-allah",
    "astaghfirullah",
    "bismillah",
  ];

  const dhikrPages: MetadataRoute.Sitemap = commonDhikrTypes.map((type) => ({
    url: `${baseUrl}/dhikr/${type}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...quranSurahs, ...duasChapters, ...dhikrPages];
}