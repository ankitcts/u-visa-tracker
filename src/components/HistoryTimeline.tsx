'use client';

import { useMemo, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import {
  Scale,
  Gavel,
  Newspaper,
  FileText,
  Landmark,
  Flag,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  HISTORY,
  KIND_META,
  type EventKind,
  type HistoryEvent,
} from '@/lib/u-visa-history';

const KIND_ICON: Record<EventKind, typeof Scale> = {
  law: Landmark,
  rule: FileText,
  court: Gavel,
  policy: Scale,
  milestone: Flag,
  coverage: Newspaper,
};

const FILTERS: { key: 'all' | EventKind; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'law', label: 'Statutes' },
  { key: 'rule', label: 'Rules' },
  { key: 'court', label: 'Court' },
  { key: 'policy', label: 'Policy' },
  { key: 'milestone', label: 'Milestones' },
  { key: 'coverage', label: 'Coverage' },
];

export default function HistoryTimeline() {
  const [filter, setFilter] = useState<'all' | EventKind>('all');
  const events = useMemo(
    () =>
      filter === 'all'
        ? HISTORY
        : HISTORY.filter((e) => e.kind === filter),
    [filter],
  );

  const years = useMemo(
    () => Array.from(new Set(events.map((e) => e.year))),
    [events],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start end', 'end start'],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  return (
    <div className="space-y-6">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-accent text-muted-foreground hover:text-foreground border-border',
              )}
            >
              {f.key !== 'all' && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: KIND_META[f.key].color }}
                />
              )}
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[120px_1fr]">
        {/* Left rail: sticky year nav */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ol className="space-y-2 border-l-2 border-border pl-4 relative">
              <motion.span
                aria-hidden
                className="absolute -left-[2px] top-0 w-[2px] bg-primary origin-top"
                style={{ scaleY: progress, height: '100%' }}
              />
              {years.map((y) => (
                <li key={y}>
                  <a
                    href={`#year-${y}`}
                    className="text-xs font-mono tabular-nums text-muted-foreground hover:text-primary"
                  >
                    {y}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* Timeline column */}
        <div ref={scrollRef} className="relative space-y-12">
          {events.map((event, i) => (
            <TimelineItem
              key={`${event.year}-${event.title}`}
              event={event}
              side={i % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  event,
  side,
}: {
  event: HistoryEvent;
  side: 'left' | 'right';
}) {
  const meta = KIND_META[event.kind];
  const Icon = KIND_ICON[event.kind];

  return (
    <motion.section
      id={`year-${event.year}`}
      data-narrate-id={`year-${event.year}-${slug(event.title)}`}
      data-narrate-text={`${event.year}. ${event.title}. ${event.body}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -100px 0px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="scroll-mt-24 relative"
    >
      {/* Year marker + icon bubble */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md ring-2 ring-background"
          style={{ backgroundColor: meta.color }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-mono tabular-nums text-2xl font-bold tracking-tight">
              {event.year}
            </span>
            {event.date && (
              <span className="text-xs text-muted-foreground">
                {event.date}
              </span>
            )}
            <span
              className="text-[10px] uppercase tracking-wider font-semibold rounded-full border px-2 py-0.5"
              style={{
                borderColor: meta.color,
                color: meta.color,
              }}
            >
              {meta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Newspaper-clipping card */}
      <motion.article
        whileHover={{ rotate: side === 'left' ? -0.25 : 0.25, scale: 1.005 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        className={cn(
          'relative ml-0 sm:ml-13 p-4 sm:p-5 rounded-sm shadow-md',
          'bg-[#fdfbf4] dark:bg-[#2a2824] text-foreground',
          'border border-[#e5dcc0] dark:border-[#403a2e]',
          event.highlight && 'ring-2 ring-offset-2 ring-amber-400/60',
        )}
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 40%), repeating-linear-gradient(0deg, rgba(120,100,60,0.035) 0px, rgba(120,100,60,0.035) 1px, transparent 1px, transparent 28px)',
          transform: `rotate(${side === 'left' ? '-0.3deg' : '0.3deg'})`,
        }}
      >
        {event.highlight && (
          <span className="absolute -top-2 -right-2 text-[10px] bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow">
            Pivotal
          </span>
        )}
        <h3
          className="font-serif text-xl leading-tight mb-2 tracking-tight"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {event.title}
        </h3>

        {event.image && (
          <figure
            className="mb-3 w-full sm:float-right sm:ml-4 sm:mb-2 sm:w-44 md:w-56 clipping-frame"
            style={{
              shapeOutside: 'margin-box',
              transform: `rotate(${(event.year % 3) - 1}deg)`,
            }}
          >
            <a
              href={commonsPageUrlFor(event.image.url)}
              target="_blank"
              rel="noreferrer"
              className="block group"
              title={`Open source on Wikimedia Commons: ${event.image.caption}`}
            >
              <div className="clipping-dateline">
                {event.date ?? `${event.year} · Archive`}
              </div>
              <div className="aspect-[4/3] overflow-hidden bg-[#f4ecd8]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.image.url}
                  alt={event.image.caption}
                  loading="lazy"
                  className="clipping-image transition-transform duration-300 group-hover:scale-[1.03]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.visibility = 'hidden';
                  }}
                />
              </div>
              <figcaption className="clipping-caption group-hover:text-[#1d1a14]">
                {event.image.caption}
              </figcaption>
              <div
                className="text-[8px] uppercase tracking-[0.15em] text-[#8a6a30] text-center pt-1"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {event.image.credit}
              </div>
            </a>
          </figure>
        )}

        <p
          className="text-[13.5px] leading-relaxed text-foreground/80"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {event.body}
        </p>

        {/* Clear float before the citation/archive rows */}
        {event.image && <div className="clear-both" />}

        {event.citations && event.citations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-dashed border-[#c8bb96] dark:border-[#5a5040] flex flex-wrap gap-x-4 gap-y-1">
            {event.citations.map((c) => (
              <span
                key={c.label}
                className="text-[11px] uppercase tracking-wider text-muted-foreground"
              >
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline hover:text-foreground"
                  >
                    § {c.label} ↗
                  </a>
                ) : (
                  <>§ {c.label}</>
                )}
              </span>
            ))}
          </div>
        )}

        {event.articles && event.articles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              From the archive
            </p>
            <ul className="space-y-1.5">
              {event.articles.map((a) => (
                <li key={a.url}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block rounded-sm border border-[#d8ccab] dark:border-[#4a4232] bg-white/60 dark:bg-black/20 px-3 py-2 hover:border-[#a08a55] dark:hover:border-[#7a6a4a] transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span
                        className="text-[10px] uppercase tracking-[0.15em] text-[#8a7548] dark:text-[#c4ad7a] font-bold"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                      >
                        {a.outlet}
                      </span>
                      <ExternalLink className="h-3 w-3 opacity-30 group-hover:opacity-100 shrink-0" />
                    </div>
                    <p
                      className="text-[13.5px] leading-snug mt-0.5 group-hover:underline"
                      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                    >
                      {a.headline}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.article>
    </motion.section>
  );
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

/**
 * Given a Wikimedia Commons direct-image URL, returns the Commons File: page
 * URL (credit/attribution page). For non-Commons URLs, returns the url itself
 * so the link still works — it just opens the image directly.
 */
function commonsPageUrlFor(imageUrl: string): string {
  try {
    const u = new URL(imageUrl);
    if (u.hostname === 'upload.wikimedia.org') {
      const parts = u.pathname.split('/').filter(Boolean);
      const file = parts[parts.length - 1];
      return `https://commons.wikimedia.org/wiki/File:${file}`;
    }
  } catch {
    // fall through
  }
  return imageUrl;
}
