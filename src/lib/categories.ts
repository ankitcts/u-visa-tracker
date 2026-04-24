/**
 * FEATURED HERO VIDEO on the landing page.
 * Set FEATURED_VIDEO.youtubeId to a verified YouTube video ID to swap the
 * hero out. While empty, the hero shows a configurable placeholder.
 *
 * Examples:
 *   'dQw4w9WgXcQ'  — use a bare video ID, not the full URL
 */
export const FEATURED_VIDEO = {
  youtubeId: 'g3Wlcrx8Hlg', // "U Visa, Form I-918 (English)"
  title: 'What is a U Visa?',
  subtitle:
    'An introduction to the U nonimmigrant classification — who qualifies, what Form I-918 does, and why adjudication takes 20+ years.',
  searchQuery: 'USCIS U visa explained Form I-918 overview',
  // Chapter timestamps are approximate — update when you confirm against
  // the actual video. If chapters is empty the hero falls back to a plain embed.
  chapters: [
    { id: 'intro', title: 'Introduction', seconds: 0 },
    { id: 'eligibility', title: 'Who qualifies', seconds: 45 },
    { id: 'form', title: 'Form I-918 overview', seconds: 120 },
    { id: 'cert', title: 'Law enforcement certification (I-918B)', seconds: 210 },
    { id: 'process', title: 'What happens after filing', seconds: 300 },
  ],
};

export interface UCategory {
  code: 'U-1' | 'U-2' | 'U-3' | 'U-4' | 'U-5';
  title: string;
  eligibility: string;
  details: string;
  capAware: 'counts against cap' | 'does not count against cap';
  /** Optional YouTube video ID. When absent, the UI renders a placeholder. */
  youtubeId?: string;
}

/**
 * Under 8 U.S.C. § 1101(a)(15)(U), the U nonimmigrant classification
 * covers the principal petitioner and specific qualifying family members.
 * Only U-1 approvals count against the 10,000 annual statutory cap.
 */
export const U_CATEGORIES: UCategory[] = [
  {
    code: 'U-1',
    title: 'Principal petitioner',
    eligibility: 'Direct victim of a qualifying criminal activity (QCA).',
    details:
      'The U-1 petitioner must have suffered substantial physical or mental abuse, possess credible information about the QCA, and have been, be being, or be likely to be helpful to law enforcement. The petitioner files Form I-918 with a Supplement B certification from a qualifying agency.',
    capAware: 'counts against cap',
    youtubeId: 'XaeIlanjb0Q', // Form I-918 Explained, Petition for U Visa Nonimmigrant Status
  },
  {
    code: 'U-2',
    title: 'Spouse of principal',
    eligibility: 'Spouse of a U-1 principal petitioner at the time of filing.',
    details:
      'The U-2 derivative is granted alongside an approved U-1. If the principal is under 21, the spouse still qualifies, but different derivative categories apply for parents and siblings. The relationship must be maintained through adjudication.',
    capAware: 'does not count against cap',
    youtubeId: 'SZXyjEUINc8', // U Visa Derivatives: Which Family Members Are Eligible
  },
  {
    code: 'U-3',
    title: 'Child of principal',
    eligibility: 'Unmarried child under 21 of a U-1 principal petitioner.',
    details:
      'The U-3 category covers biological, adopted, and step-children. "Age-out" protections exist for children who turn 21 after the Form I-918 is filed. Children born to a U-1 principal outside the US may also be eligible for derivative status in certain circumstances.',
    capAware: 'does not count against cap',
    youtubeId: '5a3t9t8nBp4', // How to Include Derivatives (spouse and children)
  },
  {
    code: 'U-4',
    title: 'Parent of principal (principal under 21)',
    eligibility:
      'Parent of a U-1 principal petitioner who is under 21 at the time of filing.',
    details:
      'Available only when the principal petitioner is under 21. Both biological and adoptive parents may qualify. Step-parents who are in a valid marriage with the natural parent when the step-child was under 18 may also be eligible.',
    capAware: 'does not count against cap',
    youtubeId: 'HdLz-VUPJW4', // Everything about U Visa (general overview covering family)
  },
  {
    code: 'U-5',
    title: 'Unmarried sibling under 18 (principal under 21)',
    eligibility:
      'Unmarried sibling under 18 of a U-1 principal petitioner who is under 21 at the time of filing.',
    details:
      'The U-5 category is the narrowest derivative. Both the principal must be under 21 and the sibling must be under 18 at the time Form I-918 is filed. After filing, age-out protections preserve eligibility even if either crosses the age threshold during adjudication.',
    capAware: 'does not count against cap',
    youtubeId: 'yFtlrOpQMBw', // Unlock Your U Visa Journey
  },
];
