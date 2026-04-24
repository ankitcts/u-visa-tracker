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
import { ExternalLink } from 'lucide-react';
import { FIPS_TO_USPS, USPS_TO_NAME } from '@/lib/us-states';
import { STATE_CERT_SHARES } from '@/lib/data';
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

const CERT_SHARE: Record<string, number> = Object.fromEntries(
  STATE_CERT_SHARES.map((s) => [s.state, s.share]),
);

interface GeoFeature {
  rsmKey: string;
  id: string;
  properties: { name: string };
}

type GroupedNews = Record<string, ClassifiedNewsItem[]>;

export default function USNewsMap({
  news,
  lastUpdated,
}: {
  news: ClassifiedNewsItem[];
  lastUpdated?: string;
}) {
  const grouped = useMemo<GroupedNews>(() => {
    const out: GroupedNews = {};
    for (const item of news) {
      if (item.state && /^[A-Z]{2}$/.test(item.state)) {
        (out[item.state] ??= []).push(item);
      }
    }
    return out;
  }, [news]);

  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = pinned ?? hovered;

  const locatedCount = Object.values(grouped).reduce(
    (n, arr) => n + arr.length,
    0,
  );

  const total = news.length;
  const unlocated = total - locatedCount;

  return (
    <div className="relative w-full rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 pt-2 pb-1">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Live
            </span>
            U-Visa News
          </h2>
          <p className="text-[11px] text-muted-foreground leading-tight">
            <span className="text-foreground font-medium">{total}</span> items
            ·{' '}
            <span className="text-foreground font-medium">{locatedCount}</span>{' '}
            located on map · {unlocated} national/unlocated · past 7 days
            {lastUpdated && (
              <>
                {' · '}
                <span title={new Date(lastUpdated).toLocaleString()}>
                  updated {formatLastUpdated(lastUpdated)}
                </span>
              </>
            )}
          </p>
        </div>
        <Legend />
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
                const fill = shadeForShare(share);
                const isActive = active === usps;
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
                        cursor: grouped[usps]?.length ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: '#cbd5e1',
                        outline: 'none',
                      },
                    }}
                    aria-label={
                      usps
                        ? `${USPS_TO_NAME[usps] ?? usps}${share ? `, ${share}% of certifications` : ''}${grouped[usps]?.length ? `, ${grouped[usps].length} news items` : ''}`
                        : undefined
                    }
                  />
                );
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
          news={news}
          activeState={active}
          setHovered={setHovered}
          setPinned={setPinned}
          lastUpdated={lastUpdated}
        />
      </div>
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
                <span
                  className="mt-1 h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: TAG_COLOR[item.tag] }}
                  aria-hidden
                />
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
