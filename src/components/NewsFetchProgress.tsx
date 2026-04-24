'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Tag,
  Flag,
  Image as ImageIcon,
  Check,
  Loader2,
  Database,
  type LucideIcon,
} from 'lucide-react';
import type { IconType } from 'react-icons';
import {
  SiGooglenews,
  SiReddit,
  SiYcombinator,
  SiYoutube,
} from 'react-icons/si';

/**
 * Real-data progress indicator for the /news Suspense fallback.
 *
 * Opens an EventSource to /api/news/stream, which runs the five source
 * fetches in parallel on the server and streams per-source completion
 * events back over SSE. Each event flips the corresponding row to done.
 * The classifier + enrichment stages also emit events as they complete.
 *
 * If SSE fails for any reason (network, proxy strip) the component still
 * runs a slow background timer that advances rows, so the UI never
 * appears frozen — but the primary source of truth is the stream.
 */
type Status = 'pending' | 'loading' | 'done';

interface Step {
  key: string;
  label: string;
  Icon: LucideIcon | IconType;
  color: string;
}

const SOURCES: Step[] = [
  { key: 'google', label: 'Google News', Icon: SiGooglenews, color: '#4285f4' },
  { key: 'reddit', label: 'Reddit', Icon: SiReddit, color: '#ff4500' },
  { key: 'gdelt', label: 'GDELT', Icon: Database, color: '#10b981' },
  { key: 'hn', label: 'Hacker News', Icon: SiYcombinator, color: '#ff6600' },
  { key: 'youtube', label: 'YouTube', Icon: SiYoutube, color: '#ff0000' },
];

const STAGES: Step[] = [
  { key: 'state', label: 'Geo-tagging by state', Icon: MapPin, color: '#3b82f6' },
  { key: 'tag', label: 'Classifying by tag', Icon: Tag, color: '#a855f7' },
  { key: 'country', label: 'Inferring subject country', Icon: Flag, color: '#f59e0b' },
  { key: 'image', label: 'Attaching thumbnails', Icon: ImageIcon, color: '#10b981' },
];

type StatusMap = Record<string, Status>;

interface StreamEvent {
  kind:
    | 'source:start'
    | 'source:done'
    | 'source:error'
    | 'classify:start'
    | 'classify:done'
    | 'enrich:done'
    | 'done';
  key?: string;
  count?: number;
  durationMs?: number;
  total?: number;
}

export default function NewsFetchProgress() {
  const [srcStatus, setSrcStatus] = useState<StatusMap>(() =>
    Object.fromEntries(SOURCES.map((s) => [s.key, 'loading' as Status])),
  );
  const [stgStatus, setStgStatus] = useState<StatusMap>(() =>
    Object.fromEntries(STAGES.map((s) => [s.key, 'pending' as Status])),
  );
  const [counts, setCounts] = useState<Record<string, number>>({});
  const startedAt = useRef(Date.now());

  useEffect(() => {
    let es: EventSource | null = null;
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;

    try {
      es = new EventSource('/api/news/stream');
      es.onmessage = (ev) => {
        let data: StreamEvent | null = null;
        try {
          data = JSON.parse(ev.data) as StreamEvent;
        } catch {
          return;
        }
        if (!data) return;

        if (data.kind === 'source:start' && data.key) {
          setSrcStatus((s) => ({ ...s, [data!.key as string]: 'loading' }));
        } else if (data.kind === 'source:done' && data.key) {
          setSrcStatus((s) => ({ ...s, [data!.key as string]: 'done' }));
          if (typeof data.count === 'number') {
            setCounts((c) => ({ ...c, [data!.key as string]: data!.count as number }));
          }
        } else if (data.kind === 'source:error' && data.key) {
          // Show as done (with 0 count) so the row doesn't sit in loading forever.
          setSrcStatus((s) => ({ ...s, [data!.key as string]: 'done' }));
          setCounts((c) => ({ ...c, [data!.key as string]: 0 }));
        } else if (data.kind === 'classify:start') {
          setStgStatus((s) => ({
            ...s,
            state: 'loading',
            tag: 'loading',
          }));
        } else if (data.kind === 'classify:done') {
          setStgStatus((s) => ({ ...s, state: 'done', tag: 'done' }));
        } else if (data.kind === 'enrich:done' && data.key) {
          setStgStatus((s) => ({ ...s, [data!.key as string]: 'done' }));
        } else if (data.kind === 'done') {
          // Ensure everything flips to done in case we missed any event.
          setSrcStatus(
            Object.fromEntries(SOURCES.map((x) => [x.key, 'done'])),
          );
          setStgStatus(
            Object.fromEntries(STAGES.map((x) => [x.key, 'done'])),
          );
          es?.close();
        }
      };
      es.onerror = () => {
        // Silent fail — fallback timer below keeps UI moving.
      };
    } catch {
      // EventSource constructor failed (very old browsers) — fall through.
    }

    // Fallback: if SSE hasn't delivered a single event in 2s, nudge the rows
    // to loading so the UI is never visibly frozen.
    fallbackTimer = setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      if (elapsed > 2000) {
        setSrcStatus((s) => {
          const next = { ...s };
          for (const src of SOURCES)
            if (next[src.key] === 'pending') next[src.key] = 'loading';
          return next;
        });
      }
    }, 500);

    return () => {
      es?.close();
      if (fallbackTimer !== null) clearInterval(fallbackTimer);
    };
  }, []);

  const sourcesDone = SOURCES.filter((s) => srcStatus[s.key] === 'done').length;
  const stagesDone = STAGES.filter((s) => stgStatus[s.key] === 'done').length;
  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex h-full w-full flex-col p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-2 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="relative h-2 w-2 rounded-full bg-green-500">
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-60" />
          </span>
          {sourcesDone === SOURCES.length
            ? totalItems > 0
              ? `${totalItems} items fetched`
              : 'Rendering news'
            : 'Fetching live news'}
        </span>
        <span
          className="font-mono tabular-nums text-foreground"
          aria-live="polite"
        >
          {sourcesDone}/{SOURCES.length} sources · {stagesDone}/{STAGES.length}{' '}
          stages
        </span>
      </div>

      <div className="grid flex-1 gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
            Sources
          </p>
          <ul className="space-y-2">
            {SOURCES.map((s) => (
              <ProgressRow
                key={s.key}
                step={s}
                status={srcStatus[s.key] ?? 'pending'}
                count={counts[s.key]}
              />
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
            Enriching each item
          </p>
          <ul className="space-y-2">
            {STAGES.map((s) => (
              <ProgressRow
                key={s.key}
                step={s}
                status={stgStatus[s.key] ?? 'pending'}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ProgressRow({
  step,
  status,
  count,
}: {
  step: Step;
  status: Status;
  count?: number;
}) {
  const { Icon, label, color } = step;
  const bubbleBg =
    status === 'pending'
      ? 'rgba(148,163,184,0.15)'
      : status === 'loading'
        ? `${color}22`
        : `${color}33`;

  return (
    <li className="space-y-1">
      <div className="flex items-center gap-2.5 text-sm">
        <span
          className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300"
          style={{ backgroundColor: bubbleBg }}
        >
          <Icon
            className="h-3.5 w-3.5 transition-colors duration-300"
            style={{
              color: status === 'pending' ? 'rgb(148,163,184)' : color,
            }}
          />
          {status === 'loading' && (
            <span
              aria-hidden
              className="absolute inset-0 animate-spin rounded-full border-2"
              style={{
                borderColor: `${color}33`,
                borderTopColor: color,
              }}
            />
          )}
        </span>
        <span
          className={
            status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
          }
        >
          {label}
        </span>
        {typeof count === 'number' && status === 'done' && (
          <span className="text-[10px] tabular-nums font-mono text-muted-foreground">
            {count}
          </span>
        )}
        <span className="ml-auto inline-flex h-5 w-5 items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {status === 'done' ? (
              <motion.span
                key="done"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow-sm"
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </motion.span>
            ) : status === 'loading' ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
              </motion.span>
            ) : (
              <motion.span
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="block h-1 w-1 rounded-full bg-muted"
              />
            )}
          </AnimatePresence>
        </span>
      </div>

      <div className="ml-9 h-1 overflow-hidden rounded-full bg-muted relative">
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: color }}
          initial={false}
          animate={{
            width:
              status === 'pending' ? '0%' : status === 'loading' ? '70%' : '100%',
          }}
          transition={{ duration: status === 'done' ? 0.3 : 1.2, ease: 'easeOut' }}
        >
          {status === 'loading' && (
            <span
              aria-hidden
              className="absolute inset-y-0 w-1/2 animate-[shimmerSweep_0.9s_linear_infinite]"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)',
              }}
            />
          )}
        </motion.div>
      </div>
    </li>
  );
}
