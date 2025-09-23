import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSurahInfo } from "@/data/surah-names";
import { parseSurahSlug, generateSurahSlug } from "@/lib/url-utils";
import StructuredData from "@/components/seo/StructuredData";
import VerseDetailClient from "./VerseDetailClient";

// Special verses that get high search volume
const specialVerses: Record<string, { name: string; searches: string }> = {
  "2:255": { name: "Ayat al-Kursi", searches: "165000" },
  "2:286": { name: "Last verse of Al-Baqarah", searches: "45000" },
  "36:1": { name: "Opening of Surah Yaseen", searches: "35000" },
  "67:1": { name: "Opening of Surah Mulk", searches: "28000" },
  "112:1": { name: "Surah Ikhlas opening", searches: "25000" },
  "1:1": { name: "Opening of the Quran", searches: "85000" },
  "3:185": { name: "Every soul shall taste death", searches: "42000" },
  "2:152": { name: "Remember Me and I will remember you", searches: "38000" },
  "94:5": { name: "Indeed with hardship comes ease", searches: "52000" },
  "93:5": { name: "Your Lord has not abandoned you", searches: "31000" },
};

// Generate metadata for each verse
export async function generateMetadata({
  params,
}: {
  params: Promise<{ surahSlug: string; verseNumber: string }>;
}): Promise<Metadata> {
  const { surahSlug, verseNumber } = await params;
  const surahId = parseSurahSlug(surahSlug);
  const verseNum = parseInt(verseNumber);
  const surahInfo = surahId ? getSurahInfo(surahId) : null;

  if (!surahInfo || !surahId || surahId < 1 || surahId > 114 || verseNum < 1 || verseNum > surahInfo.versesCount) {
    return {
      title: "Verse Not Found",
      description: "The requested Quran verse could not be found.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";
  const verseUrl = `${baseUrl}/quran/${surahSlug}/verse/${verseNumber}`;
  const verseKey = `${surahId}:${verseNum}`;
  const specialVerse = specialVerses[verseKey];

  const title = specialVerse
    ? `${specialVerse.name} - ${surahInfo.name} ${verseKey} | Quran Translation`
    : `${surahInfo.name} Verse ${verseNum} (${verseKey}) - Translation & Tafsir | Quran`;

  const description = specialVerse
    ? `Read ${specialVerse.name} (Quran ${verseKey}) from Surah ${surahInfo.name} with Arabic text, transliteration, English translation, and detailed tafsir. One of the most powerful verses in the Quran.`
    : `Read verse ${verseNum} of Surah ${surahInfo.name} (${surahInfo.translatedName}) from the Holy Quran. Arabic text with word-by-word translation, multiple interpretations, and tafsir.`;

  return {
    title,
    description,
    keywords: [
      "quran",
      "verse",
      surahInfo.name.toLowerCase(),
      surahInfo.translatedName.toLowerCase(),
      `quran ${verseKey}`,
      `surah ${surahInfo.name} verse ${verseNum}`,
      "arabic",
      "translation",
      "tafsir",
      "islamic",
      "holy quran",
      ...(specialVerse ? [specialVerse.name.toLowerCase(), "famous quran verse"] : []),
    ],
    alternates: {
      canonical: verseUrl,
    },
    openGraph: {
      title,
      description,
      url: verseUrl,
      type: "article",
      siteName: "Tasbihfy",
      images: [
        {
          url: `${baseUrl}/api/og/verse?surah=${surahId}&verse=${verseNum}`,
          width: 1200,
          height: 630,
          alt: `Quran ${verseKey} - ${surahInfo.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: specialVerse ? `${specialVerse.name} - Quran ${verseKey}` : `Quran ${verseKey}`,
      description: description.substring(0, 160),
      images: [`${baseUrl}/api/og/verse?surah=${surahId}&verse=${verseNum}`],
    },
  };
}

// Generate static params for all verses in all surahs
export async function generateStaticParams() {
  const params: { surahSlug: string; verseNumber: string }[] = [];

  // Generate params for all verses in all 114 surahs
  for (let surahId = 1; surahId <= 114; surahId++) {
    const surahInfo = getSurahInfo(surahId);
    if (surahInfo) {
      const surahSlug = generateSurahSlug(surahId);

      // For performance, only pre-generate special verses and first/last verses of each surah
      // The rest will be generated on-demand with ISR
      const versesToGenerate = new Set<number>();

      // Add first and last verse of each surah
      versesToGenerate.add(1);
      versesToGenerate.add(surahInfo.versesCount);

      // Add special verses for this surah
      Object.keys(specialVerses).forEach(key => {
        const [specialSurahId, specialVerseNum] = key.split(':').map(Number);
        if (specialSurahId === surahId) {
          versesToGenerate.add(specialVerseNum);
        }
      });

      // Add some popular verses in between (every 10th verse for shorter surahs, every 50th for longer ones)
      const interval = surahInfo.versesCount > 100 ? 50 : 10;
      for (let v = interval; v < surahInfo.versesCount; v += interval) {
        versesToGenerate.add(v);
      }

      // Generate params for selected verses
      versesToGenerate.forEach(verseNum => {
        params.push({
          surahSlug,
          verseNumber: verseNum.toString(),
        });
      });
    }
  }

  return params;
}

// Server component that handles metadata and structured data
export default async function VersePage({
  params,
}: {
  params: Promise<{ surahSlug: string; verseNumber: string }>;
}) {
  const { surahSlug, verseNumber } = await params;
  const surahId = parseSurahSlug(surahSlug);
  const verseNum = parseInt(verseNumber);
  const surahInfo = surahId ? getSurahInfo(surahId) : null;

  if (!surahInfo || !surahId || surahId < 1 || surahId > 114 || verseNum < 1 || verseNum > surahInfo.versesCount) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";
  const verseUrl = `${baseUrl}/quran/${surahSlug}/verse/${verseNumber}`;
  const verseKey = `${surahId}:${verseNum}`;
  const specialVerse = specialVerses[verseKey];

  // Structured data for this verse
  const verseStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": verseUrl,
    "headline": specialVerse
      ? `${specialVerse.name} - Quran ${verseKey}`
      : `Quran ${verseKey} - ${surahInfo.name} Verse ${verseNum}`,
    "description": `Verse ${verseNum} from Surah ${surahInfo.name} (${surahInfo.translatedName}) of the Holy Quran. Read with Arabic text, translation, and tafsir.`,
    "author": {
      "@type": "Organization",
      "name": "Tasbihfy App",
      "url": baseUrl,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tasbihfy App",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/icons/icon-512x512.png`,
        "width": 512,
        "height": 512,
      },
    },
    "url": verseUrl,
    "mainEntityOfPage": verseUrl,
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString(),
    "image": {
      "@type": "ImageObject",
      "url": `${baseUrl}/api/og/verse?surah=${surahId}&verse=${verseNum}`,
      "width": 1200,
      "height": 630,
    },
    "articleSection": "Holy Quran",
    "keywords": [
      "quran",
      `quran ${verseKey}`,
      surahInfo.name.toLowerCase(),
      ...(specialVerse ? [specialVerse.name.toLowerCase()] : []),
    ],
    "inLanguage": ["en", "ar"],
    "isPartOf": {
      "@type": "Book",
      "name": "The Holy Quran",
      "author": {
        "@type": "Person",
        "name": "Prophet Muhammad (PBUH)",
      },
    },
    "about": {
      "@type": "Thing",
      "name": `Surah ${surahInfo.name}`,
      "description": surahInfo.translatedName,
    },
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
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
        "name": "Quran",
        "item": `${baseUrl}/quran`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `Surah ${surahInfo.name}`,
        "item": `${baseUrl}/quran/${surahSlug}`,
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": `Verse ${verseNum}`,
        "item": verseUrl,
      },
    ],
  };

  // FAQ structured data for special verses
  const faqData = specialVerse ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is ${specialVerse.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${specialVerse.name} is verse ${verseNum} of Surah ${surahInfo.name} (Quran ${verseKey}). It is one of the most powerful and frequently recited verses in the Quran.`,
        },
      },
      {
        "@type": "Question",
        "name": `What are the benefits of reciting ${specialVerse.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Reciting ${specialVerse.name} brings protection, blessings, and spiritual benefits according to Islamic tradition. It is recommended to recite it daily for divine protection.`,
        },
      },
    ],
  } : null;

  return (
    <>
      <StructuredData data={verseStructuredData} />
      <StructuredData data={breadcrumbStructuredData} />
      {faqData && <StructuredData data={faqData} />}
      <VerseDetailClient
        surahId={surahId}
        verseNumber={verseNum}
        surahInfo={surahInfo}
        isSpecialVerse={!!specialVerse}
        specialVerseName={specialVerse?.name}
      />
    </>
  );
}