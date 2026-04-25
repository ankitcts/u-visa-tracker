/**
 * Catalog of every newspaper / news / government archive we recommend for
 * U-visa historical research.
 *
 * Each entry exposes a `searchUrl(query, yearFrom?, yearTo?)` helper that
 * returns a deep-link into that archive's search UI for a given keyword and
 * optional year range. Used by <ArchiveSearchPanel /> to render one-click
 * pre-built searches across every archive that covers the U-visa era
 * (1994–present), plus a few that don't but are worth knowing about for
 * background research (Chronicling America, etc).
 *
 * No scraping happens here — we deep-link to the archive's own search UI
 * so users see real results in the rights-holder's interface, with
 * paywalls / signup walls intact where they exist.
 */

export type ArchiveAccess =
  | 'free' // fully free, no signup
  | 'freemium' // free search + previews; paid full text
  | 'paid' // subscription required to use at all
  | 'institutional' // typically reachable via a public-library card / academic login
  | 'free-with-account'; // free but requires registration

export interface ArchiveSource {
  id: string;
  name: string;
  description: string;
  access: ArchiveAccess;
  /** Geographic focus, e.g. "United States", "United Kingdom & Ireland". */
  geography: string;
  /** Earliest year the archive covers (or null if unknown). */
  yearsFrom?: number;
  /** Latest year covered. "present" means continuously updated. */
  yearsTo?: number | 'present';
  /** Editorial / source focus. Helps users pick the right archive fast. */
  focus?: string;
  homeUrl: string;
  /**
   * Returns a deep-link URL to the archive's search results for `query`.
   * Returns null if the archive doesn't expose a parseable search URL
   * (Factiva, ProQuest behind a paywall login, etc.) — in that case we
   * just deep-link to the homepage so the user can search there manually.
   */
  searchUrl: (q: string, yearFrom?: number, yearTo?: number) => string;
  /** True when the archive's date coverage misses the U-visa era (2000+). */
  preUVisaOnly?: boolean;
}

const enc = (s: string) => encodeURIComponent(s);

export const ARCHIVE_SOURCES: ArchiveSource[] = [
  // ─── Major commercial newspaper archives ──────────────────────────────
  {
    id: 'newspapers-com',
    name: 'Newspapers.com',
    description:
      'Largest commercial archive of digitized US newspapers. Free users see thumbnails of clippings; full-page images require a subscription. Excellent for state and regional papers.',
    access: 'freemium',
    geography: 'United States (some Canada/UK)',
    yearsFrom: 1700,
    yearsTo: 'present',
    focus: 'State + regional dailies, broadsheets',
    homeUrl: 'https://www.newspapers.com/',
    searchUrl: (q, from, to) => {
      const yr =
        from || to
          ? `&dr_year=${from ?? 1700}-${to ?? 2025}`
          : '';
      return `https://www.newspapers.com/search/results/?query=${enc(q)}${yr}`;
    },
  },
  {
    id: 'newspaperarchive',
    name: 'NewspaperArchive.com',
    description:
      'Over 280M digitized pages, 1736 to present. Strong on local, small-town US papers in addition to majors. Subscription for full text.',
    access: 'paid',
    geography: 'United States, with some international',
    yearsFrom: 1736,
    yearsTo: 'present',
    focus: 'Small-town & local US dailies',
    homeUrl: 'https://newspaperarchive.com/',
    searchUrl: (q) => `https://newspaperarchive.com/us/search/?keywords=${enc(q)}`,
  },
  {
    id: 'genealogybank',
    name: 'GenealogyBank',
    description:
      'NewsBank-owned archive specialized in obituaries, marriage / vital records, and historical newspapers. Includes unique titles like the San Diego Union (1871–1983) and Denver Post (1894–1986).',
    access: 'paid',
    geography: 'United States',
    yearsFrom: 1690,
    yearsTo: 'present',
    focus: 'Obituaries, vital records, niche papers',
    homeUrl: 'https://www.genealogybank.com/',
    searchUrl: (q) =>
      `https://www.genealogybank.com/explore/newspapers/all?keywords=${enc(q)}`,
  },
  {
    id: 'proquest-historical',
    name: 'ProQuest Historical Newspapers',
    description:
      'Academic gold standard. Full-page images including advertisements for the New York Times (1851–2020), Wall Street Journal, Chicago Tribune, Washington Post, LA Times. Reachable through most public-library cards.',
    access: 'institutional',
    geography: 'Global, US-heavy',
    yearsFrom: 1764,
    yearsTo: 2020,
    focus: 'Major US dailies, full page images',
    homeUrl: 'https://about.proquest.com/en/products-services/pq-hist-news/',
    searchUrl: (q) =>
      `https://www.proquest.com/results/?Issn=&Aulast=&Aufirst=&Source=All+Sources&Subject=&aifTitle=&Atitle=&Stitle=&Volume=&Issue=&Spage=&Date=&Series=&t=&Lang=&queryString=${enc(q)}`,
  },
  {
    id: 'british-newspaper-archive',
    name: 'The British Newspaper Archive',
    description:
      '200+ years of British & Irish papers in collaboration with the British Library. High-resolution clickable scans. Useful when a story crossed the Atlantic.',
    access: 'paid',
    geography: 'United Kingdom & Ireland',
    yearsFrom: 1700,
    yearsTo: 'present',
    focus: 'UK & Irish papers',
    homeUrl: 'https://www.britishnewspaperarchive.co.uk/',
    searchUrl: (q) =>
      `https://www.britishnewspaperarchive.co.uk/search/results/?basicsearch=${enc(q)}&retrievecountrycounts=false&newspapertitle=&page=1`,
  },

  // ─── Specialized & niche ──────────────────────────────────────────────
  {
    id: 'african-american-newspapers',
    name: 'African American Newspapers (Readex / Accessible Archives)',
    description:
      'Hundreds of US newspapers covering the African American experience, 1827–1998. Critical source for civil-rights-era coverage and parallel reporting on immigration enforcement.',
    access: 'institutional',
    geography: 'United States',
    yearsFrom: 1827,
    yearsTo: 1998,
    focus: 'African American press',
    homeUrl: 'https://www.readex.com/products/african-american-newspapers',
    searchUrl: (q) =>
      `https://www.readex.com/?s=${enc(q)}`,
  },
  {
    id: 'fbis',
    name: 'Foreign Broadcast Information Service (FBIS)',
    description:
      'CIA-produced English translations of foreign radio, television, and print news, 1974–1996. Useful for tracking how trafficking and immigration stories were covered abroad before the U visa.',
    access: 'institutional',
    geography: 'Global (foreign press in English)',
    yearsFrom: 1974,
    yearsTo: 1996,
    focus: 'Foreign press translations',
    homeUrl: 'https://www.readex.com/products/foreign-broadcast-information-service-fbis-daily-reports-1941-1996',
    searchUrl: (q) =>
      `https://www.google.com/search?q=site%3Areadex.com+FBIS+${enc(q)}`,
    preUVisaOnly: true,
  },
  {
    id: 'factiva',
    name: 'Factiva (Dow Jones)',
    description:
      'Professional, subscription-based aggregator over 33,000+ news sources with 30+ years of archives. The standard tool for news monitoring inside law firms and newsrooms.',
    access: 'paid',
    geography: 'Global',
    yearsFrom: 1980,
    yearsTo: 'present',
    focus: 'Wire + business + global news',
    homeUrl: 'https://www.dowjones.com/professional/factiva/',
    searchUrl: () => 'https://professional.dowjones.com/factiva/',
  },
  {
    id: 'independent-voices',
    name: 'Independent Voices',
    description:
      'Open-access JSTOR collection of alternative press papers, magazines, and journals from the late 20th century. Includes feminist, anti-war, and immigrant-rights publications.',
    access: 'free',
    geography: 'United States',
    yearsFrom: 1955,
    yearsTo: 2002,
    focus: 'Alternative & advocacy press',
    homeUrl: 'https://voices.revealdigital.org/',
    searchUrl: (q) =>
      `https://voices.revealdigital.org/?a=q&hs=1&r=1&results=1&txq=${enc(q)}`,
  },

  // ─── Free & institutional ─────────────────────────────────────────────
  {
    id: 'chronicling-america',
    name: 'Chronicling America (LoC)',
    description:
      'Library of Congress program with the National Endowment for the Humanities. Free full-text search and high-resolution scans. Coverage skews 1789–1963; cuts off before the U-visa era but rich for historical context (anti-trafficking, immigration debates pre-1900).',
    access: 'free',
    geography: 'United States',
    yearsFrom: 1789,
    yearsTo: 1963,
    focus: 'Pre-1963 US press',
    homeUrl: 'https://chroniclingamerica.loc.gov/',
    searchUrl: (q, from, to) =>
      `https://chroniclingamerica.loc.gov/search/pages/results/?proxtext=${enc(q)}${from ? `&date1=${from}` : ''}${to ? `&date2=${to}` : ''}&format=html`,
    preUVisaOnly: true,
  },
  {
    id: 'cdnc',
    name: 'California Digital Newspaper Collection',
    description:
      'Free archive of California papers maintained by UC Riverside. Strong for LA Times, Sacramento Bee, San Francisco Examiner local coverage of immigration enforcement.',
    access: 'free',
    geography: 'California',
    yearsFrom: 1846,
    yearsTo: 'present',
    focus: 'California papers',
    homeUrl: 'https://cdnc.ucr.edu/',
    searchUrl: (q) =>
      `https://cdnc.ucr.edu/?a=q&r=1&hs=1&results=1&txq=${enc(q)}&txf=txIN&dafdq=&dafmq=&dafyq=&datdq=&datmq=&datyq=`,
  },
  {
    id: 'elephind',
    name: 'Elephind',
    description:
      'Federated search engine across thousands of free historical newspaper archives — useful when you don\'t know which library or state holds the paper you need.',
    access: 'free',
    geography: 'Global (English-language)',
    yearsFrom: 1700,
    yearsTo: 'present',
    focus: 'Cross-archive search',
    homeUrl: 'https://elephind.com/',
    searchUrl: (q) =>
      `https://www.elephind.com/?a=q&hs=1&r=1&results=1&txq=${enc(q)}`,
  },
  {
    id: 'internet-archive',
    name: 'Internet Archive',
    description:
      'Free full-text search across millions of digitized books, government reports, magazines, and C-SPAN clips. Strong for CRS reports, Ombudsman annual reports, congressional hearings.',
    access: 'free',
    geography: 'Global',
    yearsFrom: 1500,
    yearsTo: 'present',
    focus: 'Documents, books, video, magazines',
    homeUrl: 'https://archive.org/',
    searchUrl: (q) => `https://archive.org/search?query=${enc(q)}`,
  },

  // ─── Government / legal primary sources ───────────────────────────────
  {
    id: 'courtlistener',
    name: 'CourtListener',
    description:
      'Free Law Project database of every federal court opinion. Primary source for U-visa litigation: Barrios Garcia, RAILS, ASISTA cases.',
    access: 'free',
    geography: 'United States (federal)',
    yearsFrom: 1900,
    yearsTo: 'present',
    focus: 'Federal court opinions',
    homeUrl: 'https://www.courtlistener.com/',
    searchUrl: (q) =>
      `https://www.courtlistener.com/?q=${enc(q)}&type=o`,
  },
  {
    id: 'federal-register',
    name: 'Federal Register',
    description:
      'Daily journal of the US government. Every U-visa rule, policy memo, and Federal Register notice. Free, fully searchable.',
    access: 'free',
    geography: 'United States (federal)',
    yearsFrom: 1936,
    yearsTo: 'present',
    focus: 'Federal rules & notices',
    homeUrl: 'https://www.federalregister.gov/',
    searchUrl: (q) =>
      `https://www.federalregister.gov/documents/search?conditions%5Bterm%5D=${enc(q)}`,
  },
  {
    id: 'congress-gov',
    name: 'Congress.gov',
    description:
      'Official legislative record: bill text, sponsor lists, committee reports, roll-call votes. Run by the Library of Congress.',
    access: 'free',
    geography: 'United States (federal)',
    yearsFrom: 1789,
    yearsTo: 'present',
    focus: 'Bills & congressional record',
    homeUrl: 'https://www.congress.gov/',
    searchUrl: (q) =>
      `https://www.congress.gov/search?q=${enc(q)}&searchResultViewType=expanded`,
  },
  {
    id: 'govinfo',
    name: 'GovInfo',
    description:
      'GPO portal to public documents from all three branches of federal government — Congressional Record, CRS reports, GAO studies, court decisions.',
    access: 'free',
    geography: 'United States (federal)',
    yearsFrom: 1789,
    yearsTo: 'present',
    focus: 'Branch documents, CRS, GAO',
    homeUrl: 'https://www.govinfo.gov/',
    searchUrl: (q) =>
      `https://www.govinfo.gov/app/search?query=${enc(q)}`,
  },
];

/**
 * Pivotal U-visa-history queries that we offer pre-built across every
 * archive. The panel UI loops these and asks each archive to build its
 * own search URL via `searchUrl(q, yearFrom, yearTo)`.
 */
export interface ArchiveQuery {
  label: string;
  query: string;
  yearFrom?: number;
  yearTo?: number;
  /** When set, restrict to archives whose coverage overlaps these years. */
  era?: 'pre-1963' | 'modern' | 'all';
}

export const ARCHIVE_QUERIES: ArchiveQuery[] = [
  {
    label: 'VAWA 1994',
    query: '"Violence Against Women Act"',
    yearFrom: 1994,
    yearTo: 1995,
    era: 'modern',
  },
  {
    label: '1999 hearings on trafficking',
    query: '"trafficking" "immigrant victims"',
    yearFrom: 1999,
    yearTo: 2000,
    era: 'modern',
  },
  {
    label: 'VTVPA / Trafficking Victims Protection Act 2000',
    query: '"Victims of Trafficking and Violence Protection Act"',
    yearFrom: 2000,
    yearTo: 2001,
    era: 'modern',
  },
  {
    label: 'VAWA 2005 reauthorization',
    query: '"Violence Against Women" reauthorization',
    yearFrom: 2005,
    yearTo: 2006,
    era: 'modern',
  },
  {
    label: 'U-visa interim rule (Sept 2007)',
    query: '"U visa" "interim rule"',
    yearFrom: 2007,
    yearTo: 2008,
    era: 'modern',
  },
  {
    label: '10,000 cap reached (FY2010)',
    query: '"U visa" cap',
    yearFrom: 2010,
    yearTo: 2011,
    era: 'modern',
  },
  {
    label: 'VAWA 2013 reauthorization',
    query: '"Violence Against Women" 2013',
    yearFrom: 2013,
    yearTo: 2014,
    era: 'modern',
  },
  {
    label: 'Bona Fide Determination (June 2021)',
    query: '"Bona Fide Determination" "U visa"',
    yearFrom: 2021,
    yearTo: 2022,
    era: 'modern',
  },
  {
    label: 'Barrios Garcia v. DHS (6th Cir. 2022)',
    query: '"Barrios Garcia" "U visa"',
    yearFrom: 2022,
    yearTo: 2023,
    era: 'modern',
  },
  {
    label: 'Backlog ~273,000 (FY2024)',
    query: '"U visa" backlog',
    yearFrom: 2024,
    yearTo: 2025,
    era: 'modern',
  },
  {
    label: '2025 fraud / integrity coverage',
    query: '"U visa" fraud OR scheme',
    yearFrom: 2025,
    yearTo: 2025,
    era: 'modern',
  },
];

export const ACCESS_LABEL: Record<ArchiveAccess, string> = {
  free: 'Free',
  freemium: 'Freemium',
  paid: 'Paid',
  institutional: 'Library card',
  'free-with-account': 'Free · signup',
};

export const ACCESS_COLOR: Record<ArchiveAccess, string> = {
  free: '#10b981',
  freemium: '#3b82f6',
  paid: '#ef4444',
  institutional: '#a855f7',
  'free-with-account': '#0ea5e9',
};
