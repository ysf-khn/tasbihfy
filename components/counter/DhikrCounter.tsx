"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useArabicSettings } from "@/hooks/useArabicSettings";
import Link from "next/link";
import {
  ChevronLeftIcon,
  PlusIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  StarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  getRandomMessage,
  encouragements,
  getMilestoneMessage,
  getInstantTasbihMilestone,
} from "@/lib/messages";

interface DhikrCounterProps {
  dhikrName: string;
  targetCount: number;
  currentCount: number;
  onIncrement: () => void;
  onReset: () => void;
  onComplete?: () => void;
  hasUnsavedChanges?: boolean;
  isInstantMode?: boolean;
  arabicText?: string;
  transliteration?: string;
  tempDhikr?: {
    arabic?: string;
    transliteration?: string;
    source?: string;
  };
}

export default function DhikrCounter({
  dhikrName,
  targetCount,
  currentCount,
  onIncrement,
  onReset,
  onComplete,
  hasUnsavedChanges = false,
  isInstantMode = false,
  arabicText,
  transliteration,
  tempDhikr,
}: DhikrCounterProps) {
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);
  const [wasComplete, setWasComplete] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState("");
  const { user } = useAuth();
  const { getArabicClasses } = useArabicSettings();

  const progress = targetCount > 0 ? (currentCount / targetCount) * 100 : 0;
  const isComplete = currentCount >= targetCount && targetCount > 0;
  const progressPercentage = Math.min(progress, 100);

  // Determine if this is a long dhikr that needs different layout
  const currentArabic = tempDhikr?.arabic || arabicText;
  const currentTransliteration = tempDhikr?.transliteration || transliteration;
  const hasArabicText = Boolean(currentArabic);
  const isLongText = hasArabicText && (currentArabic?.length || 0) > 100;

  // Check for milestone reached
  const checkMilestone = (newProgress: number, oldProgress: number, newCount: number, oldCount: number) => {
    if (isInstantMode) {
      // Check instant tasbih milestones based on absolute counts
      const instantMilestones = [10, 33, 50, 67, 100];
      
      for (const milestone of instantMilestones) {
        if (newCount >= milestone && oldCount < milestone) {
          setMilestoneMessage(getInstantTasbihMilestone(milestone));
          setShowMilestone(true);
          setTimeout(() => setShowMilestone(false), 3000);
          return;
        }
      }
      
      // Check for every 25 after 100
      if (newCount > 100 && newCount % 25 === 0 && oldCount < newCount) {
        setMilestoneMessage(getInstantTasbihMilestone(newCount));
        setShowMilestone(true);
        setTimeout(() => setShowMilestone(false), 3000);
      }
    } else {
      // Regular milestone checking for percentage-based progress
      const milestones = [25, 50, 75];
      for (const milestone of milestones) {
        if (newProgress >= milestone && oldProgress < milestone) {
          setMilestoneMessage(getMilestoneMessage(milestone));
          setShowMilestone(true);
          setTimeout(() => setShowMilestone(false), 3000);
          break;
        }
      }
    }
  };

  const handleIncrement = useCallback(() => {
    const oldProgress = progress;
    const oldCount = currentCount;
    onIncrement();

    // Check for milestone after increment
    const newProgress =
      targetCount > 0 ? ((currentCount + 1) / targetCount) * 100 : 0;
    const newCount = currentCount + 1;
    checkMilestone(newProgress, oldProgress, newCount, oldCount);

    // Haptic feedback for mobile devices
    if (isVibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50); // Short vibration
    }
  }, [onIncrement, isVibrationEnabled, progress, currentCount, targetCount]);

  // Check for completion (not applicable in instant mode)
  useEffect(() => {
    if (!isInstantMode && isComplete && !wasComplete) {
      onComplete?.();
      // Longer vibration for completion
      if (isVibrationEnabled && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      setWasComplete(true);
    } else if (!isComplete) {
      setWasComplete(false);
    }
  }, [isComplete, wasComplete, onComplete, isVibrationEnabled, isInstantMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleIncrement();
      } else if (e.code === "KeyR" && e.ctrlKey) {
        e.preventDefault();
        onReset();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleIncrement, onReset]);

  // Get dhikr translation (mock for now)
  const getTranslation = (dhikrName: string) => {
    const translations: Record<string, string> = {
      SubhanAllah: "Glory be to Allah",
      Alhamdulillah: "Praise be to Allah",
      "Allahu Akbar": "Allah is the Greatest",
      "La ilaha illallah": "There is no god but Allah",
    };
    return translations[dhikrName] || "Remembrance of Allah";
  };

  return (
    <>
      {/* Toast Notification */}
      <div 
        className={`fixed top-4 left-4 right-4 z-50 transform transition-all duration-500 ease-in-out ${
          showMilestone ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-success/90 backdrop-blur-sm text-success-content px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md mx-auto">
          <SparklesIcon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{milestoneMessage}</span>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-6rem)] p-4 overflow-hidden">
        {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={tempDhikr ? "/duas" : "/"}
          className="btn btn-ghost btn-circle"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-base-content">
          {tempDhikr ? "Hisnul Muslim" : ""}
        </h1>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={onReset}
            disabled={currentCount === 0}
            title="Reset counter"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
          <button
            className={`btn btn-ghost btn-circle btn-sm ${isVibrationEnabled ? 'btn-active' : ''}`}
            onClick={() => setIsVibrationEnabled(!isVibrationEnabled)}
            title={isVibrationEnabled ? "Vibration on" : "Vibration off"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d={isVibrationEnabled ? "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" : "M9.143 17.082a24.248 24.248 0 003.844.148m-3.844-.148a23.856 23.856 0 01-5.455-1.31 8.964 8.964 0 002.3-5.542m3.155 6.852a3 3 0 005.667 1.97m1.965-2.277L21 21m-4.225-4.225a23.81 23.81 0 003.536-1.003A8.967 8.967 0 0118 9.75V9A6 6 0 006.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content - Adaptive Layout */}
      {isLongText ? (
        // Long Text Layout (Ayatul Kursi, Surahs, etc.)
        <div className="flex flex-col flex-1 min-h-0 mt-4">
          {/* English Name */}
          <div className="text-center mb-3">
            <h2 className="text-2xl font-bold text-base-content">{dhikrName}</h2>
          </div>

          {/* Scrollable Arabic Text - Takes most space */}
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="space-y-3 bg-base-100/50 rounded-xl border border-base-300/20 p-6 mx-4">
              {/* Arabic text */}
              <p
                className={`leading-relaxed text-center text-base-content ${getArabicClasses()}`}
              >
                {currentArabic}
              </p>

              {/* Transliteration */}
              {currentTransliteration && (
                <div className="border-t border-base-300 pt-3">
                  <p className="text-sm text-base-content/60 mb-1">
                    Transliteration:
                  </p>
                  <p className="text-base italic text-base-content/80 leading-relaxed !whitespace-normal !break-words !w-full !overflow-visible !text-ellipsis-none">
                    {currentTransliteration}
                  </p>
                </div>
              )}

              {tempDhikr?.source && (
                <div className="border-t border-base-300 pt-3">
                  <p className="text-sm text-base-content/60">
                    {tempDhikr.source}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Count Display */}
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-primary mb-2">
              {currentCount}
            </div>
          </div>
        </div>
      ) : (
        // Short Text Layout (SubhanAllah, Alhamdulillah, etc.)
        <div
          className={`flex flex-col items-center justify-center flex-1 ${
            hasArabicText ? "space-y-3" : "space-y-6"
          } min-h-0 mt-4`}
        >
          {/* Dhikr Name and Translation */}
          <div className="text-center space-y-2">
            {hasArabicText ? (
              <div className="space-y-2 w-full">
                <div className="space-y-3 bg-base-100/50 rounded-xl border border-base-300/20 p-6">
                  {/* English Name */}
                  <h2 className="text-2xl font-bold text-base-content">
                    {dhikrName}
                  </h2>
                  
                  {/* Arabic text */}
                  <p
                    className={`text-xl leading-relaxed text-center text-base-content ${getArabicClasses()}`}
                  >
                    {currentArabic}
                  </p>

                  {/* Transliteration */}
                  {currentTransliteration && (
                    <p className="text-base italic text-base-content/80 leading-relaxed !whitespace-normal !break-words !w-full !overflow-visible !text-ellipsis-none">
                      {currentTransliteration}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-4xl font-bold text-base-content">
                  {isInstantMode ? "Instant Tasbih" : dhikrName}
                </h2>
                <p className="text-lg text-base-content/70">
                  {isInstantMode ? "Count without limits" : getTranslation(dhikrName)}
                </p>
              </div>
            )}
          </div>

          {/* Large Count Display */}
          <div className="text-center">
            <div className="text-7xl font-bold text-primary mb-2">
              {currentCount}
            </div>
          </div>

          {!isInstantMode && isComplete && (
            <div className="alert alert-success shadow-lg max-w-md animate-pulse">
              <CheckCircleIcon className="w-6 h-6" />
              <span>{getRandomMessage(encouragements.completion)}</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Section */}
      <div className={`${isLongText || tempDhikr ? "space-y-2" : "space-y-4"} flex-shrink-0 pb-4`}>
        {/* Main Count Button */}
        <div className="flex justify-center">
          <button
            className={`btn btn-primary ${
              isLongText
                ? "w-full max-w-sm h-16 rounded-full text-2xl" // Pill shape for long text
                : tempDhikr
                ? "w-80 h-20 rounded-full text-2xl" // Medium for temp dhikr
                : "w-64 h-64 rounded-full text-3xl" // Large circle for short dhikr
            } font-bold shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 touch-manipulation`}
            onClick={handleIncrement}
          >
            Count
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
