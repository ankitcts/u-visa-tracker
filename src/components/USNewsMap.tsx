'use client';

import { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, PlayCircle } from 'lucide-react';
import { FIPS_TO_USPS, USPS_TO_NAME } from '@/lib/us-states';
import type { StateCertShare } from '@/lib/types';
import { relativeTime } from '@/lib/news';
import { flagEmoji, countryNote } from '@/lib/geotag';
import {
  TAG_LABELS,
  type ClassifiedNewsItem,
  type NewsTag,
} from '@/lib/news-classifier';

import statesTopojson from '@/lib/us-states-10m.json';

const GEO_DATA = statesTopojson as unknown as object;

const TAG_COLOR: Record<NewsTag, string> = {
  'policy-change': '#3b82f6',
  litigation: '#f59e0b',
  'fraud-concern': '#ef4444',
  'data-report': '#10b981',
  commentary: '#a855f7',
  general: '#64748b',
};

// Built per-render from the prop the server component passes down.

interface GeoFeature {
  rsmKey: string;
  id: string;
  properties: { name: string };
}

type GroupedNews = Record<string, ClassifiedNewsItem[]>;

type ColorMode = 'news' | 'cert';

export default function USNewsMap({
  news,
  lastUpdated,
  stateShares,
}: {
  news: ClassifiedNewsItem[];
  lastUpdated?: string;
  stateShares: StateCertShare[];
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<NewsTag | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>('news');
  const active = pinned ?? hovered;

  const CERT_SHARE = useMemo<Record<string, number>>(
    () => Object.fromEntries(stateShares.map((s) => [s.state, s.share])),
    [stateShares],
  );

  const filteredNews = useMemo(
    () =>
      tagFilter ? news.filter((it) => it.tag === tagFilter) : news,
    [news, tagFilter],
  );

  const grouped = useMemo<GroupedNews>(() => {
    const out: GroupedNews = {};
    for (const item of filteredNews) {
      if (item.state && /^[A-Z]{2}$/.test(item.state)) {
        (out[item.state] ??= []).push(item);
      }
    }
    return out;
  }, [filteredNews]);

  // News-volume heat — log-scaled so one state with 10 items doesn't wash
  // out the rest.
  const maxCount = useMemo(
    () => Math.max(1, ...Object.values(grouped).map((a) => a.length)),
    [grouped],
  );

  // Top 5 states by news count — leaderboard data.
  const leaderboard = useMemo(
    () =>
      Object.entries(grouped)
        .map(([state, items]) => ({ state, items }))
        .sort((a, b) => b.items.length - a.items.length)
        .slice(0, 5),
    [grouped],
  );

  // Tag distribution across located news (for the clickable legend counts).
  const tagCounts = useMemo(() => {
    const out: Partial<Record<NewsTag, number>> = {};
    for (const item of news) {
      if (!item.state) continue;
      out[item.tag] = (out[item.tag] ?? 0) + 1;
    }
    return out;
  }, [news]);

  // Country breakdown for located items (flag strip under the map).
  const countryCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const item of filteredNews) {
      if (!item.state || !item.country) continue;
      out[item.country] = (out[item.country] ?? 0) + 1;
    }
    return Object.entries(out)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [filteredNews]);

  const locatedCount = Object.values(grouped).reduce(
    (n, arr) => n + arr.length,
    0,
  );
  const total = news.length;
  const unlocated = total - locatedCount;
  const statesCovered = Object.keys(grouped).length;

  return (
    <div className="relative w-full rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 pt-2 pb-2">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Live
            </span>
            U-Visa News
          </h2>
          {lastUpdated && (
            <span
              className="text-[10.5px] text-muted-foreground"
              title={new Date(lastUpdated).toLocaleString()}
            >
              · updated {formatLastUpdated(lastUpdated)}
            </span>
          )}
        </div>
        <div className="inline-flex items-center rounded-full border bg-background p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setColorMode('news')}
            aria-pressed={colorMode === 'news'}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              colorMode === 'news'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            News heat
          </button>
          <button
            type="button"
            onClick={() => setColorMode('cert')}
            aria-pressed={colorMode === 'cert'}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              colorMode === 'cert'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cert share (FY12–18)
          </button>
        </div>
      </div>

      {/* Stat bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-3 pb-2">
        <StatPill label="Total items" value={total} />
        <StatPill label="On the map" value={locatedCount} highlight />
        <StatPill label="States covered" value={statesCovered} />
        <StatPill label="Unlocated" value={unlocated} muted />
      </div>

      {/* Clickable tag legend */}
      <div className="px-3 pb-2">
        <ClickableLegend
          active={tagFilter}
          counts={tagCounts}
          onChange={setTagFilter}
        />
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
        <div
          className="relative"
          onClick={() => setPinned(null)}
          role="presentation"
        >
          <ComposableMap
            projection="geoAlbersUsa"
            projectionConfig={{ scale: 1000 }}
            width={980}
            height={560}
            style={{ width: '100%', height: 'auto' }}
          >
          <Geographies geography={GEO_DATA}>
            {({ geographies }: { geographies: GeoFeature[] }) =>
              geographies.map((geo) => {
                const usps = FIPS_TO_USPS[geo.id];
                const share = usps ? CERT_SHARE[usps] ?? 0 : 0;
                const newsCount = usps ? grouped[usps]?.length ?? 0 : 0;
                const fill =
                  colorMode === 'news'
                    ? shadeForNews(newsCount, maxCount)
                    : shadeForShare(share);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => usps && setHovered(usps)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={(e) => {
                      if (!usps) return;
                      e.stopPropagation();
                      setPinned((p) => (p === usps ? null : usps));
                    }}
                    style={{
                      default: {
                        fill,
                        stroke: '#ffffff',
                        strokeWidth: 0.6,
                        outline: 'none',
                        transition: 'fill 0.2s',
                      },
                      hover: {
                        fill: '#e2e8f0',
                        stroke: '#ffffff',
                        strokeWidth: 0.8,
                        outline: 'none',
                        cursor: newsCount ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: '#cbd5e1',
                        outline: 'none',
                      },
                    }}
                    aria-label={
                      usps
                        ? `${USPS_TO_NAME[usps] ?? usps}${share ? `, ${share}% of certifications` : ''}${newsCount ? `, ${newsCount} news items` : ''}`
                        : undefined
                    }
                  />
                );
              })
            }
          </Geographies>

          {/* State code labels on larger states */}
          <Geographies geography={GEO_DATA}>
            {({ geographies }: { geographies: GeoFeature[] }) =>
              geographies.flatMap((geo) => {
                const usps = FIPS_TO_USPS[geo.id];
                if (!usps) return [];
                if (SKIP_LABEL.has(usps)) return [];
                const [lon, lat] = geoCentroid(geo as never) as [
                  number,
                  number,
                ];
                if (!Number.isFinite(lon) || !Number.isFinite(lat)) return [];
                const hasNews = !!grouped[usps]?.length;
                return [
                  <Marker
                    key={`lbl-${usps}`}
                    coordinates={[lon, lat]}
                  >
                    <text
                      textAnchor="middle"
                      y={-9}
                      fontSize={8}
                      fontWeight={700}
                      fill={hasNews ? '#1e293b' : '#94a3b8'}
                      style={{ pointerEvents: 'none' }}
                    >
                      {usps}
                    </text>
                  </Marker>,
                ];
              })
            }
          </Geographies>

          <Geographies geography={GEO_DATA}>
            {({ geographies }: { geographies: GeoFeature[] }) =>
              geographies.flatMap((geo) => {
                const usps = FIPS_TO_USPS[geo.id];
                if (!usps) return [];
                const items = grouped[usps];
                if (!items?.length) return [];
                const [lon, lat] = geoCentroid(geo as never) as [
                  number,
                  number,
                ];
                if (!Number.isFinite(lon) || !Number.isFinite(lat)) return [];
                const topTag = items[0].tag;
                const color = TAG_COLOR[topTag];
                const isActive = active === usps;
                return [
                  <Marker key={`m-${usps}`} coordinates={[lon, lat]}>
                    <g
                      onMouseEnter={() => setHovered(usps)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPinned((p) => (p === usps ? null : usps));
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Expanding ring pulse */}
                      <motion.circle
                        fill={color}
                        initial={{ r: 6, opacity: 0.55 }}
                        animate={{
                          r: [6, 18, 6],
                          opacity: [0.55, 0, 0.55],
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: 'easeOut',
                          times: [0, 0.85, 1],
                        }}
                      />
                      {/* Solid dot */}
                      <circle
                        r={isActive ? 6.5 : 5}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                      {items.length > 1 && (
                        <text
                          y={1}
                          textAnchor="middle"
                          fontSize={7}
                          fontWeight={700}
                          fill="#ffffff"
                          style={{ pointerEvents: 'none' }}
                        >
                          {items.length}
                        </text>
                      )}
                    </g>
                  </Marker>,
                ];
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Floating tooltip card */}
        <AnimatePresence>
          {active && grouped[active]?.length && (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-4 right-4 z-10 w-[min(360px,calc(100%-2rem))] rounded-xl border bg-background/95 shadow-xl backdrop-blur-sm p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold">
                  {USPS_TO_NAME[active] ?? active}
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  {CERT_SHARE[active]
                    ? `${CERT_SHARE[active]}% of certifications`
                    : 'Aggregate data'}
                </span>
              </div>
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {grouped[active].slice(0, 5).map((item) => (
                  <li key={item.link}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-md border border-transparent hover:border-border px-2 py-1.5 -mx-2 transition-colors"
                    >
                      <div className="flex items-start gap-1.5">
                        <span
                          className="mt-1 h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: TAG_COLOR[item.tag] }}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug line-clamp-2 inline">
                            {item.country && (
                              <span
                                className="mr-1 align-[-1px]"
                                title={countryNote(item.country)}
                                aria-label={`Country: ${item.country}`}
                              >
                                {flagEmoji(item.country)}
                              </span>
                            )}
                            {item.title}
                            <ExternalLink className="inline h-3 w-3 opacity-50 ml-1 -mt-0.5" />
                          </p>
                          {item.country && (
                            <p className="text-[10.5px] italic text-muted-foreground mt-0.5">
                              {countryNote(item.country)}
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {item.source} · {relativeTime(item.pubDate)} ·{' '}
                            <span style={{ color: TAG_COLOR[item.tag] }}>
                              {TAG_LABELS[item.tag]}
                            </span>
                          </p>
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
              {pinned && (
                <button
                  type="button"
                  onClick={() => setPinned(null)}
                  className="mt-2 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Click map to close
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Side panel — every news item, located or not */}
        <AllNewsPanel
          news={filteredNews}
          activeState={active}
          setHovered={setHovered}
          setPinned={setPinned}
          lastUpdated={lastUpdated}
        />
      </div>

      {/* Leaderboard + country strip */}
      {(leaderboard.length > 0 || countryCounts.length > 0) && (
        <div className="border-t bg-background/40 px-3 py-3 grid gap-3 md:grid-cols-[1fr_auto] items-start">
          {leaderboard.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                Top states · by news volume
              </p>
              <ol className="flex flex-wrap gap-1.5">
                {leaderboard.map(({ state, items }, i) => (
                  <li key={state}>
                    <button
                      type="button"
                      onMouseEnter={() => setHovered(state)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() =>
                        setPinned((p) => (p === state ? null : state))
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                        active === state
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-background hover:bg-accent'
                      }`}
                    >
                      <span className="font-mono tabular-nums text-[10px] opacity-60">
                        #{i + 1}
                      </span>
                      <span className="font-semibold">{state}</span>
                      <span className="text-[10px] opacity-70">
                        {USPS_TO_NAME[state] ?? ''}
                      </span>
                      <span className="rounded-full bg-primary/10 text-primary px-1.5 text-[10px] font-bold tabular-nums">
                        {items.length}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {countryCounts.length > 0 && (
            <div className="space-y-1.5 md:text-right">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                Nationalities in located news
              </p>
              <ul className="flex flex-wrap gap-1.5 md:justify-end">
                {countryCounts.map(([cc, n]) => (
                  <li
                    key={cc}
                    className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs"
                    title={countryNote(cc)}
                  >
                    <span aria-hidden>{flagEmoji(cc)}</span>
                    <span>{cc}</span>
                    <span className="opacity-60 tabular-nums">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AllNewsPanel({
  news,
  activeState,
  setHovered,
  setPinned,
  lastUpdated,
}: {
  news: ClassifiedNewsItem[];
  activeState: string | null;
  setHovered: (s: string | null) => void;
  setPinned: (s: string | null) => void;
  lastUpdated?: string;
}) {
  return (
    <div className="border-t lg:border-t-0 lg:border-l bg-background/40 flex flex-col max-h-[560px]">
      <div className="px-3 py-2 border-b text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between gap-2">
        <span>All news · newest first</span>
        {lastUpdated && (
          <span
            className="inline-flex items-center gap-1 text-[10px] normal-case tracking-normal text-green-700 dark:text-green-400 font-normal"
            title={`Feed refreshed: ${new Date(lastUpdated).toLocaleString()}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {formatLastUpdated(lastUpdated)}
          </span>
        )}
      </div>
      <ul className="flex-1 overflow-y-auto divide-y">
        {news.map((item) => {
          const hasState = !!item.state;
          const isActive = activeState && item.state === activeState;
          return (
            <li
              key={item.link}
              className={`px-3 py-2 hover:bg-accent/50 transition-colors ${isActive ? 'bg-accent/60' : ''}`}
              onMouseEnter={() => hasState && setHovered(item.state!)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => hasState && setPinned(item.state!)}
              style={{ cursor: hasState ? 'pointer' : 'default' }}
            >
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2 group"
                onClick={(e) => e.stopPropagation()}
              >
                {item.imageUrl ? (
                  <span className="relative mt-0.5 h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.visibility = 'hidden';
                      }}
                    />
                    {item.videoUrl && (
                      <span
                        aria-label="Article contains video"
                        className="absolute inset-0 flex items-center justify-center bg-black/30"
                      >
                        <PlayCircle className="h-5 w-5 text-white drop-shadow" />
                      </span>
                    )}
                  </span>
                ) : (
                  <span
                    className="mt-1 h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: TAG_COLOR[item.tag] }}
                    aria-hidden
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-snug line-clamp-2 group-hover:text-primary">
                    {item.country && (
                      <span
                        className="mr-1 text-base leading-none align-[-1px]"
                        title={countryNote(item.country)}
                        aria-label={`Country: ${item.country}`}
                      >
                        {flagEmoji(item.country)}
                      </span>
                    )}
                    {item.title}
                    <ExternalLink className="inline h-3 w-3 opacity-40 ml-1 -mt-0.5" />
                  </p>
                  {item.country && (
                    <p className="text-[10.5px] italic text-muted-foreground mt-0.5">
                      {countryNote(item.country)}
                    </p>
                  )}
                  <p className="text-[10.5px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span>{item.source}</span>
                    <span>·</span>
                    <span title={`Published: ${item.pubDate}`}>
                      published {relativeTime(item.pubDate)}
                    </span>
                    {lastUpdated && (
                      <>
                        <span>·</span>
                        <span
                          className="inline-flex items-center gap-1 text-green-700 dark:text-green-400"
                          title={`Feed refreshed: ${new Date(lastUpdated).toLocaleString()}`}
                        >
                          <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                          refreshed {formatLastUpdated(lastUpdated)}
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span style={{ color: TAG_COLOR[item.tag] }}>
                      {TAG_LABELS[item.tag]}
                    </span>
                    {hasState && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0 text-[9px] uppercase tracking-wider text-foreground">
                        📍 {item.state}
                      </span>
                    )}
                  </p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Legend() {
  const tags: NewsTag[] = [
    'policy-change',
    'litigation',
    'fraud-concern',
    'data-report',
    'commentary',
    'general',
  ];
  return (
    <div className="hidden sm:flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: TAG_COLOR[t] }}
          />
          {TAG_LABELS[t]}
        </span>
      ))}
    </div>
  );
}

function formatLastUpdated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffSec = (Date.now() - d.getTime()) / 1000;
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.round(diffSec / 3600)}h ago`;
  return `${Math.round(diffSec / 86400)}d ago`;
}

function shadeForShare(share: number): string {
  if (share <= 0) return '#f1f5f9';
  if (share < 2) return '#e0e7ff';
  if (share < 5) return '#c7d2fe';
  if (share < 10) return '#a5b4fc';
  if (share < 20) return '#818cf8';
  return '#6366f1';
}

// Log-scaled news-volume heat ramp. 0 → neutral slate, then cool → warm.
function shadeForNews(count: number, max: number): string {
  if (count <= 0) return '#f1f5f9';
  const t = Math.log(count + 1) / Math.log(Math.max(2, max + 1));
  if (t < 0.2) return '#fef3c7'; // amber-50
  if (t < 0.4) return '#fde68a'; // amber-200
  if (t < 0.6) return '#fca5a5'; // red-300
  if (t < 0.8) return '#f87171'; // red-400
  return '#ef4444'; // red-500
}

// Very small / narrow states where a USPS code label would overflow or
// overlap its neighbors (DC, RI, DE, NJ, NH, VT, MD, CT, MA). We skip
// labeling these; hover/click still works fine.
const SKIP_LABEL = new Set(['DC', 'RI', 'DE', 'NJ', 'NH', 'VT', 'MD', 'CT', 'MA']);

function StatPill({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-xs ${
        highlight
          ? 'border-primary/50 bg-primary/5'
          : muted
          ? 'border-border bg-muted/30'
          : 'border-border bg-background/60'
      }`}
    >
      <div
        className={`text-[10px] uppercase tracking-wider ${
          muted ? 'text-muted-foreground' : 'text-muted-foreground'
        }`}
      >
        {label}
      </div>
      <div
        className={`font-mono tabular-nums text-lg font-semibold ${
          highlight ? 'text-primary' : muted ? 'text-muted-foreground' : ''
        }`}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function ClickableLegend({
  active,
  counts,
  onChange,
}: {
  active: NewsTag | null;
  counts: Partial<Record<NewsTag, number>>;
  onChange: (tag: NewsTag | null) => void;
}) {
  const tags: NewsTag[] = [
    'fraud-concern',
    'litigation',
    'policy-change',
    'data-report',
    'commentary',
    'general',
  ];
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
      <span className="text-muted-foreground mr-1">Filter markers:</span>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 transition-colors ${
          active === null
            ? 'bg-foreground text-background border-foreground'
            : 'bg-background hover:bg-accent'
        }`}
      >
        All
      </button>
      {tags.map((t) => {
        const n = counts[t] ?? 0;
        const isActive = active === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(isActive ? null : t)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 transition-colors ${
              isActive
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background hover:bg-accent'
            } ${n === 0 ? 'opacity-50' : ''}`}
            disabled={n === 0}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: TAG_COLOR[t] }}
            />
            {TAG_LABELS[t]}
            <span className="tabular-nums opacity-70">{n}</span>
          </button>
        );
      })}
    </div>
  );
}
