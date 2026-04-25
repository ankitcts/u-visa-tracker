import { HISTORY, INTRO_NARRATION, OUTRO_NARRATION } from '@/lib/u-visa-history';

const VALID_KINDS = new Set([
  'law',
  'rule',
  'court',
  'policy',
  'milestone',
  'coverage',
]);

describe('lib/u-visa-history', () => {
  it('every event has the required fields', () => {
    for (const e of HISTORY) {
      expect(typeof e.year).toBe('number');
      expect(Number.isInteger(e.year)).toBe(true);
      expect(typeof e.title).toBe('string');
      expect(e.title.length).toBeGreaterThan(0);
      expect(typeof e.body).toBe('string');
      expect(e.body.length).toBeGreaterThan(0);
      expect(VALID_KINDS.has(e.kind)).toBe(true);
    }
  });

  it('events are roughly chronological (years are monotonically non-decreasing)', () => {
    const years = HISTORY.map((e) => e.year);
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeGreaterThanOrEqual(years[i - 1]);
    }
  });

  it('all events fall within the program era (1990 ≤ year ≤ this year + 1)', () => {
    const upper = new Date().getFullYear() + 1;
    for (const e of HISTORY) {
      expect(e.year).toBeGreaterThanOrEqual(1990);
      expect(e.year).toBeLessThanOrEqual(upper);
    }
  });

  it('citation URLs (when present) are absolute http(s) links', () => {
    for (const e of HISTORY) {
      for (const c of e.citations ?? []) {
        if (c.url) expect(c.url).toMatch(/^https?:\/\//);
      }
    }
  });

  it('article URLs are absolute http(s) links', () => {
    for (const e of HISTORY) {
      for (const a of e.articles ?? []) {
        expect(a.url).toMatch(/^https?:\/\//);
      }
    }
  });

  it('image URLs (when present) are absolute http(s) links', () => {
    for (const e of HISTORY) {
      if (e.image) expect(e.image.url).toMatch(/^https?:\/\//);
      for (const x of e.extraImages ?? []) {
        expect(x.url).toMatch(/^https?:\/\//);
      }
    }
  });

  it('image credits are non-empty strings when an image is present', () => {
    for (const e of HISTORY) {
      if (e.image) {
        expect(e.image.caption.trim()).not.toBe('');
        expect(e.image.credit.trim()).not.toBe('');
        expect(e.image.license.trim()).not.toBe('');
      }
    }
  });

  it('intro and outro narration are present and non-trivial', () => {
    expect(INTRO_NARRATION.length).toBeGreaterThan(40);
    expect(OUTRO_NARRATION.length).toBeGreaterThan(40);
  });

  it('VAWA 1994 and VTVPA 2000 are recorded', () => {
    expect(
      HISTORY.find((e) => e.year === 1994 && /VAWA|Violence Against Women/i.test(e.title)),
    ).toBeDefined();
    expect(
      HISTORY.find((e) => e.year === 2000 && /Trafficking|VTVPA/i.test(e.title)),
    ).toBeDefined();
  });
});
