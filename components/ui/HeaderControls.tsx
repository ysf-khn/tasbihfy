"use client";

import { useArabicSettings } from "@/hooks/useArabicSettings";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function HeaderControls() {
  const {
    toggleFont,
    increaseSize,
    decreaseSize,
    resetSize,
    getFontName,
    canDecrease,
    canIncrease,
  } = useArabicSettings();

  return (
    <div className="flex items-center gap-2">
      {/* Font Toggle */}
      <button
        onClick={toggleFont}
        className="flex items-center gap-1.5 px-3 py-1.5 
                   bg-base-200/50 hover:bg-base-200/70 
                   rounded-full transition-all text-sm font-medium
                   border border-base-300/20"
        title={`Switch to ${
          getFontName() === "Naskh" ? "Nastaliq" : "Naskh"
        } font`}
      >
        <span>{getFontName()}</span>
      </button>

      {/* Size Controls - Segmented */}
      <div className="flex items-center bg-base-200/50 rounded-full border border-base-300/20 overflow-hidden">
        <button
          onClick={decreaseSize}
          disabled={!canDecrease}
          className={`px-2.5 py-1.5 transition-all
                     ${
                       canDecrease
                         ? "hover:bg-base-200/70 text-base-content"
                         : "text-base-content/30 cursor-not-allowed"
                     }`}
          title="Decrease text size"
        >
          <MinusIcon className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={resetSize}
          className="px-3 py-1.5 text-sm font-bold hover:bg-base-200/70 transition-all border-x border-base-300/20"
          title="Reset text size"
        >
          A
        </button>

        <button
          onClick={increaseSize}
          disabled={!canIncrease}
          className={`px-2.5 py-1.5 transition-all
                     ${
                       canIncrease
                         ? "hover:bg-base-200/70 text-base-content"
                         : "text-base-content/30 cursor-not-allowed"
                     }`}
          title="Increase text size"
        >
          <PlusIcon className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
