import { Clock } from 'lucide-react';
import { getRouteLastUpdated } from '@/lib/refresh';
import LocalTimestamp from '@/components/LocalTimestamp';

/**
 * Pill showing when the page's underlying data was last reconciled
 * against the upstream USCIS XLSX (i.e. the data vintage, NOT the
 * deploy time or cache-bust time). Sourced from `LAST_UPDATED` in
 * src/lib/data.ts via `getRouteLastUpdated()`.
 *
 * Renders as UTC in the SSR HTML; reformatted in the visitor's local
 * timezone after hydration via <LocalTimestamp>.
 *
 * `customDate` overrides the data.ts vintage (used by /news to show
 * the live feed-fetch ISO instead).
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
      title={`Data reconciled against USCIS source on ${iso}`}
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
