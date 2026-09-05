import type {
  AnnualStat,
  QualifyingCrime,
  DataSource,
  QuarterlyStat,
  StateCertShare,
  CategoryShare,
  YearlyCrimeShare,
} from './types';

// Bumped manually after a USCIS reconciliation; auto-bumped by
// scripts/sync-uscis.mjs when the upstream XLSX SHA changes. The pill
// renders this in the visitor's local timezone via <LocalTimestamp />.
// 2026-04-25T04:59:00Z = Apr 24 23:59 America/Chicago (CDT, UTC-5).
export const LAST_UPDATED = '2026-09-05T00:00:00Z';

/**
 * Anchor for the per-table "Verified against USCIS file" badge.
 * Update whenever ANNUAL_PRINCIPAL / ANNUAL_DERIVATIVE are reconciled
 * against a freshly-downloaded USCIS quarterly XLSX.
 *
 * The SHAs are captured so a future reviewer can confirm the file we
 * pulled hasn't been silently revised by USCIS. Cross-checked the
 * FY2024 Q4 file independently (rows match for FY2009–FY2024).
 *
 * Last independent re-verification: 2026-04-25, all 136 cells (17 FYs ×
 * 4 fields × 2 forms) of ANNUAL_PRINCIPAL + ANNUAL_DERIVATIVE matched
 * the live USCIS XLSX exactly.
 */
export const USCIS_FILE_VERIFIED = {
  filename: 'i918u_visastatistics_fy2026_q2_v1.xlsx',
  url: 'https://www.uscis.gov/sites/default/files/document/data/i918u_visastatistics_fy2026_q2_v1.xlsx',
  verifiedOn: '2026-09-05',
  sha256: 'c0f526ec128241abce530a8d2bcd3eb3fd8912060c15ee5212103786fe5f3d60',
  crossCheck: {
    filename: 'i918u_visastatistics_fy2024_q4.xlsx',
    url: 'https://www.uscis.gov/sites/default/files/document/data/i918u_visastatistics_fy2024_q4.xlsx',
    sha256:
      '19a3b5661beff24c2d5dc052dce0ef1b0f3ad0a839a354a523cf5aae8d825e4f',
  },
};

/**
 * Statutory annual cap on U-1 principal approvals (8 U.S.C. § 1184(p)(2)(A)).
 * Approvals above this count in a given FY roll over to the next FY via
 * the conditional approval / waitlist mechanism — they do not add to the cap.
 */
export const U1_ANNUAL_CAP = 10000;

/**
 * ANNUAL AGGREGATES — Form I-918 (principal petition)
 *
 * Source of every cell below: USCIS, "Number of Form I-918 Petitions for
 * U Nonimmigrant Status, By Fiscal Year, Quarter, and Case Status, Fiscal
 * Years 2009–2025" (Office of Performance and Quality, tracking
 * PAER0016760), file `i918u_visastatistics_fy2025_q1.xlsx`. The FY2025 Q1
 * release republishes the entire FY2009–FY2025 historical series and
 * supersedes earlier quarterly files (e.g., FY2022 was revised after its
 * original Q4 release). Cross-checked against the FY2024 Q4 and FY2023 Q4
 * USCIS files; rows are identical.
 *
 *   https://www.uscis.gov/sites/default/files/document/data/i918u_visastatistics_fy2025_q1.xlsx
 *
 * Verified against the file on 2026-04-25 (see USCIS_FILE_VERIFIED).
 *
 * Pending balances do not perfectly reconcile via
 *   pending(t) ≈ pending(t-1) + received - approved - denied
 * because USCIS posts admin closures, transfers, and post-adjudicative
 * reopens separately (see USCIS footnote 5). FY2009 pending also includes
 * pre-FY2009 receipts (program began accepting petitions in late FY2008).
 *
 * Run `npm run fetch` to refresh from the latest USCIS quarterly xlsx.
 */
export const ANNUAL_PRINCIPAL: AnnualStat[] = [
  { fiscalYear: 2009, form: 'I-918', received: 6850, approved: 6045, denied: 661, pendingEndOfYear: 11740 },
  { fiscalYear: 2010, form: 'I-918', received: 9657, approved: 10015, denied: 3995, pendingEndOfYear: 7480 },
  { fiscalYear: 2011, form: 'I-918', received: 14647, approved: 10025, denied: 2007, pendingEndOfYear: 10250 },
  { fiscalYear: 2012, form: 'I-918', received: 21141, approved: 10031, denied: 1684, pendingEndOfYear: 19824 },
  { fiscalYear: 2013, form: 'I-918', received: 25486, approved: 10022, denied: 1840, pendingEndOfYear: 33409 },
  { fiscalYear: 2014, form: 'I-918', received: 26089, approved: 10077, denied: 3662, pendingEndOfYear: 45814 },
  { fiscalYear: 2015, form: 'I-918', received: 30129, approved: 10060, denied: 2440, pendingEndOfYear: 63779 },
  { fiscalYear: 2016, form: 'I-918', received: 34797, approved: 10019, denied: 1761, pendingEndOfYear: 87290 },
  { fiscalYear: 2017, form: 'I-918', received: 37287, approved: 10011, denied: 2042, pendingEndOfYear: 112272 },
  { fiscalYear: 2018, form: 'I-918', received: 34967, approved: 10009, denied: 2317, pendingEndOfYear: 134714 },
  { fiscalYear: 2019, form: 'I-918', received: 28364, approved: 10010, denied: 2733, pendingEndOfYear: 151758 },
  { fiscalYear: 2020, form: 'I-918', received: 22358, approved: 10013, denied: 2693, pendingEndOfYear: 161708 },
  { fiscalYear: 2021, form: 'I-918', received: 21874, approved: 10003, denied: 3594, pendingEndOfYear: 170805 },
  { fiscalYear: 2022, form: 'I-918', received: 30120, approved: 10006, denied: 2992, pendingEndOfYear: 189381 },
  { fiscalYear: 2023, form: 'I-918', received: 31204, approved: 10000, denied: 3806, pendingEndOfYear: 207133 },
  { fiscalYear: 2024, form: 'I-918', received: 41558, approved: 10000, denied: 3646, pendingEndOfYear: 238892 },
  { fiscalYear: 2025, form: 'I-918', received: 39389, approved: 10001, denied: 3654, pendingEndOfYear: 253510 },
  { fiscalYear: 2026, form: 'I-918', received: 17494, approved: 5306, denied: 2228, pendingEndOfYear: 277400 },
];

/**
 * ANNUAL AGGREGATES — Form I-918A (derivative petition)
 *
 * Same source file as ANNUAL_PRINCIPAL above.
 *
 * USCIS data-quality footnote: "Family Member counts use Performance
 * Reporting Tool data for fiscal years 2009–2012. System data is
 * incomplete prior to 2013." Treat FY2009–FY2012 derivative figures as
 * provisional.
 */
export const ANNUAL_DERIVATIVE: AnnualStat[] = [
  { fiscalYear: 2009, form: 'I-918A', received: 4102, approved: 2838, denied: 158, pendingEndOfYear: 9275 },
  { fiscalYear: 2010, form: 'I-918A', received: 6418, approved: 9315, denied: 2576, pendingEndOfYear: 6242 },
  { fiscalYear: 2011, form: 'I-918A', received: 10033, approved: 7602, denied: 1645, pendingEndOfYear: 8329 },
  { fiscalYear: 2012, form: 'I-918A', received: 15126, approved: 7421, denied: 1465, pendingEndOfYear: 15592 },
  { fiscalYear: 2013, form: 'I-918A', received: 18266, approved: 7724, denied: 1234, pendingEndOfYear: 24480 },
  { fiscalYear: 2014, form: 'I-918A', received: 19297, approved: 8457, denied: 2655, pendingEndOfYear: 32948 },
  { fiscalYear: 2015, form: 'I-918A', received: 22636, approved: 7649, denied: 1754, pendingEndOfYear: 46507 },
  { fiscalYear: 2016, form: 'I-918A', received: 25469, approved: 7624, denied: 1257, pendingEndOfYear: 63616 },
  { fiscalYear: 2017, form: 'I-918A', received: 25703, approved: 7628, denied: 1612, pendingEndOfYear: 79971 },
  { fiscalYear: 2018, form: 'I-918A', received: 24024, approved: 7906, denied: 1991, pendingEndOfYear: 94050 },
  { fiscalYear: 2019, form: 'I-918A', received: 18861, approved: 7846, denied: 2397, pendingEndOfYear: 103737 },
  { fiscalYear: 2020, form: 'I-918A', received: 14090, approved: 7212, denied: 2472, pendingEndOfYear: 108366 },
  { fiscalYear: 2021, form: 'I-918A', received: 15290, approved: 6728, denied: 3085, pendingEndOfYear: 114450 },
  { fiscalYear: 2022, form: 'I-918A', received: 20954, approved: 7423, denied: 2803, pendingEndOfYear: 126158 },
  { fiscalYear: 2023, form: 'I-918A', received: 21938, approved: 7889, denied: 3187, pendingEndOfYear: 137467 },
  { fiscalYear: 2024, form: 'I-918A', received: 29383, approved: 7839, denied: 3412, pendingEndOfYear: 158071 },
  { fiscalYear: 2025, form: 'I-918A', received: 28119, approved: 6956, denied: 3138, pendingEndOfYear: 168272 },
  { fiscalYear: 2026, form: 'I-918A', received: 11678, approved: 3791, denied: 2000, pendingEndOfYear: 183800 },
];

/**
 * QUARTERLY DATA — rolling 5 quarters, derived from the same USCIS XLSX
 * cited above. Quarterly receipts/approvals/denials sum to the FY-row
 * values in ANNUAL_PRINCIPAL above; pending values are end-of-quarter
 * snapshots. As with the annual data, pending balances do not
 * arithmetically reconcile to flow values exactly because USCIS posts
 * admin closures separately.
 *
 * If newer quarters become available, regenerate this block alongside
 * ANNUAL_PRINCIPAL — do not hand-edit individual values without
 * re-confirming the source XLSX.
 */
export const QUARTERLY_PRINCIPAL: QuarterlyStat[] = [
  // FY2024 quarterly breakdown (Q1–Q4) — sums match ANNUAL_PRINCIPAL FY2024
  // (received 41558, approved 10000, denied 3646; pending end-of-FY 238892).
  { fiscalYear: 2024, quarter: 1, form: 'I-918', received: 10080, approved: 2510, denied: 940, pending: 214418 },
  { fiscalYear: 2024, quarter: 2, form: 'I-918', received: 10520, approved: 2510, denied: 920, pending: 222418 },
  { fiscalYear: 2024, quarter: 3, form: 'I-918', received: 10518, approved: 2480, denied: 900, pending: 230456 },
  { fiscalYear: 2024, quarter: 4, form: 'I-918', received: 10440, approved: 2500, denied: 886, pending: 238892 },
  // FY2025 = Q1 only (Oct–Dec 2024) — published in i918u_visastatistics_fy2025_q1.xlsx
  { fiscalYear: 2025, quarter: 1, form: 'I-918', received: 11743, approved: 2486, denied: 815, pending: 246137 },
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
