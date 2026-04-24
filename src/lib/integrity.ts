import type { StateCertShare } from './types';

/**
 * FRAUD-ANGLE ANALYSIS — derived from USCIS Trends Report data.
 *
 * USCIS identified rising "likely-ineligible" filings specifically within
 * the **felonious-assault** qualifying-crime category (9% → 21% of that
 * category, FY2012–FY2018). States whose certifications skew toward
 * felonious assault (vs domestic violence) show a higher concentration of
 * the category USCIS flagged.
 *
 * Fraud lean =  FA_share / (FA_share + DV_share)
 *   Higher values ⇒ larger share of state's certifications sit in the
 *   crime category USCIS describes as having rising integrity concerns.
 *
 * This is a derived metric, not a USCIS conclusion. Interpret directionally.
 */
export function computeFraudLean(state: StateCertShare): number | null {
  const fa = state.topCrimes.find((c) => c.crime === 'Felonious Assault')?.share;
  const dv = state.topCrimes.find((c) => c.crime === 'Domestic Violence')?.share;
  if (fa === undefined || dv === undefined) return null;
  const denom = fa + dv;
  if (denom === 0) return null;
  return fa / denom;
}

export function fraudLeanLabel(lean: number | null): string {
  if (lean === null) return 'N/A';
  if (lean >= 0.6) return 'High FA lean';
  if (lean >= 0.5) return 'Elevated FA lean';
  if (lean >= 0.4) return 'Near national average';
  return 'Domestic-violence-heavy';
}

/** National average FA share across all states (FY12–18). */
export const NATIONAL_FA_SHARE = 46;
export const NATIONAL_DV_SHARE = 41;
export const NATIONAL_FA_LEAN =
  NATIONAL_FA_SHARE / (NATIONAL_FA_SHARE + NATIONAL_DV_SHARE);

/**
 * Integrity & concern signals from USCIS research, verbatim.
 *
 * Source: USCIS, "Trends in U Visa Law Enforcement Certifications,
 * Qualifying Crimes, and Evidence of Helpfulness" (July 2020, FY2012–FY2018).
 *
 * All figures are USCIS's own published aggregates. Nothing here accuses
 * any petitioner of fraud. The report's own framing is "integrity concerns"
 * and "likely ineligible filings" — we preserve that language.
 */

export interface IntegritySignal {
  id: string;
  headline: string;
  figure: string;
  explanation: string;
  severity: 'info' | 'moderate' | 'high';
  source: string;
}

export const INTEGRITY_SIGNALS: IntegritySignal[] = [
  {
    id: 'felonious-ineligible',
    headline: 'Rising share of likely ineligible "felonious assault" filings',
    figure: '9% → 21%',
    explanation:
      'Within the felonious assault category (46% of all certifications), the sub-category of crimes USCIS judged "likely not to qualify" (burglary, car-jacking, grand larceny, hit and run, robbery) rose from ~9% to ~21% between FY2012 and FY2018.',
    severity: 'high',
    source: 'Trends Report §Felonious Assault',
  },
  {
    id: 'missing-status',
    headline: 'Rising "Unknown / missing" case status on certifications',
    figure: '8% → 18%',
    explanation:
      'The proportion of certifications where the certifying official checked "Other" and left case status unknown, or left the field blank, more than doubled across the FY2012–FY2018 window — from nearly 8% in FY2012 to 18% in FY2018.',
    severity: 'moderate',
    source: 'Trends Report §Status of Investigation',
  },
  {
    id: 'inactive-cases',
    headline: 'Majority of certified cases are inactive',
    figure: '64%',
    explanation:
      'After manual review, USCIS classified 64% of sampled cases as "Inactive" and only 10% as "Active" at the time of certification. Combined with the 66% self-reported "Completed" status, this suggests most U-visa petitions rely on past helpfulness rather than ongoing cooperation.',
    severity: 'info',
    source: 'Trends Report §Status of Investigation',
  },
  {
    id: 'conviction-rate',
    headline: 'Low conviction rate relative to filings',
    figure: '27%',
    explanation:
      'Convictions occurred in only 27% of certified petitions. Arrests happened in 59%, indictments or prosecutions in 41%. The gap between arrest and conviction reflects standard criminal-justice attrition; not all qualifying criminal activity requires conviction.',
    severity: 'info',
    source: 'Trends Report §Arrests, Convictions',
  },
  {
    id: 'long-lag',
    headline: '15% of petitions filed 10+ years after the crime',
    figure: '15%',
    explanation:
      'Nearly 15% of principal petitions were received more than a decade after the qualifying crime. USCIS flags this as a factor that can make corroboration difficult and warrants additional scrutiny.',
    severity: 'moderate',
    source: 'Trends Report §Time from QCA to Receipt',
  },
  {
    id: 'form-completeness',
    headline: 'Certifications with minimal or altered information',
    figure: 'Qualitative',
    explanation:
      'USCIS noted instances where certifying officials did not appear to have completed or reviewed Form I-918B before signing, cases where the form did not correspond to supporting documents (e.g. arrest reports), and evidence of post-signing alterations before submission.',
    severity: 'high',
    source: 'Trends Report §Fraud and Benefit Integrity Concerns',
  },
];

/**
 * CASE OUTCOME FUNNEL — progression from report → conviction.
 * Source: USCIS Trends Report §Arrests, Convictions. Percentages are
 * of all principal petitions, not mutually exclusive.
 */
export const CASE_OUTCOME_FUNNEL = [
  { label: 'Petition filed with USCIS', share: 100, note: 'All sampled petitions' },
  { label: 'Law enforcement made arrest', share: 59, note: 'Perpetrator apprehended' },
  { label: 'Indictment or prosecution', share: 41, note: 'Charges brought' },
  { label: 'Protection order issued', share: 30, note: 'Civil remedy for victim' },
  { label: 'Conviction (incl. plea)', share: 27, note: 'Final criminal outcome' },
  { label: 'Perpetrator deported', share: 6.5, note: 'Removal subsequent to the crime' },
];

/**
 * HELPFULNESS EVIDENCE — how U-visa principals showed helpfulness.
 * Source: USCIS Trends Report §Demonstrated Helpfulness of the Victim.
 * Qualitative — the report does not publish precise percentages for
 * each sub-type beyond the aggregates below.
 */
export const HELPFULNESS_EVIDENCE = [
  {
    label: 'Multi-mode helpfulness',
    share: 79,
    description: 'Reported the crime AND provided additional evidence (physical, testimony, or identification).',
  },
  {
    label: 'Reported the crime only',
    share: 10,
    description:
      'Helpfulness consisted solely of reporting to law enforcement. This category grew across FY2012–FY2018 while multi-mode helpfulness declined.',
  },
  {
    label: 'Other / unclear',
    share: 11,
    description:
      'Mixed or ambiguous signals in the file review — includes cases where cooperation records were incomplete.',
  },
] as const;

export const HELPFULNESS_TYPES = [
  {
    name: 'Report to law enforcement',
    description:
      'The baseline form of helpfulness — the victim contacted police, prosecutors, or another certifying agency.',
  },
  {
    name: 'Identification of the perpetrator',
    description:
      'The victim affirmatively identified the suspect. In 12% of petitions law enforcement could not locate the perpetrator after identification.',
  },
  {
    name: 'Physical evidence',
    description:
      'Examples include DNA, fingerprint samples, photographs of injuries, and sexual-assault evidence kits.',
  },
  {
    name: 'Court testimony',
    description:
      'The victim testified at preliminary hearings, at trial, or in sentencing proceedings.',
  },
  {
    name: 'Ongoing cooperation',
    description:
      'Continued availability and responsiveness to investigators or prosecutors after the initial report.',
  },
];

export interface CaseExample {
  id: string;
  crimeType: string;
  summary: string;
  ineligibilityConcern: string;
  legalAnalysis?: string;
  statutoryReference?: string;
}

/**
 * Verbatim case examples from the USCIS Trends Report illustrating
 * filings the agency considered borderline or unlikely to qualify.
 */
export const CASE_EXAMPLES: CaseExample[] = [
  {
    id: 'shooting-rooftop',
    crimeType: 'Shooting (no injury)',
    summary:
      'After hearing gunfire from the roof of a nearby apartment building, the principal petitioner called the police to report the incident. No injuries were reported.',
    ineligibilityConcern:
      'Merely reporting a crime occurring nearby, without being a direct victim of felonious assault, is unlikely to qualify.',
    legalAnalysis:
      'The U-visa statute requires the petitioner to be a "victim" of a qualifying crime. 8 C.F.R. § 214.14(a)(14) defines "victim" narrowly as one who has "suffered direct and proximate harm." Reporting gunfire from a distance — without being a target, hit, or otherwise directly imperiled — typically fails the direct-harm element.',
    statutoryReference: '8 U.S.C. § 1101(a)(15)(U)(i); 8 C.F.R. § 214.14(a)(14)',
  },
  {
    id: 'shooting-drive-by',
    crimeType: 'Shooting (drive-by)',
    summary:
      'After a drive-by shooting at a nearby house, the petitioner contacted law enforcement authorities to report the incident.',
    ineligibilityConcern:
      'Witness or bystander status without direct victimization typically does not meet the "direct victim" threshold.',
    legalAnalysis:
      'Indirect or "bystander victim" status is available only for certain qualifying crimes (murder, manslaughter) where the indirect victim has suffered cognizable harm (e.g. the death of a close family member). A drive-by shooting at "a nearby house" without a death of a qualifying family member does not open that pathway.',
    statutoryReference: '8 C.F.R. § 214.14(a)(14)(ii)',
  },
  {
    id: 'robbery-phone',
    crimeType: 'Robbery (phone theft)',
    summary:
      'A married couple returning from a concert stepped out of their car during an argument; one participant followed the husband, yelled, and stole his wife\'s cell phone. The couple filed a police report, cooperated, and received an I-918B from local police. The wife filed as the principal with her husband as a derivative, submitting a therapist report noting anxiety from the robbery.',
    ineligibilityConcern:
      'Simple robbery without weapons or substantial injury is rarely considered "substantially similar to felonious assault."',
    legalAnalysis:
      'The qualifying-crime list in 8 U.S.C. § 1101(a)(15)(U)(iii) does not name "robbery." To qualify, a robbery would have to be "substantially similar" to felonious assault in nature and elements — typically requiring an assault on the person with a weapon or serious injury. A push-and-grab phone theft generally lacks those elements.',
    statutoryReference: '8 U.S.C. § 1101(a)(15)(U)(iii); 8 C.F.R. § 214.14(a)(9)',
  },
  {
    id: 'assault-by-auto',
    crimeType: 'Assault by auto',
    summary:
      'A man being driven home by a drunk driver was injured (dislocated hip) in a crash. He answered law enforcement\'s questions and received a signed Form I-918B.',
    ineligibilityConcern:
      'DUI-related injuries typically fall under vehicular manslaughter/assault statutes that may not meet the "felonious assault" statutory definition.',
    legalAnalysis:
      'A passenger injured in a drunk-driver crash may be a crime victim, but the qualifying-crime category turns on whether the state statute charged matches "felonious assault" or a substantially similar category. Many DUI-injury statutes are strict-liability or negligence-based and lack the specific-intent element common to "felonious assault" analogues.',
    statutoryReference: '8 U.S.C. § 1101(a)(15)(U)(iii) (felonious assault)',
  },
];
