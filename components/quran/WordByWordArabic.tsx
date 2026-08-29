"use client";

import { useState } from "react";
import { VerseWord } from "@/lib/quran/types";

interface WordByWordArabicProps {
  words: VerseWord[];
  /** Word field for the reader's chosen script, e.g. "text_uthmani". */
  scriptFieldName: string;
  /** Plain verse text, rendered when no word breakdown is available. */
  fallbackText: string;
  /** 1-based position of the word currently being recited. */
  activeWordPosition: number | null;
  style?: React.CSSProperties;
}

function wordText(word: VerseWord, scriptFieldName: string): string {
  return (
    (word as unknown as Record<string, string>)[scriptFieldName] ||
    word.text_uthmani ||
    word.text_indopak ||
    word.text ||
    ""
  );
}

/**
 * Renders a verse as individually addressable words so the one being recited
 * can be highlighted, and so tapping a word reveals its gloss.
 *
 * Joining the words back together reproduces the verse text exactly apart from
 * invisible soft hyphens, so swapping to this rendering causes no visible
 * reflow. When `words` is empty (still loading, or the request failed) it falls
 * back to the plain string and the verse simply loses word-level highlighting.
 */
export default function WordByWordArabic({
  words,
  scriptFieldName,
  fallbackText,
  activeWordPosition,
  style,
}: WordByWordArabicProps) {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  // IndoPak text carries its waqf signs in the Private Use Area, so it only
  // renders without tofu boxes in an IndoPak font.
  const scriptClass =
    scriptFieldName === "text_indopak" ? " script-indopak" : "";

  if (words.length === 0) {
    return (
      <p className={`quran-arabic${scriptClass} text-base-content verse-card`} style={style} dir="rtl">
        {fallbackText}
      </p>
    );
  }

  // The gloss is tap-only: following the recitation word by word turned the
  // panel into a flicker of text nobody could read.
  const glossWord = selectedPosition
    ? words.find((word) => word.position === selectedPosition)
    : undefined;

  return (
    <>
      <p className={`quran-arabic${scriptClass} text-base-content verse-card`} style={style} dir="rtl">
        {words.map((word) => {
          const isActive = word.position === activeWordPosition;
          const isSelected = word.position === selectedPosition;
          return (
            <span
              key={word.position}
              role="button"
              tabIndex={0}
              onClick={() =>
                setSelectedPosition((current) =>
                  current === word.position ? null : word.position
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedPosition((current) =>
                    current === word.position ? null : word.position
                  );
                }
              }}
              // Colour alone carries the highlight: a background swatch on
              // every recited word is noisy against Arabic script, and any
              // weight or size change would reflow the line as it moves.
              // Primary green sat too close to the body text to read, so the
              // recited word takes the far lighter secondary gold.
              className={`cursor-pointer transition-colors duration-150 ${
                isActive
                  ? "text-secondary"
                  : isSelected
                  ? "text-primary"
                  : "hover:text-base-content/60"
              }`}
            >
              {wordText(word, scriptFieldName)}{" "}
            </span>
          );
        })}
      </p>

      {/* Kept mounted for the whole verse once the first word lands, so swapping
          words re-renders text in place instead of tearing the panel down. */}
      {glossWord && (
        <div
          className="mt-3 flex min-h-[2.5rem] flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg bg-base-200 px-3 py-2"
          aria-live="polite"
        >
          <span className={`quran-arabic${scriptClass} text-lg text-primary`} dir="rtl">
            {wordText(glossWord, scriptFieldName)}
          </span>
          {glossWord.transliteration?.text && (
            <span className="text-sm italic text-base-content/60">
              {glossWord.transliteration.text}
            </span>
          )}
          {glossWord.translation?.text && (
            <span className="text-sm text-base-content">
              {glossWord.translation.text}
            </span>
          )}
        </div>
      )}
    </>
  );
}
