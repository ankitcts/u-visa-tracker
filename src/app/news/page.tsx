import type { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, Clock, MapPin, ShieldAlert } from 'lucide-react';
import InteractiveNewsFeed from '@/components/InteractiveNewsFeed';
import NewsTicker from '@/components/NewsTicker';
import USNewsMap from '@/components/USNewsMapClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default async function NewsPage() {
  const latest = latestPending(ANNUAL_PRINCIPAL);

  const newsItems = await fetchUVisaNews(120);
  const classifiedNews = await classifyNews(newsItems);
  const newsLastUpdated = await getNewsLastUpdated();

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

      <NewsTicker limit={10} />
      <USNewsMap news={classifiedNews} lastUpdated={newsLastUpdated} />

      {/* Interactive news feed — full-width, supports search, tag filter,
          country filter, grid/list toggle, featured hero */}
      <InteractiveNewsFeed
        items={classifiedNews}
        lastUpdated={newsLastUpdated}
      />

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
    </div>
  );
}
