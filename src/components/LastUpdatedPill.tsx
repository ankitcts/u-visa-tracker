import { Clock } from 'lucide-react';
import { getRouteLastUpdated } from '@/lib/refresh';
import LocalTimestamp from '@/components/LocalTimestamp';

/**
 * Pill showing when the page's underlying data was last refreshed by
 * the nightly cron. The ISO timestamp is fetched server-side from the
 * unstable_cache backed `getRouteLastUpdated()`; it renders as UTC in
 * the SSR HTML and is reformatted in the visitor's local timezone after
 * hydration via <LocalTimestamp>.
 *
 * `customDate` overrides the route-level cache (used by /news to show
 * the live feed-fetch ISO).
 */
export default async function LastUpdatedPill({
  routeKey,
  prefix = 'Last updated',
  customDate,
}: {
  routeKey: string;
  prefix?: string;
  customDate?: string;
}) {
  const iso = customDate ?? (await getRouteLastUpdated(routeKey));

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground"
      title={`Refreshes nightly via Vercel Cron · ${iso}`}
    >
      <Clock className="h-3 w-3" aria-hidden />
      <span>
        {prefix}{' '}
        <span className="text-foreground font-medium">
          <LocalTimestamp iso={iso} />
        </span>
      </span>
    </div>
  );
}
