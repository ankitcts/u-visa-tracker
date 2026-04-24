'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  LayoutGrid,
  List,
  ExternalLink,
  PlayCircle,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  TAG_BADGE_VARIANT,
  TAG_LABELS,
  type ClassifiedNewsItem,
  type NewsTag,
} from '@/lib/news-classifier';
import { flagEmoji, countryNote } from '@/lib/geotag';
import { relativeTime } from '@/lib/news';
import VideoLightbox, {
  isYouTubeUrl,
  type VideoLightboxItem,
} from './VideoLightbox';

type ViewMode = 'grid' | 'list';
type TagFilter = 'all' | NewsTag;
type CountryFilter = 'all' | string;

const TAG_COLOR: Record<NewsTag, string> = {
  'policy-change': '#3b82f6',
  litigation: '#f59e0b',
  'fraud-concern': '#ef4444',
  'data-report': '#10b981',
  commentary: '#a855f7',
  general: '#64748b',
};

const TAG_FILTERS: { key: TagFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'fraud-concern', label: 'Fraud' },
  { key: 'litigation', label: 'Litigation' },
  { key: 'policy-change', label: 'Policy' },
  { key: 'data-report', label: 'Data' },
  { key: 'commentary', label: 'Commentary' },
  { key: 'general', label: 'General' },
];

export default function InteractiveNewsFeed({
  items,
  lastUpdated,
}: {
  items: ClassifiedNewsItem[];
  lastUpdated?: string;
}) {
  const [tag, setTag] = useState<TagFilter>('all');
  const [country, setCountry] = useState<CountryFilter>('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
  const [lightbox, setLightbox] = useState<VideoLightboxItem | null>(null);

  function openVideo(
    e: React.MouseEvent,
    item: ClassifiedNewsItem,
  ): boolean {
    // Returns true if we handled the click (opened lightbox); false if the
    // caller should let the <a> navigate normally.
    if (!item.videoUrl || !isYouTubeUrl(item.videoUrl)) return false;
    e.preventDefault();
    e.stopPropagation();
    setLightbox({
      title: item.title,
      source: item.source,
      videoUrl: item.videoUrl,
      articleUrl: item.link,
    });
    return true;
  }

  // Top 8 countries by item count (for the filter row).
  const topCountries = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const it of items) {
      if (it.country) counts[it.country] = (counts[it.country] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([cc, n]) => ({ cc, n }));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (tag !== 'all' && it.tag !== tag) return false;
      if (country !== 'all' && it.country !== country) return false;
      if (q) {
        const hay =
          `${it.title} ${it.source} ${it.description ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, tag, country, query]);

  // Pick a "hero" article — newest pivotal (fraud/litigation/policy) with image.
  const hero = useMemo(() => {
    const preferred = ['fraud-concern', 'litigation', 'policy-change'] as NewsTag[];
    const byPriority = [...filtered].sort((a, b) => {
      const pa = preferred.indexOf(a.tag);
      const pb = preferred.indexOf(b.tag);
      if (pa !== pb) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
      return (
        new Date(b.pubDate || 0).getTime() -
        new Date(a.pubDate || 0).getTime()
      );
    });
    return byPriority.find((it) => it.imageUrl) ?? byPriority[0] ?? null;
  }, [filtered]);

  const rest = useMemo(
    () => filtered.filter((it) => it.link !== hero?.link),
    [filtered, hero],
  );

  const tagCounts = useMemo(() => {
    const out: Record<string, number> = { all: items.length };
    for (const it of items) out[it.tag] = (out[it.tag] ?? 0) + 1;
    return out;
  }, [items]);

  return (
    <div className="space-y-5">
      {/* Top bar: search + view toggle + refresh */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search headlines, sources, descriptions…"
            className="w-full rounded-full border bg-background pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="inline-flex items-center rounded-full border bg-background p-1">
          <button
            type="button"
            onClick={() => setView('grid')}
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-colors',
              view === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Cards
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            aria-label="List view"
            aria-pressed={view === 'list'}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-colors',
              view === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
        </div>
        {lastUpdated && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] text-green-700 dark:text-green-400"
            title={`Feed refreshed: ${new Date(lastUpdated).toLocaleString()}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live · refreshes hourly
          </span>
        )}
      </div>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-1.5">
        {TAG_FILTERS.map((f) => {
          const n = tagCounts[f.key] ?? 0;
          const active = tag === f.key;
          const color = f.key === 'all' ? undefined : TAG_COLOR[f.key];
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setTag(f.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                active
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground border-border',
              )}
            >
              {color && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
              {f.label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-[10px] tabular-nums',
                  active
                    ? 'bg-background/20 text-background'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {/* Country flag strip */}
      {topCountries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Sparkles className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Focused on:</span>
          <button
            type="button"
            onClick={() => setCountry('all')}
            className={cn(
              'rounded-full border px-2 py-0.5 transition-colors',
              country === 'all'
                ? 'bg-foreground text-background border-foreground'
                : 'hover:bg-accent',
            )}
          >
            All
          </button>
          {topCountries.map(({ cc, n }) => {
            const active = country === cc;
            return (
              <button
                key={cc}
                type="button"
                onClick={() => setCountry(active ? 'all' : cc)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 transition-colors',
                  active
                    ? 'bg-foreground text-background border-foreground'
                    : 'hover:bg-accent',
                )}
                title={countryNote(cc)}
              >
                <span aria-hidden>{flagEmoji(cc)}</span>
                {cc}
                <span className="opacity-60 tabular-nums">{n}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-xl border bg-muted/20 py-10 text-center text-sm text-muted-foreground">
          No articles match your filters.{' '}
          <button
            type="button"
            onClick={() => {
              setTag('all');
              setCountry('all');
              setQuery('');
            }}
            className="text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Hero */}
      {hero && view === 'grid' && filtered.length > 0 && (
        <HeroCard
          item={hero}
          onClick={(e) => openVideo(e, hero)}
        />
      )}

      {/* Body */}
      {view === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {rest.slice(0, 60).map((item) => (
              <NewsCard
                key={item.link}
                item={item}
                onClick={(e) => openVideo(e, item)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          <AnimatePresence initial={false}>
            {filtered.slice(0, 80).map((item) => (
              <NewsListRow
                key={item.link}
                item={item}
                onClick={(e) => openVideo(e, item)}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Inline video lightbox — opens when a YouTube-backed card is clicked */}
      <VideoLightbox item={lightbox} onClose={() => setLightbox(null)} />

      {/* Footer counter */}
      <p className="text-xs text-muted-foreground text-center">
        Showing{' '}
        <span className="font-medium text-foreground">
          {Math.min(
            view === 'grid' ? rest.length + (hero ? 1 : 0) : filtered.length,
            view === 'grid' ? 61 : 80,
          )}
        </span>{' '}
        of {filtered.length}{' '}
        {tag === 'all' && country === 'all' && !query
          ? 'articles'
          : 'filtered articles'}
        {items.length !== filtered.length && ` (${items.length} total)`}
      </p>
    </div>
  );
}

function HeroCard({
  item,
  onClick,
}: {
  item: ClassifiedNewsItem;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const embeddable = isYouTubeUrl(item.videoUrl);
  return (
    <motion.a
      href={item.link}
      target={embeddable ? undefined : '_blank'}
      rel="noreferrer"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative block overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="grid md:grid-cols-[1.3fr_1fr]">
        {item.imageUrl ? (
          <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[260px] bg-muted overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt=""
              loading="eager"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
            />
            {item.videoUrl && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                <PlayCircle className="h-14 w-14 text-white drop-shadow-lg" />
              </span>
            )}
            <span className="absolute top-3 left-3">
              <Badge variant={TAG_BADGE_VARIANT[item.tag]}>
                {TAG_LABELS[item.tag]}
              </Badge>
            </span>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent md:min-h-[260px] flex items-center justify-center">
            <Badge variant={TAG_BADGE_VARIANT[item.tag]}>
              {TAG_LABELS[item.tag]}
            </Badge>
          </div>
        )}

        <div className="p-5 md:p-6 flex flex-col gap-3 justify-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            Featured · {item.source}
          </p>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-tight group-hover:text-primary">
            {item.country && (
              <span className="mr-1" aria-label={countryNote(item.country)}>
                {flagEmoji(item.country)}
              </span>
            )}
            {item.title}
            <ExternalLink className="inline h-4 w-4 opacity-40 ml-1.5 -mt-1" />
          </h3>
          {item.country && (
            <p className="text-xs italic text-muted-foreground">
              {countryNote(item.country)}
            </p>
          )}
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <span>{relativeTime(item.pubDate)}</span>
            {item.state && (
              <span className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0 text-[10px] uppercase tracking-wider">
                📍 {item.state}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.a>
  );
}

function NewsCard({
  item,
  onClick,
}: {
  item: ClassifiedNewsItem;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const embeddable = isYouTubeUrl(item.videoUrl);
  return (
    <motion.a
      href={item.link}
      target={embeddable ? undefined : '_blank'}
      rel="noreferrer"
      onClick={onClick}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
    >
      {item.imageUrl ? (
        <div className="relative aspect-[16/9] bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
          />
          {item.videoUrl && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/30">
              <PlayCircle className="h-10 w-10 text-white drop-shadow" />
            </span>
          )}
          <span className="absolute top-2 left-2">
            <Badge variant={TAG_BADGE_VARIANT[item.tag]}>
              {TAG_LABELS[item.tag]}
            </Badge>
          </span>
          {item.country && (
            <span
              className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur px-2 py-0.5 text-sm"
              aria-label={countryNote(item.country)}
              title={countryNote(item.country)}
            >
              {flagEmoji(item.country)}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between bg-gradient-to-br from-primary/10 to-transparent px-3 py-2 border-b">
          <Badge variant={TAG_BADGE_VARIANT[item.tag]}>
            {TAG_LABELS[item.tag]}
          </Badge>
          {item.country && (
            <span className="text-lg" aria-label={countryNote(item.country)}>
              {flagEmoji(item.country)}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="text-sm font-medium leading-snug line-clamp-3 group-hover:text-primary">
          {item.title}
          <ExternalLink className="inline h-3 w-3 opacity-40 ml-1 -mt-0.5" />
        </h3>
        {item.country && (
          <p className="text-[11px] italic text-muted-foreground">
            {countryNote(item.country)}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1">
          <span className="truncate">{item.source}</span>
          <span className="whitespace-nowrap tabular-nums">
            {relativeTime(item.pubDate)}
          </span>
        </div>
      </div>
    </motion.a>
  );
}

function NewsListRow({
  item,
  onClick,
}: {
  item: ClassifiedNewsItem;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const embeddable = isYouTubeUrl(item.videoUrl);
  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-start gap-3 p-3 hover:bg-accent/50 transition-colors"
    >
      {item.imageUrl ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
          />
          {item.videoUrl && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/30">
              <PlayCircle className="h-5 w-5 text-white drop-shadow" />
            </span>
          )}
        </div>
      ) : (
        <span
          className="mt-1 h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: TAG_COLOR[item.tag] }}
          aria-hidden
        />
      )}
      <a
        href={item.link}
        target={embeddable ? undefined : '_blank'}
        rel="noreferrer"
        onClick={onClick}
        className="group min-w-0 flex-1 cursor-pointer"
      >
        <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary">
          {item.country && (
            <span className="mr-1" aria-label={countryNote(item.country)}>
              {flagEmoji(item.country)}
            </span>
          )}
          {item.title}
          <ExternalLink className="inline h-3 w-3 opacity-40 ml-1 -mt-0.5" />
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
          <Badge variant={TAG_BADGE_VARIANT[item.tag]}>
            {TAG_LABELS[item.tag]}
          </Badge>
          <span className="truncate">{item.source}</span>
          <span>·</span>
          <span className="whitespace-nowrap tabular-nums">
            {relativeTime(item.pubDate)}
          </span>
          {item.state && (
            <span className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0 text-[10px] uppercase tracking-wider">
              📍 {item.state}
            </span>
          )}
        </p>
      </a>
    </motion.li>
  );
}
