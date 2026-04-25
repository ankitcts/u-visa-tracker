import type { Metadata } from 'next';
import CrimeCategoryList from '@/components/CrimeCategoryList';
import LastUpdatedPill from '@/components/LastUpdatedPill';
import ProcessFlowchart from '@/components/ProcessFlowchart';
import { QUALIFYING_CRIMES } from '@/lib/data';

export const metadata: Metadata = {
  title: 'About the U Visa',
  description:
    'What the U nonimmigrant visa is, who qualifies, the 28 statutory qualifying crimes, and why individual filings are confidential under 8 U.S.C. § 1367.',
};

export default function AboutPage() {
  return (
    <div className="prose-page">
      <div className="flex flex-wrap items-center justify-between gap-2 not-prose">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 m-0">
          About the U Visa
        </h1>
        <LastUpdatedPill routeKey="about" />
      </div>

      <p>
        The U nonimmigrant visa was created by the{' '}
        <em>Victims of Trafficking and Violence Protection Act of 2000</em>. It
        is available to victims of certain qualifying crimes who have suffered
        mental or physical abuse and who are helpful to law enforcement or
        government officials in the investigation or prosecution of the crime.
      </p>

      <p>
        USCIS began accepting petitions after the implementing regulations
        finalized in September 2007. The visa has a statutory annual cap of{' '}
        <strong>10,000 U-1 principal approvals per fiscal year</strong> (8
        U.S.C. § 1184(p)(2)(A)). Because annual receipts have exceeded the cap
        for well over a decade, a substantial backlog has accumulated.
      </p>

      <h2>Why we only show aggregate data</h2>
      <p>
        Under{' '}
        <a
          href="https://www.law.cornell.edu/uscode/text/8/1367"
          target="_blank"
          rel="noreferrer"
        >
          8 U.S.C. § 1367
        </a>
        , DHS is prohibited from disclosing information about U, T, and VAWA
        petitioners except in narrowly defined circumstances. This protection
        exists to prevent retaliation against crime victims and their
        families. As a result, petitioner identity, specific crime details,
        location, and nationality of individual applicants are{' '}
        <strong>never publicly releasable</strong> and cannot be obtained
        through FOIA.
      </p>
      <p>
        The statistics shown on this site are aggregate totals published by
        USCIS and DHS in their public reports.
      </p>

      <h2>The U visa journey — step by step</h2>
      <p>
        From the qualifying criminal activity to permanent residence, a
        complete U-visa journey can span well over a decade under current
        processing conditions.
      </p>
      <ProcessFlowchart />

      <h2>The 28 statutory qualifying crimes</h2>
      <p>
        A U visa petition must be based on one of the following statutory
        categories (or any similar activity):
      </p>
      <CrimeCategoryList crimes={QUALIFYING_CRIMES} />

      <h2>Derivative visas (I-918A)</h2>
      <p>
        The spouse, children, parents (for principal petitioners under 21),
        and unmarried siblings under 18 (for principal petitioners under 21)
        may be included as derivatives on Form I-918A. These are classified
        as U-2 (spouse), U-3 (child), U-4 (parent), and U-5 (sibling).
      </p>

      <h2>Bona fide determination (BFD)</h2>
      <p>
        Since June 2021, USCIS has issued a &quot;bona fide
        determination&quot; to certain pending principal petitioners, which
        grants work authorization and deferred action while the full petition
        remains pending. BFD processing times have themselves grown into a
        multi-year wait as of the most recent Ombudsman reporting.
      </p>
    </div>
  );
}
