"use client";

import { SurahData, VerseWord } from "@/lib/quran/types";
import { useQuranSettings } from "@/hooks/useQuranSettings";
import { toArabicNumerals } from "@/lib/utils";
import { useQuranAudioPlayer } from "./QuranAudioContext";

interface SurahReadingViewProps {
  surahData: SurahData;
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

export default function SurahReadingView({ surahData }: SurahReadingViewProps) {
  const { getArabicStyles, getScriptFieldName } = useQuranSettings();
  const {
    playVerse,
    currentVerseNumber,
    activeWordPosition,
    currentWords,
  } = useQuranAudioPlayer();

  const scriptFieldName = getScriptFieldName();
  // IndoPak encodes its waqf signs in the Private Use Area; only an IndoPak
  // font maps them, everything else draws tofu boxes.
  const scriptClass = scriptFieldName === "text_indopak" ? " script-indopak" : "";

  return (
    <div className="reading-view">
      {/* Bismillah (if applicable) */}
      {surahData.bismillah_pre && surahData.id !== 1 && (
        <div className="text-center mb-8">
          <p
            className="text-3xl font-arabic text-primary leading-relaxed"
            style={getArabicStyles()}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {/* Continuous Arabic Text */}
      <div className="card bg-base-100 border border-base-200">
        <div className="card-body p-8 md:p-12">
          <div
            className={`quran-arabic${scriptClass} text-base-content leading-loose`}
            style={{
              ...getArabicStyles(),
              // Nastaleeq slopes downward and needs more room between lines.
              lineHeight: scriptClass ? '2.9' : '2.5',
              direction: 'rtl',
              textAlign: 'justify',
              textAlignLast: 'center',
              wordSpacing: '0.1em',
            }}
          >
            {surahData.verses.map((verse, index) => {
              // Get the appropriate text based on selected script
              let arabicText = (verse as any)[scriptFieldName];

              // Fallback to other available text fields
              if (!arabicText) {
                arabicText = verse.text_uthmani || verse.text_simple || verse.text_imlaei || (verse as any).text_indopak || (verse as any).text_uthmani_simple;
              }

              const isCurrent = currentVerseNumber === verse.verse_number;

              return (
                <span
                  key={verse.verse_key || `${surahData.id}-${verse.verse_number}`}
                  id={`verse-${verse.verse_number}`}
                  onClick={() => playVerse(verse.verse_number)}
                  className="scroll-mt-24 cursor-pointer"
                >
                  {/* Only the verse being recited is split into words, so word
                      highlighting costs one small fetch rather than the whole surah. */}
                  {isCurrent && currentWords.length > 0
                    ? currentWords.map((word) => (
                        <span
                          key={word.position}
                          className={`transition-colors duration-150 ${
                            word.position === activeWordPosition
                              ? "text-primary"
                              : ""
                          }`}
                        >
                          {wordText(word, scriptFieldName)}{" "}
                        </span>
                      ))
                    : arabicText}
                  {/* Add verse number marker */}
                  <span className="verse-marker inline-flex items-center justify-center mx-1">
                    <span className="text-primary font-bold text-sm bg-primary/10 rounded-full px-2 py-0.5">
                      {toArabicNumerals(verse.verse_number)}
                    </span>
                  </span>
                  {/* Add space between verses except for the last one */}
                  {index < surahData.verses.length - 1 && ' '}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page Metadata */}
      <div className="mt-6 text-center text-sm text-base-content/60">
        <p>{surahData.verses_count} Verses • {surahData.revelation_place === 'mecca' ? 'Meccan' : 'Medinan'}</p>
      </div>
    </div>
  );
}
