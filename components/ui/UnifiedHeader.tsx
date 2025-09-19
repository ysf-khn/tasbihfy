"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  AdjustmentsHorizontalIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";
import UnifiedSettingsDrawer from "@/components/ui/UnifiedSettingsDrawer";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useAuth } from "@/components/auth/AuthProvider";

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
          <h1 className="text-xl sm:text-2xl font-bold text-base-content">
            {title}
          </h1>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* Sign In Button for Guests */}
            {showSignIn && !user && (
              <Link href="/login">
                <button className="btn btn-primary btn-sm">Sign In</button>
              </Link>
            )}

            {/* Theme Toggle Button */}
            <label className="btn btn-ghost btn-sm btn-square swap swap-rotate" title="Toggle theme">
              <input
                type="checkbox"
                data-toggle-theme="dark,light"
                data-act-class="swap-active"
              />
              {/* sun icon */}
              <SunIcon className="swap-on w-5 h-5" />
              {/* moon icon */}
              <MoonIcon className="swap-off w-5 h-5" />
            </label>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsDrawer(true)}
              className="btn btn-ghost btn-sm btn-square"
              title="Settings"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>

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
