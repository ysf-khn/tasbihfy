"use client";

import { useArabicSettings } from "@/hooks/useArabicSettings";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

interface ArabicTextControlsProps {
  compact?: boolean;
}

export default function ArabicTextControls({ compact = false }: ArabicTextControlsProps) {
  const {
    toggleFont,
    increaseSize,
    decreaseSize,
    resetSize,
    getFontName,
    canDecrease,
    canIncrease
  } = useArabicSettings();

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={toggleFont}
          className="btn btn-ghost btn-sm"
          title={`Switch to ${getFontName() === 'Naskh' ? 'Nastaliq' : 'Naskh'} font`}
        >
          <span className="arabic text-sm">أ</span>
        </button>
        <div className="flex items-center">
          <button
            onClick={decreaseSize}
            disabled={!canDecrease}
            className="btn btn-ghost btn-sm btn-square"
            title="Decrease text size"
          >
            <MinusIcon className="w-3 h-3" />
          </button>
          <button
            onClick={resetSize}
            className="btn btn-ghost btn-sm"
            title="Reset text size"
          >
            <span className="text-sm font-bold">A</span>
          </button>
          <button
            onClick={increaseSize}
            disabled={!canIncrease}
            className="btn btn-ghost btn-sm btn-square"
            title="Increase text size"
          >
            <PlusIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-200">
      <div className="card-body p-4">
        <h3 className="text-lg font-semibold mb-4">Arabic Text Settings</h3>
        
        <div className="space-y-4">
          {/* Font Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Font Style</span>
            <button
              onClick={toggleFont}
              className="btn btn-outline btn-sm"
            >
              <span className="arabic text-base mr-2">أ</span>
              {getFontName()}
            </button>
          </div>

          {/* Size Controls */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Text Size</span>
            <div className="flex items-center gap-2">
              <button
                onClick={decreaseSize}
                disabled={!canDecrease}
                className="btn btn-ghost btn-sm btn-square"
                title="Decrease text size"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <button
                onClick={resetSize}
                className="btn btn-ghost btn-sm px-3"
                title="Reset text size"
              >
                <span className="font-bold">A</span>
              </button>
              <button
                onClick={increaseSize}
                disabled={!canIncrease}
                className="btn btn-ghost btn-sm btn-square"
                title="Increase text size"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}