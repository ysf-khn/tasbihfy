import type { MetadataRoute } from "next";
import { generateSurahSlug, duaCategories, createSlug } from "@/lib/url-utils";
import { names99Allah } from "@/data/99-names";
import { cities } from "@/data/cities";

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

  // Generate 99 Names of Allah pages
  const names99Pages: MetadataRoute.Sitemap = names99Allah.map((name) => ({
    url: `${baseUrl}/99-names/${name.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Add main 99 Names index page
  const names99IndexPage: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/99-names`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  // Generate prayer times pages for major cities (top 50 for SEO)
  const majorCities = cities.slice(0, 50); // Top 50 cities
  const prayerTimesPages: MetadataRoute.Sitemap = majorCities.map((city) => ({
    url: `${baseUrl}/prayer-times/${city.countrySlug}/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Add special Quran verses with high search volume
  const specialVerses = [
    { surah: "2-al-baqarah", verse: 255, name: "Ayat al-Kursi" },
    { surah: "2-al-baqarah", verse: 286, name: "Last verse of Al-Baqarah" },
    { surah: "36-ya-sin", verse: 1, name: "Opening of Surah Yaseen" },
    { surah: "67-al-mulk", verse: 1, name: "Opening of Surah Mulk" },
    { surah: "112-al-ikhlas", verse: 1, name: "Surah Ikhlas opening" },
    { surah: "1-al-fatiha", verse: 1, name: "Opening of the Quran" },
    { surah: "3-ali-imran", verse: 185, name: "Every soul shall taste death" },
    { surah: "2-al-baqarah", verse: 152, name: "Remember Me" },
    { surah: "94-ash-sharh", verse: 5, name: "With hardship comes ease" },
    { surah: "93-ad-duhaa", verse: 5, name: "Your Lord has not abandoned you" },
  ];

  const specialVersesPages: MetadataRoute.Sitemap = specialVerses.map((verse) => ({
    url: `${baseUrl}/quran/${verse.surah}/verse/${verse.verse}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...names99IndexPage,
    ...names99Pages,
    ...quranSurahs,
    ...specialVersesPages,
    ...duasChapters,
    ...prayerTimesPages,
    ...dhikrPages,
  ];
}