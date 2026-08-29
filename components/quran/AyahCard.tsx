"use client";

import { useState } from "react";
import { useQuranBookmarks } from "@/hooks/useQuranData";
import {
  PlayIcon,
  PauseIcon,
  BookmarkIcon as BookmarkIconOutline,
  ShareIcon,
  ChatBubbleLeftEllipsisIcon,
  ClipboardIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";
import { VerseWithTranslations, SurahData } from "@/lib/quran/types";
import { getTranslationById } from "@/lib/quran/translations-data";
import { useQuranAudioPlayer } from "./QuranAudioContext";
import WordByWordArabic from "./WordByWordArabic";
import { cleanArabicForExport, cleanTranslationText } from "@/lib/quran/text-utils";
import { useQuranSettings } from "@/hooks/useQuranSettings";
import TafsirModal from "./TafsirModal";
import { useShareImage } from "@/hooks/useShareImage";
import ShareableCard from "@/components/ui/ShareableCard";

interface AyahCardProps {
  verse: VerseWithTranslations;
  surahData: SurahData;
}

export default function AyahCard({ verse, surahData }: AyahCardProps) {
  const [showTafsir, setShowTafsir] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const { generateAndShare, isGenerating, cardRef } = useShareImage();

  // Use the API's verse_key directly, or construct it as fallback
  const verseKey = verse.verse_key || `${surahData.id}:${verse.verse_number || verse.id}`;

  // Shared bookmark store (synced across components via the hook)
  const { isBookmarked: checkBookmarked, toggleBookmark: toggleStoredBookmark } =
    useQuranBookmarks();
  const isBookmarked = checkBookmarked(verseKey);

  // Settings for font styling and script selection
  const { getArabicStyles, getTranslationStyles, getScriptFieldName, getSelectedScript } = useQuranSettings();

  // Shared surah playback (one <audio> for the whole page)
  const {
    playVerse,
    currentVerseKey,
    activeWordPosition,
    currentWords,
    isPlaying: playerIsPlaying,
    isLoading: playerIsLoading,
    error: audioError,
  } = useQuranAudioPlayer();

  const isCurrent = currentVerseKey === verseKey;
  const isPlaying = isCurrent && playerIsPlaying;
  const isLoadingAudio = isCurrent && playerIsLoading;

  // Debug info removed to prevent excessive console logging during audio playback

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const shareVerse = async () => {
    // Get the appropriate text based on selected script
    const scriptFieldName = getScriptFieldName();
    let arabicText = (verse as any)[scriptFieldName];
    
    // Fallback to other available text fields
    if (!arabicText) {
      arabicText = verse.text_uthmani || verse.text_simple || verse.text_imlaei || (verse as any).text_indopak || (verse as any).text_uthmani_simple || "";
    }
    
    const translation = verse.translations?.[0]?.text || "";
    const cleanTranslation = cleanTranslationText(translation);
    // IndoPak's ornaments live in the Private Use Area, so they'd land as tofu
    // boxes in whatever app the verse is shared into.
    arabicText = cleanArabicForExport(arabicText);
    const reference = `Quran ${verseKey} • ${surahData.name_simple}`;

    await generateAndShare({
      arabicText,
      translation: cleanTranslation,
      reference,
      type: 'verse',
      filename: `quran-${verseKey.replace(':', '-')}.png`,
    });
  };

  const toggleBookmark = () => {
    toggleStoredBookmark({
      verseKey,
      surahId: surahData.id,
      verseNumber: verse.verse_number,
      surahName: surahData.name_simple,
      verseText: verse.text_uthmani,
      translation: verse.translations?.[0]?.text || "",
    });
  };

  const toggleAudio = () => {
    playVerse(verse.verse_number);
  };

  return (
    <div
      id={`verse-${verse.verse_number}`}
      className={`card bg-base-100 border scroll-mt-24 transition-colors ${
        isCurrent
          ? "border-primary border-2 shadow-lg shadow-primary/20"
          : "border-base-200"
      }`}
    >
      <div className="card-body p-6">
        {/* Verse Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Verse Number Circle */}
            <div className="w-10 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative">
              <span className="text-xs font-bold text-primary">{verseKey}</span>
              {isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-primary-content rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            <button
              onClick={toggleAudio}
              disabled={isLoadingAudio}
              className={`btn btn-sm btn-square ${
                isPlaying ? "btn-primary" : "btn-ghost"
              } ${isLoadingAudio ? "loading" : ""} ${audioError ? "text-error" : ""}`}
              title={
                audioError
                  ? "Audio error"
                  : isLoadingAudio
                  ? "Loading audio..."
                  : isPlaying
                  ? "Pause"
                  : "Play"
              }
            >
              {audioError ? (
                <ExclamationTriangleIcon className="w-4 h-4" />
              ) : isLoadingAudio ? (
                <div className="loading loading-spinner w-4 h-4" />
              ) : isPlaying ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => setShowTafsir(true)}
              className="btn btn-ghost btn-sm btn-square"
              title="View Tafsir"
            >
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
            </button>

            <button
              onClick={toggleBookmark}
              className={`btn btn-ghost btn-sm btn-square ${
                isBookmarked ? "text-primary" : ""
              }`}
              title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {isBookmarked ? (
                <BookmarkIconSolid className="w-4 h-4" />
              ) : (
                <BookmarkIconOutline className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={shareVerse}
              disabled={isGenerating}
              className={`btn btn-ghost btn-sm btn-square ${
                isGenerating ? "loading" : ""
              }`}
              title={isGenerating ? "Generating image..." : "Share as image"}
            >
              {isGenerating ? (
                <div className="loading loading-spinner w-4 h-4" />
              ) : (
                <ShareIcon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => {
                const scriptFieldName = getScriptFieldName();
                let arabicText = (verse as any)[scriptFieldName];
                if (!arabicText) {
                  arabicText = verse.text_uthmani || verse.text_simple || verse.text_imlaei || (verse as any).text_indopak || (verse as any).text_uthmani_simple || "";
                }
                copyToClipboard(cleanArabicForExport(arabicText));
              }}
              className="btn btn-ghost btn-sm btn-square"
              title="Copy Arabic"
            >
              <ClipboardIcon className="w-4 h-4" />
            </button>

            {process.env.NODE_ENV === "development" && (
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="btn btn-ghost btn-sm btn-square"
                title="Toggle Debug Info"
              >
                🐛
              </button>
            )}
          </div>
        </div>

        {/* Debug Info */}
        {showDebug && (
          <div className="mb-4 card bg-base-200 border border-warning">
            <div className="card-body p-3">
              <h4 className="text-xs font-bold text-warning">
                Verse Debug Info
              </h4>
              <div className="text-xs space-y-1">
                <p>
                  <strong>Verse ID:</strong> {verse.id || "Missing"}
                </p>
                <p>
                  <strong>Verse Key:</strong> {verse.verse_key || "Missing"}
                </p>
                <p>
                  <strong>Arabic Text (Uthmani):</strong>{" "}
                  {verse.text_uthmani ? "✅" : "❌ Missing"}
                </p>
                <p>
                  <strong>Arabic Text (Simple):</strong>{" "}
                  {verse.text_simple ? "✅" : "❌ Missing"}
                </p>
                <p>
                  <strong>Translations:</strong>{" "}
                  {verse.translations?.length || 0}
                </p>
              </div>
              {verse.translations && verse.translations.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer">
                    Translation Details
                  </summary>
                  <pre className="text-xs mt-1 overflow-auto bg-base-300 p-2 rounded">
                    {JSON.stringify(verse.translations, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Arabic Text */}
        <div className="mb-4">
          {(() => {
            // Get the appropriate text based on selected script
            const scriptFieldName = getScriptFieldName();
            const selectedScript = getSelectedScript();
            
            // Try to get text from the script-specific field first
            let arabicText = (verse as any)[scriptFieldName];
            
            // Fallback to other available text fields
            if (!arabicText) {
              arabicText = verse.text_uthmani || verse.text_simple || verse.text_imlaei || (verse as any).text_indopak || (verse as any).text_uthmani_simple;
            }
            
            if (arabicText) {
              // Only the verse being recited renders as individual words: the
              // word breakdown is fetched per verse, so every other verse keeps
              // the cheap single-string rendering.
              return (
                <WordByWordArabic
                  words={isCurrent ? currentWords : []}
                  scriptFieldName={scriptFieldName}
                  fallbackText={arabicText}
                  activeWordPosition={isCurrent ? activeWordPosition : null}
                  style={getArabicStyles()}
                />
              );
            } else {
              return (
                <div className="text-center py-8 bg-base-200 rounded-lg">
                  <p className="text-error text-sm">❌ Arabic text not available for script: {selectedScript}</p>
                  {process.env.NODE_ENV === "development" && (
                    <>
                      <p className="text-xs text-base-content/60 mt-2">
                        Looking for field: {scriptFieldName}
                      </p>
                      <p className="text-xs text-base-content/60">
                        Available fields: {Object.keys(verse).filter(k => k.startsWith('text_')).join(', ')}
                      </p>
                    </>
                  )}
                </div>
              );
            }
          })()}
        </div>

        {/* Translations */}
        {verse.translations && verse.translations.length > 0 ? (
          <div className="space-y-4">
            {verse.translations.map((translation, index) => {
              // Get translation metadata at display time
              const translationMeta = getTranslationById(
                translation.resource_id
              );
              const displayName =
                translationMeta?.name || "Unknown Translation";

              return (
                <div
                  key={translation.resource_id || translation.id || index}
                  className=""
                >
                  <p className="text-xs text-base-content/50 italic">
                    {displayName}
                  </p>
                  <p 
                    className="text-base-content leading-relaxed"
                    style={getTranslationStyles()}
                  >
                    {cleanTranslationText(translation.text) || "Translation text not available"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-base-200 rounded-lg p-4 text-center">
            <p className="text-warning text-sm">⚠️ No translations available</p>
            {process.env.NODE_ENV === "development" && (
              <p className="text-xs text-base-content/60 mt-2">
                Check translation parameters or API response
              </p>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-base-200 text-xs text-base-content/60">
          <span>Page {verse.page_number}</span>
          <span>Juz {verse.juz_number}</span>
          <span>Hizb {verse.hizb_number}</span>
          <span>Rub {verse.rub_number}</span>
        </div>
      </div>

      {/* Tafsir Modal */}
      {showTafsir && (
        <TafsirModal
          surahId={surahData.id}
          verseNumber={verse.verse_number}
          verseText={verse.text_uthmani}
          verseKey={verseKey}
          onClose={() => setShowTafsir(false)}
        />
      )}

      {/* Hidden ShareableCard for image generation */}
      <ShareableCard
        ref={cardRef}
        arabicText={verse.text_uthmani || verse.text_simple || ""}
        translation={cleanTranslationText(verse.translations?.[0]?.text || "")}
        reference={`Quran ${verseKey} • ${surahData.name_simple}`}
        type="verse"
      />
    </div>
  );
}
