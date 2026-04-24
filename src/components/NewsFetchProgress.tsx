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
 * Animated live-status widget for the `/news` Suspense fallback.
 * Cycles each fetch source and classification stage through
 *   pending → loading → done
 * on a short timer so the skeleton feels alive while the real data streams
 * in behind it. It's client-only and purely decorative — the real fetches
 * are happening on the server and settle whenever they settle.
 */
type Status = 'pending' | 'loading' | 'done';

interface Step {
  key: string;
  label: string;
  Icon: LucideIcon | IconType;
  color: string;
}

const SOURCES: Step[] = [
  // Official brand marks from simple-icons (via react-icons/si) where we have
  // them. GDELT has no simple-icons entry; using Lucide's Database glyph with
  // its brand green (#10b981).
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

export default function NewsFetchProgress() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 550);
    return () => clearInterval(id);
  }, []);

  // Stagger: sources light up first, then stages. Each finishes ~1.1s after
  // it starts so the user sees a wave of ✔s down the list.
  const statusFor = (i: number): Status => {
    if (tick < i) return 'pending';
    if (tick < i + 2) return 'loading';
    return 'done';
  };

  const sourceStatuses = SOURCES.map((_, i) => statusFor(i));
  const stageStatuses = STAGES.map((_, i) =>
    statusFor(SOURCES.length + i + 1),
  );

  return (
    <div className="grid gap-6 p-4 md:p-6 sm:grid-cols-2">
      <div>
        <p className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
          Fetching from 5 sources
        </p>
        <ul className="space-y-1.5">
          {SOURCES.map((s, i) => (
            <ProgressRow key={s.key} step={s} status={sourceStatuses[i]} />
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
          Enriching each item
        </p>
        <ul className="space-y-1.5">
          {STAGES.map((s, i) => (
            <ProgressRow key={s.key} step={s} status={stageStatuses[i]} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function ProgressRow({
  step,
  status,
}: {
  step: Step;
  status: Status;
}) {
  const { Icon, label, color } = step;
  return (
    <li className="flex items-center gap-2.5 text-sm">
      <span
        className="relative inline-flex h-7 w-7 items-center justify-center rounded-full shrink-0 transition-colors"
        style={{
          backgroundColor:
            status === 'pending'
              ? 'rgba(148,163,184,0.15)'
              : status === 'loading'
                ? `${color}22`
                : `${color}33`,
        }}
      >
        <Icon
          className="h-3.5 w-3.5"
          style={{
            color:
              status === 'pending' ? 'rgb(148,163,184)' : color,
          }}
        />
        {status === 'loading' && (
          <span
            className="absolute inset-0 rounded-full border-2 animate-spin"
            style={{
              borderColor: `${color}33`,
              borderTopColor: color,
            }}
            aria-hidden
          />
        )}
      </span>
      <span
        className={
          status === 'pending'
            ? 'text-muted-foreground'
            : status === 'loading'
              ? 'text-foreground'
              : 'text-foreground'
        }
      >
        {label}
      </span>
      <span className="ml-auto">
        {status === 'done' ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : status === 'loading' ? (
          <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
        ) : (
          <span className="block h-1 w-1 rounded-full bg-muted" />
        )}
      </span>
    </li>
  );
}
