# Data fetching and caching audit — final

Audited 2026-08-29 against `main` at b7b5f67. Covers every fetch path, cache layer, and API route in the app. Every finding below has been verified against the code (line references checked, no claim taken on faith).

## Summary

There is no data fetching library in the project. No SWR, no React Query, no `react.cache()`. Every read is a hand written `useEffect` + `fetch`, and there are three separate caching systems that don't know about each other:

1. localStorage inside `lib/quran/api.ts`
2. a second localStorage layer inside `hooks/useQuranData.ts` that caches the same objects again
3. the `PrayerTimeCache` Supabase table

On the server, Next's fetch cache and RSC data fetching are basically unused. One route in the entire app sets a segment config (`app/api/cron/send-reminders/route.ts:26`), and none of the 14 Quran proxy routes pass cache options to their upstream `fetch` calls.

Two things are already good and worth protecting. `lib/sync-manager.ts` does proper batching, dedup by session id, and `sendBeacon` on unload. `hooks/usePrayerLog.ts` does optimistic updates with a real rollback path. `public/sw.js` is conservative on purpose and correct: navigations network only, `/api/*` never intercepted, static assets cache first.

Everything below is ordered by how much it costs you today.

---

## High severity

### 1. Prayer time cache key uses raw GPS precision, so it almost never hits

`app/api/prayer-times/route.ts:58` builds the cache key as `${latParam},${lonParam}`, and the client passes `position.coords` unrounded (`hooks/usePrayerTimes.ts:161`). Every device gets its own key, something like `51.5073219,-0.1276474`.

Three things follow from that:

- `PrayerTimeCache` grows by one row per device per day, and `deleteOldPrayerCache` only prunes rows matching the same key, so rows for coordinates a user will never send again sit there forever.
- Two people in the same building never share a cached entry.
- Every cold request runs a Nominatim reverse geocode through `resolveLocation` (`lib/prayer/aladhan.ts:72`). Nominatim's usage policy is one request per second and they do block abusers. Right now you're one traffic spike away from that.

Fix: round the coordinates before they become the key. Two decimals is about 1.1 km, which is well inside the tolerance of prayer time calculation. Do it server side so old clients benefit too.

```ts
const round = (v: string) => Number(v).toFixed(2);
cacheKey = `${round(latParam)},${round(lonParam)}`;
```

Two extensions worth doing in the same change:

- **The Nominatim call can leave the hot path entirely.** In `resolveLocation` the reverse geocode only supplies display labels — the code's own comment says so. Timings can be computed immediately from the coordinates; the city label can be filled lazily or by the client. That eliminates the rate-limit exposure rather than just reducing it.
- **Qibla direction is a pure function of the coordinates.** `fetchQiblaDirection` is an upstream hop for five lines of spherical trig. Compute it locally.

Watch out on cache hits: the cached-response branch (`route.ts:87`) returns `name: location ?? cacheKey`. Once coordinates are rounded into the key, a coordinate-path cache hit would show the raw key string as the location name — store and return the resolved city name instead (the cache row already carries lat/lng and country).

### 2. The date is anchored to UTC, so users east of UTC get yesterday's times — and yesterday's Hijri date — every morning

`app/api/prayer-times/route.ts:70-75` computes "today" from the server's UTC clock and passes it to `fetchPrayerTimings`. A user in Karachi (UTC+5) checking at 4am local is still on yesterday's UTC date. The timings only drift a minute or two per day, but the **Hijri date is off by one**, which is religiously significant (fasting days, white days, month boundaries). This affects every user east of UTC — most of this app's audience — for the hours between their local midnight and UTC midnight.

Fix: derive the date from the location's timezone (the resolved location already carries it) and make the cache key `{roundedCoords}:{localDate}`. Fold this into fix #1 since it's the same key-construction code.

### 3. Quran data is cached twice in localStorage and never evicted

`lib/quran/api.ts:108` caches surah payloads under `quran_surah_*` with a 7 day TTL. `hooks/useQuranData.ts:19` then caches the same returned object again under `quran_hook_cache_*` with a 30 minute TTL. Al-Baqarah with two translations is roughly 300 KB of JSON, so it costs about 600 KB stored.

`LocalStorageCleanup.runFullCleanup()` (`lib/localStorage-cleanup.ts:301`) cleans dhikr sessions, temp dhikrs, bookmarks, guest sessions and prayer logs. It never touches the Quran caches, which are by far the largest thing in there. `checkQuotaUsage()` only logs a warning at 80%.

The failure mode is quiet and permanent. Once the user hits quota, `setCache`'s catch block swallows the `QuotaExceededError` (`lib/quran/api.ts:122`) and every subsequent write fails silently. Caching stops working for that user and nothing tells them or you.

Fix: delete the hook layer and keep the `api.ts` one, which has the real TTLs. Then add prefix based LRU eviction that runs when a write throws, dropping the oldest `quran_` entries until the write succeeds. Stale keys from old script or translation combinations also need sweeping, since today they're only removed if something happens to read that exact key again.

**Coupled with #6:** `useQuranPrefetch` writes only to the hook layer. Deleting the hook cache without moving the prefetch to `api.ts`'s cache turns it from "broken but harmless" into pure wasted bandwidth. Do #3 and #6 as one change.

### 4. Every authenticated API request does a database round trip just to check the session

`lib/auth.ts` sets `session.expiresIn` and `updateAge` but no `cookieCache`. `auth.api.getSession()` is called across 12 route files under `app/api/**`, and each call goes Worker to Supabase before any real work starts.

```ts
session: {
  expiresIn: 60 * 60 * 24 * 7,
  updateAge: 60 * 60 * 24,
  cookieCache: { enabled: true, maxAge: 5 * 60 },
},
```

That removes the hop for most requests. The tradeoff is that a revoked session stays valid for up to `maxAge`, which is fine for this app.

Related: `/api/dhikrs`, `/api/daily-progress`, `/api/prayer-log` and `/api/sessions` set no `Cache-Control` at all, so browsers apply heuristic caching to per user responses. They should say `private, no-store` explicitly.

### 5. `getDhikrsForUser` pulls every session row ever created, then throws them away

`lib/supabase-queries.ts:22` selects `sessions:DhikrSession(*)` with no filter, then filters to incomplete sessions and takes `.slice(0, 1)` in JavaScript. A user with a year of counting transfers thousands of rows to render a list of ten dhikrs. `getDhikrById` at line 71 has the same shape.

Push the filter into the query so PostgREST does the work (the embedded filter drops child rows without dropping parent dhikrs, which is what's wanted):

```ts
.select(`*, sessions:DhikrSession(*)`)
.eq('sessions.completed', false)
.order('startedAt', { referencedTable: 'DhikrSession', ascending: false })
.limit(1, { referencedTable: 'DhikrSession' })
```

---

## Medium severity

### 6. `useQuranPrefetch` writes to a key nothing reads

`hooks/useQuranData.ts:286` builds `surah_${surahId}_${ids}`. The read path at line 143 uses `surah_${surahId}_${ids}_${selectedScript}`. So every adjacent surah prefetch makes the full network round trip, writes a key nobody will ever look up, and the user still waits for a fresh fetch when they navigate. The prefetch is pure cost right now. Fix together with #3 (see the coupling note there).

### 7. Non default users pay two full surah fetches on every page load

`useQuranSettings` initialises to `DEFAULT_QURAN_SETTINGS` (`hooks/useQuranSettings.ts:9`), which has `selectedTranslations: [20]` in production, and only reads localStorage inside an effect. `QuranClient` calls `useQuranSurah(surahId, translationIds, ...)` on first render with `[20]`, then again once the real selection arrives.

If the user never changed translations the two calls match and nothing is wasted. Anyone who picked something else fetches an entire surah they will not display, every single time. The hook already returns `isLoading`, so gate the fetch on it.

### 8. No request cancellation in the Quran and prayer hooks

`AbortController` appears nowhere in the codebase. `useQuranData.ts` and `usePrayerTimes.ts` set state unconditionally inside their async callbacks with no cancelled flag, while `useTodaySummary` and `usePrayerLog` do guard. Switching surah or translation quickly lets a slower earlier response land after a newer one and overwrite it.

### 9. `/api/sessions/batch` is two to three sequential database calls per item

`app/api/sessions/batch/route.ts:56` loops over up to ten queued updates. Each iteration runs `getDhikrByIdSimple`, then `getActiveSession`, then the write, all awaited in order. That's up to 30 sequential Worker to Supabase hops for one flush, which undoes a good part of what the sync manager saved on the client.

The dhikr lookups are the easy win: collect the distinct `dhikrId` values first, fetch them in one `in('id', ids)` query, and use a map inside the loop.

### 10. The cron does an N+1 location lookup every five minutes

`app/api/cron/send-reminders/route.ts:153` calls `getPrayerLocation(prefs.userId)` inside the per user loop. The prayer timings themselves are correctly memoised per location in `timingsByLocation`, so the pattern is already understood here. The locations just need the same treatment: one `in('userId', ids)` query before the loop.

### 11. The city prayer time pages ship an empty shell

`app/prayer-times/[country]/[city]/page.tsx` statically generates a page per city, but `PrayerTimesLocationClient.tsx:41` fetches the times client side. The pages that exist to rank for "prayer times in Karachi" serve HTML containing a spinner. Crawlers see nothing, and users wait through a round trip that could have been done at build or revalidation time.

These are the best candidate in the app for a server fetch with `export const revalidate = 3600`. The times land in the HTML, the response caches at the edge, and the client waterfall disappears. (Verify vinext honors the segment config — see #12's runtime caveat.)

Smaller point on the same file: the client sends `location=<cityName>` even though `cityData` already carries `lat` and `lng`, which forces a geocode the app didn't need.

### 12. Upstream Quran fetches are uncached at the origin — and the `s-maxage` headers are almost certainly dead code

All 14 routes under `app/api/quran/**` call `fetch(url, { headers })` with no `next: { revalidate }` and no `cache` option. In Next 15 that means no store, so every proxy request hits quran.foundation.

The Quran does not change, so this traffic is nearly all avoidable — but two runtime caveats before reaching for the obvious fixes:

- **The `s-maxage` headers those routes set do nothing by themselves on Workers.** A response returned from a Worker never touches Cloudflare's CDN cache unless something explicitly stores it — the Cache API (`caches.default`) or the `cdnAdapter` wired up in `vite.config.ts:10`. Unless the adapter demonstrably covers route handlers, every one of those headers is decoration.
- **`next: { revalidate }` on fetch is a Next-runtime feature.** This app runs on vinext, and whether vinext implements the fetch data cache is an open question. Verify before trusting it.

The fix that is guaranteed to work on Workers regardless: `caches.default.match`/`put` in the proxy routes. That removes nearly all upstream traffic and most of the OAuth token churn in `lib/quran/token-manager.ts`. The same skepticism applies to the `s-maxage` on `/api/prayer-times`.

---

## Low severity

- `/api/geocode` and `/api/quran/verses/random` set no cache headers. The geocode one proxies rate limited Nominatim and a coordinate to city mapping never changes, so it should cache hard.
- The OG routes under `app/api/og/**` have no caching, so every crawler hit re renders a deterministic `ImageResponse` from scratch.
- `app/dhikr/page.tsx:9` is a client component that statically imports the 273 KB `hisnul-muslim-complete.json`, which puts all of it in that route's bundle. `app/duas/page.tsx:56` already does this correctly with `await import(...)`.
- `/api/dhikrs` is fetched by four different components (`DhikrList.tsx:25`, `dhikr/page.tsx:115`, `DailyClient.tsx:181`, `useTodaySummary.ts:69`) with no shared cache or dedup, so moving between home and daily refetches the same list repeatedly.
- The OAuth token cache in `lib/quran/token-manager.ts:8` is module scoped, which means per isolate on Workers. Every cold isolate re authenticates. Moving it to KV would help if the token endpoint ever becomes a bottleneck.
- `createServerClient()` builds a new Supabase client on every query function call, so a request running three queries constructs three clients.

---

## Where I'd start

Three changes carry most of the value and none of them are large:

1. Fix the prayer time cache key and date together (#1 + #2). Round the coordinates, derive the date from the location's timezone, and drop Nominatim from the hot path. Fixes cache hit rate, table growth, the Nominatim exposure, and the Hijri off-by-one in one edit.
2. Turn on Better Auth's cookie cache (#4). Four lines, removes a database round trip from every authenticated request.
3. Delete the duplicate localStorage layer in `useQuranData` and fix the prefetch key in the same change (#3 + #6 — they're coupled). Halves Quran storage, removes the silent quota failure, and makes the prefetch actually work.

After that, #7 is small and removes a wasted full-surah fetch on every Quran page load for non-default users, and #12 (Cache API in the Quran proxies) is the biggest upstream-traffic win once the cdnAdapter question is answered.
