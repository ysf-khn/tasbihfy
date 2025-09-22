import { useState, useEffect, useCallback } from 'react';
import {
  nightlyRecitations,
  getVerseByIndex,
  getProgressPercentage,
  getVerseDisplayInfo,
  loadProgress,
  saveProgress,
  NightlyVerse,
  NightlyRecitationsProgress
} from '@/data/nightly-recitations';
import { getVerseContentByIndex, VerseContent } from '@/data/nightly-verses-content';

interface UseNightlyRecitationsReturn {
  // Current verse data
  currentVerse: NightlyVerse | null;
  currentVerseContent: VerseContent | null;
  currentIndex: number;

  // Progress
  totalVerses: number;
  progressPercentage: number;
  progressText: string; // e.g., "0/48"

  // Display info
  surahDisplay: string; // e.g., "112. Al-Ikhlas"
  versePosition: string; // e.g., "1/4"

  // Navigation
  goToNext: () => void;
  goToPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;

  // State
  isCompleted: boolean;
  completedToday: boolean;
  markAsComplete: () => void;
  resetProgress: () => void;

  // Loading
  isLoading: boolean;
}

export function useNightlyRecitations(): UseNightlyRecitationsReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const totalVerses = nightlyRecitations.length;
  const currentVerse = getVerseByIndex(currentIndex);
  const currentVerseContent = getVerseContentByIndex(currentIndex) || null;
  const progressPercentage = getProgressPercentage(currentIndex + 1);
  const progressText = `${currentIndex}/${totalVerses}`;

  // Get display info
  const displayInfo = currentVerse
    ? getVerseDisplayInfo(currentVerse, currentIndex)
    : { surahDisplay: '', versePosition: '', totalProgress: '' };

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = loadProgress();
    if (savedProgress) {
      setCurrentIndex(savedProgress.currentIndex);
      setIsCompleted(savedProgress.completed);
      setCompletedToday(savedProgress.completedToday);
    }
    setIsLoading(false);
  }, []);

  // Save progress whenever index changes
  useEffect(() => {
    if (!isLoading) {
      const progress: NightlyRecitationsProgress = {
        currentIndex,
        completed: isCompleted,
        lastAccessed: new Date().toISOString(),
        completedToday
      };
      saveProgress(progress);
    }
  }, [currentIndex, isCompleted, completedToday, isLoading]);

  const goToNext = useCallback(() => {
    if (currentIndex < totalVerses - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Mark as complete when reaching the end
      markAsComplete();
    }
  }, [currentIndex, totalVerses]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const markAsComplete = useCallback(() => {
    setIsCompleted(true);
    setCompletedToday(true);
    const progress: NightlyRecitationsProgress = {
      currentIndex: totalVerses - 1,
      completed: true,
      lastAccessed: new Date().toISOString(),
      completedToday: true
    };
    saveProgress(progress);
  }, [totalVerses]);

  const resetProgress = useCallback(() => {
    setCurrentIndex(0);
    setIsCompleted(false);
    setCompletedToday(false);
    const progress: NightlyRecitationsProgress = {
      currentIndex: 0,
      completed: false,
      lastAccessed: new Date().toISOString(),
      completedToday: false
    };
    saveProgress(progress);
  }, []);

  return {
    // Current verse data
    currentVerse,
    currentVerseContent,
    currentIndex,

    // Progress
    totalVerses,
    progressPercentage,
    progressText,

    // Display info
    surahDisplay: displayInfo.surahDisplay,
    versePosition: displayInfo.versePosition,

    // Navigation
    goToNext,
    goToPrevious,
    canGoNext: currentIndex < totalVerses - 1,
    canGoPrevious: currentIndex > 0,

    // State
    isCompleted,
    completedToday,
    markAsComplete,
    resetProgress,

    // Loading
    isLoading
  };
}

