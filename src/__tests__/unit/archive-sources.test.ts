import {
  ARCHIVE_SOURCES,
  ARCHIVE_QUERIES,
  ACCESS_LABEL,
  ACCESS_COLOR,
} from '@/lib/archive-sources';

describe('lib/archive-sources', () => {
  describe('ARCHIVE_SOURCES catalog', () => {
    it('every source has a unique id', () => {
      const ids = ARCHIVE_SOURCES.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every source homeUrl is a valid http(s) URL', () => {
      for (const s of ARCHIVE_SOURCES) {
        expect(() => new URL(s.homeUrl)).not.toThrow();
        expect(s.homeUrl).toMatch(/^https?:\/\//);
      }
    });

    it('searchUrl returns a parseable URL when given a query', () => {
      for (const s of ARCHIVE_SOURCES) {
        const url = s.searchUrl('U visa');
        expect(() => new URL(url)).not.toThrow();
      }
    });

    it('searchUrl percent-encodes the query (no raw spaces or quotes)', () => {
      for (const s of ARCHIVE_SOURCES) {
        const url = s.searchUrl('"U visa" fraud OR scheme');
        // No literal raw quote/space in the query string portion.
        const qs = url.includes('?') ? url.split('?')[1] : '';
        expect(qs.includes('"')).toBe(false);
        expect(qs.includes(' ')).toBe(false);
      }
    });

    it('access tier values are recognised by ACCESS_LABEL and ACCESS_COLOR', () => {
      for (const s of ARCHIVE_SOURCES) {
        expect(ACCESS_LABEL).toHaveProperty(s.access);
        expect(ACCESS_COLOR).toHaveProperty(s.access);
      }
    });

    it('newspapers.com search URL accepts a year range', () => {
      const src = ARCHIVE_SOURCES.find((s) => s.id === 'newspapers-com');
      expect(src).toBeDefined();
      const url = src!.searchUrl('U visa', 2000, 2010);
      expect(url).toContain('dr_year=2000-2010');
    });
  });

  describe('ARCHIVE_QUERIES', () => {
    it('every query has a non-empty query string', () => {
      for (const q of ARCHIVE_QUERIES) {
        expect(typeof q.query).toBe('string');
        expect(q.query.length).toBeGreaterThan(0);
      }
    });

    it('yearFrom <= yearTo (when both present)', () => {
      for (const q of ARCHIVE_QUERIES) {
        if (q.yearFrom && q.yearTo) {
          expect(q.yearFrom).toBeLessThanOrEqual(q.yearTo);
        }
      }
    });
  });
});
