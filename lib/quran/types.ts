// Core Quran data types

// Simplified interface for internal use
export interface Surah {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: 'meccan' | 'medinan';
  total_verses: number;
}

// API response interfaces (matching actual API structure)
export interface ChapterApiResponse {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

// Quran text script types
export type QuranScript = 'indopak' | 'uthmani' | 'uthmani_simple' | 'imlaei';

export interface Verse {
  id: number;
  verse_key: string;
  verse_number: number;
  juz_number: number;
  hizb_number: number;
  rub_number: number;
  page_number: number;
  text_uthmani: string;
  text_simple: string;
  text_imlaei?: string;
  text_indopak?: string;
  text_uthmani_simple?: string;
}

export interface Translation {
  resource_id: number;
  text: string;
  language_name?: string;
  resource_name?: string;
  author_name?: string; // Added for enriched translation data
  // Legacy fields for backward compatibility
  id?: number;
  translated_name?: {
    name: string;
    language_name: string;
  };
}

export interface VerseWithTranslations extends Verse {
  translations?: Translation[];
}

export interface SurahData {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name?: string;
    name: string;
  };
  verses: VerseWithTranslations[];
}

export interface Tafsir {
  id: number;
  verse_id: number;
  text: string;
  language_name: string;
  resource_name: string;
  resource_id: number;
}

export interface TafsirResource {
  id: number;
  name: string;
  author_name: string;
  slug: string;
  language_name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface QuranSettings {
  translationLanguages: readonly string[] | string[];
  selectedTranslations: readonly number[] | number[]; // New: array of translation IDs
  selectedScript?: QuranScript; // New: selected Quran text script
  arabicFontSize: number;
  translationFontSize: number;
  showTransliteration: boolean;
  showWordByWord: boolean;
  showVerseNumbers?: boolean; // New: optional verse number display
  selectedReciter: string;
  selectedRecitationId: number; // New: selected recitation ID from API
  autoScroll: boolean;
  repeatVerse?: boolean; // New: repeat verse audio option
  autoPlayNext?: boolean; // New: auto play next verse
}

// New recitation types based on API response
export interface Recitation {
  id: number;
  reciter_name: string;
  style: string | null;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface AudioFile {
  verse_key: string;
  url: string; // Relative path like "AbdulBaset/Mujawwad/mp3/001001.mp3"
}

// Legacy interface - keeping for backward compatibility
export interface AudioReciter {
  id: number;
  name: string;
  arabic_name: string;
  relative_path: string;
  format: string;
  quality: string;
}

export interface BookmarkData {
  id: string;
  surahId: number;
  verseNumber: number;
  surahName: string;
  verseText: string;
  note?: string;
  createdAt: Date;
}

// API Response types
export interface SurahListResponse {
  chapters: ChapterApiResponse[];
}

export interface SurahResponse {
  chapter: SurahData;
}

export interface TranslationsResponse {
  translations: Translation[];
}

export interface TafsirResponse {
  tafsirs: Tafsir[];
}

export interface TafsirsListResponse {
  tafsirs: TafsirResource[];
}

export interface ReciterResponse {
  recitations: AudioReciter[];
}

export interface RecitationsResponse {
  recitations: Recitation[];
}

export interface AyahRecitationResponse {
  audio_files: AudioFile[];
  pagination: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}