"use client";

import { useState, useEffect } from "react";
import { getVerse, getTafsir, getAyahAudioUrl } from "@/lib/quran/api";
import { VerseWithTranslations, Tafsir } from "@/lib/quran/types";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import Link from "next/link";
import { generateSurahSlug } from "@/lib/url-utils";

interface VerseDetailClientProps {
  surahId: number;
  verseNumber: number;
  surahInfo: {
    name: string;
    translatedName: string;
    versesCount: number;
  };
  isSpecialVerse?: boolean;
  specialVerseName?: string;
}

export default function VerseDetailClient({
  surahId,
  verseNumber,
  surahInfo,
  isSpecialVerse,
  specialVerseName,
}: VerseDetailClientProps) {
  const [verse, setVerse] = useState<VerseWithTranslations | null>(null);
  const [tafsir, setTafsir] = useState<Tafsir | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState(131); // Default: Dr. Mustafa Khattab
  const [arabicScript, setArabicScript] = useState<'uthmani' | 'indopak'>('uthmani');

  // Navigation helpers
  const hasPrevious = verseNumber > 1;
  const hasNext = verseNumber < surahInfo.versesCount;
  const surahSlug = generateSurahSlug(surahId);

  // Fetch verse data
  useEffect(() => {
    const fetchVerseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch verse with multiple translations
        const translationIds = [131, 203, 54]; // Dr. Mustafa Khattab, English, Urdu
        const verseData = await getVerse(
          surahId,
          verseNumber,
          translationIds,
          arabicScript
        );
        setVerse(verseData);

        // Fetch tafsir
        const tafsirData = await getTafsir(surahId, verseNumber, 169); // Ibn Kathir
        setTafsir(tafsirData);

        // Fetch audio URL
        const audio = await getAyahAudioUrl(7, `${surahId}:${verseNumber}`); // Mishari Rashid Alafasy
        setAudioUrl(audio);
      } catch (err) {
        console.error("Error fetching verse data:", err);
        setError(err instanceof Error ? err.message : "Failed to load verse");
      } finally {
        setLoading(false);
      }
    };

    fetchVerseData();
  }, [surahId, verseNumber, arabicScript]);

  // Audio playback
  const handlePlayPause = () => {
    if (!audioUrl) return;

    const audio = document.getElementById('verse-audio') as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: specialVerseName
        ? `${specialVerseName} - Quran ${surahId}:${verseNumber}`
        : `Quran ${surahId}:${verseNumber} - ${surahInfo.name}`,
      text: verse?.translations?.[0]?.text || "Read this beautiful verse from the Quran",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <UnifiedHeader
          title={`Loading Verse ${verseNumber}...`}
          showSignIn={true}
        />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !verse) {
    return (
      <div className="min-h-screen bg-base-200">
        <UnifiedHeader
          title={`Verse ${verseNumber}`}
          showSignIn={true}
        />
        <div className="container mx-auto px-4 py-6">
          <div className="alert alert-error">
            <span>{error || "Failed to load verse"}</span>
          </div>
        </div>
      </div>
    );
  }

  // Get Arabic text based on selected script
  const arabicText = arabicScript === 'indopak'
    ? verse.text_indopak
    : verse.text_uthmani || verse.text_uthmani_simple;

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100 pb-20">
      <UnifiedHeader
        title={specialVerseName || `${surahInfo.name} - Verse ${verseNumber}`}
        showSignIn={true}
      />

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
        {/* Enhanced Breadcrumb with Icons */}
        <div className="flex items-center gap-2 text-sm px-2">
          <Link href="/" className="text-base-content/60 hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <span className="text-base-content/40">/</span>
          <Link href="/quran" className="text-base-content/60 hover:text-primary transition-colors">Quran</Link>
          <span className="text-base-content/40">/</span>
          <Link href={`/quran/${surahSlug}`} className="text-base-content/60 hover:text-primary transition-colors">{surahInfo.name}</Link>
          <span className="text-base-content/40">/</span>
          <span className="text-primary font-medium">Verse {verseNumber}</span>
        </div>

        {/* Special Verse Badge - Enhanced */}
        {isSpecialVerse && specialVerseName && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border border-primary/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content">{specialVerseName}</h3>
                <p className="text-sm text-base-content/70 mt-1">One of the most powerful and frequently recited verses in the Holy Quran</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Verse Display - Enhanced Card */}
        <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden">
          <div className="card-body space-y-8 p-6 lg:p-8">
            {/* Verse Header with Better Layout */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">📖</span>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {surahInfo.name}
                  </h1>
                </div>
                <div className="flex items-center gap-3 text-base-content/70">
                  <span className="font-semibold">{surahId}:{verseNumber}</span>
                  <span className="text-sm">•</span>
                  <span className="text-sm italic">{surahInfo.translatedName}</span>
                </div>
              </div>

              {/* Enhanced Script Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-base-content/60 font-medium">Script:</span>
                <div className="join join-horizontal">
                  <button
                    className={`btn btn-sm join-item ${arabicScript === 'uthmani' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setArabicScript('uthmani')}
                  >
                    Uthmani
                  </button>
                  <button
                    className={`btn btn-sm join-item ${arabicScript === 'indopak' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setArabicScript('indopak')}
                  >
                    IndoPak
                  </button>
                </div>
              </div>
            </div>

            {/* Arabic Text - Enhanced Presentation */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-xl"></div>
              <div className="relative text-center py-12 px-4 rounded-xl bg-base-200/50 backdrop-blur-sm">
                <p className="text-3xl sm:text-4xl lg:text-5xl leading-relaxed lg:leading-loose arabic-text text-base-content font-arabic" dir="rtl">
                  {arabicText}
                </p>
              </div>
            </div>

            {/* Enhanced Audio Controls */}
            {audioUrl && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="btn btn-circle btn-lg btn-primary shadow-lg hover:shadow-xl transition-all"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                  <div className="text-sm text-base-content/60">
                    <p className="font-medium">Listen to Recitation</p>
                    <p className="text-xs">Mishari Rashid Alafasy</p>
                  </div>
                </div>
                <audio
                  id="verse-audio"
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}

            {/* Enhanced Translations Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <h3 className="text-lg font-semibold text-base-content">Translations</h3>
              </div>

              <div className="space-y-3">
                {verse.translations?.map((translation) => (
                  <div
                    key={translation.resource_id}
                    className={`group relative rounded-xl transition-all duration-200 ${
                      translation.resource_id === selectedTranslation
                        ? 'bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary shadow-md'
                        : 'bg-base-200/70 hover:bg-base-200 border-l-4 border-transparent hover:border-base-300'
                    }`}
                    onClick={() => setSelectedTranslation(translation.resource_id)}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-primary/80">
                          {translation.resource_name}
                        </p>
                        {translation.resource_id === selectedTranslation && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Selected</span>
                        )}
                      </div>
                      <p className="text-base text-base-content leading-relaxed">
                        {translation.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tafsir Section */}
        <div className="card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-base-content">Tafsir (Commentary)</h3>
              </div>
              <button
                onClick={() => setShowTafsir(!showTafsir)}
                className="btn btn-sm btn-ghost gap-2"
              >
                {showTafsir ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Hide
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show
                  </>
                )}
              </button>
            </div>

            {showTafsir && tafsir && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-base-200">
                  <span className="text-sm font-medium text-primary">{tafsir.resource_name}</span>
                </div>
                <div
                  className="prose prose-sm max-w-none text-base-content/80"
                  dangerouslySetInnerHTML={{ __html: tafsir.text }}
                />
              </div>
            )}

            {!showTafsir && (
              <p className="text-sm text-base-content/60">Click "Show" to read detailed commentary on this verse</p>
            )}
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="grid grid-cols-3 gap-3">
          {hasPrevious ? (
            <Link
              href={`/quran/${surahSlug}/verse/${verseNumber - 1}`}
              className="btn btn-outline hover:btn-primary transition-colors group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </Link>
          ) : (
            <div></div>
          )}

          <Link
            href={`/quran/${surahSlug}`}
            className="btn btn-primary shadow-md hover:shadow-lg transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Full Surah
          </Link>

          {hasNext ? (
            <Link
              href={`/quran/${surahSlug}/verse/${verseNumber + 1}`}
              className="btn btn-outline hover:btn-primary transition-colors group"
            >
              <span className="hidden sm:inline">Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div></div>
          )}
        </div>

        {/* Enhanced Actions Bar */}
        <div className="flex flex-wrap gap-3 justify-center p-6 bg-base-100 rounded-xl shadow-md">
          <button
            onClick={handleShare}
            className="btn btn-sm btn-ghost gap-2 hover:btn-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share Verse
          </button>

          <div className="divider divider-horizontal mx-0"></div>

          <Link
            href="/"
            className="btn btn-sm btn-ghost gap-2"
          >
            <span className="text-lg">📿</span>
            Dhikr Counter
          </Link>

          <Link
            href="/duas"
            className="btn btn-sm btn-ghost gap-2"
          >
            <span className="text-lg">🤲</span>
            Daily Duas
          </Link>

          <Link
            href="/prayer-times"
            className="btn btn-sm btn-ghost gap-2"
          >
            <span className="text-lg">🕌</span>
            Prayer Times
          </Link>
        </div>

        {/* Enhanced Related Verses Section */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <div className="flex items-center gap-2 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-semibold text-base-content">Famous Verses</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/quran/al-baqarah-surah-2/verse/255"
                className="group flex items-center gap-3 p-3 rounded-lg bg-base-200/50 hover:bg-primary/10 transition-all"
              >
                <span className="text-2xl">🌟</span>
                <div>
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">Ayat al-Kursi</p>
                  <p className="text-xs text-base-content/60">The Throne Verse</p>
                </div>
              </Link>

              <Link
                href="/quran/al-ikhlas-surah-112/verse/1"
                className="group flex items-center gap-3 p-3 rounded-lg bg-base-200/50 hover:bg-primary/10 transition-all"
              >
                <span className="text-2xl">☝️</span>
                <div>
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">Surah Ikhlas</p>
                  <p className="text-xs text-base-content/60">The Sincerity</p>
                </div>
              </Link>

              <Link
                href="/quran/al-fatihah-surah-1/verse/1"
                className="group flex items-center gap-3 p-3 rounded-lg bg-base-200/50 hover:bg-primary/10 transition-all"
              >
                <span className="text-2xl">📖</span>
                <div>
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">Al-Fatihah</p>
                  <p className="text-xs text-base-content/60">The Opening</p>
                </div>
              </Link>

              <Link
                href="/quran/an-nas-surah-114/verse/1"
                className="group flex items-center gap-3 p-3 rounded-lg bg-base-200/50 hover:bg-primary/10 transition-all"
              >
                <span className="text-2xl">🛡️</span>
                <div>
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">Surah An-Nas</p>
                  <p className="text-xs text-base-content/60">The Mankind</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}