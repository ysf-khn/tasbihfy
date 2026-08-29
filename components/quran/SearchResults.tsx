"use client";

import Link from "next/link";
import { generateSurahSlug } from "@/lib/url-utils";
import type { QuranSearchResult } from "@/lib/quran/api";
import { useArabicScriptClass } from "@/hooks/useArabicScriptClass";

interface SearchResultsProps {
  results: QuranSearchResult[];
  query: string;
  totalResults?: number;
}

/** Escape HTML, then restore the <em> highlight tags the search API emits */
function renderHighlighted(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/&lt;em&gt;/g, '<em class="not-italic font-semibold text-primary">')
    .replace(/&lt;\/em&gt;/g, "</em>");
}

export default function SearchResults({
  results,
  query,
  totalResults,
}: SearchResultsProps) {
  const scriptClass = useArabicScriptClass();

  if (results.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-200">
        <div className="card-body p-6 text-center">
          <p className="text-base-content/70">No verses found for "{query}"</p>
          <p className="text-sm text-base-content/60">
            Try different keywords or check your spelling
          </p>
        </div>
      </div>
    );
  }

  const count = totalResults ?? results.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Search Results</h3>
        <span className="text-sm text-base-content/70">
          {count} verse{count !== 1 ? "s" : ""} found
        </span>
      </div>

      <div className="space-y-3">
        {results.map((result) => (
          <SearchResultCard key={result.verse_key} result={result} />
        ))}
      </div>
    </div>
  );
}

function SearchResultCard({ result }: { result: QuranSearchResult }) {
  const [surahId, verseNumber] = result.verse_key.split(":").map(Number);
  if (!surahId || !verseNumber) return null;

  const href = `/quran/${generateSurahSlug(surahId)}#verse-${verseNumber}`;
  const isArabic = /[؀-ۿ]/.test(result.text);

  return (
    <Link href={href} className="block">
      <div className="card bg-base-100 border border-base-200 hover:shadow-md hover:border-primary/40 transition-all">
        <div className="card-body p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="badge badge-primary badge-sm">
              {result.verse_key}
            </span>
            <span className="text-xs text-base-content/60">Go to verse →</span>
          </div>

          <p
            className={
              isArabic
                ? `text-right text-lg font-arabic leading-relaxed text-base-content ${scriptClass}`
                : "text-sm text-base-content leading-relaxed"
            }
            dir={isArabic ? "rtl" : "ltr"}
            dangerouslySetInnerHTML={{ __html: renderHighlighted(result.text) }}
          />

          {result.translations?.map((translation, index) => (
            <p
              key={index}
              className="text-sm text-base-content/80 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: renderHighlighted(translation.text),
              }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
