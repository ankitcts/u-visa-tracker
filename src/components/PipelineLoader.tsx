'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2, type LucideIcon } from 'lucide-react';
import type { IconType } from 'react-icons';

/**
 * Reusable progressive pipeline loader. Each step animates from
 * pending → loading → done with the same CSS keyframes the /news
 * SSE-driven loader uses (rowFill / rowBubbleBg / rowIconColor /
 * rowSpinVisible / rowTick / rowLoaderVisible — declared in
 * globals.css). Call once with a list of steps and a stagger.
 *
 * Use cases:
 *  - app/loading.tsx (root) — generic site-wide skeleton
 *  - app/<route>/loading.tsx — bespoke step labels per page
 *  - any inline Suspense fallback that wants the same look
 */
export interface PipelineStep {
  key: string;
  label: string;
  Icon: LucideIcon | IconType;
  /** Brand color for that step's icon + bar (default: --primary). */
  color?: string;
}

export interface PipelineLoaderProps {
  /** Heading shown above the rows. */
  title?: string;
  /** One-line caption under the heading. */
  subtitle?: string;
  steps: PipelineStep[];
  /** ms between each row's start (default 350). */
  staggerMs?: number;
  /** ms each row spends filling (default 700). */
  fillMs?: number;
  /** Wraps the loader in a card-style container by default. Pass false
   *  if you're embedding inside another card. */
  framed?: boolean;
}

const DEFAULT_COLOR = '#3b82f6';

export default function PipelineLoader({
  title = 'Loading',
  subtitle,
  steps,
  staggerMs = 350,
  fillMs = 700,
  framed = true,
}: PipelineLoaderProps) {
  const [elapsed, setElapsed] = useState(0);
  const pipelineEnd = (steps.length - 1) * staggerMs + fillMs;

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const e = Date.now() - start;
      setElapsed(e);
      if (e > pipelineEnd + 200) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, [pipelineEnd]);

  const stepsDone = steps.filter(
    (_, i) => elapsed >= i * staggerMs + fillMs,
  ).length;
  const allDone = stepsDone >= steps.length;

  const inner = (
    <div className="flex h-full w-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-2 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="relative h-2 w-2 rounded-full bg-green-500">
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-60" />
          </span>
          {allDone ? 'Almost ready…' : title}
        </span>
        <span
          className="font-mono tabular-nums text-foreground"
          aria-live="polite"
        >
          {stepsDone}/{steps.length}
        </span>
      </div>

      {subtitle && (
        <p className="mb-3 -mt-2 text-xs text-muted-foreground max-w-2xl">
          {subtitle}
        </p>
      )}

      <ul className="space-y-2">
        {steps.map((s, i) => (
          <PipelineRow
            key={s.key}
            step={s}
            index={i}
            staggerMs={staggerMs}
            fillMs={fillMs}
          />
        ))}
      </ul>
    </div>
  );

  if (!framed) return inner;
  return (
    <div className="rounded-xl border bg-card/60 p-5 md:p-6 max-w-2xl mx-auto w-full">
      {inner}
    </div>
  );
}

function PipelineRow({
  step,
  index,
  staggerMs,
  fillMs,
}: {
  step: PipelineStep;
  index: number;
  staggerMs: number;
  fillMs: number;
}) {
  const { Icon, label, color = DEFAULT_COLOR } = step;
  const delayMs = index * staggerMs;

  const oneShot = {
    animationDuration: `${fillMs}ms`,
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
              animation: `rowSpinVisible ${fillMs}ms ${delayMs}ms ease-out 1 forwards, rowSpin 0.9s linear infinite`,
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
              animation: `rowTick 280ms ${delayMs + fillMs - 140}ms cubic-bezier(0.34, 1.56, 0.64, 1) 1 forwards`,
            }}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span
            className="absolute"
            style={{
              opacity: 0,
              animation: `rowLoaderVisible ${fillMs}ms ${delayMs}ms linear 1 forwards`,
            }}
          >
            <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
          </span>
        </span>
      </div>

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
              animation: `shimmerSweep 0.9s linear infinite, rowLoaderVisible ${fillMs}ms ${delayMs}ms linear 1 forwards`,
            }}
          />
        </div>
      </div>
    </li>
  );
}
