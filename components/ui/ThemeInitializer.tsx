"use client";

import { useEffect } from "react";
import { themeChange } from "theme-change";

export default function ThemeInitializer() {
  useEffect(() => {
    themeChange(false);
    // 👆 false parameter is required for react project
  }, []);

  return null;
}