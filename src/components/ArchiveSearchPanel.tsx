'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Archive, Filter } from 'lucide-react';
import {
  ARCHIVE_SOURCES,
  ARCHIVE_QUERIES,
  ACCESS_LABEL,
  ACCESS_COLOR,
  type ArchiveAccess,
  type ArchiveSource,
} from '@/lib/archive-sources';

/**
 * Panel that surfaces every archive in our catalog (lib/archive-sources.ts)
 * with one-click pre-built searches across every pivotal U-visa moment.
 *
 * Two view modes:
 *   - By source — every archive listed with all relevant pre-built queries
 *   - By event  — pivotal events listed with one search button per archive
 *
 * Filterable by access type (free / freemium / paid / library-card).
 */
type ViewMode = 'source' | 'event';

const ALL_ACCESS: ArchiveAccess[] = [
  'free',
  'freemium',
  'paid',
  'institutional',
  'free-with-account',
];

export default function ArchiveSearchPanel() {
  const [view, setView] = useState<ViewMode>('source');
  const [access, setAccess] = useState<Set<ArchiveAccess>>(
    new Set(ALL_ACCESS),
  );

  const visibleSources = useMemo(
    () => ARCHIVE_SOURCES.filter((s) => access.has(s.access)),
    [access],
  );

  function toggleAccess(a: ArchiveAccess) {
    setAccess((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  }

  return (
    <section className="rounded-xl border bg-muted/20 p-5 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Archive className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold tracking-tight">
            Search the archives yourself
          </h2>
          <span className="rounded-full border bg-background px-2 py-0.5 text-[10px] font-mono tabular-nums text-muted-foreground">
            {visibleSources.length}/{ARCHIVE_SOURCES.length} sources
          </span>
        </div>

        {/* View toggle */}
        <div className="inline-flex items-center rounded-full border bg-background p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setView('source')}
            aria-pressed={view === 'source'}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              view === 'source'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            By source
          </button>
          <button
            type="button"
            onClick={() => setView('event')}
            aria-pressed={view === 'event'}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              view === 'event'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            By event
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground max-w-3xl">
        Every link below is a deep search into the archive&apos;s own UI — we
        don&apos;t reproduce copyrighted clippings here. Coverage notes (date
        range, geography, access tier) are visible inline so you can pick the
        right archive without trial and error.
      </p>

      {/* Access filter chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold inline-flex items-center gap-1">
          <Filter className="h-3 w-3" /> Access
        </span>
        {ALL_ACCESS.map((a) => {
          const on = access.has(a);
          return (
            <button
              key={a}
              type="button"
              onClick={() => toggleAccess(a)}
              aria-pressed={on}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                on
                  ? 'bg-background text-foreground'
                  : 'bg-muted/40 text-muted-foreground line-through'
              }`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: ACCESS_COLOR[a] }}
              />
              {ACCESS_LABEL[a]}
            </button>
          );
        })}
      </div>

      {view === 'source' ? (
        <SourceView sources={visibleSources} />
      ) : (
        <EventView sources={visibleSources} />
      )}

      <p className="text-[11px] text-muted-foreground italic">
        Note: Chronicling America (LoC) and FBIS only cover pre-1963 / pre-1996
        material respectively, so they&apos;re marked &ldquo;pre-U-visa&rdquo;
        and only useful for background research.
      </p>
    </section>
  );
}

function SourceView({ sources }: { sources: ArchiveSource[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sources.map((s) => (
        <article
          key={s.id}
          className="rounded-lg border bg-background p-4 space-y-3 flex flex-col"
        >
          <header className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-tight">{s.name}</h3>
              <span
                className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0 text-[9px] uppercase tracking-wider shrink-0"
                style={{
                  borderColor: ACCESS_COLOR[s.access],
                  color: ACCESS_COLOR[s.access],
                }}
              >
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: ACCESS_COLOR[s.access] }}
                />
                {ACCESS_LABEL[s.access]}
              </span>
            </div>
            <p className="text-[12px] leading-snug text-muted-foreground">
              {s.description}
            </p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80 font-mono tabular-nums flex flex-wrap gap-x-2">
              <span>{s.geography}</span>
              {(s.yearsFrom || s.yearsTo) && (
                <span>
                  · {s.yearsFrom ?? '?'}–{s.yearsTo ?? 'present'}
                </span>
              )}
              {s.preUVisaOnly && (
                <span className="text-amber-600 dark:text-amber-400">
                  · pre-U-visa
                </span>
              )}
            </p>
          </header>

          <ul className="space-y-1 mt-auto pt-1 border-t">
            <li>
              <a
                href={s.homeUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
              >
                Browse archive
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </li>
            {ARCHIVE_QUERIES.filter((q) =>
              s.preUVisaOnly ? q.era !== 'modern' : true,
            )
              .slice(0, 5)
              .map((q) => (
                <li key={q.label}>
                  <a
                    href={s.searchUrl(q.query, q.yearFrom, q.yearTo)}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1 text-[12.5px] text-foreground/80 hover:text-primary hover:underline underline-offset-4"
                  >
                    {q.label}
                    <ExternalLink className="h-3 w-3 opacity-30 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function EventView({ sources }: { sources: ArchiveSource[] }) {
  return (
    <div className="space-y-3">
      {ARCHIVE_QUERIES.map((q) => (
        <article
          key={q.label}
          className="rounded-lg border bg-background p-4 space-y-2"
        >
          <header className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-sm font-semibold leading-tight">{q.label}</h3>
            {q.yearFrom && (
              <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
                {q.yearFrom}
                {q.yearTo && q.yearTo !== q.yearFrom ? `–${q.yearTo}` : ''}
              </span>
            )}
            <code className="text-[10.5px] text-muted-foreground bg-muted/50 rounded px-1 py-0.5 font-mono">
              {q.query}
            </code>
          </header>
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
            {sources
              .filter((s) => (s.preUVisaOnly ? q.era !== 'modern' : true))
              .map((s) => (
                <li key={s.id}>
                  <a
                    href={s.searchUrl(q.query, q.yearFrom, q.yearTo)}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1 text-[12px] text-foreground/80 hover:text-primary hover:underline underline-offset-4"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: ACCESS_COLOR[s.access] }}
                    />
                    {s.name}
                    <ExternalLink className="h-3 w-3 opacity-30 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
