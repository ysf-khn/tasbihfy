"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import SurahCard from "@/components/quran/SurahCard";
import { useQuranSurahList, useLastRead } from "@/hooks/useQuranData";
import { generateSurahSlug } from "@/lib/url-utils";

// Declare gtag type for Google Analytics tracking
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function QuranClient() {
  const { surahs, loading, error: surahsError } = useQuranSurahList();
  const { lastRead } = useLastRead();

  const [showDebug, setShowDebug] = useState(
    process.env.NODE_ENV === "development"
  );

  // Track page view with Google Analytics
  useEffect(() => {
    window.gtag?.("event", "view_quran_list", {
      event_category: "engagement",
      event_label: "quran_page_view",
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <UnifiedHeader title="Quran" showSignIn={true} />
        <div className="container mx-auto px-4 py-6 pt-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
            <p className="text-base-content/70">Loading Quran chapters...</p>
            {showDebug && (
              <div className="mt-4 text-xs text-base-content/60">
                <p>🔄 Fetching surah list from API</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (surahsError) {
    return (
      <div className="min-h-screen bg-base-200">
        <UnifiedHeader title="Quran" showSignIn={true} />
        <div className="container mx-auto px-4 py-6 pt-24">
          <div className="text-center">
            <div className="alert alert-error max-w-md mx-auto mb-6">
              <h2 className="font-bold">Failed to Load Quran</h2>
              <p className="text-sm">{surahsError}</p>
            </div>

            {showDebug && (
              <div className="card bg-base-100 border border-error max-w-2xl mx-auto mb-6">
                <div className="card-body">
                  <h3 className="card-title text-error">Debug Info</h3>
                  <div className="text-left text-sm">
                    <p>
                      <strong>Loading:</strong> {loading ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Surahs Loaded:</strong> {surahs.length}
                    </p>
                    <p>
                      <strong>Error:</strong> {surahsError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 pb-16">
      <UnifiedHeader title="Quran" showSignIn={true} />

      <div className="container mx-auto px-4 max-w-4xl pt-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpenIcon className="w-8 h-8 text-base-content" />
            <h1 className="text-3xl font-bold text-base-content">Al Quran</h1>
          </div>
        </div>

        {/* Last Read Section */}
        {lastRead && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3 text-base-content">
              Last Read
            </h2>
            <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-base-content">
                      {lastRead.surahName}
                    </h3>
                    <p className="text-sm text-base-content/70">
                      Continue reading
                    </p>
                  </div>
                  <Link
                    href={`/quran/${generateSurahSlug(lastRead.surahId)}`}
                    className="btn btn-primary btn-sm"
                  >
                    Continue
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Popular Surahs */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 18, name: "Al-Kahf" },
              { id: 36, name: "Ya-Sin" },
              { id: 67, name: "Al-Mulk" },
              { id: 56, name: "Al-Waqiah" },
              { id: 55, name: "Ar-Rahman" },
              { id: 112, name: "Al-Ikhlas" },
              { id: 113, name: "Al-Falaq" },
              { id: 114, name: "An-Nas" },
            ].map((surah) => (
              <Link
                key={surah.id}
                href={`/quran/${generateSurahSlug(surah.id)}`}
                className="badge badge-lg badge-neutral hover:badge-primary transition-all duration-200 px-3 py-2"
              >
                {surah.name}
              </Link>
            ))}
            <Link
              href="/baqarah-last-two"
              className="badge badge-lg badge-neutral hover:badge-primary transition-all duration-200 px-3 py-2"
            >
              Last 2 Ayahs (Al-Baqarah)
            </Link>
          </div>
        </div>

        {/* Surah List */}
        <>
          <div className="divide-y divide-gray-200">
            {surahs.length > 0 ? (
              surahs.map((surah) => <SurahCard key={surah.id} surah={surah} />)
            ) : (
              <div className="text-center py-8">
                <div className="alert alert-warning max-w-md mx-auto">
                  <p>No Surahs found.</p>
                  {showDebug && (
                    <p className="text-xs mt-2">
                      Check the console for API errors or network issues.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      </div>
    </div>
  );
}
