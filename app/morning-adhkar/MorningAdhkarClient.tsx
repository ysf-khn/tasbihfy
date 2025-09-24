"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { morningAdhkar } from "@/data/morning-adhkar";
import {
  SunIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ShareIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function MorningAdhkarClient() {
  const router = useRouter();
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [currentCounts, setCurrentCounts] = useState<{ [key: number]: number }>({});

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const incrementCount = (id: number, maxCount: number) => {
    const current = currentCounts[id] || 0;
    const newCount = current + 1;

    if (newCount >= maxCount) {
      setCompletedItems(new Set(completedItems).add(id));
      setCurrentCounts({ ...currentCounts, [id]: maxCount });
    } else {
      setCurrentCounts({ ...currentCounts, [id]: newCount });
    }
  };

  const resetCount = (id: number) => {
    const newCompleted = new Set(completedItems);
    newCompleted.delete(id);
    setCompletedItems(newCompleted);
    setCurrentCounts({ ...currentCounts, [id]: 0 });
  };

  const handleShare = async () => {
    const shareData = {
      title: "Morning Adhkar - أذكار الصباح",
      text: "Start your day with authentic morning adhkar for protection and blessings",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleStartCounter = (dhikr: typeof morningAdhkar[0]) => {
    const dhikrData = {
      name: dhikr.translation.substring(0, 50) + "...",
      arabicText: dhikr.arabic,
      targetCount: dhikr.count,
      transliteration: dhikr.transliteration.substring(0, 50) + "...",
    };

    const params = new URLSearchParams({
      temp: "true",
      instant: "true",
      name: dhikrData.name,
      arabic: dhikrData.arabicText,
      target: dhikrData.targetCount.toString(),
      transliteration: dhikrData.transliteration,
    });

    router.push(`/?${params.toString()}`);
  };

  const completionPercentage = Math.round((completedItems.size / morningAdhkar.length) * 100);

  const benefits = [
    {
      icon: ShieldCheckIcon,
      title: "Protection for the Day",
      description: "Shield yourself from harm and evil throughout the day"
    },
    {
      icon: SparklesIcon,
      title: "Blessings & Barakah",
      description: "Invite Allah's blessings into your daily activities"
    },
    {
      icon: ClockIcon,
      title: "Best After Fajr",
      description: "Ideally recited after Fajr prayer until sunrise"
    },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost btn-circle">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
        <div className="navbar-center">
          <h1 className="text-xl font-bold">Morning Adhkar</h1>
        </div>
        <div className="navbar-end">
          <button onClick={handleShare} className="btn btn-ghost btn-circle">
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center">
              <SunIcon className="w-8 h-8 text-warning" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 font-arabic-naskh">أذكار الصباح</h1>
          <p className="text-lg text-base-content/70">Morning Remembrance</p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="badge badge-outline gap-2">
              <BookOpenIcon className="w-4 h-4" />
              {morningAdhkar.length} Adhkar
            </div>
            <div className="badge badge-outline">After Fajr - Sunrise</div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Today's Progress</h3>
              <span className="text-2xl font-bold">{completionPercentage}%</span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={completionPercentage}
              max="100"
            ></progress>
            <p className="text-sm text-base-content/70 mt-2">
              {completedItems.size} of {morningAdhkar.length} completed
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Benefits of Morning Adhkar</h2>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{benefit.title}</h4>
                    <p className="text-xs text-base-content/70">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Adhkar List */}
        <div className="space-y-4 mb-8">
          {morningAdhkar.map((dhikr) => {
            const isExpanded = expandedItems.has(dhikr.id);
            const isCompleted = completedItems.has(dhikr.id);
            const currentCount = currentCounts[dhikr.id] || 0;

            return (
              <div
                key={dhikr.id}
                className={`card bg-base-100 shadow-lg ${isCompleted ? 'border-2 border-success' : ''}`}
              >
                <div className="card-body">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-success text-success-content' : 'bg-base-200'
                        }`}>
                          {isCompleted ? (
                            <CheckCircleIcon className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-semibold">{dhikr.id}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        {/* Count Badge */}
                        <div className="flex gap-2 mb-2">
                          <div className="badge badge-primary badge-outline">
                            Recite {dhikr.count}x
                          </div>
                          {dhikr.note && (
                            <div className="badge badge-ghost text-xs">{dhikr.note}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpanded(dhikr.id)}
                      className="btn btn-ghost btn-circle btn-sm"
                    >
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Arabic Text */}
                  <div className="bg-base-200 rounded-lg p-4 mb-4">
                    <p className="text-xl md:text-2xl text-center leading-loose font-arabic-naskh" dir="rtl">
                      {dhikr.arabic}
                    </p>
                  </div>

                  {/* Counter Section */}
                  {dhikr.count > 1 && (
                    <div className="flex justify-center mb-4">
                      <div className="join">
                        <button
                          className="btn btn-outline join-item"
                          onClick={() => resetCount(dhikr.id)}
                          disabled={currentCount === 0}
                        >
                          Reset
                        </button>
                        <button
                          className={`btn join-item ${isCompleted ? 'btn-success' : 'btn-primary'}`}
                          onClick={() => incrementCount(dhikr.id, dhikr.count)}
                          disabled={isCompleted}
                        >
                          {currentCount}/{dhikr.count}
                        </button>
                        <button
                          className="btn btn-outline join-item"
                          onClick={() => handleStartCounter(dhikr)}
                        >
                          Open Counter
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="space-y-4">
                      <div className="divider"></div>

                      {/* Transliteration */}
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Transliteration</h4>
                        <p className="text-sm italic text-base-content/80">
                          {dhikr.transliteration}
                        </p>
                      </div>

                      <div className="divider"></div>

                      {/* Translation */}
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Translation</h4>
                        <p className="text-sm">
                          {dhikr.translation}
                        </p>
                      </div>

                      {/* Reference */}
                      <div className="pt-2">
                        <div className="badge badge-ghost badge-sm">
                          {dhikr.reference}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Complete for single recitation */}
                  {dhikr.count === 1 && !isCompleted && (
                    <button
                      onClick={() => {
                        setCompletedItems(new Set(completedItems).add(dhikr.id));
                        setCurrentCounts({ ...currentCounts, [dhikr.id]: 1 });
                      }}
                      className="btn btn-primary btn-block"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      Mark as Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Related Content */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Related Content</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/evening-adhkar"
                className="btn btn-outline justify-start"
              >
                <ChevronRightIcon className="w-4 h-4" />
                Evening Adhkar
              </Link>
              <Link
                href="/ayatul-kursi"
                className="btn btn-outline justify-start"
              >
                <ChevronRightIcon className="w-4 h-4" />
                Ayatul Kursi
              </Link>
              <Link
                href="/durood-shareef"
                className="btn btn-outline justify-start"
              >
                <ChevronRightIcon className="w-4 h-4" />
                Durood Shareef
              </Link>
              <Link
                href="/99-names"
                className="btn btn-outline justify-start"
              >
                <ChevronRightIcon className="w-4 h-4" />
                99 Names of Allah
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}