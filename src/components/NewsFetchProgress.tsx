'use client';

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
 * CSS-only staggered progress loader. Every row uses a pair of keyframe
 * animations with per-row `animation-delay`, so progression happens on the
 * compositor — no useEffect, no rAF, no setInterval, no React state. The
 * counter re-renders driven by a single `useEffect` tick so it stays in
 * sync, but even that is non-critical: if the ticker froze, every bar would
 * still fill because the animation is entirely CSS.
 */
import { useEffect, useState } from 'react';

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

const STAGGER_MS = 450;
const FILL_MS = 700;
const TOTAL_STEPS = SOURCES.length + STAGES.length;
const PIPELINE_MS = (TOTAL_STEPS - 1) * STAGGER_MS + FILL_MS;
const CYCLE_MS = PIPELINE_MS + 1200;

export default function NewsFetchProgress() {
  // Drives only the counter "N/5 · M/4" — not the bars. Bars are pure CSS.
  // So even if this effect fails to update, the motion still plays.
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start), 80);
    return () => clearInterval(id);
  }, []);

  const cycleT = elapsed % CYCLE_MS;
  const doneAt = (i: number) => i * STAGGER_MS + FILL_MS;
  const isDone = (i: number) =>
    cycleT >= doneAt(i) && cycleT < PIPELINE_MS + 1200;

  const sourcesDone = SOURCES.filter((_, i) => isDone(i)).length;
  const stagesDone = STAGES.filter((_, i) => isDone(SOURCES.length + i)).length;

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
              <ProgressRow key={s.key} step={s} index={i} />
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
            Enriching each item
          </p>
          <ul className="space-y-2">
            {STAGES.map((s, i) => (
              <ProgressRow key={s.key} step={s} index={SOURCES.length + i} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ step, index }: { step: Step; index: number }) {
  const { Icon, label, color } = step;
  const delayMs = index * STAGGER_MS;

  return (
    <li className="space-y-1">
      <div className="flex items-center gap-2.5 text-sm">
        <span
          className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={
            {
              backgroundColor: 'rgba(148,163,184,0.15)',
              animation: `rowBubbleBg ${CYCLE_MS}ms linear infinite`,
              animationDelay: `${delayMs}ms`,
              ['--row-color' as string]: color,
            } as React.CSSProperties
          }
        >
          <Icon
            className="h-3.5 w-3.5 row-icon"
            style={
              {
                color: 'rgb(148,163,184)',
                animation: `rowIconColor ${CYCLE_MS}ms linear infinite`,
                animationDelay: `${delayMs}ms`,
                ['--row-color' as string]: color,
              } as React.CSSProperties
            }
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-2"
            style={{
              borderColor: `${color}33`,
              borderTopColor: color,
              animation: `rowSpin 0.9s linear infinite, rowSpinVisible ${CYCLE_MS}ms linear infinite`,
              animationDelay: `0s, ${delayMs}ms`,
              opacity: 0,
            }}
          />
        </span>

        <span className="row-label text-foreground">{label}</span>

        <span className="ml-auto inline-flex h-5 w-5 items-center justify-center">
          <span
            className="row-done inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow-sm"
            style={{
              opacity: 0,
              transform: 'scale(0.3)',
              animation: `rowTick ${CYCLE_MS}ms linear infinite`,
              animationDelay: `${delayMs + FILL_MS - 150}ms`,
            }}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span
            className="row-loader absolute"
            style={{
              animation: `rowLoaderVisible ${CYCLE_MS}ms linear infinite`,
              animationDelay: `${delayMs}ms`,
              opacity: 0,
            }}
          >
            <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
          </span>
        </span>
      </div>

      {/* Progress bar — pure CSS, fills from 0 to 100% then holds until cycle restart */}
      <div className="ml-9 h-1 overflow-hidden rounded-full bg-muted relative">
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            width: '0%',
            backgroundColor: color,
            animation: `rowFill ${CYCLE_MS}ms linear infinite`,
            animationDelay: `${delayMs}ms`,
          }}
        >
          <span
            aria-hidden
            className="absolute inset-y-0 w-1/2"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)',
              animation: 'shimmerSweep 0.9s linear infinite',
            }}
          />
        </div>
      </div>
    </li>
  );
}
