"use client";

import { SurahData } from "@/lib/quran/types";
import { useQuranSettings } from "@/hooks/useQuranSettings";
import { toArabicNumerals } from "@/lib/utils";

interface SurahReadingViewProps {
  surahData: SurahData;
}

export default function SurahReadingView({ surahData }: SurahReadingViewProps) {
  const { getArabicStyles, getScriptFieldName } = useQuranSettings();

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
            className="quran-arabic text-base-content leading-loose"
            style={{
              ...getArabicStyles(),
              lineHeight: '2.5',
              direction: 'rtl',
              textAlign: 'justify',
              textAlignLast: 'center',
              wordSpacing: '0.1em',
            }}
          >
            {surahData.verses.map((verse, index) => {
              // Get the appropriate text based on selected script
              const scriptFieldName = getScriptFieldName();
              let arabicText = (verse as any)[scriptFieldName];
              
              // Fallback to other available text fields
              if (!arabicText) {
                arabicText = verse.text_uthmani || verse.text_simple || verse.text_imlaei || (verse as any).text_indopak || (verse as any).text_uthmani_simple;
              }
              
              return (
                <span key={verse.verse_key || `${surahData.id}-${verse.verse_number}`}>
                  {arabicText}
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