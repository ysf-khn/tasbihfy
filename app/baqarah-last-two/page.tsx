import { Metadata } from "next";
import BaqarahLastTwoViewer from "@/components/quran/BaqarahLastTwoViewer";

export const metadata: Metadata = {
  title: "Last 2 Ayahs of Surah Al-Baqarah (2:285-286) | Tasbihfy",
  description:
    "Read the last two verses of Surah Al-Baqarah (2:285-286) with Arabic text and English translation. These verses are recommended to recite before sleep for protection.",
  keywords: [
    "last 2 ayahs baqarah",
    "surah baqarah 285 286",
    "quran 2:285",
    "quran 2:286",
    "baqarah last verses",
    "protection before sleep",
    "islamic recitation",
    "quran arabic",
    "quran translation",
  ],
  alternates: {
    canonical: "/baqarah-last-two",
  },
  openGraph: {
    title: "Last 2 Ayahs of Surah Al-Baqarah",
    description:
      "Read verses 285-286 of Surah Al-Baqarah with Arabic and translation. Recommended for protection before sleep.",
    type: "article",
  },
};

export default function BaqarahLastTwoPage() {
  return <BaqarahLastTwoViewer />;
}
