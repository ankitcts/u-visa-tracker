import {
  computeFraudLean,
  fraudLeanLabel,
  NATIONAL_FA_LEAN,
  NATIONAL_FA_SHARE,
  NATIONAL_DV_SHARE,
} from '@/lib/integrity';
import type { StateCertShare } from '@/lib/types';

const make = (fa: number | null, dv: number | null): StateCertShare => ({
  state: 'Test',
  abbr: 'TS',
  share: 1,
  topCrimes: [
    ...(fa !== null ? [{ crime: 'Felonious Assault', share: fa }] : []),
    ...(dv !== null ? [{ crime: 'Domestic Violence', share: dv }] : []),
  ],
});

describe('lib/integrity', () => {
  describe('computeFraudLean()', () => {
    it('returns FA / (FA + DV) when both present', () => {
      expect(computeFraudLean(make(60, 40))).toBeCloseTo(0.6, 5);
      expect(computeFraudLean(make(30, 30))).toBeCloseTo(0.5, 5);
    });

    it('returns null when either crime is missing', () => {
      expect(computeFraudLean(make(60, null))).toBeNull();
      expect(computeFraudLean(make(null, 30))).toBeNull();
    });

    it('returns null when denominator is 0', () => {
      expect(computeFraudLean(make(0, 0))).toBeNull();
    });
  });

  describe('fraudLeanLabel()', () => {
    it.each([
      [null, 'N/A'],
      [0.65, 'High FA lean'],
      [0.55, 'Elevated FA lean'],
      [0.45, 'Near national average'],
      [0.2, 'Domestic-violence-heavy'],
    ])('lean %p → %p', (lean, expected) => {
      expect(fraudLeanLabel(lean as number | null)).toBe(expected);
    });
  });

  describe('NATIONAL_FA_LEAN', () => {
    it('is consistent with NATIONAL_FA_SHARE / NATIONAL_DV_SHARE', () => {
      expect(NATIONAL_FA_LEAN).toBeCloseTo(
        NATIONAL_FA_SHARE / (NATIONAL_FA_SHARE + NATIONAL_DV_SHARE),
        6,
      );
    });

    it('the constants reflect the published USCIS Trends Report figures', () => {
      // 2020 USCIS Trends Report: FA 46%, DV 41% of nationwide certifications.
      expect(NATIONAL_FA_SHARE).toBe(46);
      expect(NATIONAL_DV_SHARE).toBe(41);
    });
  });
});
