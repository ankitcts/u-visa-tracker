import { Clock } from 'lucide-react';
import { getRouteLastUpdated } from '@/lib/refresh';

/**
 * Small pill showing when the page's data was last refreshed. Pair it
 * with a per-route `routeKey` so each page gets its own daily bucket
 * (so /dashboard's stamp doesn't drag /backlog's, etc.). Server component;
 * the timestamp is the daily-bucketed value from getRouteLastUpdated.
 */
export default async function LastUpdatedPill({
  routeKey,
  prefix = 'Page data last refreshed',
}: {
  routeKey: string;
  prefix?: string;
}) {
  const iso = await getRouteLastUpdated(routeKey);
  const date = new Date(iso);
  const label = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground"
      title={`Refreshes daily · ${date.toUTCString()}`}
    >
      <Clock className="h-3 w-3" aria-hidden />
      <span>
        {prefix}{' '}
        <span className="text-foreground font-medium">{label}</span>
      </span>
      <span className="text-muted-foreground/70 ml-1 text-[10px] uppercase tracking-wider">
        · daily
      </span>
    </div>
  );
}
