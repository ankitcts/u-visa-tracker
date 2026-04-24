'use client';

import { useEffect, useState } from 'react';
import {
  MapPin,
  Tag,
  Flag,
  Image as ImageIcon,
  Check,
  Loader2,
  Database,
  Info,
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
 * Scripted one-shot progress indicator for the /news Suspense fallback.
 *
 * The real data fetch happens on the server and resolves whenever it resolves;
 * this widget is purely a visual affordance so the wait feels intentional.
 * Each row animates from pending → loading → done on a pre-scripted 450ms
 * stagger, ends at 4300ms with a green tick, and STAYS done. No loop.
 *
 * The counter "N/5 · M/4" mirrors the scripted timeline, not live fetch
 * state — so we label it "Scripted" to be honest about that.
 */

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
const PIPELINE_END_MS = (TOTAL_STEPS - 1) * STAGGER_MS + FILL_MS;

export default function NewsFetchProgress() {
  // Drives the counter only. Re-renders every 100ms until the scripted
  // pipeline finishes, then stops. Bars are pure CSS and run regardless.
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const e = Date.now() - start;
      setElapsed(e);
      if (e > PIPELINE_END_MS + 200) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, []);

  const doneAt = (i: number) => i * STAGGER_MS + FILL_MS;
  const isDoneAt = (i: number) => elapsed >= doneAt(i);

  const sourcesDone = SOURCES.filter((_, i) => isDoneAt(i)).length;
  const stagesDone = STAGES.filter((_, i) => isDoneAt(SOURCES.length + i)).length;

  const pipelineComplete = elapsed >= PIPELINE_END_MS;

  return (
    <div className="flex h-full w-full flex-col p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-2 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="relative h-2 w-2 rounded-full bg-green-500">
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-60" />
          </span>
          {pipelineComplete ? 'Rendering news' : 'Fetching live news'}
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

      <p className="mt-4 inline-flex items-center gap-1 text-[10px] text-muted-foreground italic">
        <Info className="h-3 w-3" />
        Scripted pipeline indicator — the real fetch resolves independently
        when upstream sources respond.
      </p>
    </div>
  );
}

function ProgressRow({ step, index }: { step: Step; index: number }) {
  const { Icon, label, color } = step;
  const delayMs = index * STAGGER_MS;

  const oneShot = {
    animationDuration: `${FILL_MS}ms`,
    animationDelay: `${delayMs}ms`,
    animationIterationCount: '1' as const,
    animationFillMode: 'forwards' as const,
    animationTimingFunction: 'ease-out',
  };

  return (
    <li className="space-y-1">
      <div className="flex items-center gap-2.5 text-sm">
        <span
          className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={
            {
              backgroundColor: 'rgba(148,163,184,0.15)',
              animationName: 'rowBubbleBg',
              ...oneShot,
              ['--row-color' as string]: color,
            } as React.CSSProperties
          }
        >
          <Icon
            className="h-3.5 w-3.5"
            style={
              {
                color: 'rgb(148,163,184)',
                animationName: 'rowIconColor',
                ...oneShot,
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
              opacity: 0,
              animation: `rowSpinVisible ${FILL_MS}ms ${delayMs}ms ease-out 1 forwards, rowSpin 0.9s linear infinite`,
            }}
          />
        </span>

        <span className="text-foreground">{label}</span>

        <span className="ml-auto relative inline-flex h-5 w-5 items-center justify-center">
          <span
            className="absolute inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow-sm"
            style={{
              opacity: 0,
              transform: 'scale(0.3)',
              animation: `rowTick 280ms ${delayMs + FILL_MS - 140}ms cubic-bezier(0.34, 1.56, 0.64, 1) 1 forwards`,
            }}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span
            className="absolute"
            style={{
              opacity: 0,
              animation: `rowLoaderVisible ${FILL_MS}ms ${delayMs}ms linear 1 forwards`,
            }}
          >
            <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
          </span>
        </span>
      </div>

      {/* Progress bar — fills once, holds at 100%. No loop. */}
      <div className="ml-9 h-1 overflow-hidden rounded-full bg-muted relative">
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            width: '0%',
            backgroundColor: color,
            animationName: 'rowFill',
            ...oneShot,
            animationTimingFunction: 'ease-out',
          }}
        >
          <span
            aria-hidden
            className="absolute inset-y-0 w-1/2"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)',
              animation: `shimmerSweep 0.9s linear infinite, rowLoaderVisible ${FILL_MS}ms ${delayMs}ms linear 1 forwards`,
            }}
          />
        </div>
      </div>
    </li>
  );
}
