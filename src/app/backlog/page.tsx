import type { Metadata } from 'next';
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
      </section>
    </div>
  );
}
