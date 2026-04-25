import type { ReactNode } from 'react';
import LastUpdatedPill from '@/components/LastUpdatedPill';

/**
 * Standard page header. One row: optional badge → title → last-updated pill
 * (right-aligned). Description paragraph beneath, full-width muted text.
 *
 * Use on every primary page so titles and summaries align consistently and
 * the title row stays a single line on desktop.
 */
export default function PageHeader({
  title,
  description,
  badge,
  routeKey,
  showLastUpdated = true,
  titleClassName = 'text-3xl font-semibold tracking-tight',
}: {
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  /** Route key for the daily-bucketed last-updated stamp. Pass false-y to skip. */
  routeKey?: string;
  showLastUpdated?: boolean;
  titleClassName?: string;
}) {
  return (
    <header className="w-full space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {badge}
          <h1 className={titleClassName}>{title}</h1>
        </div>
        {showLastUpdated && routeKey && <LastUpdatedPill routeKey={routeKey} />}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground w-full max-w-none">
          {description}
        </p>
      )}
    </header>
  );
}
