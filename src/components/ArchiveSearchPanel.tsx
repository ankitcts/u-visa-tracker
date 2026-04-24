import { ExternalLink, Archive } from 'lucide-react';

/**
 * Pre-built search URLs across every reliable free US archive that covers
 * the U-visa era. Users click to jump straight to the archive — we don't
 * embed copyrighted results.
 *
 * Chronicling America (Library of Congress) covers pre-1963 only and
 * therefore can't host U-visa clippings; it's omitted here to avoid a
 * misleading "no results" experience.
 */
const ARCHIVES: {
  name: string;
  description: string;
  searches: { label: string; url: string }[];
}[] = [
  {
    name: 'Newspapers.com',
    description:
      'Digitized US newspaper scans, 1700s–present. Free-tier users see thumbnails; subscription required for full-page images. Real period front pages.',
    searches: [
      {
        label: 'VAWA 1994',
        url: 'https://www.newspapers.com/search/results/?query=%22Violence+Against+Women+Act%22&dr_year=1994-1994',
      },
      {
        label: 'VTVPA signing (Oct 2000)',
        url: 'https://www.newspapers.com/search/results/?query=%22Victims+of+Trafficking%22&dr_year=2000-2000',
      },
      {
        label: 'U-visa interim rule 2007',
        url: 'https://www.newspapers.com/search/results/?query=%22U+visa%22+%22interim+rule%22&dr_year=2007-2007',
      },
      {
        label: 'VAWA 2013 reauth',
        url: 'https://www.newspapers.com/search/results/?query=%22Violence+Against+Women%22&dr_year=2013-2013',
      },
      {
        label: 'Bona Fide Determination 2021',
        url: 'https://www.newspapers.com/search/results/?query=%22Bona+Fide+Determination%22&dr_year=2021-2021',
      },
      {
        label: 'Barrios Garcia 2022',
        url: 'https://www.newspapers.com/search/results/?query=%22Barrios+Garcia%22+%22U+visa%22&dr_year=2022-2022',
      },
    ],
  },
  {
    name: 'Internet Archive',
    description:
      'Free full-text search across millions of scanned books, government reports, C-SPAN clips, and digital captures.',
    searches: [
      {
        label: 'VTVPA reports & hearings',
        url: 'https://archive.org/search?query=%22Victims+of+Trafficking+and+Violence+Protection+Act%22',
      },
      {
        label: 'U-visa / I-918',
        url: 'https://archive.org/search?query=%22U+visa%22+OR+%22I-918%22',
      },
      {
        label: 'USCIS / INS crime-victim',
        url: 'https://archive.org/search?query=USCIS+%22crime+victim%22+visa',
      },
      {
        label: 'C-SPAN human-trafficking hearings',
        url: 'https://archive.org/search?query=C-SPAN+%22human+trafficking%22+hearing',
      },
    ],
  },
  {
    name: 'CourtListener',
    description:
      'Free-Law-Project database of every federal court opinion. Primary source for U-visa litigation.',
    searches: [
      {
        label: 'Barrios Garcia v. DHS (6th Cir. 2022)',
        url: 'https://www.courtlistener.com/opinion/9267430/barrios-garcia-v-mayorkas/',
      },
      {
        label: 'All U-visa litigation',
        url: 'https://www.courtlistener.com/?q=%22U+visa%22&type=o',
      },
      {
        label: 'USCIS delay litigation',
        url: 'https://www.courtlistener.com/?q=%22U+visa%22+delay&type=o',
      },
    ],
  },
  {
    name: 'Federal Register',
    description:
      'Official daily journal of the US government. Every U-visa rule, policy memo, and Fed. Reg. notice.',
    searches: [
      {
        label: '2007 Interim Rule (72 FR 53014)',
        url: 'https://www.federalregister.gov/documents/2007/09/17/E7-17807/new-classification-for-victims-of-criminal-activity-eligibility-for-u-nonimmigrant-status',
      },
      {
        label: 'All U-visa / U nonimmigrant notices',
        url: 'https://www.federalregister.gov/documents/search?conditions%5Bterm%5D=%22U+nonimmigrant%22',
      },
      {
        label: 'Form I-918 revisions',
        url: 'https://www.federalregister.gov/documents/search?conditions%5Bterm%5D=%22Form+I-918%22',
      },
    ],
  },
  {
    name: 'Congress.gov',
    description:
      'Official legislative record. Bill text, sponsor lists, committee reports, roll-call votes.',
    searches: [
      {
        label: 'H.R. 3244 — VTVPA 2000',
        url: 'https://www.congress.gov/bill/106th-congress/house-bill/3244',
      },
      {
        label: 'H.R. 3355 — VCCLEA/VAWA 1994',
        url: 'https://www.congress.gov/bill/103rd-congress/house-bill/3355',
      },
      {
        label: 'All U-visa bills',
        url: 'https://www.congress.gov/search?q=%22U+visa%22&searchResultViewType=expanded',
      },
    ],
  },
  {
    name: 'GovInfo',
    description:
      'Public documents from all three branches — Congressional Record, CRS reports, GAO studies.',
    searches: [
      {
        label: 'CRS reports on U-visa',
        url: 'https://www.govinfo.gov/app/search?query=%22U+visa%22',
      },
      {
        label: 'TVPRA reauthorizations',
        url: 'https://www.govinfo.gov/app/search?query=%22Trafficking+Victims+Protection+Reauthorization%22',
      },
    ],
  },
];

export default function ArchiveSearchPanel() {
  return (
    <section className="rounded-xl border bg-muted/20 p-5 md:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Archive className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold tracking-tight">
          Search the archive yourself
        </h2>
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl">
        We don&apos;t reproduce copyrighted newspaper scans. These are
        pre-built searches against every reliable free U.S. archive that
        covers the U-visa era — click any button to open the real
        contemporaneous record in a new tab.
      </p>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {ARCHIVES.map((a) => (
          <article
            key={a.name}
            className="rounded-lg border bg-background p-4 space-y-3"
          >
            <header className="space-y-1">
              <h3 className="text-sm font-semibold">{a.name}</h3>
              <p className="text-[12px] leading-snug text-muted-foreground">
                {a.description}
              </p>
            </header>
            <ul className="space-y-1">
              {a.searches.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1 text-[13px] text-foreground/80 hover:text-primary hover:underline underline-offset-4"
                  >
                    {s.label}
                    <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground italic">
        Note: Library of Congress Chronicling America is excluded — it only
        covers pre-1963 US newspapers, predating the U-visa era (2000–present).
      </p>
    </section>
  );
}
