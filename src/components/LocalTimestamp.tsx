'use client';

import { useEffect, useState } from 'react';

/**
 * Formats a UTC ISO-8601 timestamp in the visitor's local timezone.
 * Renders the UTC string on the server (so the SSR HTML is stable and
 * SEO-friendly) and re-formats once mounted in the client. Avoids the
 * hydration-mismatch warning that you'd get from calling
 * `toLocaleString()` directly during SSR.
 */
export default function LocalTimestamp({
  iso,
  fallback,
}: {
  iso: string;
  /** Server-side / pre-hydration display. Defaults to the date in UTC. */
  fallback?: string;
}) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return;
    setLabel(
      d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }),
    );
  }, [iso]);

  if (label) return <>{label}</>;

  // SSR / pre-hydration fallback. Render UTC date+time so the markup is
  // stable and meaningful before JS runs.
  if (fallback) return <>{fallback}</>;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return <>{iso}</>;
  return (
    <>
      {d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short',
      })}
    </>
  );
}
