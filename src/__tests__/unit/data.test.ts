import {
  totals,
  latestPending,
  ANNUAL_PRINCIPAL,
  ANNUAL_DERIVATIVE,
  U1_ANNUAL_CAP,
  STATE_CERT_SHARES,
  CERTIFIED_CRIME_SHARES,
} from '@/lib/data';

describe('lib/data', () => {
  describe('totals()', () => {
    it('sums received / approved / denied across stats', () => {
      const t = totals([
        { fiscalYear: 2020, form: 'I-918', received: 10, approved: 5, denied: 1, pendingEndOfYear: 4 },
        { fiscalYear: 2021, form: 'I-918', received: 20, approved: 8, denied: 2, pendingEndOfYear: 14 },
      ]);
      expect(t).toEqual({ received: 30, approved: 13, denied: 3 });
    });

    it('returns zeros for empty input', () => {
      expect(totals([])).toEqual({ received: 0, approved: 0, denied: 0 });
    });

    it('does not include pendingEndOfYear in totals (it is a snapshot, not a flow)', () => {
      const sums = totals([
        { fiscalYear: 2020, form: 'I-918', received: 1, approved: 0, denied: 0, pendingEndOfYear: 999 },
      ]);
      expect(sums).not.toHaveProperty('pending');
      expect(Object.values(sums).every((n) => n < 999)).toBe(true);
    });
  });

  describe('latestPending()', () => {
    it('picks the highest fiscalYear regardless of input order', () => {
      const out = latestPending([
        { fiscalYear: 2010, form: 'I-918', received: 0, approved: 0, denied: 0, pendingEndOfYear: 100 },
        { fiscalYear: 2025, form: 'I-918', received: 0, approved: 0, denied: 0, pendingEndOfYear: 999 },
        { fiscalYear: 2020, form: 'I-918', received: 0, approved: 0, denied: 0, pendingEndOfYear: 500 },
      ]);
      expect(out).toEqual({ fiscalYear: 2025, pending: 999 });
    });
  });

  describe('ANNUAL_PRINCIPAL invariants', () => {
    it('contains a row for every fiscal year from 2009 onward without gaps', () => {
      const years = ANNUAL_PRINCIPAL.map((s) => s.fiscalYear).sort((a, b) => a - b);
      for (let i = 1; i < years.length; i++) {
        expect(years[i] - years[i - 1]).toBe(1);
      }
    });

    it('approvals never exceed the statutory cap by more than rounding (cap-aware adjudications)', () => {
      // USCIS occasionally adjudicates slightly under or near the cap due to
      // rollover. Per the USCIS quarterly XLSX, the FY-end approved count is
      // always within ~100 of 10,000 for full FYs. FY2025 is partial (Q1).
      const overCap = ANNUAL_PRINCIPAL.filter(
        (s) => s.fiscalYear < 2025 && s.approved > U1_ANNUAL_CAP + 200,
      );
      expect(overCap).toEqual([]);
    });

    it('every row has form === "I-918"', () => {
      for (const s of ANNUAL_PRINCIPAL) expect(s.form).toBe('I-918');
    });

    it('non-negative integers for all numeric fields', () => {
      for (const s of ANNUAL_PRINCIPAL) {
        for (const k of ['received', 'approved', 'denied', 'pendingEndOfYear'] as const) {
          expect(Number.isInteger(s[k])).toBe(true);
          expect(s[k]).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('pending balances reconcile (with admin-closure tolerance) — pre-FY2010 carries a separate opening balance', () => {
      // Real USCIS data drifts by hundreds-to-thousands per FY due to admin
      // closures, transfers, and post-adjudicative reopens (USCIS footnote
      // 5). FY2009 carries pre-FY2009 receipts not reflected here, so we
      // skip it.
      const sorted = [...ANNUAL_PRINCIPAL].sort(
        (a, b) => a.fiscalYear - b.fiscalYear,
      );
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const cur = sorted[i];
        if (cur.fiscalYear === 2010) continue; // see USCIS footnote 5
        const expected =
          prev.pendingEndOfYear + cur.received - cur.approved - cur.denied;
        const drift = Math.abs(cur.pendingEndOfYear - expected);
        expect(drift).toBeLessThan(5000);
      }
    });
  });

  describe('ANNUAL_DERIVATIVE invariants', () => {
    it('every row has form === "I-918A"', () => {
      for (const s of ANNUAL_DERIVATIVE) expect(s.form).toBe('I-918A');
    });

    it('derivative receipts roughly track principal receipts in shape (correlated growth)', () => {
      const principalByYear = new Map(
        ANNUAL_PRINCIPAL.map((s) => [s.fiscalYear, s.received]),
      );
      const derivByYear = new Map(
        ANNUAL_DERIVATIVE.map((s) => [s.fiscalYear, s.received]),
      );
      const overlap = [...principalByYear.keys()].filter((y) => derivByYear.has(y));
      expect(overlap.length).toBeGreaterThan(5);
      // Derivative pool generally tracks at 0.4×–1.5× principal receipts.
      for (const y of overlap) {
        const p = principalByYear.get(y)!;
        const d = derivByYear.get(y)!;
        if (p > 0) {
          const ratio = d / p;
          expect(ratio).toBeGreaterThan(0.2);
          expect(ratio).toBeLessThan(2.0);
        }
      }
    });
  });

  describe('STATE_CERT_SHARES', () => {
    it('listed top-state shares sum to under 100% (the rest is non-top states)', () => {
      const total = STATE_CERT_SHARES.reduce((a, s) => a + s.share, 0);
      expect(total).toBeGreaterThan(40);
      expect(total).toBeLessThanOrEqual(100);
    });

    it('top-crime shares within each state are 0–100 percentages', () => {
      for (const state of STATE_CERT_SHARES) {
        for (const c of state.topCrimes) {
          expect(c.share).toBeGreaterThanOrEqual(0);
          expect(c.share).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('CERTIFIED_CRIME_SHARES', () => {
    it('multi-check categories can sum >100% (USCIS notes ~31% multi-check forms)', () => {
      const total = CERTIFIED_CRIME_SHARES.reduce((a, c) => a + c.share, 0);
      expect(total).toBeGreaterThan(100);
    });
  });

  describe('U1_ANNUAL_CAP', () => {
    it('matches the statute (8 U.S.C. § 1184(p)(2)(A))', () => {
      expect(U1_ANNUAL_CAP).toBe(10000);
    });
  });
});
