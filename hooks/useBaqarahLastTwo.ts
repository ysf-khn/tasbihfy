import { useState, useEffect, useCallback } from "react";
import { getVerse } from "@/lib/quran/api";
import { VerseWithTranslations } from "@/lib/quran/types";
import { useQuranSettings } from "./useQuranSettings";

interface BaqarahLastTwoProgress {
  currentIndex: number;
  completed: boolean;
  lastAccessed: string;
}

interface UseBaqarahLastTwoReturn {
  // Data
  verses: VerseWithTranslations[];
  currentVerse: VerseWithTranslations | null;
  currentIndex: number;

  // Navigation
  goToNext: () => void;
  goToPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;

  // Display
  progressText: string;
  verseKey: string;

  // State
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
  markAsComplete: () => void;
  resetProgress: () => void;
}

const STORAGE_KEY = "baqarah_last_two_progress";
const TRANSLATION_ID = 131; // Dr. Mustafa Khattab

function loadProgress(): BaqarahLastTwoProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function saveProgress(progress: BaqarahLastTwoProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage errors
  }
}

export function useBaqarahLastTwo(): UseBaqarahLastTwoReturn {
  const [verses, setVerses] = useState<VerseWithTranslations[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const { settings } = useQuranSettings();
  const script = settings.selectedScript || "uthmani";

  // Load verses on mount
  useEffect(() => {
    async function fetchVerses() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch both verses in parallel
        const [verse285, verse286] = await Promise.all([
          getVerse(2, 285, [TRANSLATION_ID], script),
          getVerse(2, 286, [TRANSLATION_ID], script),
        ]);

        setVerses([verse285, verse286]);

        // Load saved progress
        const savedProgress = loadProgress();
        if (savedProgress) {
          setCurrentIndex(savedProgress.currentIndex);
          setIsCompleted(savedProgress.completed);
        }
      } catch (err) {
        console.error("Failed to fetch Baqarah last two verses:", err);
        setError("Failed to load verses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchVerses();
  }, [script]);

  // Save progress when index or completed changes
  useEffect(() => {
    if (!isLoading && verses.length > 0) {
      saveProgress({
        currentIndex,
        completed: isCompleted,
        lastAccessed: new Date().toISOString(),
      });
    }
  }, [currentIndex, isCompleted, isLoading, verses.length]);

  const currentVerse = verses[currentIndex] || null;

  const goToNext = useCallback(() => {
    if (currentIndex < verses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, verses.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const markAsComplete = useCallback(() => {
    setIsCompleted(true);
    saveProgress({
      currentIndex: verses.length - 1,
      completed: true,
      lastAccessed: new Date().toISOString(),
    });
  }, [verses.length]);

  const resetProgress = useCallback(() => {
    setCurrentIndex(0);
    setIsCompleted(false);
    saveProgress({
      currentIndex: 0,
      completed: false,
      lastAccessed: new Date().toISOString(),
    });
  }, []);

  return {
    // Data
    verses,
    currentVerse,
    currentIndex,

    // Navigation
    goToNext,
    goToPrevious,
    canGoNext: currentIndex < verses.length - 1,
    canGoPrevious: currentIndex > 0,

    // Display
    progressText: `${currentIndex + 1}/2`,
    verseKey: currentVerse?.verse_key || "",

    // State
    isLoading,
    error,
    isCompleted,
    markAsComplete,
    resetProgress,
  };
}
