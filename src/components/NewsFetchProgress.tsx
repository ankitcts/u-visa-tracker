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

// Pipeline timing (real milliseconds).
const STEP_DURATION_MS = 700; // how long each row spends "loading"
const STEP_STAGGER_MS = 450; // delay between rows starting
const CYCLE_PAUSE_MS = 1200; // pause after pipeline completes before restart

const TOTAL_STEPS = SOURCES.length + STAGES.length; // 9
const PIPELINE_DURATION_MS =
  (TOTAL_STEPS - 1) * STEP_STAGGER_MS + STEP_DURATION_MS;
const CYCLE_DURATION_MS = PIPELINE_DURATION_MS + CYCLE_PAUSE_MS;

/**
 * Live-status widget for the /news Suspense fallback.
 * rAF-driven: each frame computes (elapsed ms since mount) and derives the
 * progress of every source + stage deterministically. No setInterval and no
 * stale-closure risk — if the page is visible at all, the bars are moving.
 * Loops continuously so a slow fetch keeps showing motion.
 */
export default function NewsFetchProgress() {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const tick = () => {
      setElapsed(performance.now() - start);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Time within the current cycle (0..CYCLE_DURATION_MS).
  const t = elapsed % CYCLE_DURATION_MS;

  /** Compute progress (0..1) for a step index, where i is its position in
   *  the overall 9-item pipeline. Each step starts at i*STAGGER, takes
   *  DURATION to complete, then remains at 100% until the cycle ends.
   */
  function progressFor(i: number): number {
    const startAt = i * STEP_STAGGER_MS;
    if (t < startAt) return 0;
    if (t >= PIPELINE_DURATION_MS) return 1; // pipeline complete — all done
    const localT = t - startAt;
    if (localT >= STEP_DURATION_MS) return 1;
    return Math.max(0, Math.min(1, localT / STEP_DURATION_MS));
  }

  function statusFor(p: number): Status {
    if (p <= 0) return 'pending';
    if (p >= 1) return 'done';
    return 'loading';
  }

  const sourceProgress = SOURCES.map((_, i) => progressFor(i));
  const stageProgress = STAGES.map((_, i) => progressFor(SOURCES.length + i));

  const sourceStatuses = sourceProgress.map(statusFor);
  const stageStatuses = stageProgress.map(statusFor);

  const sourcesDone = sourceStatuses.filter((s) => s === 'done').length;
  const stagesDone = stageStatuses.filter((s) => s === 'done').length;

  return (
    <div className="flex h-full w-full flex-col p-4 md:p-6">
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
                progress={sourceProgress[i]}
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
                progress={stageProgress[i]}
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
          className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: bubbleBg }}
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
            status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
          }
        >
          {label}
        </span>
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

      {/* Continuous rAF-driven progress bar — width is a plain inline style so
          it updates every frame without motion's diffing. Shimmer overlay gives
          unmistakable motion on rows that are actively filling. */}
      <div className="ml-9 h-1 overflow-hidden rounded-full bg-muted relative">
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: color,
            transition: 'width 80ms linear',
          }}
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
        </div>
      </div>
    </li>
  );
}
