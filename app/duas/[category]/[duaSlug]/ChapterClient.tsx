"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, BookmarkIcon, ShareIcon } from "@heroicons/react/24/outline";
import UnifiedHeader from "@/components/ui/UnifiedHeader";

// Declare gtag type for Google Analytics tracking
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface Chapter {
  id: number;
  title: string;
  arabicTitle: string;
  duas: Array<{
    id?: number;
    arabic: string;
    translation: string;
    transliteration: string;
    hisnNumber?: string;
  }>;
}

interface ChapterClientProps {
  chapter: Chapter;
}

export default function ChapterClient({ chapter }: ChapterClientProps) {
  const router = useRouter();
  const [fontSize, setFontSize] = useState(16);

  // Track page view with Google Analytics
  useEffect(() => {
    window.gtag?.("event", "view_duas_chapter", {
      event_category: "engagement",
      event_label: `duas_chapter_${chapter.id}`,
      chapter_id: chapter.id,
      chapter_title: chapter.title,
    });
  }, [chapter.id, chapter.title]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${chapter.title} - Tasbihfy`,
          text: `Read Islamic duas for ${chapter.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback to copying URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You could add a toast notification here
      } catch (error) {
        console.log("Error copying to clipboard:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <UnifiedHeader title="Duas" showSignIn={true} />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Duas
          </button>

          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
              {chapter.title}
            </h1>
            {chapter.arabicTitle && (
              <h2 className="text-xl font-arabic text-base-content/80 mb-2">
                {chapter.arabicTitle}
              </h2>
            )}
            <p className="text-base-content/70">
              {chapter.duas.length} {chapter.duas.length === 1 ? "dua" : "duas"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Font Size:</label>
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="range range-primary range-sm"
              />
              <span className="text-sm">{fontSize}px</span>
            </div>

            <button
              onClick={handleShare}
              className="btn btn-outline btn-sm"
            >
              <ShareIcon className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Duas List */}
        <div className="space-y-6">
          {chapter.duas.map((dua, index) => (
            <div
              key={dua.id || index}
              className="card bg-base-100 border border-base-300 shadow-sm"
            >
              <div className="card-body p-6">
                {/* Arabic Text */}
                <div className="mb-4">
                  <p
                    className="text-right font-arabic leading-loose text-base-content"
                    style={{ fontSize: `${fontSize + 2}px` }}
                    dir="rtl"
                  >
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                {dua.transliteration && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-base-content/70 mb-2">
                      Transliteration:
                    </h4>
                    <p
                      className="italic text-base-content/80"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {dua.transliteration}
                    </p>
                  </div>
                )}

                {/* Translation */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-base-content/70 mb-2">
                    Translation:
                  </h4>
                  <p
                    className="text-base-content"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {dua.translation}
                  </p>
                </div>

                {/* Reference */}
                {dua.hisnNumber && (
                  <div className="text-xs text-base-content/50 mt-4 pt-4 border-t border-base-300">
                    <p>Hisnul Muslim: {dua.hisnNumber}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation hint */}
        <div className="text-center mt-8 text-base-content/50">
          <p className="text-sm">
            For more duas and Islamic content, explore our complete collection
          </p>
        </div>
      </div>
    </div>
  );
}