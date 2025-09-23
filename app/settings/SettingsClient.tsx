"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { signOut } from "@/lib/auth-client";

// Declare gtag type for Google Analytics tracking
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
import UnifiedHeader from "@/components/ui/UnifiedHeader";
import ArabicTextControls from "@/components/ui/ArabicTextControls";
import ReminderSettings from "@/components/notifications/ReminderSettings";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ChartBarIcon,
  BellIcon,
  InformationCircleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

// Type definitions for settings items
type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type LinkSettingsItem = {
  type: "link";
  icon: IconType;
  label: string;
  href: string;
  subtitle?: string;
  hasChevron: boolean;
};

type ButtonSettingsItem = {
  type: "button";
  icon: IconType;
  label: string;
  onClick: () => void;
  hasChevron: boolean;
};

type ToggleSettingsItem = {
  type: "toggle";
  icon: IconType;
  label: string;
  hasToggle: true;
  toggleValue: boolean;
  onToggle: (value: boolean) => void;
};

type SettingsItem = LinkSettingsItem | ButtonSettingsItem | ToggleSettingsItem;

type SettingsSection = {
  title: string;
  items: SettingsItem[];
};

export default function SettingsClient() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    // Track user logout
    window.gtag?.("event", "user_logout", {
      event_category: "Authentication",
      event_label: "User logged out",
    });
    await signOut();
  };

  // Auth-specific settings sections
  const authSettingSections: SettingsSection[] = user
    ? [
        {
          title: "GENERAL",
          items: [
            {
              type: "button",
              icon: HeartIcon,
              label: "Favorites",
              hasChevron: true,
              onClick: () => console.log("Favorites clicked"),
            },
            {
              type: "button",
              icon: ChartBarIcon,
              label: "Daily Goal",
              hasChevron: true,
              onClick: () => console.log("Daily Goal clicked"),
            },
          ],
        },
      ]
    : [];

  const settingSections: SettingsSection[] = [
    ...authSettingSections,
    {
      title: "ABOUT",
      items: [
        {
          type: "link",
          icon: InformationCircleIcon,
          label: "About Tasbihfy",
          hasChevron: true,
          href: "/about",
        },
      ],
    },
    {
      title: "SUPPORT",
      items: [
        {
          type: "link",
          icon: EnvelopeIcon,
          label: "Contact Developer",
          subtitle: "yusufmohd72@gmail.com",
          hasChevron: true,
          href: "mailto:yusufmohd72@gmail.com",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <UnifiedHeader title="Settings" showSignIn={true} />
      <div>
        {/* Content */}
        <div className="p-6 space-y-8">
          <h2 className="text-2xl font-bold text-base-content">Settings</h2>

          {/* Arabic Text Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider px-2">
              ARABIC TEXT
            </h3>
            <ArabicTextControls />
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider px-2">
              NOTIFICATIONS
            </h3>
            <ReminderSettings user={user} />
          </div>

          {settingSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              {/* Section Header */}
              <h2 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider px-2">
                {section.title}
              </h2>

              {/* Section Items */}
              <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    {item.type === "link" ? (
                      <Link href={item.href} className="block">
                        <div className="w-full flex items-center justify-between p-6 hover:bg-base-200 transition-colors">
                          {/* Left side: Icon and Label */}
                          <div className="flex items-center gap-4">
                            <item.icon className="w-6 h-6 text-base-content/70" />
                            <div>
                              <span className="text-base font-medium text-base-content">
                                {item.label}
                              </span>
                              {item.subtitle && (
                                <div className="text-sm text-base-content/60">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right side: Chevron */}
                          {item.hasChevron && (
                            <ChevronRightIcon className="w-5 h-5 text-base-content/40" />
                          )}
                        </div>
                      </Link>
                    ) : item.type === "toggle" ? (
                      <div className="w-full flex items-center justify-between p-6">
                        {/* Left side: Icon and Label */}
                        <div className="flex items-center gap-4">
                          <item.icon className="w-6 h-6 text-base-content/70" />
                          <span className="text-base font-medium text-base-content">
                            {item.label}
                          </span>
                        </div>

                        {/* Right side: Toggle */}
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={item.toggleValue}
                          onChange={(e) => item.onToggle(e.target.checked)}
                        />
                      </div>
                    ) : (
                      <button
                        className="w-full flex items-center justify-between p-6 hover:bg-base-200 transition-colors"
                        onClick={item.onClick}
                      >
                        {/* Left side: Icon and Label */}
                        <div className="flex items-center gap-4">
                          <item.icon className="w-6 h-6 text-base-content/70" />
                          <span className="text-base font-medium text-base-content">
                            {item.label}
                          </span>
                        </div>

                        {/* Right side: Chevron */}
                        {item.hasChevron && (
                          <ChevronRightIcon className="w-5 h-5 text-base-content/40" />
                        )}
                      </button>
                    )}

                    {/* Divider (except for last item) */}
                    {itemIndex < section.items.length - 1 && (
                      <div className="border-b border-base-200 mx-6" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* User Info & Sign Out / Sign In */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider px-2">
              ACCOUNT
            </h2>

            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="p-6 border-b border-base-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-content font-semibold text-lg">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-base-content">
                          {user.name || "User"}
                        </div>
                        <div className="text-sm text-base-content/70">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="w-full p-6 text-error font-medium hover:bg-base-200 transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {/* Guest Info */}
                  <div className="p-6 border-b border-base-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-base-300 rounded-full flex items-center justify-center">
                        <span className="text-base-content font-semibold text-lg">
                          G
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-base-content">
                          Guest User
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sign In Prompt */}
                  <div className="p-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-base-content">
                        Sign In to Save Your Progress
                      </h3>
                      <p className="text-sm text-base-content/70">
                        Create an account to sync your progress across devices
                        and keep it safe.
                      </p>
                      <Link href="/login" className="btn btn-primary btn-sm">
                        Sign In
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
