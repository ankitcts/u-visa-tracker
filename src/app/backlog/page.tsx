import type { Metadata } from 'next';
import Link from 'next/link';
import BacklogChart from '@/components/BacklogChart';
import LastUpdatedPill from '@/components/LastUpdatedPill';
import StatCard from '@/components/StatCard';
import {
  ANNUAL_PRINCIPAL,
  ANNUAL_DERIVATIVE,
  U1_ANNUAL_CAP,
  latestPending,
} from '@/lib/data';

export const metadata: Metadata = {
  title: 'U Visa Backlog',
  description:
    'How the U visa backlog grew from ~15k pending in FY2009 to over 270k today — and what the 10,000 annual cap means for wait times.',
  alternates: { canonical: '/backlog' },
};

export default function BacklogPage() {
  const latestP = latestPending(ANNUAL_PRINCIPAL);
  const latestD = latestPending(ANNUAL_DERIVATIVE);
  const yearsAtCap = Math.ceil(latestP.pending / U1_ANNUAL_CAP);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            The U Visa Backlog
          </h1>
          <LastUpdatedPill routeKey="backlog" />
        </div>
        <p className="text-muted-foreground w-full text-justify">
          Because Congress capped U-1 principal approvals at 10,000 per
          fiscal year but receipts have run at 25,000–45,000 per year for over
          a decade, the pending queue has grown steadily. The chart and
          figures below are drawn entirely from USCIS quarterly public
          statistics.
        </p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Principal pending"
          value={latestP.pending}
          sublabel={`End of FY${latestP.fiscalYear}`}
        />
        <StatCard
          label="Derivative pending"
          value={latestD.pending}
          sublabel={`End of FY${latestD.fiscalYear}`}
        />
        <StatCard
          label="Annual cap"
          value={U1_ANNUAL_CAP}
          sublabel="Statutory U-1 approvals/FY"
        />
        <StatCard
          label="Years to clear at cap"
          value={yearsAtCap}
          sublabel="If receipts stopped today"
        />
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-4">Pending over time</h2>
        <BacklogChart
          principal={ANNUAL_PRINCIPAL}
          derivative={ANNUAL_DERIVATIVE}
        />
      </section>

      <section className="prose-page !max-w-none w-full [&>p]:text-justify">
        <h2>Why the backlog grows</h2>
        <p>
          Each year, USCIS may finally approve no more than 10,000 principal
          U-1 petitions. Any principal petition approved beyond that count in
          a given FY is placed on a <em>conditional approval</em> waitlist
          (with work authorization and deferred action) and is formally
          approved in a later FY when a new cap allotment becomes available.
        </p>
        <p>
          Derivative approvals (I-918A, classifications U-2 through U-5) are{' '}
          <strong>not</strong> counted against the 10,000 cap, but they are
          tied to the approval of the principal petition.
        </p>
        <h2>Bona fide determination (BFD) waits</h2>
        <p>
          The 2021-era BFD process intended to reduce the time between filing
          and initial work authorization. Recent USCIS Ombudsman reports
          describe BFD queue ages of several years for the newest cases, so
          the BFD itself has become a gating wait in addition to the eventual
          cap-governed final adjudication.
        </p>
        <h2>What the wait means in practice</h2>
        <p>
          A backlog measured in years is not an abstraction for the people
          inside it. A victim who petitions today may wait through the BFD
          queue simply to obtain interim work authorization, and then wait far
          longer for a principal visa to become available under a future
          year&apos;s cap allotment. Because eligibility to later apply for a
          green card generally begins only after several years of holding U
          status, the full path from the qualifying crime to permanent
          residence routinely spans well over a decade. During that time the
          petitioner&apos;s life — employment, travel, the ability to petition
          for family — is shaped by where they sit in a line that moves at a
          fixed 10,000 cases a year.
        </p>
        <h2>Will the backlog shrink?</h2>
        <p>
          Not without a change in the arithmetic. The pending queue falls only
          when annual approvals exceed annual receipts, but approvals are
          frozen at the statutory cap while receipts have exceeded it every
          year for more than a decade. Barring a drop in filings or an act of
          Congress lifting or raising the 10,000 ceiling, the mechanical result
          is a queue that continues to lengthen. Proposals to recapture unused
          visa numbers from prior years, to exempt certain petitioners from the
          cap, or to raise the cap outright have circulated for years, but none
          has become law. Until one does, the trend line above is the honest
          forecast: up.
        </p>
        <p className="text-sm text-muted-foreground">
          For the full year-by-year receipts, approvals, and denials that drive
          this queue, see the{' '}
          <Link href="/dashboard" className="text-primary hover:underline">
            dashboard
          </Link>
          ; for common questions about how the cap and BFD work, see the{' '}
          <Link href="/faq" className="text-primary hover:underline">
            FAQ
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
