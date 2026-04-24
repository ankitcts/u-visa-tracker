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
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Live U-Visa News
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          Recent U-visa, immigration-fraud, and crime-victim-visa coverage,
          geo-tagged by state where possible. Feed refreshes hourly; program
          aggregate stats refresh daily. What the U visa IS (categories,
          eligibility, process) lives at{' '}
          <Link href="/u-visa" className="text-primary hover:underline">
            /u-visa
          </Link>
          .
        </p>
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
