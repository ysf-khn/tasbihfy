// Random Ayah service for daily reminders
// Uses the Quran Foundation API to fetch random ayahs
import { getAccessToken, getClientId, getApiUrl } from '@/lib/quran/token-manager';

interface RandomAyahResponse {
  verse: {
    id: number;
    verse_key: string;
    verse_number: number;
    chapter_id: number;
    page_number: number;
    juz_number: number;
    hizb_number: number;
    rub_number: number;
    text_uthmani: string;
    text_simple: string;
    translations: Array<{
      id: number;
      text: string;
      resource_id: number;
      resource_name: string;
      language_name: string;
    }>;
  };
}

export interface AyahForNotification {
  verseKey: string;
  arabicText: string;
  translation: string;
  chapterId: number;
  verseNumber: number;
  translationSource: string;
  title: string;
  body: string;
}

/**
 * Fetch a random ayah with English translation using Quran Foundation API
 */
export async function getRandomAyah(): Promise<AyahForNotification> {
  try {
    // Get authentication tokens using the token manager
    const token = await getAccessToken();
    const clientId = getClientId();
    const apiUrl = getApiUrl();

    const config = {
      method: "GET" as const,
      headers: {
        Accept: "application/json",
        "x-auth-token": token,
        "x-client-id": clientId,
      },
    };

    // Use translation ID 20 in production, 85 in development
    const translationId = process.env.NODE_ENV === 'production' ? '20' : '85';
    const url = `${apiUrl}/verses/random?translations=${translationId}&language=en&words=false`;

    console.log("🔄 Fetching random ayah from Quran Foundation API...");

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RandomAyahResponse = await response.json();
    console.log("✅ Random ayah fetched successfully:", data.verse.verse_key);

    if (
      !data.verse ||
      !data.verse.translations ||
      data.verse.translations.length === 0
    ) {
      throw new Error("No translation found in the response");
    }

    const verse = data.verse;
    const translation = verse.translations[0]; // Use the first (and likely only) translation

    const ayahForNotification: AyahForNotification = {
      verseKey: verse.verse_key,
      arabicText: verse.text_uthmani,
      translation: translation.text,
      chapterId: verse.chapter_id,
      verseNumber: verse.verse_number,
      translationSource: translation.resource_name,
      title: `Daily Ayah: ${verse.verse_key}`,
      body: translation.text,
    };

    console.log("📖 Formatted ayah for notification:", {
      verseKey: ayahForNotification.verseKey,
      translationLength: ayahForNotification.translation.length,
      translationSource: ayahForNotification.translationSource,
    });

    return ayahForNotification;
  } catch (error) {
    console.error("❌ Failed to fetch random ayah:", error);

    // Fallback: return a well-known ayah (Ayatul Kursi - 2:255) if API fails
    console.log("📄 Using fallback ayah (Ayatul Kursi)");
    return {
      verseKey: "2:255",
      arabicText: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ",
      translation:
        "Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining.",
      chapterId: 2,
      verseNumber: 255,
      translationSource: "The Clear Quran",
      title: "Daily Ayah: 2:255",
      body: "Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining.",
    };
  }
}

/**
 * Get a fallback ayah for testing purposes
 */
export function getFallbackAyah(): AyahForNotification {
  const fallbackAyahs = [
    {
      verseKey: "2:255",
      arabicText: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ",
      translation:
        "Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining.",
      chapterId: 2,
      verseNumber: 255,
      translationSource: "The Clear Quran",
    },
    {
      verseKey: "1:1",
      arabicText: "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ",
      translation:
        "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      chapterId: 1,
      verseNumber: 1,
      translationSource: "The Clear Quran",
    },
    {
      verseKey: "3:26",
      arabicText: "قُلِ ٱللَّهُمَّ مَـٰلِكَ ٱلۡمُلۡكِ",
      translation:
        "Say, 'O Allah, Owner of Sovereignty, You give sovereignty to whom You will.'",
      chapterId: 3,
      verseNumber: 26,
      translationSource: "The Clear Quran",
    },
  ];

  // Select a random fallback ayah
  const randomIndex = Math.floor(Math.random() * fallbackAyahs.length);
  const selectedAyah = fallbackAyahs[randomIndex];

  return {
    ...selectedAyah,
    title: `Daily Ayah: ${selectedAyah.verseKey}`,
    body: selectedAyah.translation,
  };
}

/**
 * Validate ayah data before sending notification
 */
export function validateAyahData(ayah: AyahForNotification): boolean {
  return !!(
    ayah &&
    ayah.verseKey &&
    ayah.translation &&
    ayah.translation.length > 0 &&
    ayah.title &&
    ayah.body
  );
}
