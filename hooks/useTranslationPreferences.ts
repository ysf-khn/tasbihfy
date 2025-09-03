import { useState, useEffect, useCallback } from 'react';
import { getAvailableTranslations } from '@/lib/quran/api';
import { DEFAULT_TRANSLATIONS } from '@/lib/quran/constants';

interface Translation {
  id: number;
  name: string;
  author_name: string;
  language_name: string;
}

interface TranslationPreferences {
  english: number | null;
  urdu: number | null;
}

interface TranslationsByLanguage {
  english: Translation[];
  urdu: Translation[];
}

export function useTranslationPreferences() {
  const [availableTranslations, setAvailableTranslations] = useState<TranslationsByLanguage>({
    english: [],
    urdu: []
  });
  const [preferences, setPreferences] = useState<TranslationPreferences>({
    english: null,
    urdu: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load available translations from API
  const loadAvailableTranslations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAvailableTranslations();
      const translations = data.translations || [];
      
      // Group translations by language
      const grouped: TranslationsByLanguage = {
        english: [],
        urdu: []
      };
      
      for (const translation of translations) {
        const lang = translation.language_name?.toLowerCase();
        if (lang === 'english') {
          grouped.english.push(translation);
        } else if (lang === 'urdu') {
          grouped.urdu.push(translation);
        }
      }
      
      setAvailableTranslations(grouped);
      
      // Set default preferences if none exist
      const savedPrefs = loadPreferencesFromStorage();
      if (!savedPrefs.english || !savedPrefs.urdu) {
        const defaultPrefs = await resolveDefaultTranslations(grouped);
        const finalPrefs = {
          english: savedPrefs.english || defaultPrefs.english,
          urdu: savedPrefs.urdu || defaultPrefs.urdu
        };
        setPreferences(finalPrefs);
        savePreferencesToStorage(finalPrefs);
      } else {
        setPreferences(savedPrefs);
      }
      
    } catch (err) {
      console.error('Failed to load available translations:', err);
      setError('Failed to load translations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Resolve default translation IDs by name matching
  const resolveDefaultTranslations = async (grouped: TranslationsByLanguage): Promise<TranslationPreferences> => {
    const prefs: TranslationPreferences = { english: null, urdu: null };
    
    // Find Sahih International for English
    const sahihInternational = grouped.english.find(t => 
      t.name.toLowerCase().includes('sahih international') ||
      t.author_name?.toLowerCase().includes('sahih international')
    );
    prefs.english = sahihInternational?.id || grouped.english[0]?.id || null;
    
    // Find Bayan Ul Quran or Dr. Israr Ahmad for Urdu
    const bayanUlQuran = grouped.urdu.find(t => 
      t.name.toLowerCase().includes('bayan') ||
      t.name.toLowerCase().includes('israr') ||
      t.author_name?.toLowerCase().includes('israr')
    );
    prefs.urdu = bayanUlQuran?.id || grouped.urdu[0]?.id || null;
    
    console.log('🎯 Resolved default translations:', prefs);
    return prefs;
  };

  // Load preferences from localStorage
  const loadPreferencesFromStorage = (): TranslationPreferences => {
    try {
      const saved = localStorage.getItem('quran_translation_preferences');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load translation preferences:', error);
    }
    return { english: null, urdu: null };
  };

  // Save preferences to localStorage
  const savePreferencesToStorage = (prefs: TranslationPreferences) => {
    try {
      localStorage.setItem('quran_translation_preferences', JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to save translation preferences:', error);
    }
  };

  // Update preferences
  const updatePreference = (language: 'english' | 'urdu', translationId: number) => {
    const newPrefs = { ...preferences, [language]: translationId };
    setPreferences(newPrefs);
    savePreferencesToStorage(newPrefs);
  };

  // Get selected translations for API calls
  const getSelectedTranslationIds = (): number[] => {
    const ids: number[] = [];
    if (preferences.english) ids.push(preferences.english);
    if (preferences.urdu) ids.push(preferences.urdu);
    return ids;
  };

  // Get translation details by ID
  const getTranslationById = (id: number): Translation | null => {
    const all = [...availableTranslations.english, ...availableTranslations.urdu];
    return all.find(t => t.id === id) || null;
  };

  // Initialize on mount
  useEffect(() => {
    loadAvailableTranslations();
  }, [loadAvailableTranslations]);

  return {
    availableTranslations,
    preferences,
    loading,
    error,
    updatePreference,
    getSelectedTranslationIds,
    getTranslationById,
    refetch: loadAvailableTranslations
  };
}