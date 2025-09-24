"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { duroodShareefCollection, duroodBenefits } from "@/data/durood-shareef";
import {
  HeartIcon,
  BookOpenIcon,
  CheckCircleIcon,
  SparklesIcon,
  StarIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ShareIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";

export default function DuroodShareefClient() {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleShare = async () => {
    const shareData = {
      title: "Durood Shareef - صلوات على النبي",
      text: "Send authentic blessings upon Prophet Muhammad (PBUH)",
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

  const handleStartCounter = (durood: typeof duroodShareefCollection[0]) => {
    const dhikrData = {
      name: durood.name,
      arabicText: durood.arabic,
      targetCount: 11, // Default count for durood
      transliteration: durood.transliteration.substring(0, 50) + "...",
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

  const categories = [
    { id: "all", name: "All Forms", icon: BookOpenIcon },
    { id: "essential", name: "Essential", icon: StarIcon },
    { id: "common", name: "Common", icon: HeartIcon },
    { id: "special", name: "Special", icon: SparklesIcon },
    { id: "simple", name: "Simple", icon: CheckCircleIcon },
  ];

  const filteredDurood = selectedCategory === "all"
    ? duroodShareefCollection
    : duroodShareefCollection.filter(d => d.category === selectedCategory);

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
          <h1 className="text-xl font-bold">Durood Shareef</h1>
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
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <HeartIcon className="w-8 h-8 text-accent" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 font-arabic-naskh">صلوات على النبي</h1>
          <p className="text-lg text-base-content/70 mb-2">Blessings upon the Prophet</p>
          <p className="text-sm text-base-content/60">صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ</p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="badge badge-outline gap-2">
              <BookOpenIcon className="w-4 h-4" />
              {duroodShareefCollection.length} Forms
            </div>
            <div className="badge badge-outline">Authentic Collection</div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4 flex items-center gap-2">
              <GiftIcon className="w-6 h-6 text-accent" />
              Spiritual Benefits
            </h2>
            <div className="space-y-3">
              {duroodBenefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="border-l-4 border-accent pl-4">
                  <h4 className="font-semibold text-sm mb-1">{benefit.title}</h4>
                  <p className="text-xs text-base-content/70 mb-1">{benefit.description}</p>
                  <div className="badge badge-ghost badge-xs">{benefit.reference}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`btn btn-sm ${
                    selectedCategory === category.id ? 'btn-accent' : 'btn-outline btn-accent'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Durood Collection */}
        <div className="space-y-4 mb-8">
          {filteredDurood.map((durood) => {
            const isExpanded = expandedItems.has(durood.id);

            return (
              <div key={durood.id} className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{durood.name}</h3>
                      <div className="flex gap-2 mb-3">
                        <div className="badge badge-accent badge-outline">
                          {durood.category.charAt(0).toUpperCase() + durood.category.slice(1)}
                        </div>
                        {durood.note && (
                          <div className="badge badge-ghost text-xs">{durood.note}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpanded(durood.id)}
                      className="btn btn-ghost btn-circle btn-sm"
                    >
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Arabic Text */}
                  <div className="bg-base-200 rounded-lg p-4 mb-4">
                    <p className="text-lg md:text-xl text-center leading-loose font-arabic-naskh" dir="rtl">
                      {durood.arabic}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <button
                      onClick={() => handleStartCounter(durood)}
                      className="btn btn-accent flex-1"
                    >
                      <SparklesIcon className="w-5 h-5" />
                      Start Counter (11x)
                    </button>
                    <button className="btn btn-outline">
                      <HeartIcon className="w-5 h-5" />
                      Add to Favorites
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="space-y-4">
                      <div className="divider"></div>

                      {/* Transliteration */}
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Transliteration</h4>
                        <p className="text-sm italic text-base-content/80 leading-relaxed">
                          {durood.transliteration}
                        </p>
                      </div>

                      <div className="divider"></div>

                      {/* Translation */}
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Translation</h4>
                        <p className="text-sm leading-relaxed">
                          {durood.translation}
                        </p>
                      </div>

                      {/* Reference */}
                      <div className="flex justify-between items-center pt-2">
                        <div className="badge badge-ghost badge-sm">
                          {durood.reference}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hadith Quote */}
        <div className="card bg-accent text-accent-content shadow-lg mb-6">
          <div className="card-body text-center">
            <div className="text-4xl mb-4">"</div>
            <p className="text-lg mb-4">
              "Whoever sends one durood upon me, Allah will send ten upon him."
            </p>
            <p className="text-sm opacity-90">- Prophet Muhammad (PBUH), Sahih Muslim</p>
          </div>
        </div>

        {/* Related Content */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Related Content</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/morning-adhkar"
                className="btn btn-outline justify-start"
              >
                <ChevronRightIcon className="w-4 h-4" />
                Morning Adhkar
              </Link>
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