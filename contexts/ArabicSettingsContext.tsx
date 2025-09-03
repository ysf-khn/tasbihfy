"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ArabicFont = "naskh" | "nastaliq";
export type ArabicSize = "sm" | "md" | "lg" | "xl" | "2xl";

interface ArabicSettings {
  font: ArabicFont;
  size: ArabicSize;
}

interface ArabicSettingsContextType {
  settings: ArabicSettings;
  toggleFont: () => void;
  increaseSize: () => void;
  decreaseSize: () => void;
  resetSize: () => void;
  getArabicClasses: () => string;
  getFontName: () => string;
  canDecrease: boolean;
  canIncrease: boolean;
}

const defaultSettings: ArabicSettings = {
  font: "naskh",
  size: "lg"
};

const sizeClasses: Record<ArabicSize, string> = {
  sm: "text-lg",
  md: "text-xl", 
  lg: "text-2xl",
  xl: "text-3xl",
  "2xl": "text-4xl"
};

const fontClasses: Record<ArabicFont, string> = {
  naskh: "arabic-naskh",
  nastaliq: "arabic-nastaliq"
};

const ArabicSettingsContext = createContext<ArabicSettingsContextType | undefined>(undefined);

interface ArabicSettingsProviderProps {
  children: ReactNode;
}

export function ArabicSettingsProvider({ children }: ArabicSettingsProviderProps) {
  const [settings, setSettings] = useState<ArabicSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("arabic-text-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.warn("Failed to load Arabic settings:", error);
    }
  }, []);

  // Save settings to localStorage whenever they change (only after mounted)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("arabic-text-settings", JSON.stringify(settings));
    }
  }, [settings, mounted]);

  const toggleFont = () => {
    setSettings(prev => ({
      ...prev,
      font: prev.font === "naskh" ? "nastaliq" : "naskh"
    }));
  };

  const increaseSize = () => {
    const sizes: ArabicSize[] = ["sm", "md", "lg", "xl", "2xl"];
    const currentIndex = sizes.indexOf(settings.size);
    if (currentIndex < sizes.length - 1) {
      setSettings(prev => ({
        ...prev,
        size: sizes[currentIndex + 1]
      }));
    }
  };

  const decreaseSize = () => {
    const sizes: ArabicSize[] = ["sm", "md", "lg", "xl", "2xl"];
    const currentIndex = sizes.indexOf(settings.size);
    if (currentIndex > 0) {
      setSettings(prev => ({
        ...prev,
        size: sizes[currentIndex - 1]
      }));
    }
  };

  const resetSize = () => {
    setSettings(prev => ({
      ...prev,
      size: "lg"
    }));
  };

  const getArabicClasses = () => {
    return `arabic ${fontClasses[settings.font]} ${sizeClasses[settings.size]}`;
  };

  const getFontName = () => {
    return settings.font === "naskh" ? "Naskh" : "Nastaliq";
  };

  const canDecrease = settings.size !== "sm";
  const canIncrease = settings.size !== "2xl";

  const value: ArabicSettingsContextType = {
    settings,
    toggleFont,
    increaseSize,
    decreaseSize,
    resetSize,
    getArabicClasses,
    getFontName,
    canDecrease,
    canIncrease
  };

  return (
    <ArabicSettingsContext.Provider value={value}>
      {children}
    </ArabicSettingsContext.Provider>
  );
}

export function useArabicSettings(): ArabicSettingsContextType {
  const context = useContext(ArabicSettingsContext);
  if (context === undefined) {
    throw new Error('useArabicSettings must be used within an ArabicSettingsProvider');
  }
  return context;
}