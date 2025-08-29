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
} from "@/lib/messages";

interface DhikrCounterProps {
  dhikrName: string;
  targetCount: number;
  currentCount: number;
  onIncrement: () => void;
  onReset: () => void;
  onComplete?: () => void;
  hasUnsavedChanges?: boolean;
  tempDhikr?: {
    arabic?: string;
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

  // Check for milestone reached
  const checkMilestone = (newProgress: number, oldProgress: number) => {
    const milestones = [25, 50, 75];
    for (const milestone of milestones) {
      if (newProgress >= milestone && oldProgress < milestone) {
        setMilestoneMessage(getMilestoneMessage(milestone));
        setShowMilestone(true);
        setTimeout(() => setShowMilestone(false), 3000);
        break;
      }
    }
  };

  const handleIncrement = useCallback(() => {
    const oldProgress = progress;
    onIncrement();

    // Check for milestone after increment
    const newProgress =
      targetCount > 0 ? ((currentCount + 1) / targetCount) * 100 : 0;
    checkMilestone(newProgress, oldProgress);

    // Haptic feedback for mobile devices
    if (isVibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50); // Short vibration
    }
  }, [onIncrement, isVibrationEnabled, progress, currentCount, targetCount]);

  // Check for completion
  useEffect(() => {
    if (isComplete && !wasComplete) {
      onComplete?.();
      // Longer vibration for completion
      if (isVibrationEnabled && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      setWasComplete(true);
    } else if (!isComplete) {
      setWasComplete(false);
    }
  }, [isComplete, wasComplete, onComplete, isVibrationEnabled]);

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
    <div className="flex flex-col h-[calc(100vh-6rem)] p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={tempDhikr ? "/duas" : "/"} className="btn btn-ghost btn-circle">
          <ChevronLeftIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-base-content">
          {tempDhikr ? "Hisnul Muslim" : "Tasbihfy"}
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 space-y-6 min-h-0">
        {/* Dhikr Name and Translation */}
        <div className="text-center space-y-2">
          {tempDhikr?.arabic ? (
            <div className="space-y-3">
              <p className={`leading-relaxed text-center text-base-content ${getArabicClasses()}`}>
                {tempDhikr.arabic}
              </p>
              <h2 className="text-2xl font-bold text-base-content">{dhikrName}</h2>
              {tempDhikr.source && (
                <p className="text-sm text-base-content/60 bg-base-200 px-3 py-1 rounded-full inline-block">
                  {tempDhikr.source}
                </p>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-4xl font-bold text-base-content">{dhikrName}</h2>
              <p className="text-lg text-base-content/70">
                {getTranslation(dhikrName)}
              </p>
            </div>
          )}
        </div>

        {/* Large Count Display */}
        <div className="text-center">
          <div className="text-7xl font-bold text-primary mb-2">
            {currentCount}
          </div>
          {hasUnsavedChanges && (
            <div className="badge badge-warning badge-sm animate-pulse">
              <span className="loading loading-dots loading-xs"></span>
            </div>
          )}
        </div>

        {/* Milestone/Completion Messages */}
        {showMilestone && (
          <div className="alert alert-success shadow-lg animate-pulse max-w-sm">
            <SparklesIcon className="w-6 h-6" />
            <span>{milestoneMessage}</span>
          </div>
        )}

        {isComplete && (
          <div className="alert alert-success shadow-lg max-w-md animate-pulse">
            <CheckCircleIcon className="w-6 h-6" />
            <span>{getRandomMessage(encouragements.completion)}</span>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="space-y-4 flex-shrink-0">
        {/* Main Count Button */}
        <div className="flex justify-center">
          <button
            className="btn btn-primary w-64 h-64 rounded-full text-3xl font-bold shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 touch-manipulation"
            onClick={handleIncrement}
          >
            Count
          </button>
        </div>

        {/* Controls Row */}
        <div className="flex justify-between items-center bg-base-200/50 rounded-2xl p-4 backdrop-blur-sm">
          <button
            className="btn btn-ghost btn-sm"
            onClick={onReset}
            disabled={currentCount === 0}
          >
            <ArrowPathIcon className="w-4 h-4" />
            Reset
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-base-content/70">
              Vibration
            </span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isVibrationEnabled}
              onChange={(e) => setIsVibrationEnabled(e.target.checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
