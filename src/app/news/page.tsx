import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { BarChart3, Clock, MapPin, ShieldAlert, Loader2 } from 'lucide-react';
import InteractiveNewsFeed from '@/components/InteractiveNewsFeed';
import NewsTicker from '@/components/NewsTicker';
import USNewsMap from '@/components/USNewsMapClient';
import { Card, CardContent } from '@/components/ui/card';
import { latestPending } from '@/lib/data';
import { ANNUAL_PRINCIPAL } from '@/lib/data';
import { fetchUVisaNews, getNewsLastUpdated } from '@/lib/news';
import { classifyNews } from '@/lib/news-classifier';

export const metadata: Metadata = {
  title: 'Live U-Visa News Map',
  description:
    'Live map of U-visa and immigration-fraud news, geo-tagged by state, categorized by LLM, refreshed hourly.',
};

export const revalidate = 3600;

// The /news page has two slow dependencies:
//   1. fetchUVisaNews() — fans out to Google News / Reddit / GDELT / HN / YouTube
//   2. classifyNews()   — Groq LLM call + og-meta thumbnail fetch per URL
//
// Rather than block the whole page, we split the page into a synchronous
// shell (renders instantly) and two Suspense boundaries that stream in:
//   - <NewsSectionShell>   — map + interactive feed. Awaits the shared
//                            data fetch once inside an async server component.
//   - <NewsTicker>         — marquee. Own Suspense; independent data fetch.

export default function NewsPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Live
            </span>
            U-Visa News
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Geo-tagged U-visa and immigration-fraud coverage. Feed refreshes
            hourly · aggregate stats refresh daily.
          </p>
        </div>
        <Link
          href="/u-visa"
          className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline shrink-0"
        >
          What is the U visa? →
        </Link>
      </header>

      <Suspense fallback={<TickerSkeleton />}>
        <NewsTicker limit={10} />
      </Suspense>

      <Suspense fallback={<MapAndFeedSkeleton />}>
        <NewsSectionShell />
      </Suspense>

      <QuickLinks />
    </div>
  );
}

async function NewsSectionShell() {
  // One shared fetch feeds both the map and the interactive feed — runs in
  // parallel with the ticker above because each <Suspense> awaits
  // independently.
  const newsItems = await fetchUVisaNews(120);
  const classifiedNews = await classifyNews(newsItems);
  const newsLastUpdated = await getNewsLastUpdated();

  return (
    <>
      <USNewsMap news={classifiedNews} lastUpdated={newsLastUpdated} />
      <InteractiveNewsFeed
        items={classifiedNews}
        lastUpdated={newsLastUpdated}
      />
    </>
  );
}

function TickerSkeleton() {
  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        <span>Loading live ticker…</span>
      </div>
    </div>
  );
}

function MapAndFeedSkeleton() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card/60 overflow-hidden">
        <div className="px-3 pt-2 pb-2 flex items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </span>
              <span className="h-4 w-28 rounded bg-muted animate-pulse" />
            </div>
            <span className="block h-3 w-48 rounded bg-muted animate-pulse" />
          </div>
          <span className="h-7 w-36 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-3 pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-muted/20 px-3 py-2 space-y-1"
            >
              <span className="block h-2 w-16 rounded bg-muted animate-pulse" />
              <span className="block h-5 w-10 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm">
              Fetching news from Google · Reddit · GDELT · Hacker News · YouTube…
            </p>
            <p className="text-[11px]">
              Classifying by state, tag, and country · attaching thumbnails
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="h-9 flex-1 min-w-[240px] rounded-full bg-muted animate-pulse" />
          <span className="h-9 w-40 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className="h-7 w-20 rounded-full bg-muted animate-pulse"
            />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card overflow-hidden"
            >
              <div className="aspect-[16/9] bg-muted animate-pulse" />
              <div className="p-3.5 space-y-2">
                <span className="block h-3 w-full rounded bg-muted animate-pulse" />
                <span className="block h-3 w-5/6 rounded bg-muted animate-pulse" />
                <span className="block h-2 w-1/3 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickLinks() {
  const latest = latestPending(ANNUAL_PRINCIPAL);
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <Card className="transition-colors hover:border-primary/60">
        <Link href="/dashboard" className="block">
          <CardContent className="p-5 flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Dashboard</p>
              <p className="text-sm text-muted-foreground">
                Filings, approvals, denials, backlog by FY.
              </p>
            </div>
          </CardContent>
        </Link>
      </Card>
      <Card className="transition-colors hover:border-primary/60">
        <Link href="/geography" className="block">
          <CardContent className="p-5 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Geography</p>
              <p className="text-sm text-muted-foreground">
                Top states, crime mix, agencies.
              </p>
            </div>
          </CardContent>
        </Link>
      </Card>
      <Card className="transition-colors hover:border-primary/60">
        <Link href="/backlog" className="block">
          <CardContent className="p-5 flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Backlog</p>
              <p className="text-sm text-muted-foreground">
                {latest.pending.toLocaleString()} cases pending.
              </p>
            </div>
          </CardContent>
        </Link>
      </Card>
      <Card className="transition-colors hover:border-destructive/60">
        <Link href="/integrity" className="block">
          <CardContent className="p-5 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Integrity</p>
              <p className="text-sm text-muted-foreground">
                USCIS-reported concerns.
              </p>
            </div>
          </CardContent>
        </Link>
      </Card>
    </section>
  );
}
