import {
  LANDMARK_CASES,
  CASE_TYPE_LABEL,
  CASE_TYPE_VARIANT,
} from '@/lib/litigation';

describe('lib/litigation', () => {
  it('every landmark case has the required fields', () => {
    for (const c of LANDMARK_CASES) {
      expect(c.id).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(c.summary).toBeTruthy();
      expect(c.outcome).toBeTruthy();
      expect(typeof c.year).toBe('number');
      expect(c.court).toBeTruthy();
      expect(c.type).toBeTruthy();
    }
  });

  it('landmark URLs (when present) are http(s)', () => {
    for (const c of LANDMARK_CASES) {
      if (c.url) expect(c.url).toMatch(/^https?:\/\//);
    }
  });

  it('every case type has a label and a variant', () => {
    for (const c of LANDMARK_CASES) {
      expect(CASE_TYPE_LABEL[c.type]).toBeTruthy();
      expect(CASE_TYPE_VARIANT[c.type]).toBeTruthy();
    }
  });

  it('case ids are unique', () => {
    const ids = LANDMARK_CASES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('years are within the U-visa era (2000–present + 1)', () => {
    const upper = new Date().getFullYear() + 1;
    for (const c of LANDMARK_CASES) {
      expect(c.year).toBeGreaterThanOrEqual(2000);
      expect(c.year).toBeLessThanOrEqual(upper);
    }
  });
});
