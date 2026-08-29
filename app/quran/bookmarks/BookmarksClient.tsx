"use client";

import Link from "next/link";
import { BookmarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import { useQuranBookmarks, type VerseBookmark } from "@/hooks/useQuranData";
import { cleanTranslationText } from "@/lib/quran/text-utils";
import { generateSurahSlug } from "@/lib/url-utils";
import { useArabicScriptClass } from "@/hooks/useArabicScriptClass";

export default function BookmarksClient() {
  const scriptClass = useArabicScriptClass();

  const { bookmarks, loading, removeBookmark } = useQuranBookmarks();

  // Group by surah, newest bookmark first within each group
  const groups = bookmarks.reduce<Record<number, VerseBookmark[]>>(
    (acc, bookmark) => {
      (acc[bookmark.surahId] ??= []).push(bookmark);
      return acc;
    },
    {}
  );
  const surahIds = Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-base-200 pb-16">
      <UnifiedHeader title="Bookmarks" showSignIn={true} />

      <div className="container mx-auto px-4 max-w-4xl pt-4">
        <div className="flex items-center gap-3 mb-6">
          <span className="star-8 bg-primary/10 text-primary w-9 h-9 flex items-center justify-center">
            <span className="flex items-center justify-center">
              <BookmarkIcon className="w-5 h-5" />
            </span>
          </span>
          <h1 className="heading-ornate text-3xl font-bold text-base-content">Bookmarks</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="card bg-base-100 border border-base-200">
            <div className="card-body p-8 text-center space-y-3">
              <BookmarkIcon className="w-12 h-12 mx-auto text-base-content/30" />
              <p className="text-base-content/70 font-medium">
                No bookmarks yet
              </p>
              <p className="text-sm text-base-content/60">
                Tap the bookmark icon on any verse while reading to save it here.
              </p>
              <Link href="/quran" className="btn btn-primary btn-sm mx-auto">
                Open the Quran
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {surahIds.map((surahId) => {
              const group = groups[surahId].sort(
                (a, b) => a.verseNumber - b.verseNumber
              );
              return (
                <div key={surahId}>
                  <h2 className="text-lg font-semibold mb-3 text-base-content">
                    {group[0].surahName}
                  </h2>
                  <div className="space-y-3">
                    {group.map((bookmark) => (
                      <div
                        key={bookmark.verseKey}
                        className="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow"
                      >
                        <div className="card-body p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <Link
                              href={`/quran/${generateSurahSlug(bookmark.surahId)}#verse-${bookmark.verseNumber}`}
                              className="badge badge-primary badge-sm"
                            >
                              {bookmark.verseKey}
                            </Link>
                            <button
                              onClick={() => removeBookmark(bookmark.verseKey)}
                              className="btn btn-ghost btn-xs text-error"
                              aria-label={`Remove bookmark ${bookmark.verseKey}`}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>

                          <Link
                            href={`/quran/${generateSurahSlug(bookmark.surahId)}#verse-${bookmark.verseNumber}`}
                            className="block space-y-2"
                          >
                            {bookmark.verseText && (
                              <p className={`text-right text-lg font-arabic leading-relaxed text-base-content ${scriptClass}`}>
                                {bookmark.verseText}
                              </p>
                            )}
                            {bookmark.translation && (
                              <p className="text-sm text-base-content/80 leading-relaxed line-clamp-3">
                                {cleanTranslationText(bookmark.translation)}
                              </p>
                            )}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
