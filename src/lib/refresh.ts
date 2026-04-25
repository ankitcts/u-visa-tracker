/**
 * Daily-refresh timestamp helper.
 *
 * `getPageLastUpdated()` caches the current Date at a 24-hour bucket via
 * `unstable_cache`, so every page calling it inside the same UTC day sees
 * the same value. The first request *after* 24h elapses regenerates the
 * cache — i.e. each page effectively shows "last updated" timestamps that
 * tick forward once a day.
 *
 * For true scheduled nightly refresh (regardless of traffic), pair this
 * with a Vercel Cron entry (`vercel.json` -> "crons") that pings each
 * route once a day at e.g. 03:00 UTC.
 */
import { unstable_cache } from 'next/cache';

const REVALIDATE_DAILY_SECONDS = 60 * 60 * 24; // 24h

export const getPageLastUpdated = unstable_cache(
  async () => new Date().toISOString(),
  ['u-visa-page-last-updated-v1'],
  { revalidate: REVALIDATE_DAILY_SECONDS, tags: ['daily-refresh'] },
);

/**
 * Per-route variant that buckets independently — so /dashboard's daily
 * timestamp doesn't drag /backlog's or vice versa. Each route's first
 * request after midnight UTC produces a fresh "last updated" stamp.
 */
export function getRouteLastUpdated(routeKey: string) {
  return unstable_cache(
    async () => new Date().toISOString(),
    [`u-visa-route-last-updated-v1`, routeKey],
    { revalidate: REVALIDATE_DAILY_SECONDS, tags: ['daily-refresh', routeKey] },
  )();
}
