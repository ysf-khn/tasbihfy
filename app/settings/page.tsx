"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { signOut } from "@/lib/auth-client";
import PageHeader from "@/components/ui/PageHeader";
import ArabicTextControls from "@/components/ui/ArabicTextControls";
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ChartBarIcon,
  BellIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const [dailyReminder, setDailyReminder] = useState(true);
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const settingSections = [
    {
      title: "GENERAL",
      items: [
        {
          icon: HeartIcon,
          label: "Favorites",
          hasChevron: true,
          onClick: () => console.log("Favorites clicked"),
        },
        {
          icon: ChartBarIcon,
          label: "Daily Goal",
          hasChevron: true,
          onClick: () => console.log("Daily Goal clicked"),
        },
      ],
    },
    {
      title: "NOTIFICATIONS",
      items: [
        {
          icon: BellIcon,
          label: "Daily Reminder",
          hasToggle: true,
          toggleValue: dailyReminder,
          onToggle: setDailyReminder,
        },
      ],
    },
    {
      title: "ABOUT",
      items: [
        {
          icon: InformationCircleIcon,
          label: "About Tasbihfy",
          hasChevron: true,
          onClick: () => console.log("About clicked"),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <PageHeader />
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
                    <button
                      className="w-full flex items-center justify-between p-6 hover:bg-base-200 transition-colors"
                      onClick={item.onClick}
                      disabled={item.hasToggle}
                    >
                      {/* Left side: Icon and Label */}
                      <div className="flex items-center gap-4">
                        <item.icon className="w-6 h-6 text-base-content/70" />
                        <span className="text-base font-medium text-base-content">
                          {item.label}
                        </span>
                      </div>

                      {/* Right side: Toggle or Chevron */}
                      {item.hasToggle ? (
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={item.toggleValue}
                          onChange={(e) => item.onToggle?.(e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : item.hasChevron ? (
                        <ChevronRightIcon className="w-5 h-5 text-base-content/40" />
                      ) : null}
                    </button>

                    {/* Divider (except for last item) */}
                    {itemIndex < section.items.length - 1 && (
                      <div className="border-b border-base-200 mx-6" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* User Info & Sign Out */}
          {user && (
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider px-2">
                ACCOUNT
              </h2>
              
              <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden">
                {/* User Info */}
                <div className="p-6 border-b border-base-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-content font-semibold text-lg">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-base-content">{user.name || "User"}</div>
                      <div className="text-sm text-base-content/70">{user.email}</div>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}