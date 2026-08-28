"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "vibration_enabled";
const CHANGE_EVENT = "vibration-setting-changed";

function readStoredValue(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

// Shared vibration preference, synced across components via a custom event
export function useVibrationSetting() {
  const [isVibrationEnabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(readStoredValue());
    const handleChange = () => setEnabled(readStoredValue());
    window.addEventListener(CHANGE_EVENT, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  const setVibrationEnabled = useCallback((value: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // localStorage unavailable — keep in-memory state only
    }
    setEnabled(value);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }, []);

  return { isVibrationEnabled, setVibrationEnabled };
}
