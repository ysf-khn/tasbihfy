"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import kaabaImage from "@/public/kaaba.jpeg";
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  BookOpenIcon,
  BookmarkIcon as BookmarkIconOutline,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";
import QuranPageHeader from "@/components/ui/QuranPageHeader";
import QuranNavigationDrawer from "@/components/ui/QuranNavigationDrawer";
import AyahCard from "@/components/quran/AyahCard";
import QuranSettingsDrawer from "@/components/quran/QuranSettingsDrawer";
import AudioPlayer from "@/components/quran/AudioPlayer";
import { useQuranSurah, useLastRead } from "@/hooks/useQuranData";
import { useQuranSettings } from "@/hooks/useQuranSettings";

export default function SurahPage() {
  const params = useParams();
  const router = useRouter();
  const surahId = parseInt(params.surahId as string);

  // Hooks
  const { settings } = useQuranSettings();
  const translationIds = Array.from(settings.selectedTranslations || []);
  const { surahData, loading, error } = useQuranSurah(surahId, translationIds);
  const { updateLastRead } = useLastRead();

  // Local state
  const [showSettings, setShowSettings] = useState(false);
  const [showNavDrawer, setShowNavDrawer] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDebug, setShowDebug] = useState(
    process.env.NODE_ENV === "development"
  );

  const checkBookmark = useCallback(() => {
    try {
      const bookmarks = JSON.parse(
        localStorage.getItem("quran_bookmarks") || "[]"
      );
      const isCurrentBookmarked = bookmarks.some(
        (b: any) => b.surahId === surahId
      );
      setIsBookmarked(isCurrentBookmarked);
    } catch (error) {
      console.error("Failed to check bookmark:", error);
    }
  }, [surahId]);

  useEffect(() => {
    if (surahId && surahData) {
      updateLastRead(surahId, surahData.name_simple);
      checkBookmark();
    }
  }, [surahId, surahData, updateLastRead, checkBookmark]);

  const toggleBookmark = () => {
    try {
      const bookmarks = JSON.parse(
        localStorage.getItem("quran_bookmarks") || "[]"
      );

      if (isBookmarked) {
        // Remove bookmark
        const filtered = bookmarks.filter((b: any) => b.surahId !== surahId);
        localStorage.setItem("quran_bookmarks", JSON.stringify(filtered));
        setIsBookmarked(false);
      } else {
        // Add bookmark
        const newBookmark = {
          id: `${surahId}_${Date.now()}`,
          surahId,
          surahName: surahData?.name_simple || `Surah ${surahId}`,
          createdAt: new Date().toISOString(),
        };
        bookmarks.push(newBookmark);
        localStorage.setItem("quran_bookmarks", JSON.stringify(bookmarks));
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    // Audio playback will be handled by AudioPlayer component
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <QuranPageHeader onMenuToggle={() => setShowNavDrawer(true)} />
        <div className="container mx-auto px-4 py-6 pt-24">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-base-200">
        <QuranPageHeader onMenuToggle={() => setShowNavDrawer(true)} />
        <div className="container mx-auto px-4 py-6 pt-24">
          <div className="text-center">
            <div className="alert alert-error max-w-md mx-auto mb-6">
              <h2 className="font-bold">Failed to Load Surah {surahId}</h2>
              <p className="text-sm">{error}</p>
            </div>

            {showDebug && (
              <div className="card bg-base-100 border border-error max-w-2xl mx-auto mb-6">
                <div className="card-body">
                  <h3 className="card-title text-error">Debug Info</h3>
                  <div className="text-left text-sm">
                    <p>
                      <strong>Surah ID:</strong> {surahId}
                    </p>
                    <p>
                      <strong>Translation Languages:</strong>{" "}
                      {settings.translationLanguages.join(", ")}
                    </p>
                    <p>
                      <strong>Loading:</strong> {loading ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Error:</strong> {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <button onClick={() => router.back()} className="btn btn-outline">
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!surahData) {
    return (
      <div className="min-h-screen bg-base-200">
        <QuranPageHeader onMenuToggle={() => setShowNavDrawer(true)} />
        <div className="container mx-auto px-4 py-6 pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Surah Not Found</h1>
            <p className="text-base-content/70 mb-4">
              Surah {surahId} could not be loaded. This might be due to an
              invalid Surah ID.
            </p>
            <button onClick={() => router.back()} className="btn btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 pb-20">
      <QuranPageHeader onMenuToggle={() => setShowNavDrawer(true)} />

      <div className="container mx-auto px-4 py-6 max-w-4xl pt-4">
        {/* Surah Header with Kaaba Background */}
        <div className="relative mb-6 rounded-xl overflow-hidden shadow-lg h-40">
          {/* Background Image */}
          <Image
            src={kaabaImage}
            alt="Kaaba"
            fill
            className="object-cover"
            priority
          />

          {/* Gradient Overlay - Darker towards left */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between h-full p-6">
            {/* Text Content - Left Side */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">
                {surahData.name_simple}
              </h1>
              <p className="text-lg text-white/90 mb-3">
                {surahData.translated_name?.name || "The Opening"}
              </p>
              <div className="space-y-1 text-sm text-white/80">
                <p className="font-medium">{surahData.verses_count} Verses</p>
                <p className="capitalize font-medium">
                  {surahData.revelation_place}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="flex-1" />

          <div className="flex gap-2">
            <button
              onClick={toggleBookmark}
              className={`btn btn-sm ${
                isBookmarked ? "btn-primary" : "btn-ghost"
              }`}
              title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {isBookmarked ? (
                <BookmarkIconSolid className="w-4 h-4" />
              ) : (
                <BookmarkIconOutline className="w-4 h-4" />
              )}
              <span className="hidden sm:inline ml-2">
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </span>
            </button>

            <button
              onClick={toggleAudio}
              className={`btn btn-sm ${
                isPlaying ? "btn-secondary" : "btn-ghost"
              }`}
              title={isPlaying ? "Pause audio" : "Play audio"}
            >
              {isPlaying ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline ml-2">
                {isPlaying ? "Pause" : "Play"}
              </span>
            </button>
          </div>
        </div>

        {/* Bismillah (if applicable) */}
        {surahData.bismillah_pre && surahData.id !== 1 && (
          <div className="card bg-base-100 border border-base-200 mb-6">
            <div className="card-body p-6 text-center">
              <p className="text-2xl font-arabic text-primary leading-relaxed">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <p className="text-sm text-base-content/70 mt-2">
                In the name of Allah, the Most Gracious, the Most Merciful
              </p>
            </div>
          </div>
        )}

        {/* Debug Panel */}
        {showDebug && (
          <div className="card bg-base-100 border border-info mb-6">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h3 className="card-title text-info">Debug Info</h3>
                <button
                  onClick={() => setShowDebug(false)}
                  className="btn btn-ghost btn-xs"
                >
                  Hide
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Surah ID:</strong> {surahId}
                  </p>
                  <p>
                    <strong>Name:</strong> {surahData.name_simple}
                  </p>
                  <p>
                    <strong>Total Verses:</strong> {surahData.verses_count}
                  </p>
                  <p>
                    <strong>Loaded Verses:</strong> {surahData.verses.length}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Translation Languages:</strong>{" "}
                    {settings.translationLanguages.join(", ")}
                  </p>
                  <p>
                    <strong>Revelation Place:</strong>{" "}
                    {surahData.revelation_place}
                  </p>
                  <p>
                    <strong>Bismillah Pre:</strong>{" "}
                    {surahData.bismillah_pre ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Error:</strong> {error || "None"}
                  </p>
                </div>
              </div>

              {surahData.verses.length > 0 && (
                <div className="mt-4">
                  <details className="collapse collapse-plus bg-base-200">
                    <summary className="collapse-title text-xs font-medium">
                      First Verse Sample
                    </summary>
                    <div className="collapse-content">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(surahData.verses[0], null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verses */}
        <div className="space-y-6">
          {surahData.verses && surahData.verses.length > 0 ? (
            surahData.verses.map((verse) => (
              <AyahCard
                key={verse.id || `${surahId}-${verse.verse_number}`}
                verse={verse}
                surahData={surahData}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="alert alert-warning max-w-md mx-auto">
                <p>No verses found for this Surah.</p>
                {showDebug && (
                  <p className="text-xs mt-2">
                    This might indicate an API issue or missing field
                    parameters.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => surahId > 1 && router.push(`/quran/${surahId - 1}`)}
            disabled={surahId <= 1}
            className="btn btn-outline"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Previous Surah
          </button>

          <button
            onClick={() =>
              surahId < 114 && router.push(`/quran/${surahId + 1}`)
            }
            disabled={surahId >= 114}
            className="btn btn-outline"
          >
            Next Surah
            <ArrowLeftIcon className="w-4 h-4 ml-2 rotate-180" />
          </button>
        </div>
      </div>

      {/* Navigation Drawer */}
      <QuranNavigationDrawer
        isOpen={showNavDrawer}
        onClose={() => setShowNavDrawer(false)}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Settings Drawer */}
      <QuranSettingsDrawer
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Audio Player */}
      {isPlaying && (
        <AudioPlayer
          surahId={surahId}
          verses={surahData.verses}
          onStop={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}
