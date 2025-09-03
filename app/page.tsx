"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { useConfetti } from "@/components/ui/Confetti";
import DhikrCounter from "@/components/counter/DhikrCounter";
import hisnulMuslim from "@/data/hisnul-muslim-complete.json";
import HomeDhikrCard from "@/components/dhikr/HomeDhikrCard";
import CreateDhikrModal from "@/components/dhikr/CreateDhikrModal";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { Dhikr, DhikrSession } from "@prisma/client";
import { PlusIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface DhikrWithSession extends Dhikr {
  sessions: DhikrSession[];
}

// Loading fallback component
function HomePageLoading() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="flex justify-between items-center p-4 sm:p-6 bg-base-100 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">
          Tasbihfy
        </h1>
        <ThemeToggle />
      </div>
      <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-base-content/70 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}

// Component that uses useSearchParams
function HomeContent() {
  const searchParams = useSearchParams();
  const dhikrId = searchParams.get("dhikr");
  const isTemp = searchParams.get("temp") === "true";
  const isInstant = searchParams.get("instant") === "true";
  const chapterId = searchParams.get("chapterId");
  const duaId = searchParams.get("duaId");
  const { user } = useAuth();
  const { fireCelebration } = useConfetti();

  const [dhikrs, setDhikrs] = useState<DhikrWithSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Instant Tasbih state (simple counter, no persistence)
  const [instantCount, setInstantCount] = useState(0);

  // Create temp dhikr object for temporary sessions (memoized to prevent infinite re-renders)
  const tempDhikr = useMemo(() => {
    if (!isTemp || !chapterId || !duaId) return null;

    const chapter = hisnulMuslim.chapters.find(
      (c) => c.id === parseInt(chapterId)
    );
    const dua = chapter?.duas.find((d) => d.id === parseInt(duaId));

    if (!dua) return null;

    return {
      id: "temp",
      name: dua.translation,
      targetCount: 33, // Default count for duas
      arabic: dua.arabic,
      transliteration: dua.transliteration,
      source: `Hisnul Muslim - ${dua.hisnNumber}`,
    };
  }, [isTemp, chapterId, duaId]);

  const {
    localCount,
    dhikrName,
    targetCount,
    isComplete,
    isLoading: isCounterLoading,
    error: counterError,
    hasUnsavedChanges,
    incrementCount,
    resetCount,
    arabicText,
    transliteration,
  } = useSessionTracking({ dhikrId, tempDhikr });

  const fetchDhikrs = async () => {
    try {
      const response = await fetch("/api/dhikrs");
      if (!response.ok) throw new Error("Failed to fetch dhikrs");
      const data = await response.json();
      setDhikrs(data);
    } catch (err) {
      setError("Failed to load dhikrs");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDhikrs();
    }
  }, [user]);

  const handleComplete = () => {
    console.log("Dhikr completed!");
    fireCelebration();
  };

  // Instant Tasbih handlers
  const handleInstantIncrement = () => {
    setInstantCount((prev) => prev + 1);
  };

  const handleInstantReset = () => {
    setInstantCount(0);
  };

  const handleCreate = async (data: {
    name: string;
    targetCount: number;
    arabic?: string;
    transliteration?: string;
  }) => {
    try {
      const response = await fetch("/api/dhikrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create dhikr");

      await fetchDhikrs();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating dhikr:", err);
      throw err;
    }
  };

  const handleToggleFavorite = async (dhikrId: string) => {
    try {
      const response = await fetch(`/api/dhikrs/${dhikrId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleFavorite" }),
      });

      if (!response.ok) throw new Error("Failed to toggle favorite");

      const updatedDhikr = await response.json();

      setDhikrs((prev) =>
        prev.map((dhikr) =>
          dhikr.id === dhikrId
            ? { ...dhikr, isFavorite: updatedDhikr.isFavorite }
            : dhikr
        )
      );
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // If viewing instant tasbih counter
  if (isInstant) {
    return (
      <div className="min-h-screen bg-base-200">
        <div>
          <div className="max-w-2xl mx-auto">
            <DhikrCounter
              dhikrName="Instant Tasbih"
              targetCount={0}
              currentCount={instantCount}
              onIncrement={handleInstantIncrement}
              onReset={handleInstantReset}
              hasUnsavedChanges={false}
              isInstantMode={true}
            />
          </div>
        </div>
      </div>
    );
  }

  // If viewing counter for a specific dhikr (regular or temporary)
  if ((dhikrId && dhikrName) || (tempDhikr && tempDhikr.name)) {
    if (isCounterLoading) {
      return (
        <div className="min-h-screen bg-base-200">
          <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="text-base-content/70 animate-pulse">
              Loading your dhikr...
            </p>
          </div>
        </div>
      );
    }

    if (counterError) {
      return (
        <div className="min-h-screen bg-base-200">
          <div className="flex flex-col justify-center items-center min-h-screen p-4">
            <div className="max-w-md mx-auto">
              <div className="alert alert-error shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-bold">Oops!</h3>
                  <div className="text-xs">{counterError}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-base-200">
        <div>
          <div className="max-w-2xl mx-auto">
            <DhikrCounter
              dhikrName={dhikrName}
              targetCount={targetCount}
              currentCount={localCount}
              onIncrement={incrementCount}
              onReset={resetCount}
              onComplete={handleComplete}
              hasUnsavedChanges={hasUnsavedChanges}
              arabicText={arabicText || undefined}
              transliteration={transliteration || undefined}
              tempDhikr={
                tempDhikr
                  ? {
                      arabic: tempDhikr.arabic || undefined,
                      transliteration: tempDhikr.transliteration || undefined,
                      source: tempDhikr.source || undefined,
                    }
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    );
  }

  // Home screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/70 animate-pulse">
            Loading your dhikrs...
          </p>
        </div>
      </div>
    );
  }

  const favoritesDhikrs = dhikrs.filter((dhikr) => dhikr.isFavorite);

  return (
    <div className="min-h-screen bg-base-200">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 bg-base-100 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-bold text-base-content">
            Tasbihfy
          </h1>
          <ThemeToggle />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 pb-24">
          {/* Favorites Section */}
          {favoritesDhikrs.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-base-content">
                Favorites
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {favoritesDhikrs.map((dhikr) => (
                  <HomeDhikrCard
                    key={dhikr.id}
                    dhikr={dhikr}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Dhikrs or Empty State */}
          {dhikrs.length === 0 ? (
            <div className="text-center py-16 space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-primary">
                  Welcome to Tasbihfy
                </h3>
                <p className="text-base-content/70">
                  Start your spiritual journey by adding your first dhikr
                </p>
                <div className="alert alert-info max-w-sm mx-auto">
                  <SparklesIcon className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">
                      Start with the classics:
                    </div>
                    <div className="text-sm opacity-70">
                      "SubhanAllah" (33x), "Alhamdulillah" (33x), "Allahu Akbar"
                      (34x)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-base-content">
                {favoritesDhikrs.length > 0 ? "Other Dhikrs" : "All Dhikrs"}
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {(favoritesDhikrs.length > 0
                  ? dhikrs.filter((dhikr) => !dhikr.isFavorite)
                  : dhikrs
                ).map((dhikr) => (
                  <HomeDhikrCard
                    key={dhikr.id}
                    dhikr={dhikr}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-24 left-4 right-4 z-40 flex flex-col gap-3 bg-base-100/60 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-base-300/20">
          {/* Add New Dhikr Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary rounded-full py-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Tasbih
          </button>

          {/* Instant Tasbih Option */}
          <Link href="/?instant=true">
            <button className="btn btn-secondary rounded-full py-3 shadow-md hover:shadow-lg transition-all duration-200 w-full font-medium">
              Instant Tasbih
            </button>
          </Link>
        </div>

        <CreateDhikrModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
          title="Create New Dhikr"
        />
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={<HomePageLoading />}>
      <HomeContent />
    </Suspense>
  );
}
