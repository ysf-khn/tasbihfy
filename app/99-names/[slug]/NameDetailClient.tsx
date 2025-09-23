"use client";

import { useState } from "react";
import { names99Allah } from "@/data/99-names";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import Link from "next/link";

interface NameDetailClientProps {
  name: typeof names99Allah[0];
}

export default function NameDetailClient({ name }: NameDetailClientProps) {
  const [count, setCount] = useState(0);
  const [isCountingMode, setIsCountingMode] = useState(false);

  // Find previous and next names for navigation
  const currentIndex = names99Allah.findIndex(n => n.id === name.id);
  const previousName = currentIndex > 0 ? names99Allah[currentIndex - 1] : null;
  const nextName = currentIndex < names99Allah.length - 1 ? names99Allah[currentIndex + 1] : null;

  const handleCount = () => {
    setCount(prev => prev + 1);

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const resetCount = () => {
    setCount(0);
  };

  return (
    <div className="min-h-screen bg-base-200 pb-16">
      <UnifiedHeader
        title={`${name.transliteration} - ${name.meaning}`}
        showSignIn={true}
      />

      <div className="container mx-auto px-4 py-6 space-y-6 pt-4">
        {/* Breadcrumb */}
        <div className="breadcrumbs text-sm">
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/99-names">99 Names</Link></li>
            <li className="text-base-content/70">{name.transliteration}</li>
          </ul>
        </div>

        {/* Main Name Display */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center space-y-6 p-8">
            {/* Number Badge */}
            <div className="flex justify-center">
              <div className="badge badge-primary badge-lg px-4 py-2">
                Name {name.id} of 99
              </div>
            </div>

            {/* Arabic Text */}
            <div className="space-y-4">
              <h1 className="text-6xl arabic-text text-base-content">
                {name.arabic}
              </h1>
              <h2 className="text-3xl font-bold text-base-content">
                {name.transliteration}
              </h2>
              <p className="text-xl text-primary font-semibold">
                {name.meaning}
              </p>
            </div>

            {/* Description */}
            <div className="max-w-2xl mx-auto">
              <p className="text-base-content/80 leading-relaxed">
                {name.description}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base-content mb-4">
              <span className="text-primary">✨</span>
              Spiritual Benefits
            </h3>
            <p className="text-base-content/80 leading-relaxed">
              {name.benefits}
            </p>
          </div>
        </div>

        {/* Dhikr Counter */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-base-content">
                <span className="text-primary">📿</span>
                Dhikr Counter
              </h3>
              <div className="form-control">
                <label className="label cursor-pointer space-x-2">
                  <span className="label-text">Counting Mode</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={isCountingMode}
                    onChange={(e) => setIsCountingMode(e.target.checked)}
                  />
                </label>
              </div>
            </div>

            {isCountingMode ? (
              <div className="text-center space-y-6">
                {/* Counter Display */}
                <div className="bg-base-200 rounded-lg p-8">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {count}
                  </div>
                  <div className="text-base-content/70">
                    {name.transliteration} recitations
                  </div>
                </div>

                {/* Count Button */}
                <button
                  onClick={handleCount}
                  className="btn btn-primary btn-lg w-full max-w-xs"
                >
                  Recite {name.transliteration}
                </button>

                {/* Reset Button */}
                {count > 0 && (
                  <button
                    onClick={resetCount}
                    className="btn btn-outline btn-sm"
                  >
                    Reset Counter
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-base-content/70">
                  Enable counting mode to start reciting {name.transliteration}
                </p>
                <div className="text-4xl arabic-text text-base-content">
                  {name.arabic}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {previousName ? (
            <Link
              href={`/99-names/${previousName.slug}`}
              className="btn btn-outline flex-1 mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {previousName.transliteration}
            </Link>
          ) : (
            <div className="flex-1 mr-2"></div>
          )}

          <Link href="/99-names" className="btn btn-primary mx-2">
            All Names
          </Link>

          {nextName ? (
            <Link
              href={`/99-names/${nextName.slug}`}
              className="btn btn-outline flex-1 ml-2"
            >
              {nextName.transliteration}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div className="flex-1 ml-2"></div>
          )}
        </div>

        {/* Related Actions */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base-content mb-4">
              Continue Your Spiritual Journey
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/" className="btn btn-outline btn-sm">
                <span className="text-primary">📿</span>
                Dhikr Counter
              </Link>
              <Link href="/duas" className="btn btn-outline btn-sm">
                <span className="text-primary">🤲</span>
                Daily Duas
              </Link>
              <Link href="/quran" className="btn btn-outline btn-sm">
                <span className="text-primary">📖</span>
                Read Quran
              </Link>
              <Link href="/prayer-times" className="btn btn-outline btn-sm">
                <span className="text-primary">🕐</span>
                Prayer Times
              </Link>
            </div>
          </div>
        </div>

        {/* Share */}
        <div className="text-center">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${name.transliteration} - ${name.meaning}`,
                  text: `Learn about ${name.transliteration} (${name.arabic}) - ${name.meaning}. ${name.description}`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="btn btn-outline btn-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share This Name
          </button>
        </div>
      </div>
    </div>
  );
}