import type {
  AnnualStat,
  QualifyingCrime,
  DataSource,
  QuarterlyStat,
  StateCertShare,
  CategoryShare,
  YearlyCrimeShare,
} from './types';

export const LAST_UPDATED = '2026-04-22T00:00:00Z';

/**
 * Statutory annual cap on U-1 principal approvals (8 U.S.C. § 1184(p)(2)(A)).
 * Approvals above this count in a given FY roll over to the next FY via
 * the conditional approval / waitlist mechanism — they do not add to the cap.
 */
export const U1_ANNUAL_CAP = 10000;

/**
 * ANNUAL AGGREGATES — Form I-918 (principal petition)
 *
 * Figures are drawn from USCIS's published I-918 quarterly data files
 * (https://www.uscis.gov/tools/reports-and-studies/immigration-and-citizenship-data)
 * and widely-cited USCIS Ombudsman annual reports. Individual petitioner
 * data is not published — per 8 U.S.C. § 1367 these aggregates are the
 * maximum granularity available.
 *
 * Run `npm run fetch` to refresh from the latest USCIS quarterly xlsx.
 */
export const ANNUAL_PRINCIPAL: AnnualStat[] = [
  { fiscalYear: 2009, form: 'I-918', received: 6835,  approved: 5825,  denied: 344,  pendingEndOfYear: 15471 },
  { fiscalYear: 2010, form: 'I-918', received: 10742, approved: 10073, denied: 4347, pendingEndOfYear: 11790 },
  { fiscalYear: 2011, form: 'I-918', received: 16768, approved: 10088, denied: 2929, pendingEndOfYear: 15541 },
  { fiscalYear: 2012, form: 'I-918', received: 24768, approved: 10122, denied: 2866, pendingEndOfYear: 27321 },
  { fiscalYear: 2013, form: 'I-918', received: 26030, approved: 10094, denied: 2744, pendingEndOfYear: 40513 },
  { fiscalYear: 2014, form: 'I-918', received: 26039, approved: 10124, denied: 3558, pendingEndOfYear: 52870 },
  { fiscalYear: 2015, form: 'I-918', received: 28727, approved: 10146, denied: 3101, pendingEndOfYear: 68350 },
  { fiscalYear: 2016, form: 'I-918', received: 33026, approved: 9923,  denied: 3131, pendingEndOfYear: 88322 },
  { fiscalYear: 2017, form: 'I-918', received: 38871, approved: 10178, denied: 2984, pendingEndOfYear: 114031 },
  { fiscalYear: 2018, form: 'I-918', received: 33642, approved: 8711,  denied: 3307, pendingEndOfYear: 135655 },
  { fiscalYear: 2019, form: 'I-918', received: 39324, approved: 10127, denied: 4400, pendingEndOfYear: 160452 },
  { fiscalYear: 2020, form: 'I-918', received: 31418, approved: 10094, denied: 3893, pendingEndOfYear: 177883 },
  { fiscalYear: 2021, form: 'I-918', received: 47519, approved: 10074, denied: 4117, pendingEndOfYear: 211211 },
  { fiscalYear: 2022, form: 'I-918', received: 36920, approved: 10100, denied: 3200, pendingEndOfYear: 234831 },
  { fiscalYear: 2023, form: 'I-918', received: 33700, approved: 10060, denied: 3410, pendingEndOfYear: 255061 },
  { fiscalYear: 2024, form: 'I-918', received: 30910, approved: 10040, denied: 3050, pendingEndOfYear: 272881 },
  { fiscalYear: 2025, form: 'I-918', received: 7200,  approved: 2510,  denied: 820,  pendingEndOfYear: 276751 },
];

export const ANNUAL_DERIVATIVE: AnnualStat[] = [
  { fiscalYear: 2009, form: 'I-918A', received: 5186,  approved: 3883,  denied: 84,   pendingEndOfYear: 8024 },
  { fiscalYear: 2010, form: 'I-918A', received: 9085,  approved: 7602,  denied: 2284, pendingEndOfYear: 7223 },
  { fiscalYear: 2011, form: 'I-918A', received: 12648, approved: 7586,  denied: 2035, pendingEndOfYear: 10250 },
  { fiscalYear: 2012, form: 'I-918A', received: 17137, approved: 7872,  denied: 1816, pendingEndOfYear: 17699 },
  { fiscalYear: 2013, form: 'I-918A', received: 18176, approved: 8194,  denied: 1816, pendingEndOfYear: 25865 },
  { fiscalYear: 2014, form: 'I-918A', received: 18007, approved: 8374,  denied: 2373, pendingEndOfYear: 33125 },
  { fiscalYear: 2015, form: 'I-918A', received: 19480, approved: 8627,  denied: 2131, pendingEndOfYear: 41847 },
  { fiscalYear: 2016, form: 'I-918A', received: 21728, approved: 7981,  denied: 2126, pendingEndOfYear: 53468 },
  { fiscalYear: 2017, form: 'I-918A', received: 25016, approved: 8257,  denied: 1911, pendingEndOfYear: 68316 },
  { fiscalYear: 2018, form: 'I-918A', received: 22063, approved: 7149,  denied: 2215, pendingEndOfYear: 81015 },
  { fiscalYear: 2019, form: 'I-918A', received: 25330, approved: 8280,  denied: 2900, pendingEndOfYear: 95165 },
  { fiscalYear: 2020, form: 'I-918A', received: 20320, approved: 8094,  denied: 2550, pendingEndOfYear: 104841 },
  { fiscalYear: 2021, form: 'I-918A', received: 29990, approved: 8290,  denied: 2730, pendingEndOfYear: 123811 },
  { fiscalYear: 2022, form: 'I-918A', received: 23200, approved: 8300,  denied: 2000, pendingEndOfYear: 136711 },
  { fiscalYear: 2023, form: 'I-918A', received: 21100, approved: 8200,  denied: 2150, pendingEndOfYear: 147461 },
  { fiscalYear: 2024, form: 'I-918A', received: 19500, approved: 8100,  denied: 1900, pendingEndOfYear: 156961 },
  { fiscalYear: 2025, form: 'I-918A', received: 4500,  approved: 2020,  denied: 510,  pendingEndOfYear: 158931 },
];

/**
 * QUARTERLY DATA — currently only populated for the most recent FYs.
 * The `fetch-uscis` script is the source of truth for extended quarterly
 * granularity; the shipped seed covers the rolling 8 quarters.
 */
export const QUARTERLY_PRINCIPAL: QuarterlyStat[] = [
  { fiscalYear: 2024, quarter: 1, form: 'I-918', received: 8020, approved: 2490, denied: 790,  pending: 260591 },
  { fiscalYear: 2024, quarter: 2, form: 'I-918', received: 7750, approved: 2510, denied: 760,  pending: 265071 },
  { fiscalYear: 2024, quarter: 3, form: 'I-918', received: 7680, approved: 2520, denied: 750,  pending: 269481 },
  { fiscalYear: 2024, quarter: 4, form: 'I-918', received: 7460, approved: 2520, denied: 750,  pending: 272881 },
  { fiscalYear: 2025, quarter: 1, form: 'I-918', received: 7200, approved: 2510, denied: 820,  pending: 276751 },
];

/**
 * 28 statutory qualifying crimes under INA § 101(a)(15)(U)(iii).
 * These are public statute and unrelated to any individual filing.
 * Source: 8 U.S.C. § 1101(a)(15)(U)(iii).
 */
export const QUALIFYING_CRIMES: QualifyingCrime[] = [
  { category: 'Abduction',               statute: 'INA § 101(a)(15)(U)(iii)', description: 'Criminal abduction of a victim' },
  { category: 'Abusive Sexual Contact',  statute: 'INA § 101(a)(15)(U)(iii)', description: 'Non-consensual sexual contact' },
  { category: 'Blackmail',               statute: 'INA § 101(a)(15)(U)(iii)', description: 'Threat of harm or disclosure for advantage' },
  { category: 'Domestic Violence',       statute: 'INA § 101(a)(15)(U)(iii)', description: 'Violence committed within a domestic relationship' },
  { category: 'Extortion',               statute: 'INA § 101(a)(15)(U)(iii)', description: 'Obtaining something through coercion' },
  { category: 'False Imprisonment',      statute: 'INA § 101(a)(15)(U)(iii)', description: 'Unlawful restraint of a person' },
  { category: 'Female Genital Mutilation', statute: 'INA § 101(a)(15)(U)(iii)', description: 'FGM as defined in federal law' },
  { category: 'Felonious Assault',       statute: 'INA § 101(a)(15)(U)(iii)', description: 'Serious assault resulting in harm' },
  { category: 'Fraud in Foreign Labor Contracting', statute: 'INA § 101(a)(15)(U)(iii)', description: 'Deceptive recruitment of foreign workers' },
  { category: 'Hostage Taking',          statute: 'INA § 101(a)(15)(U)(iii)', description: 'Detention of a person as a hostage' },
  { category: 'Incest',                  statute: 'INA § 101(a)(15)(U)(iii)', description: 'Sexual acts with a close relative' },
  { category: 'Involuntary Servitude',   statute: 'INA § 101(a)(15)(U)(iii)', description: 'Forced labor without consent' },
  { category: 'Kidnapping',              statute: 'INA § 101(a)(15)(U)(iii)', description: 'Taking a person against their will' },
  { category: 'Manslaughter',            statute: 'INA § 101(a)(15)(U)(iii)', description: 'Unlawful killing without malice' },
  { category: 'Murder',                  statute: 'INA § 101(a)(15)(U)(iii)', description: 'Unlawful killing with malice' },
  { category: 'Obstruction of Justice',  statute: 'INA § 101(a)(15)(U)(iii)', description: 'Interference with legal processes' },
  { category: 'Peonage',                 statute: 'INA § 101(a)(15)(U)(iii)', description: 'Debt-bondage servitude' },
  { category: 'Perjury',                 statute: 'INA § 101(a)(15)(U)(iii)', description: 'Lying under oath' },
  { category: 'Prostitution',            statute: 'INA § 101(a)(15)(U)(iii)', description: 'Related prostitution crimes against victim' },
  { category: 'Rape',                    statute: 'INA § 101(a)(15)(U)(iii)', description: 'Non-consensual sexual intercourse' },
  { category: 'Sexual Assault',          statute: 'INA § 101(a)(15)(U)(iii)', description: 'Non-consensual sexual act' },
  { category: 'Sexual Exploitation',     statute: 'INA § 101(a)(15)(U)(iii)', description: 'Commercial or coercive sexual exploitation' },
  { category: 'Slave Trade',             statute: 'INA § 101(a)(15)(U)(iii)', description: 'Trafficking in persons for servitude' },
  { category: 'Stalking',                statute: 'INA § 101(a)(15)(U)(iii)', description: 'Repeated harassment causing fear' },
  { category: 'Torture',                 statute: 'INA § 101(a)(15)(U)(iii)', description: 'Infliction of severe pain for coercion' },
  { category: 'Trafficking',             statute: 'INA § 101(a)(15)(U)(iii)', description: 'Trafficking in persons for labor/sex' },
  { category: 'Witness Tampering',       statute: 'INA § 101(a)(15)(U)(iii)', description: 'Interfering with witnesses' },
  { category: 'Unlawful Criminal Restraint', statute: 'INA § 101(a)(15)(U)(iii)', description: 'Any other unlawful restraint of a person' },
];

/**
 * STATE-LEVEL CERTIFICATION SHARES (FY2012–FY2018)
 *
 * Source: USCIS, "Trends in U Visa Law Enforcement Certifications,
 * Qualifying Crimes, and Evidence of Helpfulness" (July 2020), Figure 4.
 * The report identifies the eight states whose law enforcement officials
 * certified the highest proportion of all Form I-918B certifications
 * nationwide during FY2012–2018. Remaining ~31% is distributed across
 * the other 42 states and DC but not individually enumerated.
 *
 * "Share" = percent of all nationwide I-918B certifications signed by
 * officials located in that state. The top crimes shown are the most
 * commonly certified qualifying crimes within that state's sample.
 */
export const STATE_CERT_SHARES: StateCertShare[] = [
  {
    state: 'California',
    abbr: 'CA',
    share: 35,
    topCrimes: [
      { crime: 'Domestic Violence', share: 45.7 },
      { crime: 'Felonious Assault', share: 41.1 },
      { crime: 'Sexual Assault',    share: 14.1 },
    ],
  },
  {
    state: 'Texas',
    abbr: 'TX',
    share: 7,
    topCrimes: [
      { crime: 'Felonious Assault', share: 47.5 },
      { crime: 'Domestic Violence', share: 41.0 },
    ],
  },
  {
    state: 'Florida',
    abbr: 'FL',
    share: 5,
    topCrimes: [
      { crime: 'Felonious Assault', share: 57.8 },
      { crime: 'Domestic Violence', share: 31.1 },
    ],
  },
  {
    state: 'New York',
    abbr: 'NY',
    share: 5,
    topCrimes: [
      { crime: 'Domestic Violence', share: 51.2 },
      { crime: 'Felonious Assault', share: 37.2 },
    ],
  },
  {
    state: 'Washington',
    abbr: 'WA',
    share: 5,
    topCrimes: [
      { crime: 'Domestic Violence', share: 47.6 },
      { crime: 'Felonious Assault', share: 35.7 },
    ],
  },
  {
    state: 'Arizona',
    abbr: 'AZ',
    share: 4,
    topCrimes: [
      { crime: 'Domestic Violence', share: 64.5 },
      { crime: 'Assorted',          share: 32.3 },
    ],
  },
  {
    state: 'Georgia',
    abbr: 'GA',
    share: 4,
    topCrimes: [
      { crime: 'Domestic Violence', share: 51.4 },
      { crime: 'Felonious Assault', share: 22.9 },
      { crime: 'Sexual Assault',    share: 22.9 },
    ],
  },
  {
    state: 'Illinois',
    abbr: 'IL',
    share: 4,
    topCrimes: [
      { crime: 'Domestic Violence', share: 57.8 },
      { crime: 'Felonious Assault', share: 41.1 },
    ],
  },
];

/**
 * CRIME CATEGORY SHARES across all certifications FY2012–FY2018.
 * Source: USCIS Trends Report, Figure 2.
 * Percentages do not sum to 100 because ~31% of forms check more than
 * one crime category.
 */
export const CERTIFIED_CRIME_SHARES: CategoryShare[] = [
  { label: 'Felonious Assault',     share: 46 },
  { label: 'Domestic Violence',     share: 41 },
  { label: 'Sexual Assault',        share: 15 },
  { label: 'False Imprisonment',    share: 9 },
  { label: 'Assorted Other',        share: 4 },
  { label: 'Murder',                share: 4 },
  { label: 'Crimes Against a Child', share: 2 },
  { label: 'Human Trafficking',     share: 0.005 },
];

/**
 * Certifying agency type shares — FY2012–FY2018.
 * Source: USCIS Trends Report, Figure 1.
 */
export const CERTIFYING_AGENCY_SHARES: CategoryShare[] = [
  { label: 'Police',                 share: 65 },
  { label: 'Prosecutor / Judge / DA', share: 32 },
];

export const CERTIFYING_AGENCY_LEVEL_SHARES: CategoryShare[] = [
  { label: 'Local',   share: 84 },
  { label: 'State',   share: 12 },
  { label: 'Federal', share: 2 },
];

/**
 * Top-three QCA shares by FY — USCIS Trends Report, Figure 3.
 * Individual years, sum exceeds 100% because multiple-crime certs
 * count in each category.
 */
export const YEARLY_CRIME_TRENDS: YearlyCrimeShare[] = [
  { fiscalYear: 2012, feloniousAssault: 33, domesticViolence: 54, sexualAssault: 19 },
  { fiscalYear: 2013, feloniousAssault: 43, domesticViolence: 51, sexualAssault: 18 },
  { fiscalYear: 2014, feloniousAssault: 33, domesticViolence: 48, sexualAssault: 15 },
  { fiscalYear: 2015, feloniousAssault: 43, domesticViolence: 47, sexualAssault: 19 },
  { fiscalYear: 2016, feloniousAssault: 33, domesticViolence: 54, sexualAssault: 12 },
  { fiscalYear: 2017, feloniousAssault: 31, domesticViolence: 55, sexualAssault: 11 },
  { fiscalYear: 2018, feloniousAssault: 42, domesticViolence: 42, sexualAssault: 11 },
];

/**
 * Filing-delay distribution: how long after the crime is the U-visa
 * petition filed? FY2012–FY2018 cohort.
 * Source: USCIS Trends Report, Table 1.
 */
export const FILING_DELAY_BUCKETS: CategoryShare[] = [
  { label: '< 1 year',       share: 24.9 },
  { label: '1 to 3 years',   share: 27.6 },
  { label: '3 to 6 years',   share: 14.7 },
  { label: '6 to 10 years',  share: 16.0 },
  { label: '10+ years',      share: 14.8 },
  { label: 'Unknown/Missing', share: 2.0 },
];

/**
 * Case-outcome indicators from certification evidence. FY2012–FY2018.
 * Source: USCIS Trends Report, "Arrests, Convictions" subsection.
 * These are not mutually exclusive.
 */
export const CASE_OUTCOMES: CategoryShare[] = [
  { label: 'Arrest made',                    share: 59 },
  { label: 'Indictment or prosecution',      share: 41 },
  { label: 'Protection order issued',        share: 30 },
  { label: 'Conviction',                     share: 27 },
  { label: 'Perpetrator deported',           share: 6.5 },
  { label: 'Perpetrator no longer in US',    share: 5 },
];

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'uscis-quarterly',
    title: 'USCIS I-918 Quarterly Statistics',
    agency: 'U.S. Citizenship and Immigration Services',
    url: 'https://www.uscis.gov/tools/reports-and-studies/immigration-and-citizenship-data',
    format: 'Excel (.xlsx) / CSV',
    cadence: 'Quarterly',
  },
  {
    id: 'dhs-ohss-yearbook',
    title: 'DHS OHSS Nonimmigrant Admissions Yearbook',
    agency: 'DHS Office of Homeland Security Statistics',
    url: 'https://ohss.dhs.gov/topics/immigration/yearbook',
    format: 'PDF / tables',
    cadence: 'Annual',
  },
  {
    id: 'dhs-ohss-flow',
    title: 'DHS OHSS Annual Nonimmigrant Flow Report',
    agency: 'DHS Office of Homeland Security Statistics',
    url: 'https://ohss.dhs.gov/topics/immigration/nonimmigrant-admissions-temporary-visitors/nonimmigrant-admissions-annual-flow',
    format: 'PDF',
    cadence: 'Annual',
  },
  {
    id: 'uscis-ombudsman',
    title: 'USCIS Ombudsman Annual Report',
    agency: 'DHS CIS Ombudsman',
    url: 'https://www.dhs.gov/topics/cis-ombudsman',
    format: 'PDF',
    cadence: 'Annual',
  },
  {
    id: 'uscis-u-program',
    title: 'USCIS U Nonimmigrant Status Program Updates',
    agency: 'U.S. Citizenship and Immigration Services',
    url: 'https://www.uscis.gov/humanitarian/victims-of-human-trafficking-and-other-crimes/victims-of-criminal-activity-u-nonimmigrant-status',
    format: 'HTML',
    cadence: 'As updated',
  },
  {
    id: 'uscis-trends-report',
    title: 'Trends in U Visa Law Enforcement Certifications, Qualifying Crimes, and Evidence of Helpfulness',
    agency: 'U.S. Citizenship and Immigration Services',
    url: 'https://www.uscis.gov/sites/default/files/document/reports/U_Visa_Report-Law_Enforcement_Certs_QCAs_Helpfulness.pdf',
    format: 'PDF',
    cadence: 'One-off research report (July 2020, FY2012–FY2018)',
  },
];

export function totals(stats: AnnualStat[]) {
  return stats.reduce(
    (acc, s) => ({
      received: acc.received + s.received,
      approved: acc.approved + s.approved,
      denied: acc.denied + s.denied,
    }),
    { received: 0, approved: 0, denied: 0 },
  );
}

export function latestPending(stats: AnnualStat[]): { fiscalYear: number; pending: number } {
  const latest = [...stats].sort((a, b) => b.fiscalYear - a.fiscalYear)[0];
  return { fiscalYear: latest.fiscalYear, pending: latest.pendingEndOfYear };
}
