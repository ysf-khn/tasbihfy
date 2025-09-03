"use client";

import { CogIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { useArabicSettings } from "@/hooks/useArabicSettings";

interface QuranNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsClick: () => void;
}

export default function QuranNavigationDrawer({
  isOpen,
  onClose,
  onSettingsClick,
}: QuranNavigationDrawerProps) {
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
    <Drawer open={isOpen} onOpenChange={onClose} direction="left">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation & Controls</DrawerTitle>
        </DrawerHeader>
        
        <div className="flex flex-col gap-4 p-4">
          {/* Font Controls Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-base-content/70">Text Settings</h3>
            
            {/* Font Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Font Style</span>
              <button
                onClick={toggleFont}
                className="btn btn-outline btn-sm"
                title={`Switch to ${
                  getFontName() === "Naskh" ? "Nastaliq" : "Naskh"
                } font`}
              >
                {getFontName()}
              </button>
            </div>

            {/* Size Controls */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Text Size</span>
              <div className="flex items-center bg-base-200 rounded-lg border border-base-300/20 overflow-hidden">
                <button
                  onClick={decreaseSize}
                  disabled={!canDecrease}
                  className={`px-3 py-2 transition-all
                             ${
                               canDecrease
                                 ? "hover:bg-base-300 text-base-content"
                                 : "text-base-content/30 cursor-not-allowed"
                             }`}
                  title="Decrease text size"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={resetSize}
                  className="px-4 py-2 text-sm font-bold hover:bg-base-300 transition-all border-x border-base-300/20"
                  title="Reset text size"
                >
                  A
                </button>

                <button
                  onClick={increaseSize}
                  disabled={!canIncrease}
                  className={`px-3 py-2 transition-all
                             ${
                               canIncrease
                                 ? "hover:bg-base-300 text-base-content"
                                 : "text-base-content/30 cursor-not-allowed"
                             }`}
                  title="Increase text size"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="divider"></div>

          {/* Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-base-content/70">Options</h3>
            
            <button
              onClick={() => {
                onSettingsClick();
                onClose();
              }}
              className="btn btn-outline btn-block justify-start"
            >
              <CogIcon className="w-4 h-4" />
              Quran Settings
            </button>
          </div>
        </div>

        <div className="mt-auto p-4">
          <DrawerClose asChild>
            <button className="btn btn-outline btn-block">Close</button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}