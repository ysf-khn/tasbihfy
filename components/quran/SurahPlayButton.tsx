"use client";

import { PlayIcon, PauseIcon } from "@heroicons/react/24/outline";
import { useAudioAutoScroll } from "@/hooks/useAudioAutoScroll";
import { useQuranAudioPlayer } from "./QuranAudioContext";

/** Toolbar control that starts the surah from verse 1, or pauses/resumes. */
export function SurahPlayButton() {
  const { toggle, isPlaying, trackCount } = useQuranAudioPlayer();

  return (
    <button
      onClick={toggle}
      disabled={trackCount === 0}
      className={`btn btn-sm ${isPlaying ? "btn-primary" : "btn-ghost"}`}
      title={isPlaying ? "Pause recitation" : "Play recitation"}
    >
      {isPlaying ? (
        <PauseIcon className="w-4 h-4" />
      ) : (
        <PlayIcon className="w-4 h-4" />
      )}
      <span className="hidden sm:inline ml-2">{isPlaying ? "Pause" : "Play"}</span>
    </button>
  );
}

/**
 * Follows the recitation down the page and reserves room for the player bar so
 * the last verse can't hide behind it. Rendered as a sibling of the verse list
 * because the hook can only be called inside the provider.
 */
export function AudioFollower() {
  const { currentVerseNumber, isActive } = useQuranAudioPlayer();
  useAudioAutoScroll(currentVerseNumber, isActive);

  if (!isActive) return null;
  // Clears the player bar (~145px) stacked on the bottom nav (~81px).
  return <div aria-hidden="true" className="h-48" />;
}
