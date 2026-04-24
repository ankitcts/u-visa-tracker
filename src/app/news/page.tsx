import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, Clock, MapPin, ShieldAlert } from 'lucide-react';
import VideoEmbed from '@/components/VideoEmbed';
import ChapteredVideo from '@/components/ChapteredVideo';
import ClassifiedNewsFeed from '@/components/ClassifiedNewsFeed';
import NewsTicker from '@/components/NewsTicker';
import StatCard from '@/components/StatCard';
import USNewsMap from '@/components/USNewsMapClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { U_CATEGORIES, FEATURED_VIDEO } from '@/lib/categories';
import {
  ANNUAL_PRINCIPAL,
  ANNUAL_DERIVATIVE,
  U1_ANNUAL_CAP,
  STATE_CERT_SHARES,
  CERTIFIED_CRIME_SHARES,
  totals,
  latestPending,
} from '@/lib/data';
import { fetchUVisaNews, getNewsLastUpdated } from '@/lib/news';
import { classifyNews } from '@/lib/news-classifier';

export const metadata: Metadata = {
  title: 'Live U-Visa News Map',
  description:
    'Live map of U-visa and immigration-fraud news, geo-tagged by state, categorized by the LLM classifier, and refreshed daily.',
};

export const revalidate = 3600;

export default async function NewsPage() {
  const latest = latestPending(ANNUAL_PRINCIPAL);
  const principalTotals = totals(ANNUAL_PRINCIPAL);
  const derivativeTotals = totals(ANNUAL_DERIVATIVE);
  const totalIssued = principalTotals.approved + derivativeTotals.approved;
  const topState = [...STATE_CERT_SHARES].sort((a, b) => b.share - a.share)[0];
  const topCrime = [...CERTIFIED_CRIME_SHARES].sort(
    (a, b) => b.share - a.share,
  )[0];

  const newsItems = await fetchUVisaNews(120);
  const classifiedNews = await classifyNews(newsItems);
  const newsLastUpdated = await getNewsLastUpdated();

  return (
    <div className="space-y-10">
      <NewsTicker limit={10} />
      <USNewsMap news={classifiedNews} lastUpdated={newsLastUpdated} />

      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-4">
          <Badge variant="secondary">Video overview · live news</Badge>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Understand the U&nbsp;Visa.
          </h1>
          <p className="text-lg text-muted-foreground">
            A plain-English video explainer of Form I-918, the five U-visa
            classifications (U-1 through U-5), and a continuously-refreshed
            news feed on the program. All statistics are public aggregate —
            individual petitioners are protected by 8 U.S.C. § 1367.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard">
                Open the dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/analyze">Analyze by year & state</Link>
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {FEATURED_VIDEO.youtubeId && FEATURED_VIDEO.chapters.length > 0 ? (
            <ChapteredVideo
              youtubeId={FEATURED_VIDEO.youtubeId}
              title={FEATURED_VIDEO.title}
              chapters={FEATURED_VIDEO.chapters}
            />
          ) : (
            <VideoEmbed
              youtubeId={FEATURED_VIDEO.youtubeId || undefined}
              title={FEATURED_VIDEO.title}
              searchQuery={FEATURED_VIDEO.searchQuery}
            />
          )}
          <p className="text-sm text-muted-foreground">
            <strong>{FEATURED_VIDEO.title}</strong> — {FEATURED_VIDEO.subtitle}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="Total U-visas issued"
          value={totalIssued}
          sublabel={`Principal + derivative since FY${ANNUAL_PRINCIPAL[0].fiscalYear}`}
        />
        <StatCard
          label="Principal pending"
          value={latest.pending}
          sublabel={`End of FY${latest.fiscalYear}`}
        />
        <StatCard
          label="Annual cap"
          value={U1_ANNUAL_CAP}
          sublabel="U-1 approvals / FY"
        />
        <StatCard
          label="Top state"
          value={`${topState.state} · ${topState.share}%`}
          sublabel="Certifications, FY12–18"
        />
        <StatCard
          label="Top crime"
          value={topCrime.label}
          sublabel={`${topCrime.share}% of certifications`}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            The five U-visa categories
          </h2>
          <Link
            href="/about"
            className="text-sm text-primary hover:underline"
          >
            Full eligibility guide →
          </Link>
        </div>
        <p className="text-muted-foreground max-w-3xl">
          Only U-1 approvals count against the 10,000 statutory annual cap.
          Derivatives (U-2 through U-5) are granted alongside an approved
          principal.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          {U_CATEGORIES.map((c) => (
            <Card key={c.code} className="flex flex-col">
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <CardTitle className="text-lg">
                    <span className="font-mono text-primary">{c.code}</span>
                    <span className="ml-2">{c.title}</span>
                  </CardTitle>
                  <Badge
                    variant={
                      c.capAware === 'counts against cap'
                        ? 'destructive'
                        : 'success'
                    }
                  >
                    {c.capAware}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{c.eligibility}</p>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 flex flex-col">
                <VideoEmbed
                  youtubeId={c.youtubeId}
                  title={`${c.code} — ${c.title}`}
                  searchQuery={`U visa ${c.code} ${c.title}`}
                />
                <p className="text-sm text-muted-foreground">{c.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <CardTitle>Live news feed</CardTitle>
              <span className="text-xs text-muted-foreground">
                Refreshed daily · Google News
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ClassifiedNewsFeed limit={12} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="transition-colors hover:border-primary/60">
            <Link href="/dashboard" className="block">
              <CardContent className="p-5 flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    Filings, approvals, denials, and backlog by FY.
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
                    Top states by I-918B certification, crime mix, agencies.
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
                    Why {latest.pending.toLocaleString()} cases are pending —
                    and how long clearing them would take.
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
                  <p className="font-medium">Program integrity</p>
                  <p className="text-sm text-muted-foreground">
                    USCIS-reported concerns: rising share of likely ineligible
                    filings and certification gaps.
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}
