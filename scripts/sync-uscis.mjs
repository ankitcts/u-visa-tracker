#!/usr/bin/env node
/**
 * Nightly USCIS data sync — fetch the canonical I-918 quarterly XLSX,
 * compare its SHA against the SHA recorded in the latest snapshot at
 * `public/data/index.json` → `public/data/snapshots/<id>.json`.
 *
 *   - SHA matches  → no change. Exit 0 with `changed=false` to GH_OUTPUT.
 *   - SHA differs  → parse the XLSX, regenerate the ANNUAL_PRINCIPAL +
 *                    ANNUAL_DERIVATIVE arrays, write a NEW snapshot JSON
 *                    file at `public/data/snapshots/<iso>.json` with all
 *                    the fields a snapshot needs, prepend an entry to
 *                    `public/data/index.json`, and exit 0 with
 *                    `changed=true` so the workflow opens a PR.
 *   - Parse fails  → exit non-zero and let the workflow fail loudly.
 *
 * Crucially: this script NEVER modifies `src/lib/data.ts`. The site
 * code is fully decoupled from data updates — a USCIS refresh ships a
 * single JSON file (plus an index entry) and does NOT trigger a code
 * build / deploy.
 *
 * Old snapshots are immutable and stay in the repo forever. The
 * `public/data/index.json` array is newest-first.
 *
 * Usage:
 *   node scripts/sync-uscis.mjs                # full run
 *   node scripts/sync-uscis.mjs --dry-run      # don't write the new files
 *   node scripts/sync-uscis.mjs --file <path>  # use local xlsx (testing)
 *
 * Run by .github/workflows/sync-uscis.yml on a daily schedule.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as XLSX from 'xlsx';

const USCIS_DATA_PAGE =
  'https://www.uscis.gov/tools/reports-and-studies/immigration-and-citizenship-data';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const dataDir = path.join(repoRoot, 'public', 'data');
const indexPath = path.join(dataDir, 'index.json');
const snapshotsDir = path.join(dataDir, 'snapshots');

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const fileArgIdx = process.argv.indexOf('--file');
const LOCAL_FILE = fileArgIdx >= 0 ? process.argv[fileArgIdx + 1] : null;

// ──────────────────────────────────────────────────────────────────────
// Find the canonical I-918 XLSX URL on the USCIS data page.
// ──────────────────────────────────────────────────────────────────────
async function findLatestUscisXlsx() {
  const res = await fetch(USCIS_DATA_PAGE);
  if (!res.ok) throw new Error(`USCIS page HTTP ${res.status}`);
  const html = await res.text();

  const re = /href="([^"]+i918[^"]+\.xlsx)"/gi;
  const found = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    let link = m[1];
    if (link.startsWith('/')) link = 'https://www.uscis.gov' + link;
    found.add(link);
  }
  if (found.size === 0)
    throw new Error('No I-918 xlsx links found on USCIS data page (page layout may have changed).');

  const ranked = [...found]
    .map((url) => {
      const fyMatch = url.match(/fy(\d{4})_q([1-4])/i);
      const fy = fyMatch ? Number(fyMatch[1]) : 0;
      const q = fyMatch ? Number(fyMatch[2]) : 0;
      return { url, key: fy * 10 + q };
    })
    .sort((a, b) => b.key - a.key);

  return ranked[0].url;
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

// ──────────────────────────────────────────────────────────────────────
// Read the current snapshot from public/data/.
// ──────────────────────────────────────────────────────────────────────
async function readCurrentSnapshot() {
  const indexRaw = await readFile(indexPath, 'utf8');
  const index = JSON.parse(indexRaw);
  if (!index.snapshots || index.snapshots.length === 0) {
    throw new Error('public/data/index.json has no snapshots.');
  }
  const latestEntry = index.snapshots.find((s) => s.id === index.latest) ?? index.snapshots[0];
  const snapRaw = await readFile(
    path.join(snapshotsDir, latestEntry.filename),
    'utf8',
  );
  return { index, current: JSON.parse(snapRaw) };
}

// ──────────────────────────────────────────────────────────────────────
// Parse the XLSX. Same layout-aware parser as before.
// ──────────────────────────────────────────────────────────────────────
function parseXlsx(buf) {
  const wb = XLSX.read(buf, { type: 'buffer' });

  const sheetName = wb.SheetNames.find((n) => {
    const text = JSON.stringify(
      XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: null }).slice(0, 5),
    ).toLowerCase();
    return /petitions for u nonimmigrant status/.test(text)
      && !/bona fide determination/.test(text);
  });
  if (!sheetName) throw new Error('Could not find the I-918 petition-status sheet — XLSX layout may have changed.');

  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null });

  const colHeaderIdx = rows.findIndex((row) => {
    const cells = (row || []).map((c) => String(c ?? '').toLowerCase());
    const periodCount = cells.filter((c) => /period/.test(c)).length;
    const receivedCount = cells.filter((c) => /receiv/.test(c)).length;
    return periodCount >= 1 && receivedCount >= 2;
  });
  if (colHeaderIdx < 0) throw new Error('Could not find "Period | Petitions Received | …" header row in I-918 sheet.');

  const groupRow = (rows[colHeaderIdx - 1] || []).map((c) => String(c ?? '').toLowerCase());
  const principalStart = groupRow.findIndex((c) => /victims|principal|i[-\s]?918\b/.test(c));
  const derivativeStart = groupRow.findIndex((c) => /family|derivative|i[-\s]?918a/.test(c));
  if (principalStart < 0 || derivativeStart < 0) {
    throw new Error('Could not locate the principal vs derivative column groups in the header.');
  }

  const blocks = {
    principal: { received: principalStart, approved: principalStart + 1, denied: principalStart + 2, pending: principalStart + 3 },
    derivative: { received: derivativeStart, approved: derivativeStart + 1, denied: derivativeStart + 2, pending: derivativeStart + 3 },
  };

  const principal = [];
  const derivative = [];

  for (let i = colHeaderIdx + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const fy = parseFY(row[0]);
    if (!fy) continue;
    const pNums = readBlock(row, blocks.principal);
    const dNums = readBlock(row, blocks.derivative);
    if (pNums) {
      const existing = principal.findIndex((r) => r.fiscalYear === fy);
      const entry = { fiscalYear: fy, form: 'I-918', ...pNums };
      if (existing >= 0) principal[existing] = entry;
      else principal.push(entry);
    }
    if (dNums) {
      const existing = derivative.findIndex((r) => r.fiscalYear === fy);
      const entry = { fiscalYear: fy, form: 'I-918A', ...dNums };
      if (existing >= 0) derivative[existing] = entry;
      else derivative.push(entry);
    }
  }

  if (principal.length === 0) throw new Error('Failed to extract any principal (I-918) rows from XLSX — schema likely drifted.');
  if (derivative.length === 0) throw new Error('Failed to extract any derivative (I-918A) rows from XLSX — schema likely drifted.');

  principal.sort((a, b) => a.fiscalYear - b.fiscalYear);
  derivative.sort((a, b) => a.fiscalYear - b.fiscalYear);
  return { principal, derivative };
}

function readBlock(row, cols) {
  const nums = {
    received: numOrNull(row[cols.received]),
    approved: numOrNull(row[cols.approved]),
    denied: numOrNull(row[cols.denied]),
    pendingEndOfYear: numOrNull(row[cols.pending]),
  };
  if (Object.values(nums).some((v) => v === null)) return null;
  return nums;
}

function parseFY(cell) {
  if (cell == null) return null;
  const s = String(cell).trim();
  const m = s.match(/(?:FY)?\s*(\d{4})\b/i);
  if (!m) return null;
  const y = Number(m[1]);
  return y >= 2000 && y <= 2100 ? y : null;
}

function numOrNull(cell) {
  if (cell == null || cell === '') return null;
  if (typeof cell === 'number') return Math.round(cell);
  const cleaned = String(cell).replace(/[\s,]/g, '');
  if (!/^-?\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}

// ──────────────────────────────────────────────────────────────────────
// Diff helper.
// ──────────────────────────────────────────────────────────────────────
function diff(oldArr, newArr, label) {
  const lines = [];
  const oldByFy = new Map(oldArr.map((r) => [r.fiscalYear, r]));
  const newByFy = new Map(newArr.map((r) => [r.fiscalYear, r]));
  const fys = [...new Set([...oldByFy.keys(), ...newByFy.keys()])].sort();
  for (const fy of fys) {
    const o = oldByFy.get(fy);
    const n = newByFy.get(fy);
    if (!o && n) {
      lines.push(`  + FY${fy} ${label}: NEW row ${JSON.stringify(n)}`);
      continue;
    }
    if (o && !n) {
      lines.push(`  - FY${fy} ${label}: removed (was ${JSON.stringify(o)})`);
      continue;
    }
    for (const k of ['received', 'approved', 'denied', 'pendingEndOfYear']) {
      if (o[k] !== n[k]) {
        lines.push(`  ~ FY${fy} ${label}.${k}: ${o[k]} → ${n[k]}`);
      }
    }
  }
  return lines;
}

// ──────────────────────────────────────────────────────────────────────
// Build a new snapshot object — copies through all the static-ish
// fields from the prior snapshot (STATE_CERT_SHARES etc.) since USCIS
// quarterly XLSX only updates the ANNUAL arrays.
// ──────────────────────────────────────────────────────────────────────
function buildNewSnapshot({ id, createdAt, prior, source, principal, derivative }) {
  return {
    id,
    createdAt,
    source,
    ANNUAL_PRINCIPAL: principal,
    ANNUAL_DERIVATIVE: derivative,
    QUARTERLY_PRINCIPAL: prior.QUARTERLY_PRINCIPAL,
    STATE_CERT_SHARES: prior.STATE_CERT_SHARES,
    CERTIFIED_CRIME_SHARES: prior.CERTIFIED_CRIME_SHARES,
    CERTIFYING_AGENCY_SHARES: prior.CERTIFYING_AGENCY_SHARES,
    CERTIFYING_AGENCY_LEVEL_SHARES: prior.CERTIFYING_AGENCY_LEVEL_SHARES,
    YEARLY_CRIME_TRENDS: prior.YEARLY_CRIME_TRENDS,
    FILING_DELAY_BUCKETS: prior.FILING_DELAY_BUCKETS,
    CASE_OUTCOMES: prior.CASE_OUTCOMES,
  };
}

function emitGhOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  }
}

// ──────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────
async function main() {
  const { index, current } = await readCurrentSnapshot();
  console.log(`current snapshot: ${current.id} (source ${current.source.filename}, sha=${current.source.sha256.slice(0, 12)}…)`);

  let url, buf, filename;
  if (LOCAL_FILE) {
    console.log(`(testing) using local file: ${LOCAL_FILE}`);
    buf = await readFile(LOCAL_FILE);
    filename = path.basename(LOCAL_FILE);
    url = `file://${path.resolve(LOCAL_FILE)}`;
  } else {
    url = await findLatestUscisXlsx();
    filename = path.basename(new URL(url).pathname);
    console.log(`upstream: ${url}`);
    buf = await fetchBuffer(url);
  }

  const newSha = sha256(buf);
  console.log(`upstream sha=${newSha.slice(0, 12)}…`);

  if (newSha === current.source.sha256) {
    console.log('✓ No change — current snapshot SHA matches upstream.');
    emitGhOutput('changed', 'false');
    return;
  }

  console.log('⚠ Upstream SHA differs — parsing XLSX to compute diff…');
  const parsed = parseXlsx(buf);
  console.log(`parsed: principal=${parsed.principal.length} FYs, derivative=${parsed.derivative.length} FYs`);

  const principalDiff = diff(current.ANNUAL_PRINCIPAL, parsed.principal, 'I-918');
  const derivativeDiff = diff(current.ANNUAL_DERIVATIVE, parsed.derivative, 'I-918A');
  const allDiff = [...principalDiff, ...derivativeDiff];

  if (allDiff.length === 0) {
    console.log('✓ XLSX changed but parsed values are identical (likely a metadata-only USCIS revision). Recording new snapshot anyway to anchor the new SHA.');
  } else {
    console.log(`Δ ${allDiff.length} cell change(s):`);
    allDiff.forEach((l) => console.log(l));
  }

  // New snapshot id = current ISO with `:` swapped for `-` so it's a
  // safe filename. createdAt keeps the canonical `:`.
  const now = new Date();
  const createdAt = now.toISOString();
  const id = createdAt.replace(/:/g, '-').replace(/\.\d+Z$/, 'Z');

  const newSource = {
    filename,
    url,
    verifiedOn: createdAt.slice(0, 10),
    sha256: newSha,
    crossCheck: current.source.crossCheck, // preserve the FY2024 Q4 anchor
  };
  const next = buildNewSnapshot({
    id,
    createdAt,
    prior: current,
    source: newSource,
    principal: parsed.principal,
    derivative: parsed.derivative,
  });

  const summary = allDiff.length === 0
    ? `metadata-only refresh (filename → ${filename})`
    : `${allDiff.length} cell change(s) in I-918 / I-918A annual aggregates`;

  if (DRY_RUN) {
    console.log('(dry run — not writing snapshot or index)');
    emitGhOutput('changed', 'true');
    emitGhOutput('summary', summary);
    emitGhOutput('snapshot-id', id);
    return;
  }

  // Write the new snapshot file (immutable — never overwrite).
  const newPath = path.join(snapshotsDir, `${id}.json`);
  await writeFile(newPath, JSON.stringify(next, null, 2));
  console.log(`✓ wrote ${newPath}`);

  // Prepend entry to index, bump latest pointer.
  const newIndex = {
    latest: id,
    snapshots: [
      {
        id,
        createdAt,
        filename: `${id}.json`,
        summary,
      },
      ...index.snapshots,
    ],
  };
  await writeFile(indexPath, JSON.stringify(newIndex, null, 2) + '\n');
  console.log(`✓ updated ${indexPath} (now ${newIndex.snapshots.length} snapshots, latest=${id})`);

  emitGhOutput('changed', 'true');
  emitGhOutput('summary', summary);
  emitGhOutput('snapshot-id', id);
}

main().catch((e) => {
  console.error(`✗ sync-uscis failed: ${e.message}`);
  if (process.env.GITHUB_OUTPUT) emitGhOutput('changed', 'error');
  process.exit(1);
});
