"use client";

import { useState, useEffect } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

// Declare gtag type for Google Analytics tracking
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect if app is in standalone mode
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");
    setIsStandalone(standalone);

    // Check if app was already installed
    const wasInstalled = localStorage.getItem("tasbihfy-installed") === "true";
    setIsInstalled(wasInstalled);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);

      // Show prompt after a delay if not installed and not dismissed
      const dismissed = localStorage.getItem("install-prompt-dismissed");
      const lastShown = localStorage.getItem("install-prompt-last-shown");
      const now = Date.now();
      const threeDays = 3 * 24 * 60 * 60 * 1000;

      if (!dismissed && (!lastShown || now - parseInt(lastShown) > threeDays)) {
        setTimeout(() => {
          setShowPrompt(true);
          // Track when PWA install prompt is shown
          window.gtag?.("event", "pwa_install_prompt_shown", {
            event_category: "PWA",
            event_label: "Install prompt displayed",
          });
        }, 3000); // Show after 3 seconds
      }
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem("tasbihfy-installed", "true");
      // Track successful PWA installation
      window.gtag?.("event", "pwa_installed", {
        event_category: "PWA",
        event_label: "App successfully installed",
      });
      console.log("PWA was installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;

        if (outcome === "accepted") {
          setShowPrompt(false);
          localStorage.setItem("tasbihfy-installed", "true");
          // Track when user accepts install prompt
          window.gtag?.("event", "pwa_install_accepted", {
            event_category: "PWA",
            event_label: "User accepted install prompt",
          });
        } else {
          localStorage.setItem("install-prompt-dismissed", "true");
          // Track when user dismisses install prompt
          window.gtag?.("event", "pwa_install_dismissed", {
            event_category: "PWA",
            event_label: "User dismissed install prompt",
          });
        }

        setInstallPrompt(null);
      } catch (error) {
        console.error("Installation failed:", error);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("install-prompt-dismissed", "true");
    localStorage.setItem("install-prompt-last-shown", Date.now().toString());
    // Track when user manually dismisses prompt
    window.gtag?.("event", "pwa_install_dismissed", {
      event_category: "PWA",
      event_label: "User clicked No thanks",
    });
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    localStorage.setItem("install-prompt-last-shown", Date.now().toString());
    // Track when user chooses to be reminded later
    window.gtag?.("event", "pwa_install_remind_later", {
      event_category: "PWA",
      event_label: "User clicked Later",
    });
  };

  // Don't show if already installed or in standalone mode
  if (isStandalone || isInstalled) {
    return null;
  }

  // iOS Installation Instructions
  if (isIOS && !showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-primary text-primary-content rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📱</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Install Tasbihfy</h3>
              <p className="text-xs opacity-90 mt-1">
                Tap the share button
                <span className="inline-block mx-1">⎋</span>
                and select "Add to Home Screen"
                <span className="inline-block mx-1">➕</span>
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="btn btn-ghost btn-xs text-primary-content"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard Install Prompt
  if (showPrompt && installPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-base-200 border border-base-300 rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img
                src="/icons/icon-192x192.png"
                alt="Tasbihfy Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base-content">
                Install Tasbihfy
              </h3>
              <p className="text-sm text-base-content/70 mt-1">
                Install the app for a better experience and quick launch.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="btn btn-primary btn-sm"
                >
                  Install
                </button>
                <button
                  onClick={handleRemindLater}
                  className="btn btn-ghost btn-sm"
                >
                  Later
                </button>
                <button
                  onClick={handleDismiss}
                  className="btn btn-ghost btn-sm"
                >
                  No thanks
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Floating Install Button (when prompt is available but not shown)
  if (installPrompt && !showPrompt) {
    return (
      <button
        onClick={() => setShowPrompt(true)}
        className="fixed bottom-24 right-4 btn btn-circle btn-primary shadow-lg z-40"
        title="Install App"
      >
        <ArrowDownTrayIcon className="w-6 h-6" />
      </button>
    );
  }

  return null;
}
