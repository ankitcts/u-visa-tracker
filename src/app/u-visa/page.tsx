import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Scale, Users, CheckCircle2 } from 'lucide-react';
import VideoEmbed from '@/components/VideoEmbed';
import ChapteredVideo from '@/components/ChapteredVideo';
import StatCard from '@/components/StatCard';
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

export const metadata: Metadata = {
  title: 'Understanding the U Visa — Categories, Eligibility & Process',
  description:
    'Plain-English overview of the U nonimmigrant visa (Form I-918): the five U classifications, who qualifies as a crime victim, the law-enforcement certification requirement, and the 10,000 annual cap.',
};

export const revalidate = 60 * 60 * 24; // page-level ISR: refresh daily

export default function UVisaPage() {
  const latest = latestPending(ANNUAL_PRINCIPAL);
  const principalTotals = totals(ANNUAL_PRINCIPAL);
  const derivativeTotals = totals(ANNUAL_DERIVATIVE);
  const totalIssued = principalTotals.approved + derivativeTotals.approved;
  const topState = [...STATE_CERT_SHARES].sort((a, b) => b.share - a.share)[0];
  const topCrime = [...CERTIFIED_CRIME_SHARES].sort(
    (a, b) => b.share - a.share,
  )[0];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-4">
          <Badge variant="secondary">Plain-English explainer</Badge>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Understanding the U&nbsp;Visa
          </h1>
          <p className="text-lg text-muted-foreground">
            The U nonimmigrant visa (Form I-918) gives temporary legal status
            and work authorization to undocumented crime victims who help law
            enforcement. Congress created it in the Victims of Trafficking and
            Violence Protection Act of 2000; USCIS began issuing it in 2007.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/">
                Read the full history
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/about">Eligibility & legal details</Link>
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

      {/* Headline KPIs */}
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

      {/* How it works */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-1.5">
            <Scale className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">1. Qualifying crime</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The applicant must be a victim of one of 28 statutorily-listed
            crimes — including domestic violence, sexual assault, trafficking,
            felonious assault, and witness tampering — and must have suffered
            substantial physical or mental abuse as a result.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1.5">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">2. Cooperation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The applicant must have been, is being, or is likely to be
            helpful to law enforcement in the investigation or prosecution
            of the crime. A certifying agency (police, prosecutor, judge,
            or certain civil authorities) signs Form I-918 Supplement B.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1.5">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">3. Adjudication</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            USCIS reviews the I-918 petition. Only 10,000 principal (U-1)
            approvals may issue per fiscal year. Additional approvable
            petitions go on a waitlist with interim deferred action and
            work authorization.
          </CardContent>
        </Card>
      </section>

      {/* Five U categories */}
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
        <p className="text-xs text-muted-foreground max-w-3xl">
          Videos below are community / immigration-attorney explainers. USCIS
          does not publish U-visa-specific videos on its own channel.
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

      {/* Confidentiality */}
      <section className="rounded-lg border bg-muted/30 p-5 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Confidentiality:</strong>{' '}
          Individual U-visa petitioner information is protected by{' '}
          <a
            className="underline hover:text-foreground"
            href="https://www.law.cornell.edu/uscode/text/8/1367"
            target="_blank"
            rel="noreferrer"
          >
            8 U.S.C. § 1367
          </a>
          . This site displays only aggregate public statistics published by
          USCIS and DHS. For live program news, see{' '}
          <Link href="/news" className="text-primary hover:underline">
            /news
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
