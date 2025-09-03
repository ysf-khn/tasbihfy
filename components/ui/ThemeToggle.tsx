"use client";

import { useEffect, useState } from "react";
import { PaintBrushIcon } from "@heroicons/react/24/outline";

const themes = [
  { name: "light", displayName: "Light", type: "light", color: "#ffffff" },
  { name: "dark", displayName: "Dark", type: "dark", color: "#1f2937" },
  { name: "cupcake", displayName: "Cupcake", type: "light", color: "#fef3f2" },
  {
    name: "bumblebee",
    displayName: "Bumblebee",
    type: "light",
    color: "#fef3c7",
  },
  { name: "emerald", displayName: "Emerald", type: "light", color: "#d1fae5" },
  {
    name: "corporate",
    displayName: "Corporate",
    type: "light",
    color: "#f3f4f6",
  },
  {
    name: "synthwave",
    displayName: "Synthwave",
    type: "dark",
    color: "#1e1b4b",
  },
  { name: "retro", displayName: "Retro", type: "light", color: "#fef2f2" },
  {
    name: "cyberpunk",
    displayName: "Cyberpunk",
    type: "dark",
    color: "#fde047",
  },
  { name: "valentine", displayName: "Rose", type: "dark", color: "#e11d48" },
  {
    name: "halloween",
    displayName: "Halloween",
    type: "dark",
    color: "#f97316",
  },
  { name: "garden", displayName: "Garden", type: "light", color: "#dcfce7" },
  { name: "forest", displayName: "Forest", type: "dark", color: "#064e3b" },
  { name: "aqua", displayName: "Aqua", type: "dark", color: "#155e75" },
  { name: "lofi", displayName: "Lofi", type: "light", color: "#f5f5f4" },
  { name: "pastel", displayName: "Pastel", type: "light", color: "#fef7ff" },
  { name: "fantasy", displayName: "Fantasy", type: "light", color: "#fdf4ff" },
  {
    name: "wireframe",
    displayName: "Wireframe",
    type: "light",
    color: "#ffffff",
  },
  { name: "black", displayName: "Black", type: "dark", color: "#000000" },
  { name: "luxury", displayName: "Luxury", type: "dark", color: "#171717" },
  { name: "dracula", displayName: "Dracula", type: "dark", color: "#44475a" },
];

export default function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") || "light";
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const changeTheme = (themeName: string) => {
    setCurrentTheme(themeName);
    localStorage.setItem("theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);
  };

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="btn btn-ghost btn-circle">
        <PaintBrushIcon className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <PaintBrushIcon className="w-5 h-5" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow max-h-96 overflow-y-auto"
      >
        {themes.map((theme) => (
          <li key={theme.name}>
            <button
              className={`flex items-center gap-3 capitalize ${
                currentTheme === theme.name ? "active" : ""
              }`}
              onClick={() => changeTheme(theme.name)}
            >
              <div
                className="w-3 h-3 rounded-full border border-base-content/20"
                style={{ backgroundColor: theme.color }}
              />
              <span className="flex-1 text-left">{theme.displayName}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
