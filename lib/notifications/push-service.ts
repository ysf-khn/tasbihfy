// Push notification service for sending daily ayah reminders
// Edge-compatible implementation using Web Crypto API and fetch

import { generateVapidHeaders } from "./vapid-edge";
import { buildEncryptedRequest } from "./encrypt-edge";
import type { AyahForNotification } from "./random-ayah";

// VAPID configuration
const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
  subject: process.env.VAPID_EMAIL || "mailto:yusufmohd72@gmail.com",
};

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
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  vibrate?: number[];
}

/**
 * Send push notification to a single subscription using Edge-compatible APIs
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    if (!vapidDetails.publicKey || !vapidDetails.privateKey) {
      throw new Error(
        "VAPID keys are required. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables."
      );
    }

    console.log("🔄 Sending push notification...", {
      endpoint: subscription.endpoint.substring(0, 50) + "...",
      title: payload.title,
    });

    // Serialize the payload
    const payloadString = JSON.stringify(payload);

    // Build encrypted request body
    const encrypted = await buildEncryptedRequest(
      payloadString,
      subscription.keys.p256dh,
      subscription.keys.auth
    );

    // Generate VAPID headers
    const vapidHeaders = await generateVapidHeaders(
      subscription.endpoint,
      vapidDetails.subject,
      vapidDetails.publicKey,
      vapidDetails.privateKey
    );

    // Combine all headers
    const headers: HeadersInit = {
      ...encrypted.headers,
      ...vapidHeaders,
      TTL: "86400", // 24 hours
    };

    // Send the push notification
    // Convert Uint8Array to ArrayBuffer for fetch body
    const bodyBuffer = encrypted.body.buffer.slice(
      encrypted.body.byteOffset,
      encrypted.body.byteOffset + encrypted.body.byteLength
    ) as ArrayBuffer;

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers,
      body: bodyBuffer,
    });

    if (response.ok || response.status === 201) {
      console.log("✅ Push notification sent successfully");
      return true;
    }

    // Handle specific error codes
    if (response.status === 410 || response.status === 404) {
      console.log("⚠️ Push subscription expired or invalid");
      return false; // Subscription should be removed from database
    }

    if (response.status === 413) {
      console.log("⚠️ Payload too large");
      return false;
    }

    if (response.status === 429) {
      console.log("⚠️ Rate limited by push service");
      return false;
    }

    const errorText = await response.text();
    console.error(
      `❌ Push notification failed: ${response.status} ${response.statusText}`,
      errorText
    );
    return false;
  } catch (error) {
    console.error("❌ Failed to send push notification:", error);
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
  subscription: unknown
): subscription is PushSubscription {
  if (!subscription || typeof subscription !== "object") return false;
  const sub = subscription as Record<string, unknown>;
  return !!(
    typeof sub.endpoint === "string" &&
    sub.keys &&
    typeof sub.keys === "object" &&
    typeof (sub.keys as Record<string, unknown>).p256dh === "string" &&
    typeof (sub.keys as Record<string, unknown>).auth === "string"
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
