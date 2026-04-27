/**
 * Last-updated helpers.
 *
 * The pill on every data page should be honest about *when the
 * underlying data actually changed*. The truth now lives in the active
 * snapshot's `createdAt` (see `src/lib/snapshot.ts`); the auto-sync
 * workflow drops a new snapshot JSON into `public/data/snapshots/` and
 * the index entry's `createdAt` is what the pill renders.
 *
 * Why this is decoupled from code: a USCIS data refresh is purely a
 * data event. Changing only `public/data/...` does NOT trigger a
 * Next.js bundle rebuild — the JSON files are read at request time
 * (cached briefly via unstable_cache for performance).
 *
 * Routes that bypass this helper:
 *   - `/`        — homepage / history timeline are intentionally static.
 *   - `/news`    — uses getNewsLastUpdated() which records the actual
 *                  feed-fetch time.
 *
 * The ISO string is rendered in UTC server-side and re-formatted in the
 * visitor's local timezone by the <LocalTimestamp> client component.
 */
import { getLastUpdatedIso } from './snapshot';

/**
 * Return the ISO-8601 timestamp of the active snapshot. Server-only.
 *
 * `routeKey` is preserved for backward compat — every daily-refreshed
 * route resolves to the same snapshot timestamp today. If a future
 * route ever needs its own vintage, branch on routeKey here.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getRouteLastUpdated(_routeKey: string): Promise<string> {
  return getLastUpdatedIso();
}
