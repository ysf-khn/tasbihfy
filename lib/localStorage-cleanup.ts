"use client";

/**
 * Centralized localStorage cleanup utilities to prevent storage pollution
 */

const DHIKR_SESSION_PREFIX = 'dhikr-session-';
const TEMP_DHIKR_PREFIX = 'temp-dhikr-';
const BOOKMARK_KEYS = ['quran_verse_bookmarks'];
const LEGACY_SURAH_BOOKMARKS_KEY = 'quran_bookmarks';
const LEGACY_QURAN_HOOK_CACHE_PREFIX = 'quran_hook_cache_';
const VERSE_BOOKMARKS_KEY = 'quran_verse_bookmarks';
const GUEST_SESSIONS_KEY = 'tasbihfy-guest-sessions';
const PRAYER_LOG_KEY = 'prayer_log';
const PRAYER_LOG_RETENTION_DAYS = 180;

// Storage limits
const MAX_BOOKMARKS = 100;
const DHIKR_SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
const TEMP_DHIKR_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const GUEST_SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface StorageStats {
  totalItems: number;
  estimatedSize: number; // in bytes
  itemsByType: Record<string, number>;
}

export class LocalStorageCleanup {
  /**
   * Clean up old dhikr session keys
   */
  static cleanupDhikrSessions(userId?: string): number {
    if (typeof window === 'undefined') return 0;
    
    let cleaned = 0;
    const now = Date.now();
    
    // Get all localStorage keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(DHIKR_SESSION_PREFIX)) continue;
      
      try {
        const data = localStorage.getItem(key);
        if (!data) {
          localStorage.removeItem(key);
          cleaned++;
          continue;
        }
        
        const parsed = JSON.parse(data);
        const lastUpdated = parsed.lastUpdated || 0;
        
        // Remove if older than TTL or if it's for a specific user being cleaned
        if (now - lastUpdated > DHIKR_SESSION_TTL || 
            (userId && key.includes(`-${userId}`))) {
          localStorage.removeItem(key);
          cleaned++;
        }
      } catch (error) {
        // Remove invalid JSON
        localStorage.removeItem(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
  
  /**
   * Clean up old temp dhikr keys
   */
  static cleanupTempDhikrs(): number {
    if (typeof window === 'undefined') return 0;
    
    let cleaned = 0;
    const now = Date.now();
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(TEMP_DHIKR_PREFIX)) continue;
      
      try {
        const data = localStorage.getItem(key);
        if (!data) {
          localStorage.removeItem(key);
          cleaned++;
          continue;
        }
        
        // For temp dhikrs, we store just the count as a string
        // We can't determine age from the value, so we'll clean based on localStorage modification time
        // Since we can't access modification time, we'll just clean them if they're numeric (old format)
        if (/^\d+$/.test(data)) {
          // This is likely an old temp dhikr count, clean it up
          localStorage.removeItem(key);
          cleaned++;
        }
      } catch (error) {
        localStorage.removeItem(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
  
  /**
   * Limit bookmark arrays to prevent unlimited growth
   */
  static limitBookmarks(): number {
    if (typeof window === 'undefined') return 0;
    
    let totalTrimmed = 0;
    
    BOOKMARK_KEYS.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (!data) return;
        
        const bookmarks = JSON.parse(data);
        if (!Array.isArray(bookmarks)) return;
        
        if (bookmarks.length > MAX_BOOKMARKS) {
          // Keep the most recent bookmarks (FIFO removal)
          const trimmed = bookmarks.slice(-MAX_BOOKMARKS);
          localStorage.setItem(key, JSON.stringify(trimmed));
          totalTrimmed += bookmarks.length - MAX_BOOKMARKS;
        }
      } catch (error) {
        console.warn(`Failed to process bookmarks for ${key}:`, error);
      }
    });
    
    return totalTrimmed;
  }
  
  /**
   * Clean up old completed guest sessions
   */
  static cleanupGuestSessions(): number {
    if (typeof window === 'undefined') return 0;
    
    try {
      const data = localStorage.getItem(GUEST_SESSIONS_KEY);
      if (!data) return 0;
      
      const sessions = JSON.parse(data);
      if (!Array.isArray(sessions)) return 0;
      
      const now = Date.now();
      const originalCount = sessions.length;
      
      // Remove completed sessions older than TTL
      const filtered = sessions.filter(session => {
        if (!session.completed) return true; // Keep incomplete sessions
        
        const lastUpdated = session.lastUpdated || session.startedAt || 0;
        return now - lastUpdated < GUEST_SESSION_TTL;
      });
      
      if (filtered.length < originalCount) {
        localStorage.setItem(GUEST_SESSIONS_KEY, JSON.stringify(filtered));
        return originalCount - filtered.length;
      }
      
      return 0;
    } catch (error) {
      console.warn('Failed to cleanup guest sessions:', error);
      return 0;
    }
  }
  
  /**
   * One-time migration: convert legacy surah-level bookmarks into verse-1
   * bookmarks in the canonical verse bookmark store
   */
  static migrateSurahBookmarks(): number {
    if (typeof window === 'undefined') return 0;

    try {
      const legacy = localStorage.getItem(LEGACY_SURAH_BOOKMARKS_KEY);
      if (!legacy) return 0;

      const surahBookmarks = JSON.parse(legacy);
      if (!Array.isArray(surahBookmarks)) {
        localStorage.removeItem(LEGACY_SURAH_BOOKMARKS_KEY);
        return 0;
      }

      const verseBookmarks = JSON.parse(
        localStorage.getItem(VERSE_BOOKMARKS_KEY) || '[]'
      );
      const existingKeys = new Set(
        (Array.isArray(verseBookmarks) ? verseBookmarks : []).map(
          (b: any) => b.verseKey
        )
      );

      let migrated = 0;
      for (const bookmark of surahBookmarks) {
        if (!bookmark?.surahId) continue;
        const verseKey = `${bookmark.surahId}:1`;
        if (existingKeys.has(verseKey)) continue;
        verseBookmarks.push({
          id: `${verseKey}_${Date.now()}_${migrated}`,
          verseKey,
          surahId: bookmark.surahId,
          verseNumber: 1,
          surahName: bookmark.surahName || `Surah ${bookmark.surahId}`,
          createdAt: bookmark.createdAt || new Date().toISOString(),
        });
        existingKeys.add(verseKey);
        migrated++;
      }

      localStorage.setItem(VERSE_BOOKMARKS_KEY, JSON.stringify(verseBookmarks));
      localStorage.removeItem(LEGACY_SURAH_BOOKMARKS_KEY);
      return migrated;
    } catch (error) {
      console.warn('Failed to migrate surah bookmarks:', error);
      return 0;
    }
  }

  /**
   * Trim guest prayer log entries older than the retention window
   */
  static cleanupPrayerLog(): number {
    if (typeof window === 'undefined') return 0;

    try {
      const data = localStorage.getItem(PRAYER_LOG_KEY);
      if (!data) return 0;

      const logs = JSON.parse(data);
      if (!logs || typeof logs !== 'object' || Array.isArray(logs)) return 0;

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - PRAYER_LOG_RETENTION_DAYS);
      const cutoffStr = cutoff.toISOString().split('T')[0];

      let removed = 0;
      for (const date of Object.keys(logs)) {
        if (date < cutoffStr) {
          delete logs[date];
          removed++;
        }
      }

      if (removed > 0) {
        localStorage.setItem(PRAYER_LOG_KEY, JSON.stringify(logs));
      }
      return removed;
    } catch (error) {
      console.warn('Failed to cleanup prayer log:', error);
      return 0;
    }
  }

  /**
   * Drop expired Quran payloads and the retired `quran_hook_cache_*` layer,
   * which duplicated every surah a user read. Entries are identified by the
   * cache-item shape, so bookmarks, last-read and settings are never touched.
   */
  static cleanupQuranCache(): number {
    if (typeof window === 'undefined') return 0;

    let cleaned = 0;

    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('quran_')) keys.push(key);
      }

      for (const key of keys) {
        if (key.startsWith(LEGACY_QURAN_HOOK_CACHE_PREFIX)) {
          localStorage.removeItem(key);
          cleaned++;
          continue;
        }

        try {
          const item = JSON.parse(localStorage.getItem(key) || 'null');
          if (
            item &&
            typeof item === 'object' &&
            typeof item.expires === 'number' &&
            Date.now() > item.expires
          ) {
            localStorage.removeItem(key);
            cleaned++;
          }
        } catch {
          // Not a cache entry.
        }
      }
    } catch (error) {
      console.error('Failed to clean Quran cache:', error);
    }

    return cleaned;
  }

  /**
   * Get localStorage usage statistics
   */
  static getStorageStats(): StorageStats {
    if (typeof window === 'undefined') {
      return { totalItems: 0, estimatedSize: 0, itemsByType: {} };
    }
    
    const stats: StorageStats = {
      totalItems: localStorage.length,
      estimatedSize: 0,
      itemsByType: {}
    };
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      const value = localStorage.getItem(key);
      const size = (key.length + (value?.length || 0)) * 2; // Rough estimate (UTF-16)
      stats.estimatedSize += size;
      
      // Categorize by key pattern
      let category = 'other';
      if (key.startsWith(DHIKR_SESSION_PREFIX)) category = 'dhikr-sessions';
      else if (key.startsWith(TEMP_DHIKR_PREFIX)) category = 'temp-dhikrs';
      else if (key.startsWith('quran_surah')) category = 'quran-cache';
      else if (BOOKMARK_KEYS.includes(key)) category = 'bookmarks';
      else if (key.includes('settings')) category = 'settings';
      else if (key.includes('guest')) category = 'guest-data';
      
      stats.itemsByType[category] = (stats.itemsByType[category] || 0) + 1;
    }
    
    return stats;
  }
  
  /**
   * Run all cleanup operations
   */
  static runFullCleanup(userId?: string): {
    dhikrSessions: number;
    tempDhikrs: number;
    bookmarks: number;
    guestSessions: number;
    prayerLog: number;
    quranCache: number;
    totalCleaned: number;
  } {
    const results = {
      dhikrSessions: this.cleanupDhikrSessions(userId),
      tempDhikrs: this.cleanupTempDhikrs(),
      bookmarks: this.limitBookmarks(),
      guestSessions: this.cleanupGuestSessions(),
      prayerLog: this.cleanupPrayerLog(),
      quranCache: this.cleanupQuranCache(),
      totalCleaned: 0
    };

    results.totalCleaned = results.dhikrSessions + results.tempDhikrs +
                          results.bookmarks + results.guestSessions +
                          results.prayerLog + results.quranCache;
    
    console.log('localStorage cleanup completed:', results);
    return results;
  }
  
  /**
   * Check if localStorage is approaching browser limits
   */
  static checkQuotaUsage(): { isNearLimit: boolean; usagePercent: number } {
    if (typeof window === 'undefined') {
      return { isNearLimit: false, usagePercent: 0 };
    }
    
    try {
      const stats = this.getStorageStats();
      // Most browsers have ~5-10MB localStorage limit
      const estimatedLimit = 5 * 1024 * 1024; // 5MB
      const usagePercent = (stats.estimatedSize / estimatedLimit) * 100;
      
      return {
        isNearLimit: usagePercent > 80, // Alert at 80% usage
        usagePercent: Math.round(usagePercent * 100) / 100
      };
    } catch {
      return { isNearLimit: false, usagePercent: 0 };
    }
  }
}