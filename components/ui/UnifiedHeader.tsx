"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  AdjustmentsHorizontalIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon,
  HomeIcon,
  SparklesIcon,
  ClockIcon,
  BookOpenIcon,
  EllipsisHorizontalIcon,
  DocumentTextIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import UnifiedSettingsDrawer from "@/components/ui/UnifiedSettingsDrawer";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "next-themes";

interface UnifiedHeaderProps {
  title?: string;
  showSignIn?: boolean;
}

export default function UnifiedHeader({
  title = "Tasbihfy",
  showSignIn = false,
}: UnifiedHeaderProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { isScrollingDown, isAtTop } = useScrollDirection({ threshold: 5 });
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const { theme, setTheme } = useTheme();

  // Desktop navigation items (expanded)
  const desktopNavItems = [
    {
      name: "Home",
      path: "/",
      icon: HomeIcon,
    },
    {
      name: "Dhikr",
      path: "/dhikr",
      icon: SparklesIcon,
    },
    {
      name: "Prayer",
      path: "/prayer-times",
      icon: ClockIcon,
    },
    {
      name: "Quran",
      path: "/quran",
      icon: BookOpenIcon,
    },
    {
      name: "Duas",
      path: "/duas",
      icon: DocumentTextIcon,
    },
    {
      name: "99 Names",
      path: "/99-names",
      icon: HeartIcon,
    },
  ];

  // Mobile navigation items (with More)
  const mobileNavItems = [
    {
      name: "Home",
      path: "/",
      icon: HomeIcon,
    },
    {
      name: "Dhikr",
      path: "/dhikr",
      icon: SparklesIcon,
    },
    {
      name: "Prayer",
      path: "/prayer-times",
      icon: ClockIcon,
    },
    {
      name: "Quran",
      path: "/quran",
      icon: BookOpenIcon,
    },
    {
      name: "More",
      path: "/more",
      icon: EllipsisHorizontalIcon,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  // Determine if header should be visible
  const shouldHideHeader = isScrollingDown && !isAtTop;

  return (
    <>
      <div
        className={`
          fixed top-0 left-0 right-0 z-50 
          bg-base-100/90 backdrop-blur-md border-b border-base-200/20
          transition-transform duration-300 ease-in-out
          ${shouldHideHeader ? "-translate-y-full" : "translate-y-0"}
        `}
      >
        <div className="flex justify-between items-center p-4 sm:p-6">
          {/* Left: App Title */}
          <div className="flex items-center space-x-8">
            <h1 className="text-xl sm:text-2xl font-bold text-base-content">
              {title}
            </h1>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4">
              {desktopNavItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      active
                        ? "text-primary bg-primary/10"
                        : "text-base-content/70 hover:text-base-content hover:bg-base-200/50"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* Sign In Button for Guests */}
            {showSignIn && !user && (
              <Link href="/login">
                <button className="btn btn-primary btn-sm">Sign In</button>
              </Link>
            )}

            {/* Theme Toggle Button */}
            <button
              className="btn btn-ghost btn-sm btn-square"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* Quick Settings Button */}
            <button
              onClick={() => setShowSettingsDrawer(true)}
              className="btn btn-ghost btn-sm btn-square"
              title="Quick Settings"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>

            {/* Main Settings Button */}
            <Link href="/settings">
              <button
                className="btn btn-ghost btn-sm btn-square"
                title="Settings"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
            </Link>

          </div>
        </div>
      </div>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-[72px] sm:h-[88px]" />

      {/* Unified Settings Drawer */}
      <UnifiedSettingsDrawer
        isOpen={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        currentPath={pathname}
      />
    </>
  );
}
