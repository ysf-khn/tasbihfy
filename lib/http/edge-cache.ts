import { getRequestExecutionContext } from "vinext/shims/request-context";

/**
 * Edge caching for route handlers, via the Workers Cache API.
 *
 * Why not `next: { revalidate }` or the `s-maxage` headers these routes
 * already set: a response returned from a Worker never reaches Cloudflare's
 * CDN cache on its own. The `cdnAdapter` wired up in `vite.config.ts` is a
 * page-level ISR adapter — it turns the framework's own cache policy into
 * `CDN-Cache-Control` for rendered pages, not for arbitrary route handlers.
 * `caches.default` is the one mechanism that is guaranteed to store these
 * responses regardless of what the framework does, so it is what we use.
 *
 * The TTL is read from the handler's own `Cache-Control`, so each route keeps
 * declaring its own freshness in one place and nothing has to be duplicated
 * here.
 */

// Generic over the request type so handlers typed against NextRequest wrap
// as cleanly as ones typed against the plain Request.
type Handler<R extends Request, A extends unknown[]> = (
  request: R,
  ...args: A
) => Promise<Response>;

/** `caches.default` exists on Workers; on the Node dev server it does not. */
function edgeCache(): Cache | null {
  try {
    const store = (globalThis as { caches?: { default?: Cache } }).caches;
    return store?.default ?? null;
  } catch {
    return null;
  }
}

/**
 * Seconds the edge may store this response, from `s-maxage` (preferred) or
 * `max-age`. Returns null when the response opts out of shared caching.
 */
function sharedMaxAge(response: Response): number | null {
  const header = response.headers.get("Cache-Control");
  if (!header) return null;
  if (/\b(?:private|no-store|no-cache)\b/i.test(header)) return null;

  const match =
    /\bs-maxage=(\d+)/i.exec(header) ?? /\bmax-age=(\d+)/i.exec(header);
  if (!match) return null;

  const seconds = Number(match[1]);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

/**
 * Run `promise` after the response is sent when the runtime allows it. Without
 * `waitUntil` the isolate can be torn down mid-write, so fall back to awaiting.
 */
async function settle(promise: Promise<unknown>): Promise<void> {
  const ctx = getRequestExecutionContext();
  if (ctx) {
    ctx.waitUntil(promise);
    return;
  }
  await promise.catch(() => {});
}

/**
 * Wrap a GET route handler so identical URLs are served from the edge cache.
 *
 * Usage:
 *   async function handler(request: Request) { ... }
 *   export const GET = withEdgeCache(handler);
 */
export function withEdgeCache<R extends Request, A extends unknown[]>(
  handler: Handler<R, A>
): Handler<R, A> {
  return async (request: R, ...args: A): Promise<Response> => {
    const cache = edgeCache();

    // Only GET is cacheable, and only when the runtime gives us a store.
    if (!cache || request.method !== "GET") {
      return handler(request, ...args);
    }

    // The URL alone is the key: these proxies are unauthenticated and their
    // output depends on nothing but the query string.
    const key = new Request(request.url, { method: "GET" });

    try {
      const hit = await cache.match(key);
      if (hit) {
        const headers = new Headers(hit.headers);
        headers.set("X-Edge-Cache", "HIT");
        return new Response(hit.body, { status: hit.status, headers });
      }
    } catch (error) {
      console.warn("Edge cache read failed:", error);
    }

    const response = await handler(request, ...args);

    if (response.ok && sharedMaxAge(response) !== null) {
      // `put` consumes the body, so store the clone and return the original.
      await settle(
        cache.put(key, response.clone()).catch((error) => {
          console.warn("Edge cache write failed:", error);
        })
      );
    }

    const headers = new Headers(response.headers);
    headers.set("X-Edge-Cache", "MISS");
    return new Response(response.body, { status: response.status, headers });
  };
}
