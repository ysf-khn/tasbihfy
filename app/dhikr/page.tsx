"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { useConfetti } from "@/components/ui/Confetti";
import DhikrCounter from "@/components/counter/DhikrCounter";
import hisnulMuslim from "@/data/hisnul-muslim-complete.json";
import HomeDhikrCard from "@/components/dhikr/HomeDhikrCard";
import CreateDhikrModal, { commonDhikrs } from "@/components/dhikr/CreateDhikrModal";
import islamicTexts from "@/data/islamic-texts.json";
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import NightlyRecitationsCard from "@/components/nightly/NightlyRecitationsCard";
import type { Dhikr, DhikrSession } from "@/types/models";
import { GuestStorage } from "@/lib/guestStorage";
import { PlusIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface DhikrWithSession extends Dhikr {
  sessions: DhikrSession[];
}

// Loading fallback component
function DhikrPageLoading() {
  return (
    <div className="min-h-screen bg-base-200">
      <UnifiedHeader showSignIn={true} />
      <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-base-content/70 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

// Component that uses useSearchParams
function DhikrContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
      if (!user) {
        // Guest mode: load from localStorage
        const guestDhikrs = GuestStorage.getDhikrs();
        const dhikrsWithSessions = guestDhikrs.map((guestDhikr) => ({
          id: guestDhikr.id,
          name: guestDhikr.name,
          targetCount: guestDhikr.targetCount,
          arabicText: guestDhikr.arabicText,
          transliteration: guestDhikr.transliteration,
          userId: "",
          isFavorite: false, // Guests don't have favorites yet
          createdAt: new Date(guestDhikr.createdAt),
          updatedAt: new Date(guestDhikr.createdAt),
          sessions: [], // Guest sessions are handled separately
        })) as DhikrWithSession[];

        setDhikrs(dhikrsWithSessions);
        setIsLoading(false);
        return;
      }

      // Authenticated user: fetch from database
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
    // Fetch dhikrs for both authenticated users and guests
    fetchDhikrs();
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
  }): Promise<string> => {
    try {
      if (!user) {
        // Guest mode: save to localStorage
        const newDhikr = GuestStorage.addDhikr({
          name: data.name,
          targetCount: data.targetCount,
          arabicText: data.arabic,
          transliteration: data.transliteration,
        });

        // Refresh the dhikrs list for guests
        await fetchDhikrs();
        setIsModalOpen(false);
        return newDhikr.id;
      }

      // Authenticated user: save to database
      const response = await fetch("/api/dhikrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create dhikr");

      const createdDhikr = await response.json();
      await fetchDhikrs();
      setIsModalOpen(false);
      return createdDhikr.id;
    } catch (err) {
      console.error("Error creating dhikr:", err);
      throw err;
    }
  };

  const handleToggleFavorite = async (dhikrId: string) => {
    try {
      if (!user) {
        // Guest mode: favorites not supported yet
        return;
      }

      // Authenticated user: toggle in database
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

  // Handle selecting a preset dhikr - creates and navigates to counter
  const handlePresetSelect = async (preset: typeof commonDhikrs[number]) => {
    try {
      // Resolve textRef to get full Arabic text if needed
      let arabic = preset.arabic;
      let transliteration = preset.transliteration;

      if ('textRef' in preset && preset.textRef) {
        const fullText = islamicTexts[preset.textRef as keyof typeof islamicTexts];
        if (fullText) {
          arabic = fullText.arabic;
          transliteration = fullText.transliteration;
        }
      }

      const newId = await handleCreate({
        name: preset.name,
        targetCount: preset.targetCount,
        arabic,
        transliteration,
      });

      router.push(`/dhikr?dhikr=${newId}`);
    } catch (err) {
      console.error("Error creating preset dhikr:", err);
    }
  };

  // If viewing instant tasbih counter
  if (isInstant) {
    return (
      <div className="min-h-screen bg-base-200">
        <UnifiedHeader showSignIn={true} />
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
          <UnifiedHeader showSignIn={true} />
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
          <UnifiedHeader showSignIn={true} />
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
        <UnifiedHeader showSignIn={true} />
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

  // Dhikr management screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200">
        <UnifiedHeader showSignIn={true} />
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
      <UnifiedHeader showSignIn={true} />
      <div>
        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 pb-48">
          {/* Nightly Recitations Card - Shows only after sunset */}
          <NightlyRecitationsCard />

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
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-base-content">Start Your Tasbih</h3>
                <p className="text-base-content/70 text-sm">Tap a dhikr to add it and start counting</p>
              </div>

              {!user && (
                <div className="alert alert-warning">
                  <SparklesIcon className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">Try as a guest!</div>
                    <div className="text-xs opacity-70">
                      Your dhikrs will be saved locally. Sign in to sync across devices.
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Tasbihat - expanded by default */}
              <div className="collapse collapse-arrow bg-base-100 rounded-xl">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title font-semibold text-base-content">
                  Basic Tasbihat
                </div>
                <div className="collapse-content">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {commonDhikrs.slice(0, 3).concat(commonDhikrs.slice(5, 7)).map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => handlePresetSelect(preset)}
                        className="card bg-base-100 border border-base-300 hover:border-primary hover:bg-primary/5 p-4 text-left transition-all active:scale-[0.98] group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base-content truncate">{preset.name}</p>
                            <p className="text-xs text-base-content/60 mt-0.5">{preset.targetCount}x target</p>
                          </div>
                          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-content flex items-center justify-center transition-colors">
                            <PlusIcon className="w-4 h-4 text-primary group-hover:text-primary-content" />
                          </div>
                        </div>
                        {preset.arabic && (
                          <p className="font-arabic text-lg text-base-content/80 mt-2 text-right">{preset.arabic}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Longer Dhikrs */}
              <div className="collapse collapse-arrow bg-base-100 rounded-xl">
                <input type="checkbox" />
                <div className="collapse-title font-semibold text-base-content">
                  Longer Dhikrs
                </div>
                <div className="collapse-content">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {[commonDhikrs[3], commonDhikrs[4], commonDhikrs[7], commonDhikrs[8], commonDhikrs[10]].map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => handlePresetSelect(preset)}
                        className="card bg-base-100 border border-base-300 hover:border-primary hover:bg-primary/5 p-4 text-left transition-all active:scale-[0.98] group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base-content truncate">{preset.name}</p>
                            <p className="text-xs text-base-content/60 mt-0.5">{preset.targetCount}x target</p>
                          </div>
                          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-content flex items-center justify-center transition-colors">
                            <PlusIcon className="w-4 h-4 text-primary group-hover:text-primary-content" />
                          </div>
                        </div>
                        {preset.arabic && (
                          <p className="font-arabic text-lg text-base-content/80 mt-2 text-right">{preset.arabic}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Surahs & Duas */}
              <div className="collapse collapse-arrow bg-base-100 rounded-xl">
                <input type="checkbox" />
                <div className="collapse-title font-semibold text-base-content">
                  Surahs & Duas
                </div>
                <div className="collapse-content">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {[commonDhikrs[9], commonDhikrs[11], commonDhikrs[12], commonDhikrs[13], commonDhikrs[14], commonDhikrs[15], commonDhikrs[16]].map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => handlePresetSelect(preset)}
                        className="card bg-base-100 border border-base-300 hover:border-primary hover:bg-primary/5 p-4 text-left transition-all active:scale-[0.98] group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base-content truncate">{preset.name}</p>
                            <p className="text-xs text-base-content/60 mt-0.5">{preset.targetCount}x target</p>
                          </div>
                          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-content flex items-center justify-center transition-colors">
                            <PlusIcon className="w-4 h-4 text-primary group-hover:text-primary-content" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom dhikr option */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-outline w-full"
              >
                <PlusIcon className="w-5 h-5" />
                Create Custom Tasbih
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User's Dhikrs */}
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

              {/* Add More Section */}
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-base-content">Add More</h2>

                {/* Basic Tasbihat */}
                <div className="collapse collapse-arrow bg-base-100 rounded-xl">
                  <input type="checkbox" />
                  <div className="collapse-title font-semibold text-base-content">
                    Basic Tasbihat
                  </div>
                  <div className="collapse-content">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {commonDhikrs.slice(0, 3).concat(commonDhikrs.slice(5, 7)).map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => handlePresetSelect(preset)}
                          className="card bg-base-100 border border-base-300 hover:border-primary hover:bg-primary/5 p-4 text-left transition-all active:scale-[0.98] group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-base-content truncate">{preset.name}</p>
                              <p className="text-xs text-base-content/60 mt-0.5">{preset.targetCount}x target</p>
                            </div>
                            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-content flex items-center justify-center transition-colors">
                              <PlusIcon className="w-4 h-4 text-primary group-hover:text-primary-content" />
                            </div>
                          </div>
                          {preset.arabic && (
                            <p className="font-arabic text-lg text-base-content/80 mt-2 text-right">{preset.arabic}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Longer Dhikrs */}
                <div className="collapse collapse-arrow bg-base-100 rounded-xl">
                  <input type="checkbox" />
                  <div className="collapse-title font-semibold text-base-content">
                    Longer Dhikrs
                  </div>
                  <div className="collapse-content">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {[commonDhikrs[3], commonDhikrs[4], commonDhikrs[7], commonDhikrs[8], commonDhikrs[10]].map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => handlePresetSelect(preset)}
                          className="card bg-base-100 border border-base-300 hover:border-primary hover:bg-primary/5 p-4 text-left transition-all active:scale-[0.98] group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-base-content truncate">{preset.name}</p>
                              <p className="text-xs text-base-content/60 mt-0.5">{preset.targetCount}x target</p>
                            </div>
                            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-content flex items-center justify-center transition-colors">
                              <PlusIcon className="w-4 h-4 text-primary group-hover:text-primary-content" />
                            </div>
                          </div>
                          {preset.arabic && (
                            <p className="font-arabic text-lg text-base-content/80 mt-2 text-right">{preset.arabic}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Surahs & Duas */}
                <div className="collapse collapse-arrow bg-base-100 rounded-xl">
                  <input type="checkbox" />
                  <div className="collapse-title font-semibold text-base-content">
                    Surahs & Duas
                  </div>
                  <div className="collapse-content">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {[commonDhikrs[9], commonDhikrs[11], commonDhikrs[12], commonDhikrs[13], commonDhikrs[14], commonDhikrs[15], commonDhikrs[16]].map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => handlePresetSelect(preset)}
                          className="card bg-base-100 border border-base-300 hover:border-primary hover:bg-primary/5 p-4 text-left transition-all active:scale-[0.98] group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-base-content truncate">{preset.name}</p>
                              <p className="text-xs text-base-content/60 mt-0.5">{preset.targetCount}x target</p>
                            </div>
                            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-content flex items-center justify-center transition-colors">
                              <PlusIcon className="w-4 h-4 text-primary group-hover:text-primary-content" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Instant Tasbih Button - only show when user has dhikrs */}
        {dhikrs.length > 0 && (
          <div className="fixed bottom-24 left-4 right-4 z-40">
            <Link href="/dhikr?instant=true">
              <button className="btn btn-secondary rounded-full py-3 shadow-lg hover:shadow-xl transition-all duration-200 w-full font-medium">
                Instant Tasbih
              </button>
            </Link>
          </div>
        )}

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
export default function DhikrPage() {
  return (
    <Suspense fallback={<DhikrPageLoading />}>
      <DhikrContent />
    </Suspense>
  );
}