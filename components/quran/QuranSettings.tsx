"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { 
  TRANSLATION_RESOURCES, 
  DEFAULT_QURAN_SETTINGS 
} from '@/lib/quran/constants';
import { QuranSettings as QuranSettingsType } from '@/lib/quran/types';

interface QuranSettingsProps {
  onClose: () => void;
}

export default function QuranSettings({ onClose }: QuranSettingsProps) {
  const [settings, setSettings] = useState<QuranSettingsType>(DEFAULT_QURAN_SETTINGS);

  useEffect(() => {
    // Load settings from localStorage
    try {
      const savedSettings = localStorage.getItem('quran_settings');
      if (savedSettings) {
        setSettings({ ...DEFAULT_QURAN_SETTINGS, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  const saveSettings = (newSettings: QuranSettingsType) => {
    try {
      localStorage.setItem('quran_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      
      // Trigger a settings update event for other components
      window.dispatchEvent(new CustomEvent('quranSettingsUpdate', { detail: newSettings }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleTranslationToggle = (languageKey: string, enabled: boolean) => {
    const currentLanguages = [...settings.translationLanguages];
    
    if (enabled && !currentLanguages.includes(languageKey)) {
      currentLanguages.push(languageKey);
    } else if (!enabled) {
      const index = currentLanguages.indexOf(languageKey);
      if (index > -1) {
        currentLanguages.splice(index, 1);
      }
    }

    saveSettings({ ...settings, translationLanguages: currentLanguages });
  };

  const handleFontSizeChange = (type: 'arabic' | 'translation', size: number) => {
    if (type === 'arabic') {
      saveSettings({ ...settings, arabicFontSize: size });
    } else {
      saveSettings({ ...settings, translationFontSize: size });
    }
  };

  const handleToggleOption = (option: keyof QuranSettingsType, value: boolean) => {
    saveSettings({ ...settings, [option]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-base-100 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-base-100 border-b border-base-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Quran Settings</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Translation Languages */}
          <div>
            <h3 className="font-medium text-base-content mb-3">Translations</h3>
            <div className="space-y-3">
              {Object.entries(TRANSLATION_RESOURCES).map(([key, resource]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{resource.name}</div>
                    <div className="text-xs text-base-content/60 capitalize">
                      {resource.language === 'english' ? 'English' : 'Urdu'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={settings.translationLanguages.includes(key)}
                    onChange={(e) => handleTranslationToggle(key, e.target.checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Content Options */}
          <div>
            <h3 className="font-medium text-base-content mb-3">Content</h3>
            <div className="space-y-3">
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
                  onChange={(e) => handleToggleOption('showTransliteration', e.target.checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Word by Word</div>
                  <div className="text-xs text-base-content/60">
                    Show individual word translations
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.showWordByWord}
                  onChange={(e) => handleToggleOption('showWordByWord', e.target.checked)}
                />
              </div>
            </div>
          </div>

          {/* Font Settings */}
          <div>
            <h3 className="font-medium text-base-content mb-3">Font Settings</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Arabic Font Size</label>
                  <span className="text-sm text-base-content/70">{settings.arabicFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="32"
                  value={settings.arabicFontSize}
                  onChange={(e) => handleFontSizeChange('arabic', parseInt(e.target.value))}
                  className="range range-primary range-sm"
                />
                <div className="flex justify-between text-xs text-base-content/60 mt-1">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Translation Font Size</label>
                  <span className="text-sm text-base-content/70">{settings.translationFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={settings.translationFontSize}
                  onChange={(e) => handleFontSizeChange('translation', parseInt(e.target.value))}
                  className="range range-primary range-sm"
                />
                <div className="flex justify-between text-xs text-base-content/60 mt-1">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div>
            <h3 className="font-medium text-base-content mb-3">Audio Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Reciter</label>
                <select
                  className="select select-bordered w-full"
                  value={settings.selectedReciter}
                  onChange={(e) => saveSettings({ ...settings, selectedReciter: e.target.value })}
                >
                  <option value="mishari-al-afasy">Mishari Rashid al-Afasy</option>
                  <option value="abdul-basit">Abdul Basit Abdul Samad</option>
                  <option value="sa-ad-al-ghamdi">Sa'ad Al-Ghamdi</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Auto Scroll</div>
                  <div className="text-xs text-base-content/60">
                    Automatically scroll to current verse
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.autoScroll}
                  onChange={(e) => handleToggleOption('autoScroll', e.target.checked)}
                />
              </div>
            </div>
          </div>

          {/* Reset Settings */}
          <div className="pt-4 border-t border-base-200">
            <button
              onClick={() => {
                localStorage.removeItem('quran_settings');
                setSettings(DEFAULT_QURAN_SETTINGS);
                window.dispatchEvent(new CustomEvent('quranSettingsUpdate', { detail: DEFAULT_QURAN_SETTINGS }));
              }}
              className="btn btn-outline btn-sm w-full"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}