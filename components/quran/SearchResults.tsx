"use client";

import Link from 'next/link';
import { VerseWithTranslations } from '@/lib/quran/types';

interface SearchResultsProps {
  results: VerseWithTranslations[];
  query: string;
}

export default function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-200">
        <div className="card-body p-6 text-center">
          <p className="text-base-content/70">
            No verses found for "{query}"
          </p>
          <p className="text-sm text-base-content/60">
            Try different keywords or check your spelling
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Search Results</h3>
        <span className="text-sm text-base-content/70">
          {results.length} verse{results.length !== 1 ? 's' : ''} found
        </span>
      </div>
      
      <div className="space-y-3">
        {results.map((verse) => (
          <SearchResultCard key={verse.id} verse={verse} query={query} />
        ))}
      </div>
    </div>
  );
}

interface SearchResultCardProps {
  verse: VerseWithTranslations;
  query: string;
}

function SearchResultCard({ verse, query }: SearchResultCardProps) {
  // Parse verse key to get surah and verse numbers
  const [surahId, verseNumber] = verse.verse_key.split(':').map(Number);
  
  // Highlight search terms in the text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Link 
              href={`/quran/${surahId}#verse-${verseNumber}`}
              className="badge badge-primary badge-sm hover:badge-primary-focus"
            >
              {surahId}:{verseNumber}
            </Link>
            <span className="text-sm text-base-content/70">
              Page {verse.page_number} • Juz {verse.juz_number}
            </span>
          </div>
          
          <Link
            href={`/quran/${surahId}#verse-${verseNumber}`}
            className="btn btn-ghost btn-xs"
          >
            Go to verse
          </Link>
        </div>

        {/* Arabic Text */}
        <div className="mb-3">
          <p className="text-right text-lg font-arabic leading-relaxed text-base-content">
            {verse.text_uthmani}
          </p>
        </div>

        {/* Translation */}
        {verse.translations && verse.translations.length > 0 && (
          <div className="space-y-2">
            {verse.translations.map((translation, index) => (
              <div key={translation.id || index}>
                <p className="text-sm text-base-content leading-relaxed">
                  {highlightText(translation.text, query)}
                </p>
                {verse.translations && verse.translations.length > 1 && (
                  <p className="text-xs text-base-content/60 mt-1">
                    {translation.resource_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}