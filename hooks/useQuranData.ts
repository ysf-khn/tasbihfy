import { useState, useEffect, useCallback } from 'react';
import { getSurahList, getSurahData, getSurahArabicOnly } from '@/lib/quran/api';
import { Surah, SurahData, QuranScript } from '@/lib/quran/types';
import { TRANSLATION_RESOURCES } from '@/lib/quran/constants';
import { useQuranSettings } from './useQuranSettings';

// Cache management
const CACHE_KEY_PREFIX = 'quran_hook_cache_';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CachedData<T> {
  data: T;
  timestamp: number;
}

function getCachedData<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!cached) return null;

    const { data, timestamp }: CachedData<T> = JSON.parse(cached);
    
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY_PREFIX + key);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function setCachedData<T>(key: string, data: T): void {
  try {
    const cachedData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cachedData));
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
}

export function useQuranSurahList() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSurahs = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 useQuranSurahList: Starting to load surahs');
    }
    
    try {
      setLoading(true);
      setError(null);

      // Try cache first
      const cached = getCachedData<Surah[]>('surahs');
      if (cached) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ useQuranSurahList: Using cached surahs:', cached.length);
        }
        setSurahs(cached);
        setLoading(false);
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('📡 useQuranSurahList: Fetching from API');
      }
      const data = await getSurahList();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ useQuranSurahList: API response:', data.length, 'surahs');
      }
      
      setSurahs(data);
      setCachedData('surahs', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load Surahs';
      console.error('❌ useQuranSurahList: Error loading surahs:', err);
      setError(errorMessage);
      setSurahs([]); // Clear any existing data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSurahs();
  }, [loadSurahs]);

  return {
    surahs,
    loading,
    error,
    refetch: loadSurahs,
  };
}

export function useQuranSurah(surahId: number, translationIds: number[] = [], enabled: boolean = true) {
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get selected script from settings
  const { getSelectedScript } = useQuranSettings();
  const selectedScript = getSelectedScript();

  // Create stable dependency for translation IDs and script
  const translationIdsKey = translationIds.join(',');

  const loadSurah = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 useQuranSurah: Loading surah ${surahId} with translation IDs:`, translationIds, 'enabled:', enabled);
    }

    if (!surahId || surahId < 1 || surahId > 114) {
      const errorMsg = `Invalid Surah ID: ${surahId}`;
      console.error('❌ useQuranSurah:', errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Generate cache key based on surah, translation IDs, and script
      if (process.env.NODE_ENV === 'development') {
        console.log(`📋 useQuranSurah: Translation IDs:`, translationIds, 'Script:', selectedScript);
      }

      const cacheKey = `surah_${surahId}_${translationIdsKey}_${selectedScript}`;

      // Try cache first
      const cached = getCachedData<SurahData>(cacheKey);
      if (cached) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ useQuranSurah: Using cached data for surah ${surahId}`);
        }
        setSurahData(cached);
        setLoading(false);
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`📡 useQuranSurah: Fetching surah ${surahId} from API with BATCH OPTIMIZATION - translation IDs:`, translationIds, 'and script:', selectedScript);
      }
      const data = await getSurahData(surahId, translationIds, selectedScript);
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ useQuranSurah: BATCH API response for surah ${surahId}:`, {
          verses: data.verses?.length || 0,
          name: data.name_simple,
          firstVerseHasTranslations: data.verses?.[0]?.translations?.length || 0
        });
      }

      setSurahData(data);
      setCachedData(cacheKey, data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to load Surah ${surahId}`;
      console.error(`❌ useQuranSurah: Error loading surah ${surahId}:`, err);
      setError(errorMessage);
      setSurahData(null); // Clear any existing data
    } finally {
      setLoading(false);
    }
  }, [surahId, translationIdsKey, selectedScript, enabled]);

  useEffect(() => {
    if (enabled) {
      loadSurah();
    } else {
      // When disabled, clear loading state immediately
      setLoading(false);
    }
  }, [loadSurah, enabled]);

  return {
    surahData,
    loading,
    error,
    refetch: loadSurah,
  };
}

export function useQuranSurahArabicOnly(surahId: number, enabled: boolean = true) {
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get selected script from settings
  const { getSelectedScript } = useQuranSettings();
  const selectedScript = getSelectedScript();
  
  const loadSurah = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 useQuranSurahArabicOnly: Loading surah ${surahId} (Arabic only) with script: ${selectedScript}`);
    }
    
    if (!surahId || surahId < 1 || surahId > 114) {
      const errorMsg = `Invalid Surah ID: ${surahId}`;
      console.error('❌ useQuranSurahArabicOnly:', errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const cacheKey = `surah_arabic_${surahId}_${selectedScript}`;
      
      // Try cache first
      const cached = getCachedData<SurahData>(cacheKey);
      if (cached) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ useQuranSurahArabicOnly: Using cached data for surah ${surahId}`);
        }
        setSurahData(cached);
        setLoading(false);
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`📡 useQuranSurahArabicOnly: Fetching surah ${surahId} from API (Arabic only) with script: ${selectedScript}`);
      }
      const data = await getSurahArabicOnly(surahId, selectedScript);
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ useQuranSurahArabicOnly: API response for surah ${surahId}:`, {
          verses: data.verses?.length || 0,
          name: data.name_simple
        });
      }
      
      setSurahData(data);
      setCachedData(cacheKey, data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to load Surah ${surahId}`;
      console.error(`❌ useQuranSurahArabicOnly: Error loading surah ${surahId}:`, err);
      setError(errorMessage);
      setSurahData(null); // Clear any existing data
    } finally {
      setLoading(false);
    }
  }, [surahId, selectedScript, enabled]);

  useEffect(() => {
    if (enabled) {
      loadSurah();
    }
  }, [loadSurah, enabled]);

  return {
    surahData,
    loading,
    error,
    refetch: loadSurah,
  };
}

// Prefetch hook for performance
export function useQuranPrefetch() {
  const prefetchSurah = useCallback(async (surahId: number, translationLanguages: string[] = ['english']) => {
    try {
      const translationIds = translationLanguages.map(
        lang => TRANSLATION_RESOURCES[lang as keyof typeof TRANSLATION_RESOURCES]?.id
      ).filter(Boolean);
      
      const cacheKey = `surah_${surahId}_${translationIds.join(',')}`;
      
      // Only prefetch if not already cached
      if (!getCachedData<SurahData>(cacheKey)) {
        const data = await getSurahData(surahId, translationIds);
        setCachedData(cacheKey, data);
      }
    } catch (error) {
      console.warn(`Failed to prefetch surah ${surahId}:`, error);
    }
  }, []);

  const prefetchAdjacentSurahs = useCallback((currentSurahId: number, translationLanguages: string[] = ['english']) => {
    // Prefetch previous and next surahs
    if (currentSurahId > 1) {
      prefetchSurah(currentSurahId - 1, translationLanguages);
    }
    if (currentSurahId < 114) {
      prefetchSurah(currentSurahId + 1, translationLanguages);
    }
  }, [prefetchSurah]);

  const clearCache = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_KEY_PREFIX));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear Quran cache:', error);
    }
  }, []);

  return {
    prefetchSurah,
    prefetchAdjacentSurahs,
    clearCache,
  };
}

// Bookmarks hook
export function useQuranBookmarks() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(() => {
    try {
      setLoading(true);
      const saved = localStorage.getItem('quran_verse_bookmarks');
      const bookmarksList = saved ? JSON.parse(saved) : [];
      setBookmarks(bookmarksList);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
    
    // Listen for bookmark changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'quran_verse_bookmarks') {
        loadBookmarks();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadBookmarks]);

  const addBookmark = useCallback((bookmark: any) => {
    try {
      const updated = [...bookmarks, { ...bookmark, id: `${bookmark.verseKey}_${Date.now()}` }];
      localStorage.setItem('quran_verse_bookmarks', JSON.stringify(updated));
      setBookmarks(updated);
    } catch (error) {
      console.error('Failed to add bookmark:', error);
    }
  }, [bookmarks]);

  const removeBookmark = useCallback((bookmarkId: string) => {
    try {
      const updated = bookmarks.filter(b => b.id !== bookmarkId);
      localStorage.setItem('quran_verse_bookmarks', JSON.stringify(updated));
      setBookmarks(updated);
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  }, [bookmarks]);

  const isBookmarked = useCallback((verseKey: string) => {
    return bookmarks.some(b => b.verseKey === verseKey);
  }, [bookmarks]);

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    refetch: loadBookmarks,
  };
}

// Last read hook
export function useLastRead() {
  const [lastRead, setLastRead] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('quran_last_read');
      if (saved) {
        setLastRead(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load last read:', error);
    }
  }, []);

  const updateLastRead = useCallback((surahId: number, surahName: string, verseNumber?: number) => {
    const lastReadData = {
      surahId,
      surahName,
      verseNumber,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem('quran_last_read', JSON.stringify(lastReadData));
      setLastRead(lastReadData);
    } catch (error) {
      console.error('Failed to save last read:', error);
    }
  }, []);

  return {
    lastRead,
    updateLastRead,
  };
}