"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface QuranPageHeaderProps {
  onMenuToggle: () => void;
}

export default function QuranPageHeader({ onMenuToggle }: QuranPageHeaderProps) {
  return (
    <div className="sticky top-0 z-40 flex justify-between items-center p-4 sm:p-6 bg-base-100/80 backdrop-blur-md border-b border-base-200/20">
      {/* Drawer Toggle */}
      <button
        onClick={onMenuToggle}
        className="btn btn-ghost btn-sm btn-square"
        title="Open menu"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      {/* Theme Toggle */}
      <ThemeToggle />
    </div>
  );
}