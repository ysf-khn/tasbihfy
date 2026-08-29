"use client";

import { useEffect, useState } from "react";
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  XMarkIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  ArrowPathRoundedSquareIcon,
} from "@heroicons/react/24/outline";
import { getRecitations } from "@/lib/quran/recitations-data";
import { Recitation } from "@/lib/quran/types";
import { useQuranSettings } from "@/hooks/useQuranSettings";
import { useBottomNavOffset } from "@/hooks/useBottomNavOffset";
import { useQuranAudioPlayer, RepeatMode } from "./QuranAudioContext";

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5];

const REPEAT_LABELS: Record<RepeatMode, string> = {
  off: "No repeat",
  verse: "Repeat verse",
  surah: "Repeat surah",
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

interface SurahAudioPlayerProps {
  surahName: string;
}

export default function SurahAudioPlayer({ surahName }: SurahAudioPlayerProps) {
  const {
    currentVerseNumber,
    trackCount,
    isPlaying,
    isLoading,
    error,
    currentTime,
    duration,
    playbackRate,
    repeatMode,
    hasPrevious,
    hasNext,
    isActive,
    toggle,
    next,
    previous,
    seekTo,
    setPlaybackRate,
    setRepeatMode,
    stop,
  } = useQuranAudioPlayer();

  const { settings, updateSettings } = useQuranSettings();
  // Re-measure once the bar is actually on screen; it mounts before that.
  const bottomNavOffset = useBottomNavOffset(isActive);
  const [expanded, setExpanded] = useState(false);
  const [recitations, setRecitations] = useState<Recitation[]>([]);

  useEffect(() => {
    if (!expanded || recitations.length > 0) return;
    getRecitations()
      .then(setRecitations)
      .catch(() => undefined);
  }, [expanded, recitations.length]);

  if (!isActive) return null;

  const cycleRepeat = () => {
    const order: RepeatMode[] = ["off", "verse", "surah"];
    setRepeatMode(order[(order.indexOf(repeatMode) + 1) % order.length]);
  };

  return (
    // Rests directly on top of BottomNav (z-50), using its measured height so
    // no part of the bar can end up behind it. With no nav (desktop) it sits on
    // the viewport floor and clears the home indicator itself.
    <div
      className="fixed inset-x-0 z-40 border-t border-base-300 bg-base-100/95 backdrop-blur-md"
      style={{
        bottom: bottomNavOffset,
        paddingBottom: bottomNavOffset === 0 ? "env(safe-area-inset-bottom)" : undefined,
      }}
    >
      {error && (
        <p className="bg-error/10 px-4 py-1.5 text-center text-xs text-error">{error}</p>
      )}

      {expanded && (
        <div className="border-b border-base-200 px-4 py-3">
          <div className="mx-auto flex max-w-4xl flex-col gap-3">
            <label className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-base-content/60">Reciter</span>
              <select
                className="select select-bordered select-sm flex-1"
                value={settings.selectedRecitationId || 7}
                onChange={(event) =>
                  updateSettings({ selectedRecitationId: Number(event.target.value) })
                }
              >
                {(recitations.length > 0
                  ? recitations
                  : [{ id: settings.selectedRecitationId || 7, reciter_name: "Loading…" }]
                ).map((recitation) => (
                  <option key={recitation.id} value={recitation.id}>
                    {recitation.reciter_name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-base-content/60">Speed</span>
              <div className="join">
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`btn join-item btn-sm ${
                      playbackRate === rate ? "btn-primary" : "btn-ghost"
                    }`}
                  >
                    {rate}×
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-base-content/60">Repeat</span>
              <button
                onClick={cycleRepeat}
                className={`btn btn-sm gap-2 ${
                  repeatMode === "off" ? "btn-ghost" : "btn-primary"
                }`}
              >
                {repeatMode === "verse" ? (
                  <ArrowPathIcon className="h-4 w-4" />
                ) : (
                  <ArrowPathRoundedSquareIcon className="h-4 w-4" />
                )}
                {REPEAT_LABELS[repeatMode]}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-2">
        {/* Seek bar */}
        <div className="flex items-center gap-2">
          <span className="w-9 shrink-0 text-[11px] tabular-nums text-base-content/60">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(event) => seekTo(Number(event.target.value))}
            aria-label="Seek within verse"
            className="range range-primary range-xs flex-1"
          />
          <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-base-content/60">
            {formatTime(duration)}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-3">
          <button
            onClick={() => setExpanded((value) => !value)}
            className="min-w-0 flex-1 text-left"
            aria-expanded={expanded}
            aria-label="Playback options"
          >
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-medium">
                {surahName} · Verse {currentVerseNumber}
              </p>
              <ChevronUpIcon
                className={`h-3.5 w-3.5 shrink-0 text-base-content/50 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </div>
            <p className="truncate text-xs text-base-content/60">
              {currentVerseNumber} of {trackCount}
              {playbackRate !== 1 && ` · ${playbackRate}×`}
              {repeatMode !== "off" && ` · ${REPEAT_LABELS[repeatMode]}`}
            </p>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={previous}
              disabled={!hasPrevious && currentTime <= 3}
              className="btn btn-ghost btn-sm btn-square"
              aria-label="Previous verse"
            >
              <BackwardIcon className="h-5 w-5" />
            </button>

            <button
              onClick={toggle}
              className="btn btn-primary btn-square"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : isPlaying ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={next}
              disabled={!hasNext}
              className="btn btn-ghost btn-sm btn-square"
              aria-label="Next verse"
            >
              <ForwardIcon className="h-5 w-5" />
            </button>

            <button
              onClick={stop}
              className="btn btn-ghost btn-sm btn-square"
              aria-label="Close player"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
