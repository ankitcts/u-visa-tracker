/**
 * Static taxonomies + helper functions.
 *
 * The mutable, USCIS-sourced arrays (ANNUAL_PRINCIPAL, ANNUAL_DERIVATIVE,
 * QUARTERLY_PRINCIPAL, STATE_CERT_SHARES, *_CRIME_SHARES, etc.) are no
 * longer in this file. They moved to timestamped snapshot JSON in
 * `public/data/snapshots/<id>.json`, with `public/data/index.json`
 * tracking history. Pages load them via:
 *
 *   import { getLatestSnapshot } from '@/lib/snapshot';
 *   const snap = await getLatestSnapshot();
 *   // snap.ANNUAL_PRINCIPAL, snap.source, snap.createdAt, ...
 *
 * That means a USCIS data refresh ships a single JSON file and does
 * NOT trigger a code build / deploy. See `src/lib/snapshot.ts`.
 *
 * What stays here:
 *   - Type re-exports for convenience
 *   - U1_ANNUAL_CAP — statutory, never changes
 *   - QUALIFYING_CRIMES — statutory taxonomy from INA § 101(a)(15)(U)(iii)
 *   - DATA_SOURCES — provenance list shown on /sources
 *   - totals(), latestPending() — pure helpers used by pages over the
 *     snapshot's annual arrays
 */
import type {
  AnnualStat,
  QualifyingCrime,
  DataSource,
} from './types';

export type { AnnualStat, QualifyingCrime, DataSource };

/**
 * Statutory annual cap on U-1 principal approvals (8 U.S.C. § 1184(p)(2)(A)).
 * Approvals above this count in a given FY roll over to the next FY via
 * the conditional approval / waitlist mechanism — they do not add to the cap.
 */
export const U1_ANNUAL_CAP = 10000;

/**
 * 28 statutory qualifying crimes per INA § 101(a)(15)(U)(iii).
 * Static taxonomy — does not move with USCIS quarterly publications.
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
 * Authoritative provenance list — shown on /sources.
 */
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

/** Sum of received / approved / denied across an annual series. */
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

/** End-of-year pending value of the most recent FY in a series. */
export function latestPending(stats: AnnualStat[]): { fiscalYear: number; pending: number } {
  const latest = [...stats].sort((a, b) => b.fiscalYear - a.fiscalYear)[0];
  return { fiscalYear: latest.fiscalYear, pending: latest.pendingEndOfYear };
}
