'use client';

import { useEffect, useRef, useState } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import USNewsMap from './USNewsMapClient';
import InteractiveNewsFeed from './InteractiveNewsFeed';
import LocalTimestamp from './LocalTimestamp';
import { cn } from '@/lib/utils';
import type { ClassifiedNewsItem } from '@/lib/news-classifier';

interface FeedSnapshot {
  items: ClassifiedNewsItem[];
  lastUpdated: string;
  refreshSeconds: number;
}

/**
 * Wraps the map + interactive feed and refreshes both in-place every
 * `refreshSeconds` by polling /api/news/feed. Renders a "Last refreshed
 * <date> · Next refresh in Xm Ys" pill that ticks down between polls.
 *
 * The first paint uses the SSR-rendered initialItems so the page is
 * never blank; subsequent paints come from the JSON endpoint.
 */
export default function LiveNewsSection({
  initialItems,
  initialLastUpdated,
  refreshSeconds,
}: {
  initialItems: ClassifiedNewsItem[];
  initialLastUpdated: string;
  refreshSeconds: number;
}) {
  const [items, setItems] = useState<ClassifiedNewsItem[]>(initialItems);
  const [lastUpdated, setLastUpdated] = useState<string>(initialLastUpdated);
  // `lastPolledAt` tracks the last successful poll completion, separate
  // from `lastUpdated` (which only changes when the server actually has
  // new items). The countdown is keyed off this so it resets on every
  // poll, not only when the data changed — otherwise after 5 min of
  // upstream quiet the pill sticks at "Next refresh in 0s" forever and
  // the page looks broken.
  const [lastPolledAt, setLastPolledAt] = useState<number>(() => new Date(initialLastUpdated).getTime());
  const [now, setNow] = useState<number>(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const inFlight = useRef(false);

  const refresh = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    try {
      // `no-store` on every poll (manual + auto). With `default`, the
      // browser served the first response from its HTTP cache for the
      // whole revalidate window, so polling never actually hit the
      // network and data never moved.
      const res = await fetch('/api/news/feed', { cache: 'no-store' });
      if (res.ok) {
        const snap = (await res.json()) as FeedSnapshot;
        if (snap.lastUpdated !== lastUpdated) {
          setItems(snap.items);
          setLastUpdated(snap.lastUpdated);
        }
        // Always advance the poll clock, even if the server returned
        // the same snapshot — otherwise the countdown never resets.
        setLastPolledAt(Date.now());
      }
    } catch {
      // network blip — try again next tick
    } finally {
      inFlight.current = false;
      setRefreshing(false);
    }
  };

  // Auto-refresh poll loop.
  useEffect(() => {
    const id = window.setInterval(refresh, refreshSeconds * 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSeconds]);

  // Refresh when the tab becomes visible again, in case it's been hidden
  // longer than refreshSeconds and the interval drifted.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1 Hz countdown ticker for the "next refresh in" label.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const nextRefreshAt = lastPolledAt + refreshSeconds * 1000;
  const remainingMs = Math.max(0, nextRefreshAt - now);
  const remainingSec = Math.ceil(remainingMs / 1000);
  const countdown =
    remainingSec >= 60
      ? `${Math.floor(remainingSec / 60)}m ${String(remainingSec % 60).padStart(2, '0')}s`
      : `${remainingSec}s`;

  return (
    <div className="space-y-4">
      <RefreshPill
        lastUpdated={lastUpdated}
        countdown={countdown}
        refreshing={refreshing}
        onClick={() => refresh()}
      />
      <div className="relative">
        <div
          className={cn(
            'transition-opacity duration-300',
            refreshing && 'opacity-50 pointer-events-none',
          )}
        >
          <USNewsMap news={items} lastUpdated={lastUpdated} />
          <div className="mt-4">
            <InteractiveNewsFeed items={items} lastUpdated={lastUpdated} />
          </div>
        </div>
        {refreshing && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-live="polite"
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/95 backdrop-blur shadow-md px-3 py-1.5 text-xs font-medium text-foreground">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden />
              <span>Refreshing live news…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RefreshPill({
  lastUpdated,
  countdown,
  refreshing,
  onClick,
}: {
  lastUpdated: string;
  countdown: string;
  refreshing: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-muted-foreground">
        <Clock className="h-3 w-3" aria-hidden />
        <span>
          Last refreshed{' '}
          <span className="text-foreground font-medium">
            <LocalTimestamp iso={lastUpdated} />
          </span>
        </span>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={refreshing}
        title="Refresh now"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border bg-background/60 hover:bg-accent hover:text-foreground px-2.5 py-1 text-muted-foreground transition-colors',
          refreshing && 'opacity-60 cursor-wait',
        )}
      >
        <RefreshCw
          className={cn('h-3 w-3', refreshing && 'animate-spin')}
          aria-hidden
        />
        <span>
          {refreshing ? 'Refreshing…' : `Next refresh in ${countdown}`}
        </span>
      </button>
    </div>
  );
}
