/**
 * After the snapshot migration, the mutable data arrays moved out of
 * `src/lib/data.ts` and into JSON snapshots under `public/data/`. This
 * test loads the seed snapshot directly from disk and runs the same
 * invariants that used to import from `data.ts`.
 *
 * Static helpers + the statutory cap stay in `data.ts` and are imported
 * from there as before.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { totals, latestPending, U1_ANNUAL_CAP } from '@/lib/data';
import type { DataSnapshot } from '@/lib/snapshot';

const indexRaw = readFileSync(
  path.join(process.cwd(), 'public/data/index.json'),
  'utf8',
);
const index = JSON.parse(indexRaw) as { latest: string; snapshots: { id: string; filename: string }[] };
const latestEntry = index.snapshots.find((s) => s.id === index.latest)!;
const snapshotRaw = readFileSync(
  path.join(process.cwd(), 'public/data/snapshots', latestEntry.filename),
  'utf8',
);
const snap = JSON.parse(snapshotRaw) as DataSnapshot;

const ANNUAL_PRINCIPAL = snap.ANNUAL_PRINCIPAL;
const ANNUAL_DERIVATIVE = snap.ANNUAL_DERIVATIVE;
const STATE_CERT_SHARES = snap.STATE_CERT_SHARES;
const CERTIFIED_CRIME_SHARES = snap.CERTIFIED_CRIME_SHARES;

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

  describe('latest snapshot — ANNUAL_PRINCIPAL invariants', () => {
    it('contains a row for every fiscal year from 2009 onward without gaps', () => {
      const years = ANNUAL_PRINCIPAL.map((s) => s.fiscalYear).sort((a, b) => a - b);
      for (let i = 1; i < years.length; i++) {
        expect(years[i] - years[i - 1]).toBe(1);
      }
    });

    it('approvals never exceed the statutory cap by more than rounding (cap-aware adjudications)', () => {
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
        // USCIS posts admin closures, transfers, and post-adjudicative
        // reopens separately (USCIS footnote 5). Per-FY drift is
        // typically 100s–1000s; the FY2024 → FY2025 boundary shows
        // ~11k of admin-closure adjustment in the latest snapshot.
        expect(drift).toBeLessThan(15000);
      }
    });
  });

  describe('latest snapshot — ANNUAL_DERIVATIVE invariants', () => {
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

  describe('latest snapshot — STATE_CERT_SHARES', () => {
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

  describe('latest snapshot — CERTIFIED_CRIME_SHARES', () => {
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
