// Quran API integration with caching and error handling

import {
  TRANSLATION_RESOURCES,
  TAFSIR_RESOURCES,
  SURAH_METADATA,
  CACHE_DURATION,
} from "./constants";

// Use our proxy API routes instead of direct external API calls
const QURAN_API_BASE = "/api/quran";
import {
  Surah,
  SurahData,
  VerseWithTranslations,
  Translation,
  Tafsir,
  TafsirResource,
  SurahListResponse,
  SurahResponse,
  TranslationsResponse,
  TafsirResponse,
  TafsirsListResponse,
  RecitationsResponse,
  AyahRecitationResponse,
  Recitation,
  AudioFile,
} from "./types";
import { constructAudioUrl } from "./recitations-data";

// Cache interface for localStorage
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expires: number;
}

// Generic cache functions
function getCacheKey(prefix: string, id?: string | number): string {
  return `quran_${prefix}${id ? `_${id}` : ""}`;
}

/**
 * Fetch translations for a specific verse
 */
async function fetchTranslationsForVerse(
  verseKey: string,
  translationIds: number[]
): Promise<Translation[]> {
  const translations: Translation[] = [];

  console.log(
    `🌐 Fetching translations for verse ${verseKey} with IDs:`,
    translationIds
  );

  // Fetch each translation separately
  const translationPromises = translationIds.map(async (resourceId) => {
    try {
      const url = `${QURAN_API_BASE}/translations/${resourceId}/by_ayah/${verseKey}`;
      const response = await fetchFromProxy(url);
      const data = await response.json();

      if (data.translations && data.translations.length > 0) {
        return data.translations[0]; // API returns array, but should be single translation
      }
      return null;
    } catch (error) {
      console.error(
        `❌ Failed to fetch translation ${resourceId} for verse ${verseKey}:`,
        error
      );
      return null;
    }
  });

  const results = await Promise.all(translationPromises);

  // Filter out null results and add to translations array
  for (const translation of results) {
    if (translation) {
      translations.push(translation);
    }
  }

  console.log(
    `✅ Fetched ${translations.length}/${translationIds.length} translations for verse ${verseKey}`
  );
  return translations;
}

function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const item: CacheItem<T> = JSON.parse(cached);
    if (Date.now() > item.expires) {
      localStorage.removeItem(key);
      return null;
    }

    return item.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T, duration: number): void {
  try {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + duration,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.warn("Failed to cache data:", error);
  }
}

// Simplified fetch for our proxy API (no retries needed since it's local)
async function fetchFromProxy(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }
  return response;
}

// API Functions

/**
 * Get list of all surahs with metadata
 */
export async function getSurahList(): Promise<Surah[]> {
  // Use local SURAH_METADATA directly - no API call needed
  return [...SURAH_METADATA] as Surah[];
}

/**
 * Get surah data with verses and translations
 */
export async function getSurahData(
  surahId: number,
  translationIds?: number[] // Specific translation IDs to use
): Promise<SurahData> {
  // If no translation IDs provided, get defaults
  if (!translationIds || translationIds.length === 0) {
    const validIds = await getValidTranslationIds();
    translationIds = [];

    // Use first available for each language as fallback
    if (validIds.english.length > 0) {
      translationIds.push(validIds.english[0]);
    }
    if (validIds.urdu.length > 0) {
      translationIds.push(validIds.urdu[0]);
    }
  }

  console.log(
    `🔄 Loading Surah ${surahId} with translation IDs:`,
    translationIds
  );

  const cacheKey = getCacheKey(
    "surah",
    `${surahId}_${translationIds.join(",")}`
  );
  const cached = getFromCache<SurahData>(cacheKey);

  if (cached) return cached;

  try {
    // Get chapter metadata from local constants
    const chapterMetadata = SURAH_METADATA.find((s) => s.id === surahId);
    if (!chapterMetadata) {
      throw new Error(`Surah ${surahId} not found in metadata`);
    }

    // Try fetching verses WITH translations using the verses endpoint
    const requiredFields =
      "text_uthmani,text_simple,text_imlaei,verse_key,verse_number,juz_number,hizb_number,rub_number,page_number";
    const versesUrl = `${QURAN_API_BASE}/verses/by_chapter/${surahId}?fields=${requiredFields}&per_page=${
      chapterMetadata.total_verses
    }&words=false&translations=${translationIds.join(",")}`;
    console.log(`📡 Testing verses endpoint with translations:`, versesUrl);

    const versesResponse = await fetchFromProxy(versesUrl);
    const versesData = await versesResponse.json();
    console.log(`✅ Verses data loaded:`, versesData);
    console.log(`📊 Total verses received:`, versesData.verses?.length || 0);

    // Validate we have the expected data
    if (!versesData.verses || versesData.verses.length === 0) {
      console.warn(`⚠️ No verses received for Surah ${surahId}`);
    } else {
      const firstVerse = versesData.verses[0];
      console.log(`📊 Total verses received: ${versesData.verses.length}`);
      console.log(`📖 First verse sample:`, {
        verse_key: firstVerse.verse_key,
        hasArabicText: !!firstVerse.text_uthmani,
        hasTranslations: !!firstVerse.translations?.length,
        translationsCount: firstVerse.translations?.length || 0,
      });

      // If we got translations, log details
      if (firstVerse.translations && firstVerse.translations.length > 0) {
        console.log(
          `🌐 Translation sample:`,
          firstVerse.translations.map((t: any) => ({
            resource_id: t.resource_id,
            textPreview: t.text?.substring(0, 50) + "...",
          }))
        );
      } else {
        console.warn(
          `⚠️ No translations found in verses response for IDs: ${translationIds.join(
            ","
          )}`
        );
        console.log(`ℹ️ Will need to fetch translations separately`);
      }
    }

    // Build surah data using local metadata and API verses
    const surahData: SurahData = {
      id: chapterMetadata.id,
      revelation_place: chapterMetadata.type === "meccan" ? "mecca" : "medina",
      revelation_order: surahId, // Using surahId as placeholder
      bismillah_pre: surahId !== 1 && surahId !== 9, // All surahs except Al-Fatihah and At-Tawbah
      name_simple: chapterMetadata.name,
      name_complex: chapterMetadata.transliteration,
      name_arabic: chapterMetadata.name, // Will be in Arabic from constants
      verses_count: chapterMetadata.total_verses,
      pages: [1], // Placeholder - we don't have page info in constants
      translated_name: { name: chapterMetadata.translation },
      verses: versesData.verses || [],
    };

    console.log(`✅ Surah ${surahId} data prepared:`, surahData);
    setCache(cacheKey, surahData, CACHE_DURATION.SURAH_DATA);
    return surahData;
  } catch (error) {
    console.error(`❌ Failed to fetch surah ${surahId}:`, error);

    // Log more details about the error
    if (error instanceof Error) {
      console.error(`❌ Error details:`, {
        message: error.message,
        stack: error.stack,
        surahId,
        translationIds,
      });
    }

    throw new Error(
      `Unable to load Surah ${surahId}. Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Get specific verse with translations
 */
export async function getVerse(
  surahId: number,
  verseNumber: number,
  translationIds: number[] = [131]
): Promise<VerseWithTranslations> {
  const cacheKey = getCacheKey(
    "verse",
    `${surahId}_${verseNumber}_${translationIds.join(",")}`
  );
  const cached = getFromCache<VerseWithTranslations>(cacheKey);

  if (cached) return cached;

  try {
    const url = `${QURAN_API_BASE}/verses/by_key/${surahId}:${verseNumber}?translations=${translationIds.join(
      ","
    )}`;
    const response = await fetchFromProxy(url);
    const data = await response.json();

    const verse = data.verse;
    setCache(cacheKey, verse, CACHE_DURATION.SURAH_DATA);
    return verse;
  } catch (error) {
    console.error(`Failed to fetch verse ${surahId}:${verseNumber}:`, error);
    throw new Error(`Unable to load verse ${surahId}:${verseNumber}`);
  }
}

/**
 * Get translations for multiple languages
 */
export async function getTranslations(
  surahId: number,
  languages: Array<keyof typeof TRANSLATION_RESOURCES> = ["english"]
): Promise<Translation[]> {
  const translationIds = languages.map(
    (lang) => TRANSLATION_RESOURCES[lang].id
  );

  try {
    const surahData = await getSurahData(surahId, translationIds);

    // Extract translations from verses
    const translations: Translation[] = [];
    surahData.verses.forEach((verse) => {
      if (verse.translations) {
        translations.push(...verse.translations);
      }
    });

    return translations;
  } catch (error) {
    console.error(`Failed to fetch translations for surah ${surahId}:`, error);
    throw new Error(`Unable to load translations for Surah ${surahId}`);
  }
}

/**
 * Get tafsir for a specific verse
 */
export async function getTafsir(
  surahId: number,
  verseNumber: number,
  tafsirId: number = 1
): Promise<Tafsir | null> {
  const cacheKey = getCacheKey(
    "tafsir",
    `${surahId}_${verseNumber}_${tafsirId}`
  );
  const cached = getFromCache<Tafsir | null>(cacheKey);

  if (cached !== null) return cached;

  try {
    const url = `${QURAN_API_BASE}/tafsirs/${tafsirId}/by_ayah/${surahId}:${verseNumber}`;
    console.log(
      `📡 Fetching tafsir for ${surahId}:${verseNumber} using tafsir ID ${tafsirId}`
    );
    const response = await fetchFromProxy(url);
    const data = await response.json();

    if (!data.tafsir) {
      console.warn(
        `⚠️ No tafsir found for ${surahId}:${verseNumber} with tafsir ID ${tafsirId}`
      );
      return null;
    }

    const tafsir: Tafsir = {
      id: data.tafsir.id || 0,
      verse_id: data.tafsir.verse_id || 0,
      text: data.tafsir.text || "",
      language_name: data.tafsir.language_name || "",
      resource_name: data.tafsir.resource_name || "",
      resource_id: data.tafsir.resource_id || tafsirId,
    };

    console.log(
      `✅ Successfully fetched tafsir for ${surahId}:${verseNumber}:`,
      {
        hasText: !!tafsir.text,
        textLength: tafsir.text.length,
        resourceName: tafsir.resource_name,
      }
    );

    setCache(cacheKey, tafsir, CACHE_DURATION.TAFSIR);
    return tafsir;
  } catch (error) {
    console.error(
      `❌ Failed to fetch tafsir for ${surahId}:${verseNumber} with tafsir ID ${tafsirId}:`,
      error
    );
    return null;
  }
}

/**
 * Search verses by text
 */
export async function searchVersesLegacy(
  query: string,
  translationId: number = 131,
  limit: number = 20
): Promise<VerseWithTranslations[]> {
  try {
    const url = `${QURAN_API_BASE}/search?q=${encodeURIComponent(
      query
    )}&translation=${translationId}&limit=${limit}`;
    const response = await fetchFromProxy(url);
    const data = await response.json();

    return data.search.results || [];
  } catch (error) {
    console.error("Failed to search verses:", error);
    throw new Error("Search failed. Please try again.");
  }
}

/**
 * Get audio URL for verse or surah
 */
export function getAudioUrl(
  surahId: number,
  verseNumber?: number,
  reciter: string = "mishari-al-afasy"
): string {
  const paddedSurahId = surahId.toString().padStart(3, "0");

  if (verseNumber) {
    const paddedVerseNumber = verseNumber.toString().padStart(3, "0");
    return `https://everyayah.com/data/${reciter}/${paddedSurahId}${paddedVerseNumber}.mp3`;
  } else {
    return `https://server8.mp3quran.net/afs/${paddedSurahId}.mp3`;
  }
}

/**
 * Get available translation resources
 */
export function getTranslationResources() {
  return Object.entries(TRANSLATION_RESOURCES).map(([key, resource]) => ({
    id: key,
    name: resource.name,
    language: resource.language,
    resourceId: resource.id,
  }));
}

/**
 * Get available tafsir resources
 */
export function getTafsirResources() {
  return Object.entries(TAFSIR_RESOURCES).map(([key, resource]) => ({
    id: key,
    name: resource.name,
    language: resource.language,
    slug: resource.slug,
  }));
}

// New API functions for audio, tafsir, and translations

/**
 * Get available recitations
 */
export async function getRecitations(): Promise<Recitation[]> {
  try {
    const response = await fetchFromProxy(`${QURAN_API_BASE}/recitations`);
    const data: RecitationsResponse = await response.json();
    return data.recitations || [];
  } catch (error) {
    console.error("Failed to fetch recitations:", error);
    throw new Error("Unable to load recitations");
  }
}

/**
 * Get audio/recitation for a specific ayah
 */
export async function getAyahRecitation(
  recitationId: number,
  ayahKey: string
): Promise<AyahRecitationResponse> {
  try {
    const response = await fetchFromProxy(
      `${QURAN_API_BASE}/recitations/${recitationId}/by_ayah/${ayahKey}`
    );
    const data: AyahRecitationResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch recitation for ayah ${ayahKey}:`, error);
    throw new Error(`Unable to load recitation for ayah ${ayahKey}`);
  }
}

/**
 * Get full audio URL for a specific ayah
 */
export async function getAyahAudioUrl(
  recitationId: number,
  ayahKey: string
): Promise<string | null> {
  try {
    const recitationData = await getAyahRecitation(recitationId, ayahKey);

    if (recitationData.audio_files && recitationData.audio_files.length > 0) {
      const audioFile = recitationData.audio_files.find(
        (file) => file.verse_key === ayahKey
      );
      if (audioFile) {
        return constructAudioUrl(audioFile.url);
      }
    }

    return null;
  } catch (error) {
    console.error(`Failed to get audio URL for ayah ${ayahKey}:`, error);
    return null;
  }
}

/**
 * Get audio/recitation for an entire chapter
 */
export async function getChapterRecitation(
  recitationId: number,
  chapterId: number
): Promise<any> {
  try {
    const response = await fetchFromProxy(
      `${QURAN_API_BASE}/recitations/${recitationId}/by_chapter/${chapterId}`
    );
    return response.json();
  } catch (error) {
    console.error(
      `Failed to fetch recitation for chapter ${chapterId}:`,
      error
    );
    throw new Error(`Unable to load recitation for chapter ${chapterId}`);
  }
}

/**
 * Get available tafsirs
 */
export async function getTafsirs(): Promise<TafsirResource[]> {
  const cacheKey = getCacheKey("available_tafsirs");
  const cached = getFromCache<TafsirResource[]>(cacheKey);

  if (cached) {
    console.log("✅ Using cached available tafsirs:", cached.length, "tafsirs");
    return cached;
  }

  try {
    console.log("📡 Fetching available tafsirs from API...");
    const response = await fetchFromProxy(`${QURAN_API_BASE}/tafsirs`);
    const data: TafsirsListResponse = await response.json();

    console.log(
      "✅ Fetched available tafsirs:",
      data.tafsirs?.length || 0,
      "tafsirs"
    );

    // Log sample tafsirs for debugging
    if (data.tafsirs && data.tafsirs.length > 0) {
      console.log(
        "📋 Sample tafsirs:",
        data.tafsirs.slice(0, 5).map((t: TafsirResource) => ({
          id: t.id,
          name: t.name,
          language: t.language_name,
          author: t.author_name,
        }))
      );
    }

    const tafsirs = data.tafsirs || [];
    setCache(cacheKey, tafsirs, CACHE_DURATION.SURAH_LIST); // Cache for 24 hours
    return tafsirs;
  } catch (error) {
    console.error("❌ Failed to fetch available tafsirs:", error);
    throw new Error("Unable to load available tafsirs");
  }
}

/**
 * Get tafsir for a specific ayah
 */
export async function getAyahTafsir(
  tafsirId: number,
  ayahKey: string
): Promise<any> {
  try {
    const response = await fetchFromProxy(
      `${QURAN_API_BASE}/tafsirs/${tafsirId}/by_ayah/${ayahKey}`
    );
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch tafsir for ayah ${ayahKey}:`, error);
    throw new Error(`Unable to load tafsir for ayah ${ayahKey}`);
  }
}

/**
 * Get tafsir for an entire surah/chapter
 */
export async function getSurahTafsir(
  chapterId: number,
  tafsirId: number
): Promise<any> {
  try {
    const response = await fetchFromProxy(
      `${QURAN_API_BASE}/chapters/${chapterId}/tafsirs/${tafsirId}`
    );
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch tafsir for chapter ${chapterId}:`, error);
    throw new Error(`Unable to load tafsir for chapter ${chapterId}`);
  }
}

/**
 * Get available translations from API
 */
export async function getAvailableTranslations(): Promise<any> {
  const cacheKey = getCacheKey("available_translations");
  const cached = getFromCache<any>(cacheKey);

  if (cached) {
    console.log(
      "✅ Using cached available translations:",
      cached.translations?.length || 0,
      "translations"
    );
    return cached;
  }

  try {
    console.log("📡 Fetching available translations from API...");
    const response = await fetchFromProxy(
      `${QURAN_API_BASE}/resources/translations`
    );
    const data = await response.json();

    console.log(
      "✅ Fetched available translations:",
      data.translations?.length || 0,
      "translations"
    );

    // Log sample translations for debugging
    if (data.translations && data.translations.length > 0) {
      console.log(
        "📋 Sample translations:",
        data.translations.slice(0, 5).map((t: any) => ({
          id: t.id,
          name: t.name,
          language: t.language_name,
          author: t.author_name,
        }))
      );
    }

    setCache(cacheKey, data, CACHE_DURATION.SURAH_LIST); // Cache for 24 hours
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch available translations:", error);
    throw new Error("Unable to load available translations");
  }
}

/**
 * Get valid translation IDs for supported languages (English and Urdu only)
 */
export async function getValidTranslationIds(): Promise<{
  english: number[];
  urdu: number[];
}> {
  try {
    const translationsData = await getAvailableTranslations();
    const translations = translationsData.translations || [];

    const validIds = {
      english: [] as number[],
      urdu: [] as number[],
    };

    // Find translations for each language
    for (const translation of translations) {
      const lang = translation.language_name?.toLowerCase();

      if (lang === "english") {
        validIds.english.push(translation.id);
      } else if (lang === "urdu") {
        validIds.urdu.push(translation.id);
      }
    }

    console.log("✅ Found valid translation IDs:", {
      english: validIds.english.length,
      urdu: validIds.urdu.length,
    });

    // Log the actual IDs for debugging
    console.log("📋 English translation IDs:", validIds.english);
    console.log("📋 Urdu translation IDs:", validIds.urdu);

    return validIds;
  } catch (error) {
    console.error("❌ Failed to get valid translation IDs:", error);

    // Return empty arrays as fallback
    return {
      english: [],
      urdu: [],
    };
  }
}

/**
 * Get translation for a specific ayah
 */
export async function getAyahTranslation(
  translationId: number,
  ayahKey: string
): Promise<any> {
  try {
    const response = await fetchFromProxy(
      `${QURAN_API_BASE}/translations/${translationId}/by_ayah/${ayahKey}`
    );
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch translation for ayah ${ayahKey}:`, error);
    throw new Error(`Unable to load translation for ayah ${ayahKey}`);
  }
}

/**
 * Search verses by text
 */
export async function searchVerses(
  query: string,
  options: {
    translationId?: number;
    language?: string;
    limit?: number;
    page?: number;
  } = {}
): Promise<any> {
  try {
    const params = new URLSearchParams({
      q: query,
      ...(options.translationId && {
        translation: options.translationId.toString(),
      }),
      ...(options.language && { language: options.language }),
      ...(options.limit && { limit: options.limit.toString() }),
      ...(options.page && { page: options.page.toString() }),
    });

    const response = await fetchFromProxy(
      `${QURAN_API_BASE}/search?${params.toString()}`
    );
    return response.json();
  } catch (error) {
    console.error("Search failed:", error);
    throw new Error("Search failed. Please try again.");
  }
}

/**
 * Clear all cache
 */
export function clearQuranCache(): void {
  try {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("quran_")
    );
    keys.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.warn("Failed to clear cache:", error);
  }
}
