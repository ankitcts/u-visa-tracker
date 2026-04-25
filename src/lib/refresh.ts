/**
 * Last-updated helpers.
 *
 * The displayed "last refreshed" timestamp is sourced from
 * `unstable_cache(new Date())` keyed per-route and tagged with
 * `daily-refresh`. The Vercel Cron at /api/cron/refresh calls
 * `revalidateTag('daily-refresh')` once a night, which busts the cache;
 * the next request to any data page regenerates a fresh ISO timestamp.
 *
 * History and live news bypass this — the History timeline is
 * intentionally static (a curated archive), and /news has its own
 * `getNewsLastUpdated()` that records the actual feed-fetch time.
 *
 * The ISO string is rendered in UTC server-side and re-formatted in the
 * visitor's local timezone by the <LocalTimestamp> client component, so
 * a refresh at 03:00 UTC reads as "Apr 25, 8:00 PM" for an EDT visitor
 * and "Apr 25, 5:00 PM" for a PDT visitor.
 */
import { unstable_cache } from 'next/cache';

const REVALIDATE_DAILY_SECONDS = 60 * 60 * 24;

const cachedRouteStamp = (routeKey: string) =>
  unstable_cache(
    async () => new Date().toISOString(),
    [`u-visa-route-last-updated-v2`, routeKey],
    { revalidate: REVALIDATE_DAILY_SECONDS, tags: ['daily-refresh', routeKey] },
  );

/**
 * Return the ISO-8601 timestamp of the last data refresh for the given
 * route. Server-only.
 *
 *   - Daily-refreshed routes (dashboard/backlog/analyze/geography/
 *     integrity/litigation/u-visa/about/sources/archives/disclaimer/
 *     privacy/terms) → tag-revalidated by the cron.
 *
 * Pages that should NOT use this helper (use page-local logic instead):
 *   - `/`        — history page is intentionally static.
 *   - `/news`    — uses getNewsLastUpdated() which records the actual
 *                  feed-fetch time, not the daily refresh tick.
 */
export async function getRouteLastUpdated(routeKey: string): Promise<string> {
  return cachedRouteStamp(routeKey)();
}
