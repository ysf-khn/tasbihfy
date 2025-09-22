// Nightly Recitations Data Structure
// Total: 48 verses

export interface NightlyVerse {
  verseKey: string; // e.g., "112:1"
  surahId: number;
  verseNumber: number;
  surahName: string;
  surahNameArabic: string;
  totalVersesInSurah: number;
}

export const nightlyRecitations: NightlyVerse[] = [
  // Surah Al-Ikhlas (112) - 4 verses
  { verseKey: "112:1", surahId: 112, verseNumber: 1, surahName: "Al-Ikhlas", surahNameArabic: "الإخلاص", totalVersesInSurah: 4 },
  { verseKey: "112:2", surahId: 112, verseNumber: 2, surahName: "Al-Ikhlas", surahNameArabic: "الإخلاص", totalVersesInSurah: 4 },
  { verseKey: "112:3", surahId: 112, verseNumber: 3, surahName: "Al-Ikhlas", surahNameArabic: "الإخلاص", totalVersesInSurah: 4 },
  { verseKey: "112:4", surahId: 112, verseNumber: 4, surahName: "Al-Ikhlas", surahNameArabic: "الإخلاص", totalVersesInSurah: 4 },

  // Surah Al-Falaq (113) - 5 verses
  { verseKey: "113:1", surahId: 113, verseNumber: 1, surahName: "Al-Falaq", surahNameArabic: "الفلق", totalVersesInSurah: 5 },
  { verseKey: "113:2", surahId: 113, verseNumber: 2, surahName: "Al-Falaq", surahNameArabic: "الفلق", totalVersesInSurah: 5 },
  { verseKey: "113:3", surahId: 113, verseNumber: 3, surahName: "Al-Falaq", surahNameArabic: "الفلق", totalVersesInSurah: 5 },
  { verseKey: "113:4", surahId: 113, verseNumber: 4, surahName: "Al-Falaq", surahNameArabic: "الفلق", totalVersesInSurah: 5 },
  { verseKey: "113:5", surahId: 113, verseNumber: 5, surahName: "Al-Falaq", surahNameArabic: "الفلق", totalVersesInSurah: 5 },

  // Surah An-Nas (114) - 6 verses
  { verseKey: "114:1", surahId: 114, verseNumber: 1, surahName: "An-Nas", surahNameArabic: "الناس", totalVersesInSurah: 6 },
  { verseKey: "114:2", surahId: 114, verseNumber: 2, surahName: "An-Nas", surahNameArabic: "الناس", totalVersesInSurah: 6 },
  { verseKey: "114:3", surahId: 114, verseNumber: 3, surahName: "An-Nas", surahNameArabic: "الناس", totalVersesInSurah: 6 },
  { verseKey: "114:4", surahId: 114, verseNumber: 4, surahName: "An-Nas", surahNameArabic: "الناس", totalVersesInSurah: 6 },
  { verseKey: "114:5", surahId: 114, verseNumber: 5, surahName: "An-Nas", surahNameArabic: "الناس", totalVersesInSurah: 6 },
  { verseKey: "114:6", surahId: 114, verseNumber: 6, surahName: "An-Nas", surahNameArabic: "الناس", totalVersesInSurah: 6 },

  // Ayatul Kursi (2:255) - 1 verse
  { verseKey: "2:255", surahId: 2, verseNumber: 255, surahName: "Al-Baqarah (Ayatul Kursi)", surahNameArabic: "البقرة (آية الكرسي)", totalVersesInSurah: 1 },

  // Last 2 verses of Surah Al-Baqarah (2:285-286) - 2 verses
  { verseKey: "2:285", surahId: 2, verseNumber: 285, surahName: "Al-Baqarah", surahNameArabic: "البقرة", totalVersesInSurah: 2 },
  { verseKey: "2:286", surahId: 2, verseNumber: 286, surahName: "Al-Baqarah", surahNameArabic: "البقرة", totalVersesInSurah: 2 },

  // Surah Al-Mulk (67) - 30 verses
  ...Array.from({ length: 30 }, (_, i) => ({
    verseKey: `67:${i + 1}`,
    surahId: 67,
    verseNumber: i + 1,
    surahName: "Al-Mulk",
    surahNameArabic: "الملك",
    totalVersesInSurah: 30
  }))
];

// Helper functions
export function getTotalVerses(): number {
  return nightlyRecitations.length; // 48
}

export function getVerseByIndex(index: number): NightlyVerse | null {
  if (index < 0 || index >= nightlyRecitations.length) {
    return null;
  }
  return nightlyRecitations[index];
}

export function getProgressPercentage(currentIndex: number): number {
  return Math.round((currentIndex / nightlyRecitations.length) * 100);
}

export function getVerseDisplayInfo(verse: NightlyVerse, index: number): {
  surahDisplay: string;
  versePosition: string;
  totalProgress: string;
} {
  // Get the verse position within its surah group
  const surahStartIndex = nightlyRecitations.findIndex(v =>
    v.surahId === verse.surahId &&
    v.surahName === verse.surahName
  );
  const versePositionInSurah = index - surahStartIndex + 1;

  return {
    surahDisplay: `${verse.surahId}. ${verse.surahName}`,
    versePosition: `${versePositionInSurah}/${verse.totalVersesInSurah}`,
    totalProgress: `${index + 1}/${nightlyRecitations.length}`
  };
}

// Storage keys
export const NIGHTLY_RECITATIONS_STORAGE_KEY = 'nightlyRecitations';

export interface NightlyRecitationsProgress {
  currentIndex: number;
  completed: boolean;
  lastAccessed: string; // ISO date string
  completedToday: boolean;
}

export function saveProgress(progress: NightlyRecitationsProgress): void {
  localStorage.setItem(NIGHTLY_RECITATIONS_STORAGE_KEY, JSON.stringify(progress));
}

export function loadProgress(): NightlyRecitationsProgress | null {
  const stored = localStorage.getItem(NIGHTLY_RECITATIONS_STORAGE_KEY);
  if (!stored) return null;

  try {
    const progress = JSON.parse(stored) as NightlyRecitationsProgress;

    // Check if it's a new day
    const today = new Date().toDateString();
    const lastAccessed = new Date(progress.lastAccessed).toDateString();

    if (today !== lastAccessed) {
      // Reset for new day
      return {
        currentIndex: 0,
        completed: false,
        lastAccessed: new Date().toISOString(),
        completedToday: false
      };
    }

    return progress;
  } catch {
    return null;
  }
}