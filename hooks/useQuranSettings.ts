import { useState, useEffect } from 'react';
import { QuranSettings } from '@/lib/quran/types';
import { DEFAULT_QURAN_SETTINGS } from '@/lib/quran/constants';
import { getDefaultTranslations, getTranslationById } from '@/lib/quran/translations-data';

export function useQuranSettings() {
  const [settings, setSettings] = useState<QuranSettings>(DEFAULT_QURAN_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    
    // Listen for settings updates from other components
    const handleSettingsUpdate = (event: CustomEvent<QuranSettings>) => {
      setSettings(event.detail);
    };

    window.addEventListener('quranSettingsUpdate', handleSettingsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('quranSettingsUpdate', handleSettingsUpdate as EventListener);
    };
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const savedSettings = localStorage.getItem('quran_settings');
      let finalSettings: QuranSettings = { ...DEFAULT_QURAN_SETTINGS };
      
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        finalSettings = { ...DEFAULT_QURAN_SETTINGS, ...parsed };
      }
      
      // Ensure selectedTranslations has valid defaults if empty
      if (!finalSettings.selectedTranslations || finalSettings.selectedTranslations.length === 0) {
        const defaults = getDefaultTranslations();
        const defaultIds = Object.values(defaults).filter((id): id is number => id !== null);
        finalSettings = {
          ...finalSettings,
          selectedTranslations: defaultIds.slice(0, 2) // Start with 2 default translations
        };
      }
      
      setSettings(finalSettings);
    } catch (error) {
      console.error('Failed to load Quran settings:', error);
      setSettings(DEFAULT_QURAN_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (newSettings: Partial<QuranSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      localStorage.setItem('quran_settings', JSON.stringify(updatedSettings));
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('quranSettingsUpdate', { detail: updatedSettings }));
    } catch (error) {
      console.error('Failed to save Quran settings:', error);
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_QURAN_SETTINGS);
    
    try {
      localStorage.removeItem('quran_settings');
      window.dispatchEvent(new CustomEvent('quranSettingsUpdate', { detail: DEFAULT_QURAN_SETTINGS }));
    } catch (error) {
      console.error('Failed to reset Quran settings:', error);
    }
  };

  // Helper functions for common settings
  const getArabicStyles = () => ({
    fontSize: `${settings.arabicFontSize}px`,
    lineHeight: 1.8,
  });

  const getTranslationStyles = () => ({
    fontSize: `${settings.translationFontSize}px`,
    lineHeight: 1.6,
  });

  const shouldShowTransliteration = () => settings.showTransliteration;
  const shouldShowWordByWord = () => settings.showWordByWord;
  const shouldAutoScroll = () => settings.autoScroll;
  const shouldShowVerseNumbers = () => settings.showVerseNumbers ?? true;
  const shouldRepeatVerse = () => settings.repeatVerse ?? false;
  const shouldAutoPlayNext = () => settings.autoPlayNext ?? true;

  // Get selected translations with details
  const getSelectedTranslations = () => {
    return (settings.selectedTranslations || []).map((id) => {
      const translation = getTranslationById(id);
      return translation ? { ...translation, id } : null;
    }).filter(Boolean);
  };

  // Get translation IDs for API calls
  const getSelectedTranslationIds = () => settings.selectedTranslations || [];

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
    getArabicStyles,
    getTranslationStyles,
    shouldShowTransliteration,
    shouldShowWordByWord,
    shouldAutoScroll,
    shouldShowVerseNumbers,
    shouldRepeatVerse,
    shouldAutoPlayNext,
    getSelectedTranslations,
    getSelectedTranslationIds,
  };
}