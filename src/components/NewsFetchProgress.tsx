'use client';

import { useEffect, useState } from 'react';
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
 * Animated live-status widget for the /news Suspense fallback.
 *
 * Each source & enrichment stage moves through
 *   pending → loading (with progress bar) → done (animated green tick)
 * on a staggered timer so the user sees clear sequential completion.
 *
 * Purely cosmetic — the real fetches happen on the server behind the
 * <Suspense> boundary. But it makes the wait feel intentional instead of
 * frozen.
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

// Each "tick" is ~450ms. A step is loading for 2 ticks (~900ms), then done.
const TICK_MS = 450;
const LOADING_TICKS = 2;

export default function NewsFetchProgress() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const statusFor = (startTick: number): Status => {
    if (tick < startTick) return 'pending';
    if (tick < startTick + LOADING_TICKS) return 'loading';
    return 'done';
  };

  // Per-row loading progress (0..1) while in loading state.
  const progressFor = (startTick: number): number => {
    if (tick < startTick) return 0;
    const raw = (tick - startTick) / LOADING_TICKS;
    return Math.max(0, Math.min(1, raw));
  };

  const sourceStatuses = SOURCES.map((_, i) => statusFor(i));
  const stageStatuses = STAGES.map((_, i) =>
    statusFor(SOURCES.length + i + 1),
  );

  const sourcesDone = sourceStatuses.filter((s) => s === 'done').length;
  const stagesDone = stageStatuses.filter((s) => s === 'done').length;

  return (
    <div className="flex h-full w-full flex-col p-4 md:p-6">
      {/* Top counter */}
      <div className="mb-4 flex items-center justify-between text-[10.5px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="relative h-2 w-2 rounded-full bg-green-500">
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-60" />
          </span>
          Fetching live news
        </span>
        <span className="font-mono tabular-nums text-foreground">
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
            {SOURCES.map((s, i) => (
              <ProgressRow
                key={s.key}
                step={s}
                status={sourceStatuses[i]}
                progress={progressFor(i)}
              />
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
            Enriching each item
          </p>
          <ul className="space-y-2">
            {STAGES.map((s, i) => (
              <ProgressRow
                key={s.key}
                step={s}
                status={stageStatuses[i]}
                progress={progressFor(SOURCES.length + i + 1)}
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
  progress,
}: {
  step: Step;
  status: Status;
  progress: number;
}) {
  const { Icon, label, color } = step;
  const bg =
    status === 'pending'
      ? 'rgba(148,163,184,0.15)'
      : status === 'loading'
        ? `${color}22`
        : `${color}33`;

  return (
    <li className="space-y-1">
      <div className="flex items-center gap-2.5 text-sm">
        <span
          className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: bg }}
        >
          <Icon
            className="h-3.5 w-3.5"
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
            status === 'pending'
              ? 'text-muted-foreground'
              : 'text-foreground'
          }
        >
          {label}
        </span>
        <span className="ml-auto inline-flex h-5 w-5 items-center justify-center">
          <AnimatePresence mode="wait">
            {status === 'done' ? (
              <motion.span
                key="done"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 14,
                }}
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

      {/* Per-row progress bar */}
      <div className="ml-9 h-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={false}
          animate={{
            width:
              status === 'pending'
                ? '0%'
                : status === 'loading'
                  ? `${Math.round(progress * 100)}%`
                  : '100%',
          }}
          transition={{
            duration: status === 'done' ? 0.25 : 0.45,
            ease: 'easeOut',
          }}
        />
      </div>
    </li>
  );
}
