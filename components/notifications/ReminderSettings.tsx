"use client";

import { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import type { User } from "@/lib/auth";
import Toggle from "@/components/ui/Toggle";

interface ReminderPreferences {
  reminderEnabled: boolean;
  reminderTime: string;
  timezone: string;
  hasSubscription: boolean;
  lastReminderSent?: string | null;
}

interface ReminderSettingsProps {
  user: User | null;
}

export default function ReminderSettings({ user }: ReminderSettingsProps) {
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    reminderEnabled: false,
    reminderTime: "09:00",
    timezone: "UTC",
    hasSubscription: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  // Check notification permission and get user preferences on mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // Detect user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (user) {
      fetchPreferences();
    } else {
      // For guests, set defaults
      setPreferences((prev) => ({
        ...prev,
        timezone: userTimezone,
      }));
      setIsLoadingPrefs(false);
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      setIsLoadingPrefs(true);
      console.log("Fetching preferences for user:", user.id);
      const response = await fetch("/api/notifications/preferences");

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched preferences:", data.preferences);
        setPreferences(data.preferences);
      } else {
        console.error(
          "Failed to fetch preferences:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setIsLoadingPrefs(false);
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      alert("This browser doesn't support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission === "granted";
  };

  const subscribeToNotifications = async (): Promise<boolean> => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push messaging is not supported");
      }

      // Add timeout wrapper for service worker ready
      const getServiceWorkerWithTimeout = (timeoutMs: number = 5000): Promise<ServiceWorkerRegistration> => {
        return Promise.race([
          navigator.serviceWorker.ready,
          new Promise<ServiceWorkerRegistration>((_, reject) =>
            setTimeout(
              () => reject(new Error("Service worker timeout")),
              timeoutMs
            )
          ),
        ]);
      };

      // Get service worker registration with timeout
      const registration = await getServiceWorkerWithTimeout();

      // Get VAPID public key from server
      const vapidResponse = await fetch("/api/notifications/vapid");
      if (!vapidResponse.ok) {
        throw new Error("Failed to get VAPID key");
      }

      const { publicKey } = await vapidResponse.json();

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(publicKey).buffer as ArrayBuffer,
      });

      // Send subscription to server
      const subscribeResponse = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription,
          reminderTime: preferences.reminderTime,
          timezone: preferences.timezone,
        }),
      });

      if (!subscribeResponse.ok) {
        throw new Error("Failed to save subscription");
      }

      return true;
    } catch (error) {
      console.error("Subscription failed:", error);
      if (error instanceof Error && error.message === "Service worker timeout") {
        alert(
          "Service worker is not ready. Please try again or check if the app is properly installed."
        );
      } else {
        alert("Failed to enable notifications. Please try again.");
      }
      return false;
    }
  };

  const handleToggleReminder = async (enabled: boolean) => {
    console.log(
      "Toggle clicked:",
      enabled,
      "User:",
      user?.id,
      "Loading:",
      isLoading
    );
    console.log("Current preferences state:", preferences.reminderEnabled);

    if (!user) {
      alert("Please sign in to enable daily reminders");
      return;
    }

    // Optimistic update - immediately update the UI
    const previousState = preferences.reminderEnabled;
    setPreferences((prev) => ({
      ...prev,
      reminderEnabled: enabled,
    }));

    setIsLoading(true);

    try {
      if (enabled) {
        // Request permission and subscribe
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
          alert("Notification permission is required for daily reminders");
          // Revert optimistic update
          setPreferences((prev) => ({
            ...prev,
            reminderEnabled: previousState,
          }));
          setIsLoading(false);
          return;
        }

        const subscribed = await subscribeToNotifications();
        if (!subscribed) {
          // Revert optimistic update
          setPreferences((prev) => ({
            ...prev,
            reminderEnabled: previousState,
          }));
          setIsLoading(false);
          return;
        }

        // Update server preferences to enabled after successful subscription
        const response = await fetch("/api/notifications/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reminderEnabled: true }),
        });

        if (!response.ok) {
          throw new Error("Failed to update server preferences");
        }
      } else {
        // Disable reminders
        const response = await fetch("/api/notifications/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reminderEnabled: false }),
        });

        if (!response.ok) {
          throw new Error("Failed to disable reminders");
        }
      }

    } catch (error) {
      console.error("Error toggling reminder:", error);
      alert("Failed to update reminder settings. Please try again.");
      // Revert optimistic update on error
      setPreferences((prev) => ({
        ...prev,
        reminderEnabled: previousState,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeChange = async (newTime: string) => {
    if (!user) return;

    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderTime: newTime }),
      });

      if (response.ok) {
        setPreferences((prev) => ({ ...prev, reminderTime: newTime }));
      } else {
        throw new Error("Failed to update reminder time");
      }
    } catch (error) {
      console.error("Error updating reminder time:", error);
      alert("Failed to update reminder time. Please try again.");
    }
  };

  const handleTimezoneChange = async (newTimezone: string) => {
    if (!user) return;

    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: newTimezone }),
      });

      if (response.ok) {
        setPreferences((prev) => ({ ...prev, timezone: newTimezone }));
      } else {
        throw new Error("Failed to update timezone");
      }
    } catch (error) {
      console.error("Error updating timezone:", error);
      alert("Failed to update timezone. Please try again.");
    }
  };

  const sendTestNotification = async () => {
    if (!user || !preferences.hasSubscription) {
      alert("Please enable notifications first");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/notifications/test");

      if (response.ok) {
        const data = await response.json();
        alert(`Test notification sent! Ayah: ${data.ayah.verseKey}`);
      } else {
        const error = await response.json();
        alert(`Failed to send test: ${error.error}`);
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      alert("Failed to send test notification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert VAPID key
  function urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (isLoadingPrefs) {
    return (
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6">
        <div className="flex items-center gap-4">
          <div className="skeleton w-6 h-6"></div>
          <div className="skeleton w-32 h-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200">
      {/* Main Toggle */}
      <div className="p-6 min-h-fit">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-4">
            <BellIcon className="w-6 h-6 text-base-content/70" />
            <div>
              <span className="text-base font-medium text-base-content">
                Daily Reminder
              </span>
              {!user && (
                <div className="text-sm text-base-content/60">
                  Sign in to enable
                </div>
              )}
              {user && preferences.reminderEnabled && (
                <div className="text-sm text-base-content/60">
                  {preferences.reminderTime} in {preferences.timezone}
                </div>
              )}
            </div>
          </div>

          <Toggle
            id="daily-reminder-toggle"
            name="dailyReminder"
            checked={preferences.reminderEnabled}
            onChange={handleToggleReminder}
            disabled={isLoading || !user}
            aria-label="Toggle daily reminder"
            className="flex-shrink-0"
          />
        </div>
      </div>

      {/* Settings when enabled */}
      {user && preferences.reminderEnabled && (
        <>
          <div className="border-t border-base-200 px-6 py-4">
            {/* Reminder Time */}
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-base-content">
                Reminder Time
              </label>
              <input
                type="time"
                value={preferences.reminderTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="input input-bordered input-sm"
              />
            </div>

            {/* Timezone */}
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-base-content">
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => handleTimezoneChange(e.target.value)}
                className="select select-bordered select-sm"
              >
                <option
                  value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                >
                  Auto ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                </option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Berlin">Berlin</option>
                <option value="Asia/Dubai">Dubai</option>
                <option value="Asia/Karachi">Karachi</option>
                <option value="Asia/Jakarta">Jakarta</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>

            {/* Permission Status */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-base-content">
                Notification Status
              </span>
              <span
                className={`text-sm ${
                  notificationPermission === "granted"
                    ? "text-success"
                    : notificationPermission === "denied"
                    ? "text-error"
                    : "text-warning"
                }`}
              >
                {notificationPermission === "granted"
                  ? "Enabled"
                  : notificationPermission === "denied"
                  ? "Blocked"
                  : "Not set"}
              </span>
            </div>

            {/* Test Button */}
            <button
              onClick={sendTestNotification}
              disabled={isLoading || !preferences.hasSubscription}
              className="btn btn-outline btn-sm w-full"
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Send Test Notification"
              )}
            </button>

            {preferences.lastReminderSent && (
              <div className="text-xs text-base-content/50 mt-2 text-center">
                Last sent:{" "}
                {new Date(preferences.lastReminderSent).toLocaleString()}
              </div>
            )}
          </div>
        </>
      )}

      {/* Permission Help */}
      {user && notificationPermission === "denied" && (
        <div className="border-t border-base-200 p-4 bg-error/10">
          <div className="text-sm text-error">
            <strong>Notifications Blocked:</strong> Please enable notifications
            in your browser settings and refresh the page.
          </div>
        </div>
      )}
    </div>
  );
}
