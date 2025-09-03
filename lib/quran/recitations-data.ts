// Quran recitation data management with caching
import { Recitation, RecitationsResponse } from './types';

// Base URL for audio files
export const QURAN_AUDIO_CDN = 'https://verses.quran.foundation';

// Default recitations (fallback data in case API fails)
export const DEFAULT_RECITATIONS: Recitation[] = [
  {
    id: 7,
    reciter_name: "Mishari Rashid al-`Afasy",
    style: null,
    translated_name: {
      name: "Mishari Rashid al-`Afasy",
      language_name: "english"
    }
  },
  {
    id: 6,
    reciter_name: "Mahmoud Khalil Al-Husary",
    style: null,
    translated_name: {
      name: "Mahmoud Khalil Al-Husary",
      language_name: "english"
    }
  },
  {
    id: 5,
    reciter_name: "Abdul Basit Abdul Samad",
    style: "Murattal",
    translated_name: {
      name: "Abdul Basit Abdul Samad",
      language_name: "english"
    }
  }
];

// Cache key for localStorage
const RECITATIONS_CACHE_KEY = 'quran_recitations_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CacheItem {
  data: Recitation[];
  timestamp: number;
  expires: number;
}

/**
 * Get recitations from cache if available and not expired
 */
function getFromCache(): Recitation[] | null {
  try {
    const cached = localStorage.getItem(RECITATIONS_CACHE_KEY);
    if (!cached) return null;

    const item: CacheItem = JSON.parse(cached);
    if (Date.now() > item.expires) {
      localStorage.removeItem(RECITATIONS_CACHE_KEY);
      return null;
    }

    return item.data;
  } catch (error) {
    console.error('Failed to read recitations from cache:', error);
    return null;
  }
}

/**
 * Save recitations to cache
 */
function saveToCache(recitations: Recitation[]): void {
  try {
    const item: CacheItem = {
      data: recitations,
      timestamp: Date.now(),
      expires: Date.now() + CACHE_DURATION
    };
    localStorage.setItem(RECITATIONS_CACHE_KEY, JSON.stringify(item));
  } catch (error) {
    console.error('Failed to save recitations to cache:', error);
  }
}

/**
 * Fetch available recitations from API with caching
 */
export async function getRecitations(): Promise<Recitation[]> {
  // Try cache first
  const cached = getFromCache();
  if (cached) {
    console.log('✅ Using cached recitations:', cached.length);
    return cached;
  }

  try {
    console.log('🌐 Fetching recitations from API...');
    const response = await fetch('/api/quran/recitations');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: RecitationsResponse = await response.json();
    const recitations = data.recitations || [];
    
    console.log('✅ Fetched recitations from API:', recitations.length);
    
    // Save to cache
    saveToCache(recitations);
    
    return recitations;
  } catch (error) {
    console.error('❌ Failed to fetch recitations, using defaults:', error);
    
    // Return default recitations as fallback
    saveToCache(DEFAULT_RECITATIONS);
    return DEFAULT_RECITATIONS;
  }
}

/**
 * Get recitation by ID
 */
export async function getRecitationById(id: number): Promise<Recitation | null> {
  const recitations = await getRecitations();
  return recitations.find(r => r.id === id) || null;
}

/**
 * Get default recitation (Mishari Rashid al-`Afasy)
 */
export function getDefaultRecitation(): Recitation {
  return DEFAULT_RECITATIONS[0]; // Mishari Rashid al-`Afasy (ID: 7)
}

/**
 * Construct full audio URL from relative path
 */
export function constructAudioUrl(relativePath: string): string {
  const fullUrl = `${QURAN_AUDIO_CDN}/${relativePath}`;
  console.log('🎵 Constructed audio URL:', fullUrl);
  return fullUrl;
}

/**
 * Clear recitations cache (useful for debugging or force refresh)
 */
export function clearRecitationsCache(): void {
  try {
    localStorage.removeItem(RECITATIONS_CACHE_KEY);
    console.log('✅ Recitations cache cleared');
  } catch (error) {
    console.error('Failed to clear recitations cache:', error);
  }
}