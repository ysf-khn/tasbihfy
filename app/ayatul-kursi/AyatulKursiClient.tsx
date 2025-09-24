"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpenIcon,
  PlayIcon,
  PauseIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function AyatulKursiClient() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const arabicText = "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ";

  const transliteration = "Allahu laa ilaaha illaa Huwal Hayyul Qayyoom. Laa ta'khuzuhoo sinatunw wa laa nawm. Lahoo maa fis samaawaati wa maa fil ard. Man zal lazee yashfa'u 'indahooo illaa bi-iznih. Ya'lamu maa baina aydeehim wa maa khalfahum. Wa laa yuheetoona bi shai'im min 'ilmiheee illaa bimaa shaa'. Wasi'a Kursiyyuhus samaawaati wal ard. Wa laa ya'ooduhoo hifzuhumaa. Wa Huwal 'Aliyyul 'Azeem.";

  const translation = "Allah! There is no god but He, the Living, the Self-Subsisting, Eternal. No slumber can seize Him nor sleep. To Him belongs all that is in the heavens and on earth. Who is there that can intercede in His presence except as He permits? He knows what is before them and what is behind them. And they encompass nothing of His knowledge except what He wills. His Throne extends over the heavens and the earth, and He feels no fatigue in guarding and preserving them. And He is the Most High, the Most Great.";

  const handlePlayAudio = () => {
    if (!audioElement) {
      const audio = new Audio("https://verses.quran.foundation/Alafasy/mp3/002_255.mp3");
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Ayatul Kursi - The Throne Verse",
      text: "Read and recite Ayatul Kursi for protection and blessings",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Could add a toast notification here
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleStartReciting = () => {
    // Navigate to counter with Ayatul Kursi preset
    const dhikrData = {
      name: "Ayatul Kursi",
      arabicText: "آية الكرسي",
      targetCount: 3,
      transliteration: "Ayatul Kursi",
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

  const benefits = [
    {
      icon: ShieldCheckIcon,
      title: "Protection from Evil",
      description: "The Prophet (PBUH) said whoever recites it will be protected from Shaytan until morning."
    },
    {
      icon: ClockIcon,
      title: "After Every Prayer",
      description: "Nothing will prevent entry to Paradise except death for one who recites it after each prayer."
    },
    {
      icon: SparklesIcon,
      title: "Greatest Verse",
      description: "The Prophet (PBUH) declared it as the greatest verse in the Book of Allah."
    },
  ];

  const relatedContent = [
    { name: "Last 2 Verses of Baqarah", href: "/quran/2-al-baqarah/verse/285" },
    { name: "Surah Yaseen", href: "/quran/36-ya-sin" },
    { name: "99 Names of Allah", href: "/99-names" },
    { name: "Morning Adhkar", href: "/morning-adhkar" },
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
          <h1 className="text-xl font-bold">Ayatul Kursi</h1>
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">آية الكرسي</h1>
          <p className="text-lg text-base-content/70">The Throne Verse - Quran 2:255</p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="badge badge-outline gap-2">
              <BookOpenIcon className="w-4 h-4" />
              Surah Al-Baqarah
            </div>
            <div className="badge badge-outline">Most Powerful Verse</div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="card bg-base-100 shadow-lg mb-8">
          <div className="card-body">
            {/* Arabic Text */}
            <div className="py-8 px-4 bg-base-200 rounded-lg mb-6">
              <p className="text-2xl md:text-3xl text-center leading-loose font-arabic-naskh" dir="rtl">
                {arabicText}
              </p>
            </div>

            {/* Audio Controls */}
            <div className="flex justify-center mb-6">
              <button
                onClick={handlePlayAudio}
                className="btn btn-primary gap-2"
              >
                {isPlaying ? (
                  <>
                    <PauseIcon className="w-5 h-5" />
                    Pause Audio
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-5 h-5" />
                    Play Audio
                  </>
                )}
              </button>
            </div>

            <div className="divider"></div>

            {/* Transliteration */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-primary" />
                Transliteration
              </h3>
              <p className="text-base leading-relaxed italic text-base-content/80">
                {transliteration}
              </p>
            </div>

            <div className="divider"></div>

            {/* Translation */}
            <div>
              <h3 className="text-lg font-semibold mb-3">English Translation</h3>
              <p className="text-base leading-relaxed">
                {translation}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="card bg-base-100 shadow-lg mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Benefits & Virtues</h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{benefit.title}</h4>
                    <p className="text-sm text-base-content/70">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* When to Recite */}
        <div className="card bg-base-100 shadow-lg mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">When to Recite</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <ChevronRightIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <span>After every obligatory prayer</span>
              </div>
              <div className="flex items-center gap-3">
                <ChevronRightIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Before going to sleep</span>
              </div>
              <div className="flex items-center gap-3">
                <ChevronRightIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <span>When leaving home</span>
              </div>
              <div className="flex items-center gap-3">
                <ChevronRightIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <span>During times of fear or anxiety</span>
              </div>
              <div className="flex items-center gap-3">
                <ChevronRightIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <span>For protection during travel</span>
              </div>
              <div className="flex items-center gap-3">
                <ChevronRightIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <span>When entering a new place</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="card bg-primary text-primary-content shadow-lg mb-8">
          <div className="card-body text-center">
            <h2 className="card-title text-2xl mb-4 justify-center">Start Reciting Now</h2>
            <p className="mb-6">Use our digital counter to track your recitation</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleStartReciting} className="btn btn-secondary">
                <SparklesIcon className="w-5 h-5" />
                Start Counter (3 Times)
              </button>
              <button className="btn btn-ghost">
                <ArrowDownTrayIcon className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Related Content */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Related Content</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedContent.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="btn btn-outline justify-start"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}