/**
 * Last-updated helpers.
 *
 * The pill on every data page should be honest about *when the
 * underlying data actually changed*, not when the request hit the cache
 * or when the build was deployed. The truth is `LAST_UPDATED` in
 * `src/lib/data.ts` — a build-time constant bumped (a) by hand when
 * someone reconciles a fresh USCIS XLSX into the data arrays, or
 * (b) automatically by `scripts/sync-uscis.mjs` when the upstream USCIS
 * file SHA changes and the auto-sync workflow opens a PR.
 *
 * Older versions cached `new Date().toISOString()` per-route and relied
 * on the Vercel Cron at /api/cron/refresh to bust a `daily-refresh` tag.
 * That timestamp moved with deploys (each deploy starts with a cold
 * cache that regenerates "now"), making it wrong-by-design as a data-
 * vintage signal. Sourcing from `LAST_UPDATED` is the simple, accurate
 * version. The cron is now a no-op for this pill (kept in place because
 * it's harmless and may be repurposed later).
 *
 * Routes that bypass this helper:
 *   - `/`        — homepage / history timeline are intentionally static.
 *   - `/news`    — uses getNewsLastUpdated() which records the actual
 *                  feed-fetch time, not the data.ts vintage.
 *
 * The ISO string is rendered in UTC server-side and re-formatted in the
 * visitor's local timezone by the <LocalTimestamp> client component.
 */
import { LAST_UPDATED } from './data';

/**
 * Return the ISO-8601 timestamp of the last data refresh for the given
 * route. Server-only.
 *
 * `routeKey` is preserved as the function signature so callers don't
 * need to change. Today every daily-refreshed route resolves to the
 * same `LAST_UPDATED` constant; if a future route ever needs its own
 * vintage (e.g. a separately-sourced dataset), branch on routeKey here.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getRouteLastUpdated(_routeKey: string): Promise<string> {
  return LAST_UPDATED;
}
