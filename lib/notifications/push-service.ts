// Push notification service — WebCrypto implementation, runs on Cloudflare Workers
import { sendWebPush, type SendResult } from "./web-push";

// Push subscription interface
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: Record<string, unknown>;
  actions?: { action: string; title: string }[];
  vibrate?: number[];
}

function withDefaults(payload: NotificationPayload) {
  return {
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [200, 100, 200],
    ...payload,
  };
}

/**
 * Send a push notification to a single subscription.
 * Returns the full result so callers can clean up expired subscriptions.
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<SendResult> {
  try {
    return await sendWebPush(subscription, withDefaults(payload));
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return { ok: false, expired: false, status: 0 };
  }
}

/**
 * Send a test notification
 */
export async function sendTestNotification(
  subscription: PushSubscription
): Promise<SendResult> {
  return sendPushNotification(subscription, {
    title: "Tasbihfy",
    body: "Test notification — your reminders are working!",
    tag: "test-notification",
    url: "/",
  });
}

/**
 * Send the same notification to multiple subscriptions
 */
export async function sendBatchNotifications(
  subscriptions: PushSubscription[],
  payload: NotificationPayload
): Promise<{
  successful: number;
  failed: number;
  expiredSubscriptions: PushSubscription[];
}> {
  const results = await Promise.all(
    subscriptions.map(async (subscription) => ({
      subscription,
      result: await sendPushNotification(subscription, payload),
    }))
  );

  return {
    successful: results.filter((r) => r.result.ok).length,
    failed: results.filter((r) => !r.result.ok).length,
    expiredSubscriptions: results
      .filter((r) => r.result.expired)
      .map((r) => r.subscription),
  };
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
 * Check if VAPID is properly configured
 */
export function isVapidConfigured(): boolean {
  return !!(
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_EMAIL
  );
}
