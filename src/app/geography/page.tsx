import type { Metadata } from 'next';
import LastUpdatedPill from '@/components/LastUpdatedPill';
import StateShareChart from '@/components/StateShareChart';
import CategoryBarChart from '@/components/CategoryBarChart';
import { getLatestSnapshot } from '@/lib/snapshot';

export const metadata: Metadata = {
  title: 'Geography & Context of U Visa Certifications',
  description:
    'Where were U visa I-918B certifications signed? State-level aggregate data from USCIS\'s 2020 Trends Report covering FY2012–FY2018, plus crime category, certifying agency type, filing delay, and case outcome distributions.',
  alternates: { canonical: '/geography' },
};

export default async function GeographyPage() {
  const {
    STATE_CERT_SHARES,
    CERTIFIED_CRIME_SHARES,
    CERTIFYING_AGENCY_SHARES,
    CERTIFYING_AGENCY_LEVEL_SHARES,
    FILING_DELAY_BUCKETS,
    CASE_OUTCOMES,
  } = await getLatestSnapshot();
  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Geography &amp; Context
          </h1>
          <LastUpdatedPill routeKey="geography" />
        </div>
        <p className="text-muted-foreground w-full text-justify">
          In 2020, USCIS published a research report with aggregate
          breakdowns covering <strong>FY2012–FY2018</strong>. It is the only
          public USCIS release that includes state-level, crime-category,
          certifying-agency, and case-outcome breakdowns. No more recent
          equivalent has been issued. All figures below are nationwide
          aggregates — never linked to individual petitioners.
        </p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-1">
          Top states by I-918B certifications signed
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Percent of all nationwide Form I-918B certifications signed by law
          enforcement officials located in the state, FY2012–FY2018. Eight
          states account for ~69% of all certifications; the remaining ~31%
          is distributed across the other 42 states and DC.
        </p>
        <StateShareChart states={STATE_CERT_SHARES} />
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-1">
          Top qualifying crimes certified
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Share of I-918B forms that checked each qualifying-crime category,
          FY2012–FY2018. Values exceed 100% because about 31% of forms
          select more than one category.
        </p>
        <CategoryBarChart
          items={CERTIFIED_CRIME_SHARES}
          color="rgba(239, 68, 68, 0.8)"
          max={50}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold mb-1">
            Who signs certifications?
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            By official type, FY2012–FY2018.
          </p>
          <CategoryBarChart
            items={CERTIFYING_AGENCY_SHARES}
            color="rgba(59, 130, 246, 0.8)"
            max={80}
          />
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-1">
            At what government level?
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Local police and prosecutors sign the overwhelming majority.
          </p>
          <CategoryBarChart
            items={CERTIFYING_AGENCY_LEVEL_SHARES}
            color="rgba(16, 185, 129, 0.8)"
            max={100}
          />
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-1">
          How long after the crime do victims file?
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Time between the qualifying crime and USCIS receipt of the
          principal petition. About half file within 3 years; about 15%
          file a decade or more after the crime.
        </p>
        <CategoryBarChart
          items={FILING_DELAY_BUCKETS}
          color="rgba(234, 179, 8, 0.85)"
          max={35}
        />
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-1">Case outcomes</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Aggregate outcomes recorded on certifications. Not mutually
          exclusive — a single case can have multiple outcomes.
        </p>
        <CategoryBarChart
          items={CASE_OUTCOMES}
          color="rgba(139, 92, 246, 0.8)"
          max={70}
        />
      </section>

      <section className="prose-page !max-w-none w-full [&>p]:text-justify">
        <h2>Per-state top crime mix</h2>
        <p>
          Within each top-eight state, the certifications skew toward
          different qualifying crimes. The cards below show each state&apos;s
          most frequently certified categories, FY2012–FY2018.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 mt-4">
          {STATE_CERT_SHARES.map((s) => (
            <div key={s.abbr} className="card !p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold text-foreground">
                  {s.state}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {s.share}%
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {s.topCrimes.map((c) => (
                  <li key={c.crime} className="flex justify-between gap-2">
                    <span className="text-foreground/80">
                      {c.crime}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {c.share.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Source: USCIS, <em>Trends in U Visa Law Enforcement
          Certifications, Qualifying Crimes, and Evidence of Helpfulness</em>
          , July 2020. Figure 4.
        </p>
      </section>

      <section className="prose-page !max-w-none w-full [&>p]:text-justify [&_li]:text-justify">
        <h2>What this still does not tell us</h2>
        <p>
          Even with the Trends Report, the following remain{' '}
          <strong>unavailable</strong> at any level of granularity:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>The city, county, or agency that signed any specific certification</li>
          <li>Counts for individual states outside the top eight</li>
          <li>Any petitioner-level identity, residence, or nationality</li>
          <li>Certifications broken down by state × year × crime simultaneously</li>
        </ul>
        <p>
          These are either not published or sealed by 8 U.S.C. § 1367. The
          2020 report remains the most granular public release to date.
        </p>
      </section>
    </div>
  );
}
