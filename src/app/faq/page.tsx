import type { Metadata } from 'next';
import Link from 'next/link';
import LastUpdatedPill from '@/components/LastUpdatedPill';
import AdSenseSlot from '@/components/AdSenseSlot';
import {
  ANNUAL_PRINCIPAL,
  ANNUAL_DERIVATIVE,
  U1_ANNUAL_CAP,
  totals,
  latestPending,
} from '@/lib/data';

export const metadata: Metadata = {
  title: 'U Visa FAQ — Common Questions About Form I-918, the Cap & the Backlog',
  description:
    'Plain-English answers to the most common questions about the U nonimmigrant visa: what it is, who qualifies, how the 10,000 annual cap works, why the backlog is over 250,000 cases, how long the wait is, and where the public data comes from.',
  alternates: { canonical: '/faq' },
};

export const revalidate = 86400; // refresh daily

// A single source of truth for both the rendered accordion-style list and
// the FAQPage JSON-LD. Answers are plain prose (one or more paragraphs
// separated by a blank line) so the exact same text feeds Google's rich
// result and the on-page content — no drift between the two.
function buildFaqs() {
  const latest = latestPending(ANNUAL_PRINCIPAL);
  const yearsAtCap = Math.ceil(latest.pending / U1_ANNUAL_CAP);
  const principalTotals = totals(ANNUAL_PRINCIPAL);
  const derivativeTotals = totals(ANNUAL_DERIVATIVE);
  const totalIssued = (
    principalTotals.approved + derivativeTotals.approved
  ).toLocaleString();
  const pending = latest.pending.toLocaleString();
  const firstFy = ANNUAL_PRINCIPAL[0].fiscalYear;

  return [
    {
      q: 'What is the U visa?',
      a: [
        'The U visa — formally "U nonimmigrant status" — is a temporary immigration benefit for victims of certain serious crimes who have suffered substantial physical or mental abuse and who help law enforcement investigate or prosecute the crime. It is applied for on USCIS Form I-918.',
        'Congress created it in the Victims of Trafficking and Violence Protection Act of 2000. The goal was practical as much as humanitarian: when undocumented crime victims fear that contacting the police will get them deported, crimes go unreported and unsolved. The U visa gives those victims a reason to come forward by offering temporary legal status and work authorization in exchange for cooperating with the investigation.',
      ],
    },
    {
      q: 'Who qualifies for a U visa?',
      a: [
        'Four core requirements must all be met. First, the applicant must be the victim of a qualifying criminal activity. Second, they must have suffered substantial physical or mental abuse as a result of that crime. Third, they must possess information about the crime. Fourth, they must have been, be, or be likely to be helpful to law enforcement or government officials investigating or prosecuting it.',
        'The helpfulness requirement is documented by a certifying official — typically a police department, prosecutor, judge, or certain other agencies — who signs Form I-918, Supplement B. Without that certification, a petition generally cannot be approved.',
      ],
    },
    {
      q: 'What are the qualifying crimes for a U visa?',
      a: [
        'The statute lists 28 categories of qualifying criminal activity, including domestic violence, sexual assault, rape, felonious assault, trafficking, kidnapping, false imprisonment, extortion, witness tampering, obstruction of justice, and others — plus attempt, conspiracy, or solicitation to commit any of them, and "any similar activity."',
        'In practice a small set of crimes dominates the certifications. In the FY2012–FY2018 data USCIS published, felonious assault (about 46%) and domestic violence (about 41%) together account for the large majority of certified petitions, with sexual assault a distant third. You can see the full breakdown on the Geography & Context page.',
      ],
    },
    {
      q: 'How does the 10,000 annual cap work?',
      a: [
        `By statute (8 U.S.C. § 1184(p)(2)(A)), USCIS may grant no more than 10,000 U-1 principal approvals in a single fiscal year. That cap has been reached every year since 2010. It applies only to principal petitioners — derivative family members (U-2 through U-5) do not count against it.`,
        'When more petitions are approvable in a year than the cap allows, USCIS does not deny the surplus. Instead it places those petitioners on a waitlist with "deferred action" and, in many cases, work authorization, and formally approves them in a later year when a new 10,000-visa allotment opens. This is why the number of people waiting keeps climbing even though the program never technically runs out of approvable cases.',
      ],
    },
    {
      q: 'Why is there such a large U visa backlog?',
      a: [
        `The arithmetic is simple and unforgiving. USCIS can approve only 10,000 principal petitions a year, but it has received roughly 22,000 to 42,000 principal petitions a year for more than a decade. When inflow runs at two to four times the maximum outflow, a queue is inevitable and it compounds.`,
        `As of the most recent USCIS quarterly data, about ${pending} principal petitions were pending at the end of FY${latest.fiscalYear}. At the statutory pace of 10,000 approvals per year, it would take on the order of ${yearsAtCap} years to clear that queue even if not a single new petition were ever filed again.`,
      ],
    },
    {
      q: 'How long is the U visa wait right now?',
      a: [
        'There is no single official "wait time," because a petition passes through more than one queue. The headline figure is the cap-governed wait for a principal visa, which now stretches into a decade-plus given the size of the backlog.',
        'Since 2021, USCIS has used a "Bona Fide Determination" (BFD) process to grant work authorization and deferred action to certain pending petitioners years before their case reaches final adjudication. But the BFD queue has itself grown into a multi-year wait for the newest filings, so many petitioners now wait years just to reach the interim benefit, and much longer for the visa itself.',
      ],
    },
    {
      q: 'What is a Bona Fide Determination (BFD)?',
      a: [
        'A Bona Fide Determination is a review USCIS introduced in June 2021 as a faster on-ramp to interim benefits. If USCIS finds that a pending principal petition is "bona fide" and that the petitioner merits a favorable exercise of discretion, it can grant employment authorization and deferred action while the full petition continues to wait for cap-limited final adjudication.',
        'The BFD does not skip the line for the visa itself; it is a way to let long-waiting victims work legally and avoid removal in the meantime. Because demand has been high, the wait to even receive a BFD has grown substantially since the process launched.',
      ],
    },
    {
      q: 'What are U-2, U-3, U-4, and U-5 derivative visas?',
      a: [
        'When a principal victim (U-1) petitions, certain family members can be included as derivatives on Form I-918A: a spouse (U-2) and children (U-3) for any principal, and — when the principal is under 21 — parents (U-4) and unmarried siblings under 18 (U-5).',
        `Derivatives are granted alongside an approved principal and do not count against the 10,000 cap. They do, however, form their own large backlog: derivative pending cases reached roughly ${latestPending(ANNUAL_DERIVATIVE).pending.toLocaleString()} at the end of FY${latestPending(ANNUAL_DERIVATIVE).fiscalYear}.`,
      ],
    },
    {
      q: 'Does a U visa lead to a green card?',
      a: [
        'It can. After holding U nonimmigrant status for a continuous period (generally three years) and meeting other conditions — including not unreasonably refusing to help law enforcement and showing that continued presence is justified — a U visa holder may apply to adjust status to lawful permanent residence (a green card) on Form I-485.',
        'Because of the front-end backlog, the full arc from the qualifying crime to a green card commonly spans well over a decade under current conditions. Nothing on this site is legal advice; anyone pursuing this path should consult a licensed immigration attorney.',
      ],
    },
    {
      q: 'How many U visas have been issued in total?',
      a: [
        `Across the public USCIS record beginning in FY${firstFy}, roughly ${totalIssued} U visas have been approved when you add principal (I-918) and derivative (I-918A) approvals together. Principal approvals are effectively pinned near the 10,000 cap in every recent year, while derivative approvals vary.`,
        'You can explore the full year-by-year series — receipts, approvals, denials, and end-of-year pending — on the Dashboard.',
      ],
    },
    {
      q: 'Which states sign the most U visa certifications?',
      a: [
        'In the FY2012–FY2018 window covered by the USCIS Trends Report, eight states accounted for roughly 69% of all Form I-918B certifications nationwide. California alone was about 35%, followed at a distance by Texas, Florida, New York, Washington, Arizona, Georgia, and Illinois.',
        'The remaining ~31% of certifications was spread across the other 42 states and the District of Columbia, which the report did not enumerate individually. The state-by-state and per-state crime mix is on the Geography & Context page.',
      ],
    },
    {
      q: 'Why does this site only show aggregate statistics?',
      a: [
        'Federal law (8 U.S.C. § 1367) prohibits DHS from disclosing information about individual U, T, and VAWA petitioners except in narrowly defined circumstances. This confidentiality protection exists to prevent abusers and traffickers from using immigration filings to locate or retaliate against the victims who reported them.',
        'As a result, the identity of a petitioner, the specific facts of an individual crime, the location where it happened, the petitioner\'s nationality, and which agency signed a particular certification are never publicly releasable and cannot be obtained through a FOIA request. This site is built entirely from aggregate totals that USCIS and DHS publish, and it does not collect, host, or reproduce any individual-level information.',
      ],
    },
    {
      q: 'Where does the data on this site come from?',
      a: [
        'Every figure is drawn from publicly published U.S. government sources: USCIS quarterly I-918 statistics (Excel/CSV), the DHS Office of Homeland Security Statistics yearbooks and flow reports, USCIS Ombudsman annual reports, and the USCIS 2020 research report "Trends in U Visa Law Enforcement Certifications, Qualifying Crimes, and Evidence of Helpfulness."',
        'The annual filing series is reconciled cell-by-cell against the latest USCIS quarterly workbook, and the exact file, verification date, and file hash are recorded on the site. The full source list with links lives on the Sources page.',
      ],
    },
    {
      q: 'Is U Visa Tracker affiliated with USCIS or the government?',
      a: [
        'No. U Visa Tracker is an independent, informational project. It is not affiliated with, endorsed by, or operated by USCIS, DHS, or any government agency.',
        'Nothing on the site is legal advice and using it does not create an attorney-client relationship. If you are considering a U visa petition, consult a licensed immigration attorney or a Board of Immigration Appeals–accredited representative.',
      ],
    },
    {
      q: 'How often is the data updated?',
      a: [
        'The aggregate USCIS statistics are refreshed whenever USCIS publishes a new quarterly workbook — typically a few times a year — and reconciled by hand before the figures on the site change. Each data page shows a "last updated" indicator, and the Dashboard links directly to the specific USCIS file the numbers were verified against.',
        'A separate live news section aggregates and links to third-party coverage of the program; that is a convenience feature and is kept separate from the site\'s first-party statistics and analysis.',
      ],
    },
  ];
}

export default function FaqPage() {
  const faqs = buildFaqs();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a.join('\n\n'),
      },
    })),
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            U Visa — Frequently Asked Questions
          </h1>
          <LastUpdatedPill routeKey="faq" />
        </div>
        <p className="text-muted-foreground max-w-3xl">
          Straightforward answers to the questions people most often ask about
          the U nonimmigrant visa (Form I-918) — what it is, who qualifies, how
          the 10,000-per-year cap creates a backlog now measured in the hundreds
          of thousands, how long the wait runs, and where the public data behind
          this site comes from. For the underlying numbers and charts, see the{' '}
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>{' '}
          and{' '}
          <Link href="/backlog" className="text-primary hover:underline">
            Backlog
          </Link>{' '}
          pages.
        </p>
      </section>

      <div className="space-y-5">
        {faqs.map((f, i) => (
          <section
            key={f.q}
            className="rounded-xl border bg-card p-5 md:p-6 space-y-2"
          >
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {f.q}
            </h2>
            {f.a.map((para, j) => (
              <p
                key={j}
                className="text-sm md:text-[15px] leading-relaxed text-muted-foreground"
              >
                {para}
              </p>
            ))}
            {i === 6 && <AdSenseSlot slot="1234567892" />}
          </section>
        ))}
      </div>

      <section className="rounded-xl border bg-muted/20 p-5 md:p-6 space-y-2">
        <h2 className="text-base font-semibold tracking-tight">
          Still have a question?
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          This FAQ covers the program at a national, statistical level. For the
          legal mechanics and eligibility detail, read{' '}
          <Link href="/about" className="text-primary hover:underline">
            About the U visa
          </Link>{' '}
          and the plain-English{' '}
          <Link href="/u-visa" className="text-primary hover:underline">
            U visa overview
          </Link>
          . For the history of how the program came to be, start on the{' '}
          <Link href="/" className="text-primary hover:underline">
            home page
          </Link>
          . Remember that none of this is legal advice — consult a licensed
          immigration attorney about any individual case.
        </p>
      </section>
    </div>
  );
}
