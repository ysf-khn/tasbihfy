// Push notification service for sending daily ayah reminders
// Uses web-push library with VAPID authentication

import webpush from "web-push";
import type { AyahForNotification } from "./random-ayah";

// VAPID configuration
const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
  subject: process.env.VAPID_EMAIL || "mailto:yusufmohd72@gmail.com",
};

// Initialize web-push with VAPID details
let vapidConfigured = false;

function ensureVapidConfigured() {
  if (!vapidConfigured) {
    if (!vapidDetails.publicKey || !vapidDetails.privateKey) {
      throw new Error(
        "VAPID keys are required. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables."
      );
    }

    webpush.setVapidDetails(
      vapidDetails.subject,
      vapidDetails.publicKey,
      vapidDetails.privateKey
    );
    vapidConfigured = true;
    console.log("✅ VAPID configured successfully");
  }
}

// Push subscription interface
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Notification payload interface
interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  vibrate?: number[];
}

/**
 * Send push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    ensureVapidConfigured();

    console.log("🔄 Sending push notification...", {
      endpoint: subscription.endpoint.substring(0, 50) + "...",
      title: payload.title,
    });

    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );

    console.log("✅ Push notification sent successfully");
    return true;
  } catch (error: any) {
    console.error("❌ Failed to send push notification:", error);

    // Handle specific web-push errors
    if (error.statusCode === 410) {
      console.log("⚠️ Push subscription expired or invalid");
      return false; // Subscription should be removed from database
    }

    if (error.statusCode === 413) {
      console.log("⚠️ Payload too large");
      return false;
    }

    if (error.statusCode === 429) {
      console.log("⚠️ Rate limited by push service");
      return false;
    }

    return false;
  }
}

/**
 * Send ayah notification to a user
 */
export async function sendAyahNotification(
  subscription: PushSubscription,
  ayah: AyahForNotification
): Promise<boolean> {
  const payload: NotificationPayload = {
    title: ayah.title,
    body: ayah.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: "daily-ayah",
    data: {
      type: "daily-ayah",
      verseKey: ayah.verseKey,
      chapterId: ayah.chapterId,
      verseNumber: ayah.verseNumber,
      url: `/quran/${ayah.chapterId}?verse=${ayah.verseNumber}`,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: "read-more",
        title: "Read More",
        icon: "/icons/icon-192x192.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icons/icon-192x192.png",
      },
    ],
    vibrate: [200, 100, 200], // Gentle vibration pattern
  };

  return sendPushNotification(subscription, payload);
}

/**
 * Send test notification
 */
export async function sendTestNotification(
  subscription: PushSubscription,
  ayah: AyahForNotification
): Promise<boolean> {
  const payload: NotificationPayload = {
    title: "Test Notification - " + ayah.title,
    body: ayah.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: "test-notification",
    data: {
      type: "test-notification",
      verseKey: ayah.verseKey,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: "open",
        title: "Open App",
        icon: "/icons/icon-192x192.png",
      },
    ],
    vibrate: [100, 50, 100], // Short test vibration
  };

  return sendPushNotification(subscription, payload);
}

/**
 * Validate push subscription
 */
export function validatePushSubscription(
  subscription: any
): subscription is PushSubscription {
  return !!(
    subscription &&
    typeof subscription.endpoint === "string" &&
    subscription.keys &&
    typeof subscription.keys.p256dh === "string" &&
    typeof subscription.keys.auth === "string"
  );
}

/**
 * Generate VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string {
  if (!process.env.VAPID_PUBLIC_KEY) {
    throw new Error("VAPID_PUBLIC_KEY environment variable is not set");
  }
  return process.env.VAPID_PUBLIC_KEY;
}

/**
 * Send notifications to multiple subscriptions in batches
 */
export async function sendBatchNotifications(
  subscriptions: PushSubscription[],
  ayah: AyahForNotification,
  batchSize: number = 10
): Promise<{
  successful: number;
  failed: number;
  expiredSubscriptions: PushSubscription[];
}> {
  const results = {
    successful: 0,
    failed: 0,
    expiredSubscriptions: [] as PushSubscription[],
  };

  console.log(
    `🔄 Sending batch notifications to ${subscriptions.length} subscriptions...`
  );

  // Process subscriptions in batches
  for (let i = 0; i < subscriptions.length; i += batchSize) {
    const batch = subscriptions.slice(i, i + batchSize);

    const batchPromises = batch.map(async (subscription) => {
      try {
        const success = await sendAyahNotification(subscription, ayah);
        if (success) {
          results.successful++;
        } else {
          results.failed++;
          results.expiredSubscriptions.push(subscription);
        }
      } catch (error) {
        console.error("❌ Batch notification error:", error);
        results.failed++;
        results.expiredSubscriptions.push(subscription);
      }
    });

    await Promise.all(batchPromises);

    // Add delay between batches to avoid rate limiting
    if (i + batchSize < subscriptions.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
    }
  }

  console.log(`✅ Batch notifications completed:`, results);
  return results;
}

/**
 * Check if VAPID is properly configured
 */
export function isVapidConfigured(): boolean {
  return !!(
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_EMAIL
  );
}
