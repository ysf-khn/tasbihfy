// Push notification service - TEMPORARILY DISABLED
// Re-enable after Cloudflare Pages migration is complete

// Push subscription interface
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Send push notification - DISABLED
 */
export async function sendPushNotification(): Promise<boolean> {
  console.log("⚠️ Push notifications temporarily disabled");
  return false;
}

/**
 * Send ayah notification - DISABLED
 */
export async function sendAyahNotification(): Promise<boolean> {
  console.log("⚠️ Push notifications temporarily disabled");
  return false;
}

/**
 * Send test notification - DISABLED
 */
export async function sendTestNotification(): Promise<boolean> {
  console.log("⚠️ Push notifications temporarily disabled");
  return false;
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
 * Send notifications to multiple subscriptions - DISABLED
 */
export async function sendBatchNotifications(): Promise<{
  successful: number;
  failed: number;
  expiredSubscriptions: PushSubscription[];
}> {
  console.log("⚠️ Push notifications temporarily disabled");
  return {
    successful: 0,
    failed: 0,
    expiredSubscriptions: [],
  };
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
