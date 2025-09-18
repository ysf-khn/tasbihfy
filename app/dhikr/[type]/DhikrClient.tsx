"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseDhikrSlug } from "@/lib/url-utils";
import DhikrCounter from "@/components/counter/DhikrCounter";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import { useConfetti } from "@/components/ui/Confetti";

// Declare gtag type for Google Analytics tracking
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface DhikrClientProps {
  params: Promise<{ type: string }>;
}

export default function DhikrClient({ params }: DhikrClientProps) {
  const router = useRouter();
  const { fireCelebration } = useConfetti();
  const [dhikrType, setDhikrType] = useState<string>("");
  const [dhikrName, setDhikrName] = useState<string>("");
  const [targetCount, setTargetCount] = useState<number>(0);
  const [currentCount, setCurrentCount] = useState<number>(0);

  useEffect(() => {
    const initializeDhikr = async () => {
      const { type } = await params;
      const { name, count } = parseDhikrSlug(type);

      setDhikrType(type);
      setDhikrName(name.charAt(0).toUpperCase() + name.slice(1));
      setTargetCount(count || 0);

      // Track page view with Google Analytics
      window.gtag?.("event", "view_dhikr_counter", {
        event_category: "engagement",
        event_label: `dhikr_${type}`,
        dhikr_type: type,
        dhikr_name: name,
        target_count: count || 0,
      });
    };

    initializeDhikr();
  }, [params]);

  const handleIncrement = () => {
    setCurrentCount(prev => prev + 1);
  };

  const handleReset = () => {
    setCurrentCount(0);
  };

  const handleComplete = () => {
    console.log(`${dhikrName} completed!`);
    fireCelebration();

    // Track completion with Google Analytics
    window.gtag?.("event", "dhikr_completed", {
      event_category: "achievement",
      event_label: `dhikr_completed_${dhikrType}`,
      dhikr_type: dhikrType,
      dhikr_name: dhikrName,
      count_completed: targetCount,
    });
  };

  // Get Arabic text for common dhikr phrases
  const getArabicText = (name: string): string | undefined => {
    const arabicMap: Record<string, string> = {
      "subhanallah": "سُبْحَانَ اللَّهِ",
      "alhamdulillah": "الْحَمْدُ لِلَّهِ",
      "allahu akbar": "اللَّهُ أَكْبَرُ",
      "la illaha illa allah": "لَا إِلَٰهَ إِلَّا اللَّهُ",
      "astaghfirullah": "أَسْتَغْفِرُ اللَّهَ",
      "bismillah": "بِسْمِ اللَّهِ",
      "la hawla wa la quwwata illa billah": "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
      "subhan allah wa bihamdihi": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      "subhan allah al azeem": "سُبْحَانَ اللَّهِ الْعَظِيمِ",
    };

    return arabicMap[name.toLowerCase()];
  };

  const getTransliteration = (name: string): string | undefined => {
    const transliterationMap: Record<string, string> = {
      "subhanallah": "Subhan Allah",
      "alhamdulillah": "Alhamdulillahi rabbil alameen",
      "allahu akbar": "Allahu Akbar",
      "la illaha illa allah": "La ilaha illa Allah",
      "astaghfirullah": "Astaghfirullah",
      "bismillah": "Bismillahir rahmanir raheem",
      "la hawla wa la quwwata illa billah": "La hawla wa la quwwata illa billah",
      "subhan allah wa bihamdihi": "Subhan Allah wa bihamdihi",
      "subhan allah al azeem": "Subhan Allah al-azeem",
    };

    return transliterationMap[name.toLowerCase()];
  };

  if (!dhikrName) {
    return (
      <div className="min-h-screen bg-base-200">
        <UnifiedHeader showSignIn={true} />
        <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/70 animate-pulse">Loading dhikr...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <UnifiedHeader showSignIn={true} />
      <div>
        <div className="max-w-2xl mx-auto">
          <DhikrCounter
            dhikrName={dhikrName}
            targetCount={targetCount}
            currentCount={currentCount}
            onIncrement={handleIncrement}
            onReset={handleReset}
            onComplete={targetCount > 0 ? handleComplete : undefined}
            hasUnsavedChanges={false}
            arabicText={getArabicText(dhikrName)}
            transliteration={getTransliteration(dhikrName)}
          />
        </div>
      </div>
    </div>
  );
}