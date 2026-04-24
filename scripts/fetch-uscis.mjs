#!/usr/bin/env node
/**
 * Fetches the USCIS I-918 quarterly statistics page and prints links to
 * every xlsx/csv found. Downloads are saved to ./data/raw/ so they can
 * be hand-reviewed before updating src/lib/data.ts.
 *
 * Usage:
 *   node scripts/fetch-uscis.mjs            # list + download latest
 *   node scripts/fetch-uscis.mjs --list     # list only, no downloads
 *
 * We do NOT auto-update src/lib/data.ts — the shapes USCIS uses differ
 * slightly across years. Inspect the xlsx, then update the TS arrays by
 * hand to preserve provenance and catch schema drift.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const USCIS_DATA_PAGE =
  'https://www.uscis.gov/tools/reports-and-studies/immigration-and-citizenship-data';

const args = new Set(process.argv.slice(2));
const LIST_ONLY = args.has('--list');

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function extractLinks(html) {
  const re = /href="([^"]+\.(?:xlsx|csv|pdf))"/gi;
  const out = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    let link = m[1];
    if (link.startsWith('/')) link = 'https://www.uscis.gov' + link;
    if (/i[-_ ]?918|u.?visa|u.?nonimmigrant/i.test(link)) out.add(link);
  }
  return [...out];
}

async function main() {
  console.log(`Fetching ${USCIS_DATA_PAGE} ...`);
  const html = await fetchText(USCIS_DATA_PAGE);
  const links = extractLinks(html);

  if (links.length === 0) {
    console.error(
      'No I-918 / U-visa data links found on the page. USCIS may have restructured the page — inspect by hand.',
    );
    process.exit(1);
  }

  console.log(`Found ${links.length} candidate link(s):`);
  links.forEach((l) => console.log('  ' + l));

  if (LIST_ONLY) return;

  const rawDir = path.resolve('data/raw');
  if (!existsSync(rawDir)) await mkdir(rawDir, { recursive: true });

  for (const link of links) {
    const name = path.basename(new URL(link).pathname);
    const dest = path.join(rawDir, name);
    if (existsSync(dest)) {
      console.log(`skip (exists): ${name}`);
      continue;
    }
    console.log(`download: ${name}`);
    const buf = await fetchBuffer(link);
    await writeFile(dest, buf);
  }

  console.log(`\nDone. Review files in ${rawDir} and update src/lib/data.ts accordingly.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
