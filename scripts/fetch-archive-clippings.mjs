#!/usr/bin/env node
/**
 * Fetches Internet Archive (archive.org) items matching each U-visa history
 * event's keywords, writes the results to
 * `public/narration/archive-clippings.json`. The Remotion video reads that
 * file to render attributed archive overlays in each scene.
 *
 * Each entry is just metadata — title, identifier, thumbnail URL on IA,
 * year, IA item URL. No copyrighted scans are cached; we just point to the
 * archive-hosted preview image and link to the item page.
 *
 * Run:  npm run archive
 */
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'public/narration/archive-clippings.json');

mkdirSync(resolve(ROOT, 'public/narration'), { recursive: true });

const historySrc = readFileSync(
  resolve(ROOT, 'src/lib/u-visa-history.ts'),
  'utf8',
);

// Per-event archive.org search queries — curated so we get relevant items.
// IA's advancedsearch returns JSON with identifiers we can turn into URLs
// and thumbnails via the services/img endpoint.
const QUERIES = {
  1994: '"Violence Against Women Act" 1994',
  1999: '"trafficking" "immigrant" hearings',
  2000: '"Victims of Trafficking and Violence Protection Act"',
  2002: '"T visa" regulations 2002',
  2005: '"VAWA" reauthorization 2005',
  2007: '"U visa" "final rule" 2007',
  2008: '"U visa" 2008 crime victims',
  2010: '"U visa" 10000 cap',
  2013: '"VAWA" reauthorization 2013',
  2014: '"U visa" waitlist backlog',
  2016: '"U visa" backlog 2016',
  2020: '"U visa" pending 2020',
  2021: '"Bona Fide Determination" "U visa"',
  2022: '"Barrios Garcia" Mayorkas',
  2024: '"U visa" backlog',
  2025: '"U visa" fraud integrity',
};

async function iaSearch(query) {
  const url =
    'https://archive.org/advancedsearch.php?' +
    new URLSearchParams({
      q: `${query} AND mediatype:(texts OR audio OR movies)`,
      'fl[]': 'identifier',
      output: 'json',
      rows: '5',
      sort: 'date desc',
    }).toString() +
    '&fl[]=title&fl[]=date&fl[]=mediatype&fl[]=collection';
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'u-visa-tracker-history-fetcher/1.0' },
    });
    if (!res.ok) {
      console.warn(`  IA search ${res.status} for "${query}"`);
      return [];
    }
    const json = await res.json();
    const docs = json?.response?.docs ?? [];
    return docs
      .filter((d) => d.identifier)
      .map((d) => ({
        identifier: d.identifier,
        title: Array.isArray(d.title) ? d.title[0] : d.title || d.identifier,
        date: Array.isArray(d.date) ? d.date[0] : d.date || null,
        mediatype: d.mediatype || 'texts',
        itemUrl: `https://archive.org/details/${d.identifier}`,
        thumbnailUrl: `https://archive.org/services/img/${d.identifier}`,
      }));
  } catch (err) {
    console.warn(`  IA fetch failed for "${query}":`, err.message);
    return [];
  }
}

function extractYearsFromHistory(src) {
  const start = src.indexOf('export const HISTORY');
  if (start < 0) throw new Error('Could not find HISTORY export');
  const after = src.slice(start);
  const years = [];
  const yearRe = /year:\s*(\d{4})/g;
  let m;
  while ((m = yearRe.exec(after)) !== null) {
    years.push(Number(m[1]));
  }
  return years;
}

async function main() {
  const years = extractYearsFromHistory(historySrc);
  console.log(`Fetching archive items for ${years.length} years…`);

  const clippings = {};
  for (const year of years) {
    const q = QUERIES[year];
    if (!q) {
      clippings[year] = [];
      continue;
    }
    console.log(`→ ${year}: "${q}"`);
    const items = await iaSearch(q);
    clippings[year] = items;
    console.log(`   ${items.length} items`);
    // be polite to the API
    await new Promise((r) => setTimeout(r, 350));
  }

  writeFileSync(OUT, JSON.stringify(clippings, null, 2));
  const total = Object.values(clippings).reduce((n, xs) => n + xs.length, 0);
  console.log(`\nWrote ${OUT}`);
  console.log(`Total archive items: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
