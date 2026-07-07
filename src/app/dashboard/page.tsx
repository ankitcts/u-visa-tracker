import type { Metadata } from 'next';
import Link from 'next/link';
import LastUpdatedPill from '@/components/LastUpdatedPill';
import StatCard from '@/components/StatCard';
import FilingsTrendChart from '@/components/FilingsTrendChart';
import BacklogChart from '@/components/BacklogChart';
import AnnualTable from '@/components/AnnualTable';
import StateShareChart from '@/components/StateShareChart';
import CategoryBarChart from '@/components/CategoryBarChart';
import DerivativeLinkedChart from '@/components/DerivativeLinkedChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ANNUAL_PRINCIPAL,
  ANNUAL_DERIVATIVE,
  U1_ANNUAL_CAP,
  STATE_CERT_SHARES,
  CERTIFIED_CRIME_SHARES,
  CERTIFYING_AGENCY_LEVEL_SHARES,
  USCIS_FILE_VERIFIED,
  totals,
  latestPending,
} from '@/lib/data';

export const metadata: Metadata = {
  title: 'Dashboard — Filings, Approvals, Backlog & Geography',
  description:
    'U-visa filings dashboard: receipts, approvals, denials, backlog, top states, crime categories, and latest news — all aggregate, all public-source.',
  alternates: { canonical: '/dashboard' },
};

export const revalidate = 3600;

export default function DashboardPage() {
  const principalTotals = totals(ANNUAL_PRINCIPAL);
  const derivativeTotals = totals(ANNUAL_DERIVATIVE);
  const latest = latestPending(ANNUAL_PRINCIPAL);
  const latestYear = [...ANNUAL_PRINCIPAL].sort(
    (a, b) => b.fiscalYear - a.fiscalYear,
  )[0];

  const topState = [...STATE_CERT_SHARES].sort((a, b) => b.share - a.share)[0];
  const topCrime = [...CERTIFIED_CRIME_SHARES].sort(
    (a, b) => b.share - a.share,
  )[0];

  const firstYear = [...ANNUAL_PRINCIPAL].sort(
    (a, b) => a.fiscalYear - b.fiscalYear,
  )[0];
  const receiptsVsCap = (latestYear.received / U1_ANNUAL_CAP).toFixed(1);
  const latestDenialRate = (
    (latestYear.denied / (latestYear.approved + latestYear.denied)) *
    100
  ).toFixed(0);
  const backlogGrowth = Math.round(latest.pending / firstYear.pendingEndOfYear);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <LastUpdatedPill routeKey="dashboard" />
        </div>
        <p className="text-sm text-muted-foreground">
          Public aggregate statistics for <strong>Form I-918</strong> — the
          petition for U nonimmigrant status granted to victims of qualifying
          crimes who assist law enforcement. Data sourced from USCIS and DHS;
          individual petitioner information is protected by law and never
          displayed.
        </p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-6 gap-3">
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
          label="Latest-FY receipts"
          value={latestYear.received}
          sublabel={`Principal, FY${latestYear.fiscalYear}`}
        />
        <StatCard
          label="Cumulative approvals"
          value={principalTotals.approved + derivativeTotals.approved}
          sublabel="Since FY2009"
        />
        <StatCard
          label="Top state"
          value={`${topState.state} · ${topState.share}%`}
          sublabel="Certifications, FY12–18"
        />
        <StatCard
          label="Top crime"
          value={`${topCrime.label} · ${topCrime.share}%`}
          sublabel="Certifications, FY12–18"
        />
      </section>

      <section className="prose-page !max-w-none w-full [&>p]:text-justify">
        <h2>Reading the numbers</h2>
        <p>
          Three patterns run through every chart on this page. The first is a
          ceiling that never moves: approvals sit pinned at almost exactly{' '}
          {U1_ANNUAL_CAP.toLocaleString()} principal petitions in each recent
          year, because that is the statutory maximum. No matter how many
          victims petition, USCIS cannot grant more than 10,000 U-1 visas in a
          fiscal year.
        </p>
        <p>
          The second is a flood of demand pressing against that ceiling. In
          FY{latestYear.fiscalYear}, USCIS received{' '}
          {latestYear.received.toLocaleString()} principal petitions — about{' '}
          {receiptsVsCap} times the number it is allowed to approve. When
          roughly {receiptsVsCap}× more cases arrive than can clear each year,
          the surplus does not disappear; it accumulates. That is the third
          pattern: a backlog that has grown from{' '}
          {firstYear.pendingEndOfYear.toLocaleString()} pending at the end of
          FY{firstYear.fiscalYear} to {latest.pending.toLocaleString()} at the
          end of FY{latest.fiscalYear} — roughly a {backlogGrowth}-fold
          increase — visible as the steadily climbing line in the pending chart
          below.
        </p>
        <p>
          Denials, by contrast, stay comparatively small: about{' '}
          {latestDenialRate}% of adjudicated principal petitions were denied in
          FY{latestYear.fiscalYear}. The program&apos;s bottleneck is not
          rejection — it is capacity. Most petitions are approvable; there is
          simply no room under the cap to approve them, so they wait. The
          geographic and crime-category charts further down show where those
          petitions originate and what qualifying crimes underlie them, drawn
          from the one detailed research report USCIS has published to date.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Form I-918 Principal — Receipts, Approvals, Denials by FY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FilingsTrendChart stats={ANNUAL_PRINCIPAL} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending cases over time</CardTitle>
        </CardHeader>
        <CardContent>
          <BacklogChart
            principal={ANNUAL_PRINCIPAL}
            derivative={ANNUAL_DERIVATIVE}
          />
          <p className="text-xs text-muted-foreground mt-3">
            The gap between annual receipts and the 10,000 U-1 cap drives the
            growing principal backlog visible in the red series.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Linked derivatives — U-1 principals paired with U-2/3/4/5 family approvals
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Each approved U-1 principal can be accompanied by up to several
            derivative U-visas for spouse (U-2), child (U-3), parent (U-4),
            and sibling (U-5). The red line shows the derivatives-per-principal
            ratio by FY — derivatives do not count against the 10,000 cap.
          </p>
        </CardHeader>
        <CardContent>
          <DerivativeLinkedChart
            principal={ANNUAL_PRINCIPAL}
            derivative={ANNUAL_DERIVATIVE}
          />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-lg">
                Top states by certification
              </CardTitle>
              <Link
                href="/geography"
                className="text-sm text-primary hover:underline"
              >
                See all →
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              % of all nationwide I-918B certifications, FY2012–FY2018
            </p>
          </CardHeader>
          <CardContent>
            <StateShareChart states={STATE_CERT_SHARES} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-lg">
                Qualifying crime categories
              </CardTitle>
              <Link
                href="/geography"
                className="text-sm text-primary hover:underline"
              >
                See all →
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              % of I-918B certifications by crime (multi-check, FY12–18)
            </p>
          </CardHeader>
          <CardContent>
            <CategoryBarChart
              items={CERTIFIED_CRIME_SHARES}
              color="rgba(239, 68, 68, 0.8)"
              max={50}
            />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-baseline justify-between">
            <CardTitle className="text-lg">Certifying agency level</CardTitle>
            <Link
              href="/geography"
              className="text-sm text-primary hover:underline"
            >
              Full context →
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Local police and prosecutors sign the overwhelming majority of
            certifications.
          </p>
        </CardHeader>
        <CardContent>
          <CategoryBarChart
            items={CERTIFYING_AGENCY_LEVEL_SHARES}
            color="rgba(16, 185, 129, 0.8)"
            max={100}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Annual aggregates</CardTitle>
          <p className="text-xs text-muted-foreground">
            Verified against USCIS file{' '}
            <a
              href={USCIS_FILE_VERIFIED.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono underline hover:text-foreground"
            >
              {USCIS_FILE_VERIFIED.filename}
            </a>{' '}
            on {USCIS_FILE_VERIFIED.verifiedOn}.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnnualTable stats={ANNUAL_PRINCIPAL} form="I-918 Principal" />
          <AnnualTable stats={ANNUAL_DERIVATIVE} form="I-918A Derivative" />
        </CardContent>
      </Card>
    </div>
  );
}
