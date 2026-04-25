import type { Metadata } from 'next';
import Explorer from '@/components/Explorer';
import LastUpdatedPill from '@/components/LastUpdatedPill';
import {
  ANNUAL_PRINCIPAL,
  ANNUAL_DERIVATIVE,
  STATE_CERT_SHARES,
  YEARLY_CRIME_TRENDS,
} from '@/lib/data';

export const metadata: Metadata = {
  title: 'Analyze U Visa Data — By Year and By State',
  description:
    'Interactively filter U-visa aggregate data by fiscal year range and by state. Covers FY2009–FY2025 filings and FY2012–FY2018 certification breakdowns from public USCIS reports.',
  alternates: { canonical: '/analyze' },
};

export default function AnalyzePage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Analyze: By Year &amp; By State
          </h1>
          <LastUpdatedPill routeKey="analyze" />
        </div>
        <p className="text-muted-foreground w-full text-justify">
          Drill into the aggregate U-visa data with year and state filters.
          Because USCIS publishes annual filing volumes{' '}
          <em>separately</em> from state-level certification breakdowns, this
          page is honest about what each filter affects.
        </p>
      </section>

      <Explorer
        principal={ANNUAL_PRINCIPAL}
        derivative={ANNUAL_DERIVATIVE}
        states={STATE_CERT_SHARES}
        yearlyCrimes={YEARLY_CRIME_TRENDS}
      />
    </div>
  );
}
