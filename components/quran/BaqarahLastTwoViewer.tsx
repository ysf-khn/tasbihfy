"use client";

import { useRouter } from "next/navigation";
import { useBaqarahLastTwo } from "@/hooks/useBaqarahLastTwo";
import { useQuranAudio } from "@/hooks/useQuranAudio";
import { useQuranSettings } from "@/hooks/useQuranSettings";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";
import { SpeakerXMarkIcon } from "@heroicons/react/24/solid";

export default function BaqarahLastTwoViewer() {
  const router = useRouter();
  const { settings } = useQuranSettings();
  const {
    currentVerse,
    currentIndex,
    progressText,
    verseKey,
    goToNext,
    goToPrevious,
    canGoNext,
    canGoPrevious,
    isLoading,
    error,
    markAsComplete,
  } = useBaqarahLastTwo();

  const {
    isLoading: audioLoading,
    togglePlayPause,
    isCurrentlyPlaying,
  } = useQuranAudio();

  const handleDone = () => {
    markAsComplete();
    router.push("/quran");
  };

  const handleAudioToggle = async () => {
    if (verseKey) {
      await togglePlayPause(verseKey);
    }
  };

  // Get Arabic text based on script preference
  const getArabicText = () => {
    if (!currentVerse) return "";
    if (settings.selectedScript === "indopak") {
      return (
        currentVerse.text_indopak ||
        currentVerse.text_uthmani ||
        currentVerse.text_simple
      );
    }
    return (
      currentVerse.text_uthmani ||
      currentVerse.text_simple ||
      currentVerse.text_imlaei
    );
  };

  // Get translation text
  const getTranslation = () => {
    if (!currentVerse?.translations?.length) return "";
    return currentVerse.translations[0]?.text || "";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-error mb-4">{error}</p>
          <button onClick={() => router.back()} className="btn btn-primary">
            Go Back
          </button>
        </div>
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
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            <span className="text-lg font-semibold">Last 2 Ayahs</span>
          </div>
        </div>
        <div className="navbar-end"></div>
      </div>

      {/* Progress Bar - Fixed */}
      <div className="px-4 py-3 bg-base-100 flex-shrink-0">
        <div className="flex items-center justify-between text-sm text-base-content/70 mb-2">
          <span>Surah Al-Baqarah</span>
          <span>{progressText}</span>
        </div>
        <progress
          className="progress progress-primary w-full"
          value={currentIndex + 1}
          max={2}
        ></progress>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Verse Card */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-3">
              {/* Verse badge */}
              <div className="badge badge-primary badge-lg">{verseKey}</div>

              {/* Audio Controls */}
              <button
                onClick={handleAudioToggle}
                className="btn btn-ghost btn-circle btn-sm"
                disabled={audioLoading || !currentVerse}
              >
                {audioLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : isCurrentlyPlaying(verseKey) ? (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                ) : (
                  <SpeakerWaveIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Verse Content */}
            {currentVerse && (
              <div className="border-t border-base-200 pt-4 space-y-4">
                {/* Arabic Text */}
                <p
                  className="text-2xl md:text-3xl font-arabic text-base-content leading-loose text-center"
                  dir="rtl"
                >
                  {getArabicText()}
                </p>

                {/* Translation */}
                <p className="text-base text-base-content/80 text-center leading-relaxed">
                  {getTranslation()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer - Fixed */}
      <div className="p-4 pb-24 bg-base-100 border-t border-base-300 flex-shrink-0">
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
            disabled={!canGoNext}
            className="btn btn-primary btn-circle"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
