// WebCrypto-based Web Push sender (Workers-compatible, replaces the old
// Node-only `web-push` package)
import { buildPushPayload } from "@block65/webcrypto-web-push";
import type { PushSubscription } from "./push-service";

export interface SendResult {
  ok: boolean;
  /** 404/410 from the push service: the subscription is gone and should be removed */
  expired: boolean;
  status: number;
}

export async function sendWebPush(
  subscription: PushSubscription,
  payload: Record<string, unknown>,
  options?: { ttl?: number }
): Promise<SendResult> {
  const vapid = {
    subject: process.env.VAPID_EMAIL!,
    publicKey: process.env.VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!,
  };

  const message = {
    data: JSON.stringify(payload),
    options: { ttl: options?.ttl ?? 3600 },
  };

  const request = await buildPushPayload(
    message,
    { ...subscription, expirationTime: null },
    vapid
  );

  // The library returns a Uint8Array body, which the DOM lib's BodyInit
  // typing predates — it is valid at runtime
  const response = await fetch(subscription.endpoint, request as RequestInit);

  return {
    ok: response.ok,
    expired: response.status === 404 || response.status === 410,
    status: response.status,
  };
}
