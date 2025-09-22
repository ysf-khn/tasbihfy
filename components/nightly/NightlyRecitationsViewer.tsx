"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNightlyRecitations } from "@/hooks/useNightlyRecitations";
import { useQuranAudio } from "@/hooks/useQuranAudio";
import { useQuranSettings } from "@/hooks/useQuranSettings";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";
import { SpeakerXMarkIcon } from "@heroicons/react/24/solid";

export default function NightlyRecitationsViewer() {
  const router = useRouter();
  const { settings } = useQuranSettings();
  const {
    currentVerse,
    currentVerseContent,
    currentIndex,
    totalVerses,
    progressPercentage,
    progressText,
    surahDisplay,
    versePosition,
    goToNext,
    goToPrevious,
    canGoNext,
    canGoPrevious,
    isCompleted,
    markAsComplete,
    resetProgress,
    isLoading: recitationsLoading,
  } = useNightlyRecitations();

  const {
    isPlaying,
    isLoading: audioLoading,
    playAyah,
    pauseAyah,
    togglePlayPause,
    isCurrentlyPlaying,
  } = useQuranAudio();

  const [showCompletion, setShowCompletion] = useState(false);

  // Handle completion
  useEffect(() => {
    if (currentIndex === totalVerses - 1 && !isCompleted) {
      setShowCompletion(true);
    }
  }, [currentIndex, totalVerses, isCompleted]);

  const handleDone = () => {
    markAsComplete();
    router.push("/");
  };

  const handleAudioToggle = async () => {
    if (currentVerse) {
      await togglePlayPause(currentVerse.verseKey);
    }
  };

  if (recitationsLoading || !currentVerse) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-200 flex flex-col">
      {/* Header - Fixed */}
      <div className="navbar bg-base-100 border-b border-base-300 flex-shrink-0">
        <div className="navbar-start">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-circle"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="navbar-center">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
            <span className="text-lg font-semibold">Nightly Recitations</span>
          </div>
        </div>
      </div>

      {/* Progress Bar - Fixed */}
      <div className="px-4 py-3 bg-base-100 flex-shrink-0">
        <div className="flex items-center justify-between text-sm text-base-content/70 mb-2">
          <span>{progressText}</span>
          <span>{progressPercentage}%</span>
        </div>
        <progress
          className="progress progress-primary w-full"
          value={currentIndex}
          max={totalVerses}
        ></progress>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Surah Info Card */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-3">
              {/* Bookmark Icon */}
              <button className="btn btn-ghost btn-circle btn-sm">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>

              {/* Centered Surah Info */}
              <div className="text-center flex-1">
                <div className="text-lg font-semibold text-base-content">
                  {surahDisplay}
                </div>
                <div className="text-sm text-base-content/60">
                  Verse {versePosition}
                </div>
              </div>

              {/* Audio Controls */}
              <button
                onClick={handleAudioToggle}
                className="btn btn-ghost btn-circle btn-sm"
                disabled={audioLoading || !currentVerseContent}
              >
                {audioLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : isCurrentlyPlaying(currentVerse.verseKey) ? (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                ) : (
                  <SpeakerWaveIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Full Verse Content */}
            {currentVerseContent && (
              <div className="border-t border-base-200 pt-4 space-y-4">
                {/* Arabic Text */}
                <p className="text-2xl md:text-3xl font-arabic text-base-content leading-loose text-center" dir="rtl">
                  {settings.selectedScript === 'indopak'
                    ? currentVerseContent.textIndopak
                    : currentVerseContent.textUthmani}
                </p>

                {/* Translation */}
                <p className="text-base text-base-content/80 text-center leading-relaxed">
                  {currentVerseContent.translation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer - Fixed */}
      <div className="p-4 bg-base-100 border-t border-base-300 flex-shrink-0">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            disabled={!canGoPrevious}
            className="btn btn-primary btn-circle"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          {/* Done Button */}
          <button
            onClick={handleDone}
            className="btn btn-neutral flex-1 max-w-[200px]"
          >
            I'm Done
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            disabled={!canGoNext && !showCompletion}
            className="btn btn-primary btn-circle"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletion && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-center mb-4">
              🌙 Nightly Recitations Complete!
            </h3>
            <p className="text-center text-base-content/70 mb-6">
              May Allah protect you throughout the night. You have completed all
              48 verses.
            </p>
            <div className="modal-action justify-center">
              <button onClick={handleDone} className="btn btn-primary">
                Finish
              </button>
              <button
                onClick={() => {
                  resetProgress();
                  setShowCompletion(false);
                }}
                className="btn btn-ghost"
              >
                Start Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
