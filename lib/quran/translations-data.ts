// Translation data management system
import translationsListProd from '@/data/translations_list_prod.json';

export interface TranslationResource {
  id: number;
  name: string;
  author_name: string;
  slug: string | null;
  language_name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface GroupedTranslations {
  [languageName: string]: TranslationResource[];
}

// Cache for processed translations
let cachedGroupedTranslations: GroupedTranslations | null = null;

/**
 * Get all available translations grouped by language
 */
export function getGroupedTranslations(): GroupedTranslations {
  if (cachedGroupedTranslations) {
    return cachedGroupedTranslations;
  }

  const translations = translationsListProd.translations as TranslationResource[];
  const grouped: GroupedTranslations = {};

  translations.forEach((translation) => {
    const language = translation.language_name.toLowerCase();
    if (!grouped[language]) {
      grouped[language] = [];
    }
    grouped[language].push(translation);
  });

  // Sort translations within each language by name
  Object.keys(grouped).forEach((language) => {
    grouped[language].sort((a, b) => a.name.localeCompare(b.name));
  });

  cachedGroupedTranslations = grouped;
  return grouped;
}

/**
 * Get all available language names
 */
export function getAvailableLanguages(): string[] {
  const grouped = getGroupedTranslations();
  return Object.keys(grouped).sort();
}

/**
 * Get translations for a specific language
 */
export function getTranslationsByLanguage(language: string): TranslationResource[] {
  const grouped = getGroupedTranslations();
  return grouped[language.toLowerCase()] || [];
}

/**
 * Find translation by ID
 */
export function getTranslationById(id: number): TranslationResource | null {
  const translations = translationsListProd.translations as TranslationResource[];
  return translations.find((t) => t.id === id) || null;
}

/**
 * Search translations by name or author
 */
export function searchTranslations(query: string, language?: string): TranslationResource[] {
  const translations = language 
    ? getTranslationsByLanguage(language)
    : (translationsListProd.translations as TranslationResource[]);

  const searchTerm = query.toLowerCase();
  return translations.filter((translation) => 
    translation.name.toLowerCase().includes(searchTerm) ||
    translation.author_name.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get popular translations for each language
 * Based on common/well-known translations
 */
export function getPopularTranslations(): { [language: string]: number[] } {
  const popularIds: { [language: string]: string[] } = {
    english: [
      'sahih international',
      'pickthall', 
      'yusuf ali',
      'abdul haleem',
      'clear quran',
      'mustafa khattab'
    ],
    urdu: [
      'fatah muhammad jalandhari',
      'tahir ul qadri',
      'muhammad junagarhi',
      'kanz al iman'
    ],
    arabic: [
      'tafsir ibn kathir',
      'tafsir al-jalalayn'
    ],
    french: [
      'hamidullah'
    ],
    spanish: [
      'julio cortes',
      'isa garcia'
    ],
    turkish: [
      'diyanet',
      'elmalili'
    ]
  };

  const result: { [language: string]: number[] } = {};
  const allTranslations = translationsListProd.translations as TranslationResource[];

  Object.keys(popularIds).forEach((language) => {
    const popularNames = popularIds[language];
    const languageTranslations = allTranslations.filter(
      (t) => t.language_name.toLowerCase() === language
    );

    result[language] = [];
    
    // Find matching translations by name similarity
    popularNames.forEach((popularName) => {
      const found = languageTranslations.find((t) =>
        t.name.toLowerCase().includes(popularName.toLowerCase()) ||
        t.author_name.toLowerCase().includes(popularName.toLowerCase())
      );
      if (found) {
        result[language].push(found.id);
      }
    });
  });

  return result;
}

/**
 * Get default translation IDs for common languages
 */
export function getDefaultTranslations(): { [language: string]: number | null } {
  const popular = getPopularTranslations();
  const defaults: { [language: string]: number | null } = {};
  
  Object.keys(popular).forEach((language) => {
    defaults[language] = popular[language][0] || null;
  });

  // Fallback to first available translation if no popular one found
  const grouped = getGroupedTranslations();
  Object.keys(grouped).forEach((language) => {
    if (!defaults[language] && grouped[language].length > 0) {
      defaults[language] = grouped[language][0].id;
    }
  });

  return defaults;
}

/**
 * Check if a translation is available in the current environment
 * In production, all translations should be available
 * In development (prelive), only a subset may be available
 */
export function isTranslationAvailable(translationId: number): boolean {
  // For production, assume all translations are available
  if (process.env.NODE_ENV === 'production') {
    return true;
  }
  
  // For development/prelive, we know some translations work
  // This could be expanded based on testing
  const knownWorkingIds = [85, 84, 95, 83, 57, 234]; // Add more as tested
  return knownWorkingIds.includes(translationId);
}

/**
 * Get translation display info including availability status
 */
export function getTranslationDisplayInfo(id: number) {
  const translation = getTranslationById(id);
  if (!translation) return null;

  return {
    ...translation,
    isAvailable: isTranslationAvailable(id),
    displayName: translation.name,
    displayAuthor: translation.author_name,
    languageDisplayName: translation.language_name.charAt(0).toUpperCase() + 
                        translation.language_name.slice(1)
  };
}

/**
 * Get stats about available translations
 */
export function getTranslationStats() {
  const grouped = getGroupedTranslations();
  const languages = Object.keys(grouped);
  const totalTranslations = translationsListProd.translations.length;
  
  const languageCounts = Object.keys(grouped).map((lang) => ({
    language: lang.charAt(0).toUpperCase() + lang.slice(1),
    count: grouped[lang].length
  })).sort((a, b) => b.count - a.count);

  return {
    totalTranslations,
    totalLanguages: languages.length,
    languageCounts
  };
}