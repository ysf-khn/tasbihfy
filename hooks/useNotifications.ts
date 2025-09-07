// useNotifications hook for managing push notifications
// Handles permission requests, subscriptions, and preferences

import { useState, useEffect, useCallback } from "react";

interface NotificationPreferences {
  reminderEnabled: boolean;
  reminderTime: string;
  timezone: string;
  hasSubscription: boolean;
  lastReminderSent?: string | null;
}

interface UseNotificationsReturn {
  // State
  preferences: NotificationPreferences;
  isLoading: boolean;
  isSupported: boolean;
  permission: NotificationPermission;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  subscribe: (reminderTime?: string, timezone?: string) => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<boolean>;
  sendTestNotification: () => Promise<boolean>;
  refreshPreferences: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    reminderEnabled: false,
    reminderTime: "09:00",
    timezone: "UTC",
    hasSubscription: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  
  // Check if notifications are supported
  const isSupported = typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;

  // Initialize permissions and preferences
  useEffect(() => {
    if (!isSupported) return;

    // Set current permission state
    setPermission(Notification.permission);
    
    // Detect user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setPreferences(prev => ({
      ...prev,
      timezone: userTimezone,
    }));

    // Fetch user preferences
    refreshPreferences();
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn("Notifications not supported");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported]);

  // Helper function to convert VAPID key
  const urlB64ToUint8Array = useCallback((base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async (
    reminderTime?: string, 
    timezone?: string
  ): Promise<boolean> => {
    if (!isSupported) {
      console.warn("Push notifications not supported");
      return false;
    }

    setIsLoading(true);

    try {
      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error("Notification permission denied");
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("Using existing push subscription");
      }

      // Get VAPID public key from server
      const vapidResponse = await fetch("/api/notifications/vapid");
      if (!vapidResponse.ok) {
        throw new Error("Failed to get VAPID key from server");
      }
      
      const { publicKey } = await vapidResponse.json();

      // Create new subscription if needed
      const subscription = existingSubscription || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(publicKey).buffer as ArrayBuffer,
      });

      // Send subscription to server
      const subscribeResponse = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription,
          reminderTime: reminderTime || preferences.reminderTime,
          timezone: timezone || preferences.timezone,
        }),
      });

      if (!subscribeResponse.ok) {
        const error = await subscribeResponse.json();
        throw new Error(error.error || "Failed to save subscription to server");
      }

      // Refresh preferences
      await refreshPreferences();
      
      console.log("Successfully subscribed to push notifications");
      return true;

    } catch (error) {
      console.error("Failed to subscribe to notifications:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, requestPermission, urlB64ToUint8Array, preferences.reminderTime, preferences.timezone]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);

    try {
      // Unsubscribe from browser
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove subscription from server
      const response = await fetch("/api/notifications/unsubscribe", {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove subscription from server");
      }

      // Refresh preferences
      await refreshPreferences();
      
      console.log("Successfully unsubscribed from push notifications");
      return true;

    } catch (error) {
      console.error("Failed to unsubscribe from notifications:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Update notification preferences
  const updatePreferences = useCallback(async (
    updates: Partial<NotificationPreferences>
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update preferences");
      }

      // Refresh preferences
      await refreshPreferences();
      
      console.log("Successfully updated notification preferences");
      return true;

    } catch (error) {
      console.error("Failed to update preferences:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!preferences.hasSubscription) {
      console.warn("No push subscription available for test");
      return false;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/notifications/test");
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send test notification");
      }

      const data = await response.json();
      console.log("Test notification sent successfully:", data);
      return true;

    } catch (error) {
      console.error("Failed to send test notification:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [preferences.hasSubscription]);

  // Fetch user preferences from server
  const refreshPreferences = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/notifications/preferences");
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      } else {
        // If not authenticated or no preferences, keep current state
        console.log("No preferences found or not authenticated");
      }
    } catch (error) {
      console.error("Failed to fetch notification preferences:", error);
    }
  }, []);

  return {
    // State
    preferences,
    isLoading,
    isSupported,
    permission,
    
    // Actions
    requestPermission,
    subscribe,
    unsubscribe,
    updatePreferences,
    sendTestNotification,
    refreshPreferences,
  };
}