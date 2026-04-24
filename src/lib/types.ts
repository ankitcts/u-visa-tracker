export type CaseStatus = 'received' | 'approved' | 'denied' | 'pending';

export type FormType = 'I-918' | 'I-918A';

export interface QuarterlyStat {
  fiscalYear: number;
  quarter: 1 | 2 | 3 | 4;
  form: FormType;
  received: number;
  approved: number;
  denied: number;
  pending: number;
}

export interface AnnualStat {
  fiscalYear: number;
  form: FormType;
  received: number;
  approved: number;
  denied: number;
  pendingEndOfYear: number;
}

export interface QualifyingCrime {
  category: string;
  statute: string;
  description: string;
}

export interface DataSource {
  id: string;
  title: string;
  agency: string;
  url: string;
  format: string;
  cadence: string;
}

export interface StateCertShare {
  state: string;
  abbr: string;
  share: number;
  topCrimes: { crime: string; share: number }[];
}

export interface CategoryShare {
  label: string;
  share: number;
}

export interface YearlyCrimeShare {
  fiscalYear: number;
  feloniousAssault: number;
  domesticViolence: number;
  sexualAssault: number;
}
