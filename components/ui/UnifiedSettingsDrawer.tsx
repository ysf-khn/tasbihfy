"use client";

import { useArabicSettings } from "@/hooks/useArabicSettings";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useState, useEffect } from "react";
import {
  CogIcon,
  XMarkIcon,
  LanguageIcon,
  SpeakerWaveIcon,
  AdjustmentsHorizontalIcon,
  BookOpenIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import TranslationSelector from "@/components/quran/TranslationSelector";
import { useQuranSettings } from "@/hooks/useQuranSettings";
import { AUDIO_RECITERS } from "@/lib/quran/constants";
import { getRecitations } from "@/lib/quran/recitations-data";
import { Recitation } from "@/lib/quran/types";

interface UnifiedSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

type SettingsTab = "translations" | "display" | "audio";

export default function UnifiedSettingsDrawer({
  isOpen,
  onClose,
  currentPath,
}: UnifiedSettingsDrawerProps) {
  const {
    toggleFont,
    increaseSize,
    decreaseSize,
    resetSize,
    getFontName,
    canDecrease,
    canIncrease,
  } = useArabicSettings();

  const {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
    getArabicStyles,
    getTranslationStyles,
  } = useQuranSettings();

  const isDuasPage = currentPath.startsWith("/duas");
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    isDuasPage ? "display" : "translations"
  );
  const [availableRecitations, setAvailableRecitations] = useState<
    Recitation[]
  >([]);
  const [loadingRecitations, setLoadingRecitations] = useState(false);

  // Load available recitations
  useEffect(() => {
    if (isOpen && activeTab === "audio") {
      loadRecitations();
    }
  }, [isOpen, activeTab]);

  const loadRecitations = async () => {
    setLoadingRecitations(true);
    try {
      const recitations = await getRecitations();
      setAvailableRecitations(recitations);
    } catch (error) {
      console.error("Failed to load recitations:", error);
    } finally {
      setLoadingRecitations(false);
    }
  };

  // Handle font size changes
  const handleFontSizeChange = (
    type: "arabic" | "translation",
    size: number
  ) => {
    if (type === "arabic") {
      updateSettings({ arabicFontSize: size });
    } else {
      updateSettings({ translationFontSize: size });
    }
  };

  // Handle translation selection
  const handleTranslationSelectionChange = (translationIds: number[]) => {
    updateSettings({ selectedTranslations: translationIds });
  };

  // Handle toggle options
  const handleToggleOption = (
    option: keyof typeof settings,
    value: boolean
  ) => {
    updateSettings({ [option]: value });
  };

  const renderTranslationsTab = () => (
    <div className="space-y-6">
      <TranslationSelector
        selectedTranslationIds={settings.selectedTranslations as number[]}
        onSelectionChange={handleTranslationSelectionChange}
        maxSelections={5}
      />
    </div>
  );

  const renderDisplayTab = () => (
    <div className="space-y-6">
      {/* Arabic Text Controls for Duas pages */}
      {isDuasPage && (
        <div className="space-y-4">
          <h3 className="font-semibold text-base-content flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5" />
            Arabic Text
          </h3>

          {/* Font Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content/70">
              Font Style
            </label>
            <button
              onClick={toggleFont}
              className="btn btn-outline w-full justify-between"
            >
              <span>{getFontName()}</span>
              <span className="text-sm opacity-70">
                {getFontName() === "Naskh"
                  ? "Switch to Nastaliq"
                  : "Switch to Naskh"}
              </span>
            </button>
          </div>

          {/* Size Controls */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content/70">
              Text Size
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={decreaseSize}
                disabled={!canDecrease}
                className={`btn btn-square btn-sm ${
                  canDecrease ? "btn-outline" : "btn-disabled"
                }`}
              >
                <MinusIcon className="w-4 h-4" />
              </button>

              <button
                onClick={resetSize}
                className="btn btn-outline btn-sm flex-1"
              >
                Reset Size
              </button>

              <button
                onClick={increaseSize}
                disabled={!canIncrease}
                className={`btn btn-square btn-sm ${
                  canIncrease ? "btn-outline" : "btn-disabled"
                }`}
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Font Settings */}
      <div>
        <h3 className="font-medium text-base-content mb-4 flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
          Font Settings
        </h3>
        <div className="space-y-4">
          {/* Arabic Font Size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Arabic Font Size</label>
              <span className="text-sm text-base-content/70">
                {settings.arabicFontSize}px
              </span>
            </div>
            <input
              type="range"
              min="14"
              max="32"
              value={settings.arabicFontSize}
              onChange={(e) =>
                handleFontSizeChange("arabic", parseInt(e.target.value))
              }
              className="range range-primary range-sm w-full"
            />
            <div className="flex justify-between text-xs text-base-content/60 mt-1">
              <span>Small</span>
              <span>Large</span>
            </div>
            {/* Preview */}
            <div
              className="mt-3 p-3 bg-base-200 rounded-lg text-center font-arabic-naskh"
              style={getArabicStyles()}
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          </div>

          {/* Translation Font Size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                Translation Font Size
              </label>
              <span className="text-sm text-base-content/70">
                {settings.translationFontSize}px
              </span>
            </div>
            <input
              type="range"
              min="12"
              max="24"
              value={settings.translationFontSize}
              onChange={(e) =>
                handleFontSizeChange("translation", parseInt(e.target.value))
              }
              className="range range-primary range-sm w-full"
            />
            <div className="flex justify-between text-xs text-base-content/60 mt-1">
              <span>Small</span>
              <span>Large</span>
            </div>
            {/* Preview */}
            <div
              className="mt-3 p-3 bg-base-200 rounded-lg"
              style={getTranslationStyles()}
            >
              In the name of Allah, the Entirely Merciful, the Especially
              Merciful.
            </div>
          </div>
        </div>
      </div>

      {/* Content Options */}
      <div>
        <h3 className="font-medium text-base-content mb-4">Content Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Show Transliteration</div>
              <div className="text-xs text-base-content/60">
                Display Arabic text in Latin script
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={settings.showTransliteration}
              onChange={(e) =>
                handleToggleOption("showTransliteration", e.target.checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">
                Word by Word Translation
              </div>
              <div className="text-xs text-base-content/60">
                Show individual word translations
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={settings.showWordByWord}
              onChange={(e) =>
                handleToggleOption("showWordByWord", e.target.checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Show Verse Numbers</div>
              <div className="text-xs text-base-content/60">
                Display verse numbers beside text
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={settings.showVerseNumbers ?? true}
              onChange={(e) =>
                handleToggleOption("showVerseNumbers", e.target.checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAudioTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-base-content mb-4 flex items-center gap-2">
          <SpeakerWaveIcon className="w-5 h-5" />
          Audio Settings
        </h3>

        <div className="space-y-4">
          {/* Reciter Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Reciter</label>
            {loadingRecitations ? (
              <div className="flex items-center justify-center p-4">
                <div className="loading loading-spinner loading-md"></div>
                <span className="ml-2">Loading recitations...</span>
              </div>
            ) : (
              <select
                className="select select-bordered w-full"
                value={settings.selectedRecitationId || 7}
                onChange={(e) =>
                  updateSettings({
                    selectedRecitationId: parseInt(e.target.value),
                    selectedReciter: "mishari-al-afasy", // Keep legacy field for compatibility
                  })
                }
              >
                {availableRecitations.length > 0
                  ? availableRecitations.map((recitation) => (
                      <option key={recitation.id} value={recitation.id}>
                        {recitation.translated_name.name}
                        {recitation.style && ` (${recitation.style})`}
                      </option>
                    ))
                  : // Fallback to legacy reciters if API fails
                    Object.entries(AUDIO_RECITERS).map(([key, reciter]) => (
                      <option key={reciter.id} value={reciter.id}>
                        {reciter.name} - {reciter.arabic_name}
                      </option>
                    ))}
              </select>
            )}
          </div>

          {/* Audio Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Auto Scroll</div>
                <div className="text-xs text-base-content/60">
                  Automatically scroll to current verse during playback
                </div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.autoScroll}
                onChange={(e) =>
                  handleToggleOption("autoScroll", e.target.checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Repeat Verse</div>
                <div className="text-xs text-base-content/60">
                  Repeat each verse multiple times
                </div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.repeatVerse ?? false}
                onChange={(e) =>
                  handleToggleOption("repeatVerse", e.target.checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Auto Play Next</div>
                <div className="text-xs text-base-content/60">
                  Automatically play next verse
                </div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.autoPlayNext ?? true}
                onChange={(e) =>
                  handleToggleOption("autoPlayNext", e.target.checked)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2">
              <CogIcon className="w-5 h-5" />
              Settings
            </DrawerTitle>
            <DrawerClose asChild>
              <button className="btn btn-ghost btn-sm btn-square">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </DrawerClose>
          </div>

          {/* Tab Navigation */}
          <div className="tabs tabs-boxed mt-4">
            {!isDuasPage && (
              <button
                onClick={() => setActiveTab("translations")}
                className={`tab gap-2 ${
                  activeTab === "translations" ? "tab-active" : ""
                }`}
              >
                <LanguageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Translations</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab("display")}
              className={`tab gap-2 ${
                activeTab === "display" ? "tab-active" : ""
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Display</span>
            </button>
            {!isDuasPage && (
              <button
                onClick={() => setActiveTab("audio")}
                className={`tab gap-2 ${
                  activeTab === "audio" ? "tab-active" : ""
                }`}
              >
                <SpeakerWaveIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Audio</span>
              </button>
            )}
          </div>
        </DrawerHeader>

        {/* Content */}
        <div className="px-4 pb-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading loading-spinner loading-md text-primary"></div>
            </div>
          ) : (
            <>
              {activeTab === "translations" && renderTranslationsTab()}
              {activeTab === "display" && renderDisplayTab()}
              {activeTab === "audio" && renderAudioTab()}
            </>
          )}
        </div>

        <DrawerFooter>
          <div className="flex gap-2">
            <button
              onClick={resetSettings}
              className="btn btn-outline btn-sm flex-1"
            >
              Reset to Default
            </button>
            <DrawerClose asChild>
              <button className="btn btn-primary btn-sm flex-1">Done</button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
