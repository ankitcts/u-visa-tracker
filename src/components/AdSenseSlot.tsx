'use client';

import { useEffect } from 'react';

interface Props {
  /** AdSense slot ID, e.g. "1234567890". */
  slot: string;
  /** Display layout — "auto" lets Google decide, others are explicit. */
  layout?: 'auto' | 'in-article' | 'in-feed';
  className?: string;
}

/**
 * Renders a Google AdSense ad unit. Only mounts when both
 * `NEXT_PUBLIC_ADSENSE_ID` is set and a slot id is passed. The unit is
 * marked sponsored, kept narrow, and labelled so readers can distinguish
 * site content from advertising.
 *
 * Per CLAUDE.md guardrails, do NOT mount this on integrity, geography,
 * litigation, or news pages — pages adjacent to crime/victim content.
 * Safe to use on /about, /sources, /archives, /backlog, /analyze,
 * /dashboard.
 */
export default function AdSenseSlot({
  slot,
  layout = 'auto',
  className,
}: Props) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!client) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {},
      );
    } catch {
      // Ignore — script not yet loaded; AdSense will retry.
    }
  }, [client]);

  if (!client) return null;

  return (
    <aside
      role="complementary"
      aria-label="Advertisement"
      className={
        'my-6 rounded-md border bg-muted/20 px-3 py-2 ' + (className ?? '')
      }
    >
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
        Advertisement
      </p>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={layout}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
