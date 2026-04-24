/**
 * U-visa litigation tracker.
 *
 * Two layers:
 *   1. LANDMARK_CASES — a hand-curated list of known-significant cases
 *      with docket metadata. These are public record.
 *   2. fetchRecentLitigation() — queries CourtListener's free REST API
 *      for recent opinions mentioning "U visa" or "I-918". No key needed.
 *
 * CourtListener is the Free Law Project's free public legal search.
 * Rate limit: ~5000 req/day unauthenticated.
 */

export interface LandmarkCase {
  id: string;
  title: string;
  citation?: string;
  court: string;
  year: number;
  type: 'class-action' | 'mandamus' | 'appeal' | 'policy';
  summary: string;
  outcome: string;
  url?: string;
}

export const LANDMARK_CASES: LandmarkCase[] = [
  {
    id: 'barrios-garcia',
    title: 'Barrios Garcia v. DHS',
    citation: '25 F.4th 430 (6th Cir. 2022)',
    court: '6th Circuit',
    year: 2022,
    type: 'class-action',
    summary:
      'Class action on behalf of U-visa petitioners challenging USCIS\'s failure to adjudicate their waiting-list (deferred-action) eligibility within a reasonable time. Held that the district court had jurisdiction to compel USCIS to adjudicate pre-waiting-list status decisions.',
    outcome:
      'Sixth Circuit affirmed district-court jurisdiction; forced USCIS to move on stalled petitions and influenced the 2021 Bona Fide Determination policy.',
    url: 'https://www.courtlistener.com/opinion/4971923/barrios-garcia-v-united-states-department-of-homeland-security/',
  },
  {
    id: 'patel-fong-bfd',
    title: 'Multiple mandamus actions — BFD delays',
    court: 'Various federal district courts',
    year: 2024,
    type: 'mandamus',
    summary:
      'A growing line of individual mandamus suits filed in federal district courts asking USCIS to act on pending U-visa petitions or Bona Fide Determination requests after multi-year delays. Most settle with USCIS issuing a decision.',
    outcome:
      'No binding circuit precedent; outcomes case-by-case. Typically prompts USCIS action within months. Represents a practical path around backlog-era inaction.',
    url: 'https://www.courtlistener.com/?q=%22U+visa%22+mandamus&type=o',
  },
  {
    id: 'vasquez-hernandez',
    title: 'Vasquez-Hernandez v. USCIS line of cases',
    court: 'Various',
    year: 2020,
    type: 'appeal',
    summary:
      'Line of decisions addressing whether a crime is "substantially similar" to felonious assault under 8 C.F.R. § 214.14(a)(9). Courts have reached varying outcomes depending on state statute at issue and evidence of weapon use.',
    outcome:
      'Split authority; informs adjudicator guidance and factored into the 2020 Trends Report\'s focus on felonious-assault misuse.',
  },
  {
    id: 'bfd-policy-2021',
    title: 'USCIS Policy Alert — Bona Fide Determination Process',
    citation: 'PM-602-0184',
    court: 'USCIS Policy Manual',
    year: 2021,
    type: 'policy',
    summary:
      'USCIS created the Bona Fide Determination (BFD) process, granting deferred action and work authorization to principal U-visa petitioners with bona fide petitions — responding in part to Barrios Garcia and a decade of backlog-driven litigation pressure.',
    outcome:
      'Implemented June 2021. BFD issuance itself has accumulated a multi-year queue as of 2025 per USCIS Ombudsman reporting.',
    url: 'https://www.uscis.gov/policy-manual/volume-3-part-c-chapter-5',
  },
];

export interface CourtListenerOpinion {
  caseName: string;
  court: string;
  dateFiled: string;
  snippet: string;
  absoluteUrl: string;
  citation?: string;
}

const CL_BASE = 'https://www.courtlistener.com/api/rest/v4/search/';

export async function fetchRecentLitigation(
  limit = 8,
): Promise<CourtListenerOpinion[]> {
  const params = new URLSearchParams({
    q: '"U visa" OR "U nonimmigrant" OR "I-918"',
    type: 'o', // opinions
    order_by: 'dateFiled desc',
  });
  try {
    const res = await fetch(`${CL_BASE}?${params.toString()}`, {
      next: { revalidate: 60 * 60 * 6 }, // 6 hour cache — court filings slow-moving
      headers: {
        Accept: 'application/json',
        'User-Agent': 'u-visa-tracker (+litigation-feed)',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      results?: {
        caseName?: string;
        court?: string;
        dateFiled?: string;
        snippet?: string;
        absolute_url?: string;
        citation?: string[];
      }[];
    };
    return (json.results ?? [])
      .slice(0, limit)
      .map((r) => ({
        caseName: r.caseName ?? 'Untitled',
        court: r.court ?? 'Unknown court',
        dateFiled: r.dateFiled ?? '',
        snippet: stripHighlight(r.snippet ?? ''),
        absoluteUrl: r.absolute_url
          ? `https://www.courtlistener.com${r.absolute_url}`
          : '',
        citation: (r.citation ?? [])[0],
      }))
      .filter((r) => r.absoluteUrl);
  } catch {
    return [];
  }
}

function stripHighlight(s: string): string {
  return s.replace(/<\/?mark>/g, '').slice(0, 400);
}

export const CASE_TYPE_LABEL: Record<LandmarkCase['type'], string> = {
  'class-action': 'Class action',
  mandamus: 'Mandamus',
  appeal: 'Appeal',
  policy: 'Policy',
};

export const CASE_TYPE_VARIANT: Record<
  LandmarkCase['type'],
  'default' | 'warning' | 'secondary' | 'success' | 'destructive'
> = {
  'class-action': 'destructive',
  mandamus: 'warning',
  appeal: 'default',
  policy: 'success',
};
