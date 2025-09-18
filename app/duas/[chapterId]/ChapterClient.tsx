"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  PlayIcon,
  ShareIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import { useArabicSettings } from "@/hooks/useArabicSettings";
import { useQuranSettings } from "@/hooks/useQuranSettings";
import { useShareImage } from "@/hooks/useShareImage";
import ShareableCard from "@/components/ui/ShareableCard";

// Declare gtag type for Google Analytics tracking
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Type for the chapter prop
type Chapter = {
  id: number;
  title: string;
  arabicTitle: string;
  duas: Array<{
    id: number;
    arabic: string;
    translation: string;
    transliteration: string;
    reference?: string;
    hisnNumber: string;
  }>;
};

interface ChapterClientProps {
  chapter: Chapter;
}

export default function ChapterClient({ chapter }: ChapterClientProps) {
  const router = useRouter();
  const { getArabicClasses } = useArabicSettings();
  const { getArabicStyles, getTranslationStyles } = useQuranSettings();
  const { generateAndShare, isGenerating, cardRef } = useShareImage();
  const [currentDua, setCurrentDua] = useState(chapter.duas[0] || null);

  // Track chapter view with Google Analytics
  useEffect(() => {
    window.gtag?.("event", "view_dua_chapter", {
      event_category: "engagement",
      event_label: "dua_chapter_view",
      chapter_id: chapter.id,
      chapter_title: chapter.title,
      chapter_title_arabic: chapter.arabicTitle,
      duas_count: chapter.duas.length,
    });
  }, [chapter.id, chapter.title, chapter.arabicTitle, chapter.duas.length]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const shareDua = async (dua: any) => {
    // Update the current dua for the ShareableCard
    setCurrentDua(dua);

    // Give React a moment to update the DOM
    await new Promise(resolve => setTimeout(resolve, 100));

    const reference = `${chapter.title} • ${dua.hisnNumber}`;

    await generateAndShare({
      arabicText: dua.arabic,
      translation: dua.translation,
      reference,
      type: 'dua',
      filename: `dua-${chapter.id}-${dua.id}.png`,
    });
  };

  const startDhikr = (dua: any) => {
    // Navigate to counter with temporary dhikr using IDs only
    const searchParams = new URLSearchParams({
      temp: "true",
      chapterId: chapter.id.toString(),
      duaId: dua.id.toString(),
    });
    router.push(`/?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <UnifiedHeader title="Duas" showSignIn={true} />
      <div className="container mx-auto px-4 py-6 max-w-2xl pt-6">
        {/* Chapter Info */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-primary badge-sm w-8 h-8 rounded-full flex items-center justify-center p-0 text-xs font-bold">{chapter.id}</span>
              <h1 className="text-xl font-bold">{chapter.title}</h1>
            </div>
          </div>
        </div>

        {/* Duas List */}
        <div className="space-y-6">
          {chapter.duas.map((dua) => (
            <div
              key={dua.id}
              className="card bg-base-100 border border-base-200"
            >
              <div className="card-body p-6">
                {/* Dua Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="badge badge-outline badge-sm">
                    {dua.hisnNumber}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(dua.arabic)}
                      className="btn btn-ghost btn-sm btn-square"
                      title="Copy Arabic"
                    >
                      <ClipboardIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => shareDua(dua)}
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
                      onClick={() => startDhikr(dua)}
                      className="btn btn-primary btn-sm"
                      title="Start Dhikr"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Start</span>
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div className="mb-4">
                  <p
                    className={`leading-relaxed text-right text-base-content ${getArabicClasses()}`}
                    style={getArabicStyles()}
                  >
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                {dua.transliteration && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-primary mb-1">
                      Transliteration:
                    </p>
                    <p className="text-base italic text-base-content/80 leading-relaxed">
                      {dua.transliteration}
                    </p>
                  </div>
                )}

                {/* Translation */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-primary mb-1">
                    Translation:
                  </p>
                  <p
                    className="text-base-content leading-relaxed"
                    style={getTranslationStyles()}
                  >
                    {dua.translation}
                  </p>
                </div>

                {/* Reference */}
                {dua.reference && (
                  <div className="text-xs text-base-content/60 italic">
                    <span className="font-medium">Reference:</span>{" "}
                    {dua.reference}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Hidden ShareableCard for image generation */}
        {currentDua && (
          <ShareableCard
            ref={cardRef}
            arabicText={currentDua.arabic}
            translation={currentDua.translation}
            reference={`${chapter.title} • ${currentDua.hisnNumber}`}
            type="dua"
          />
        )}
      </div>
    </div>
  );
}