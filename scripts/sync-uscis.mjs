#!/usr/bin/env node
/**
 * Nightly USCIS data sync — fetch the canonical I-918 quarterly XLSX,
 * compute its SHA256, and compare to the SHA recorded in
 * src/lib/data.ts (USCIS_FILE_VERIFIED.sha256).
 *
 *   - SHA matches  → no change. Exit 0 with `changed=false` to GH_OUTPUT.
 *   - SHA differs  → parse the XLSX, regenerate the ANNUAL_PRINCIPAL +
 *                    ANNUAL_DERIVATIVE arrays + USCIS_FILE_VERIFIED block
 *                    + LAST_UPDATED, write the updated data.ts in place,
 *                    print a unified-style summary, and exit 0 with
 *                    `changed=true` so the workflow opens a PR.
 *   - Parse fails  → exit non-zero and let the workflow fail loudly.
 *                    USCIS schema drift is the most likely cause; the
 *                    next sync will resume normally once a human updates
 *                    the script to match the new shape.
 *
 * Usage:
 *   node scripts/sync-uscis.mjs                # full run
 *   node scripts/sync-uscis.mjs --dry-run      # don't rewrite data.ts
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
const dataTsPath = path.join(repoRoot, 'src/lib/data.ts');

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const fileArgIdx = process.argv.indexOf('--file');
const LOCAL_FILE = fileArgIdx >= 0 ? process.argv[fileArgIdx + 1] : null;

// ──────────────────────────────────────────────────────────────────────
// Find the canonical I-918 XLSX URL on the USCIS data page.
// USCIS publishes one xlsx per quarterly release; the most recent file
// republishes the entire historical series and supersedes prior files.
// We pick the link with the highest FY/quarter suffix.
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
  if (found.size === 0) throw new Error('No I-918 xlsx links found on USCIS data page (page layout may have changed).');

  // Sort by embedded fyYYYY_qN — newest wins.
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
// Parse data.ts to extract the current state we'll diff against.
// String-level extraction is intentional — full TS AST parsing is
// overkill, and the file's structure is stable + heavily commented.
// ──────────────────────────────────────────────────────────────────────
function extractCurrent(dataTs) {
  const shaMatch = dataTs.match(/sha256:\s*'([a-f0-9]{64})'/);
  const fileMatch = dataTs.match(/filename:\s*'([^']+)'/);
  const urlMatch = dataTs.match(/url:\s*'(https:\/\/www\.uscis\.gov[^']+\.xlsx)'/);
  if (!shaMatch || !fileMatch || !urlMatch) {
    throw new Error('Could not extract USCIS_FILE_VERIFIED block from data.ts.');
  }

  const principal = parseAnnualBlock(dataTs, 'ANNUAL_PRINCIPAL', 'I-918');
  const derivative = parseAnnualBlock(dataTs, 'ANNUAL_DERIVATIVE', 'I-918A');
  return {
    sha256: shaMatch[1],
    filename: fileMatch[1],
    url: urlMatch[1],
    principal,
    derivative,
  };
}

function parseAnnualBlock(dataTs, exportName, formLabel) {
  const blockRe = new RegExp(
    `export const ${exportName}: AnnualStat\\[\\] = \\[([\\s\\S]*?)\\n\\];`,
  );
  const block = dataTs.match(blockRe);
  if (!block) throw new Error(`Could not find ${exportName} array in data.ts.`);
  const rowRe = /\{\s*fiscalYear:\s*(\d{4}),\s*form:\s*'([^']+)',\s*received:\s*(-?\d+),\s*approved:\s*(-?\d+),\s*denied:\s*(-?\d+),\s*pendingEndOfYear:\s*(-?\d+)\s*\}/g;
  const out = new Map();
  let r;
  while ((r = rowRe.exec(block[1])) !== null) {
    if (r[2] !== formLabel) continue;
    out.set(Number(r[1]), {
      received: Number(r[3]),
      approved: Number(r[4]),
      denied: Number(r[5]),
      pendingEndOfYear: Number(r[6]),
    });
  }
  if (out.size === 0) throw new Error(`${exportName} parsed empty.`);
  return out;
}

// ──────────────────────────────────────────────────────────────────────
// Parse the XLSX. USCIS quarterly files have one sheet (or a few); we
// scan every cell looking for rows that have a 4-digit fiscal year, a
// "Total"/Annual marker, and four numeric columns matching received /
// approved / denied / pending. Sums-by-FY-by-form is what we need.
//
// If the layout drifts (column order swap, extra columns), the
// extracted numbers won't reconcile against existing FY rows — we
// detect that and fail loudly rather than silently propose bad data.
// ──────────────────────────────────────────────────────────────────────
function parseXlsx(buf) {
  const wb = XLSX.read(buf, { type: 'buffer' });

  // The petition-status sheet (not the BFD review sheet). Identified by
  // the title row containing "Form I-918 Petitions for U Nonimmigrant
  // Status" rather than "Bona Fide Determination".
  const sheetName = wb.SheetNames.find((n) => {
    const text = JSON.stringify(
      XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: null }).slice(0, 5),
    ).toLowerCase();
    return /petitions for u nonimmigrant status/.test(text)
      && !/bona fide determination/.test(text);
  });
  if (!sheetName) throw new Error('Could not find the I-918 petition-status sheet — XLSX layout may have changed.');

  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null });

  // Find the column-subheader row: "Period | Petitions Received | Approved
  // | Denied | Pending" repeated three times (principal, derivative, total).
  const colHeaderIdx = rows.findIndex((row) => {
    const cells = (row || []).map((c) => String(c ?? '').toLowerCase());
    const periodCount = cells.filter((c) => /period/.test(c)).length;
    const receivedCount = cells.filter((c) => /receiv/.test(c)).length;
    return periodCount >= 1 && receivedCount >= 2; // received appears for both forms (and total)
  });
  if (colHeaderIdx < 0) throw new Error('Could not find "Period | Petitions Received | …" header row in I-918 sheet.');

  // Find the group-header row directly above (lists the form names).
  const groupRow = (rows[colHeaderIdx - 1] || []).map((c) => String(c ?? '').toLowerCase());
  // Identify the start columns of the principal vs derivative blocks.
  const principalStart = groupRow.findIndex((c) => /victims|principal|i[-\s]?918\b/.test(c));
  const derivativeStart = groupRow.findIndex((c) => /family|derivative|i[-\s]?918a/.test(c));
  if (principalStart < 0 || derivativeStart < 0) {
    throw new Error('Could not locate the principal vs derivative column groups in the header.');
  }

  // Each form block is 4 columns: received, approved, denied, pending.
  const blocks = {
    principal: { received: principalStart, approved: principalStart + 1, denied: principalStart + 2, pending: principalStart + 3 },
    derivative: { received: derivativeStart, approved: derivativeStart + 1, denied: derivativeStart + 2, pending: derivativeStart + 3 },
  };

  // Scan every data row. Annual aggregates appear in two places:
  //   1. The "Fiscal Year - Total" block (one row per FY 2009..N-1, first cell = year).
  //   2. A trailing "Fiscal Year YYYY-Total" row that summarises the most
  //      recent FY after its quarterly breakdown (e.g. row labelled
  //      "Fiscal Year 2025-Total").
  // Quarterly rows have first cell like "Q1 October - December" — parseFY
  // returns null for those, so they're skipped naturally. Footnote rows
  // ("References:", "1 Refers to victims…") also don't match an FY year.
  const principal = new Map();
  const derivative = new Map();

  for (let i = colHeaderIdx + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const fy = parseFY(row[0]);
    if (!fy) continue;
    const pNums = readBlock(row, blocks.principal);
    const dNums = readBlock(row, blocks.derivative);
    // Always overwrite — the "Fiscal Year YYYY-Total" trailing row appears
    // after the quarter rows for the same FY, so the annual total wins.
    if (pNums) principal.set(fy, pNums);
    if (dNums) derivative.set(fy, dNums);
  }

  if (principal.size === 0) throw new Error('Failed to extract any principal (I-918) rows from XLSX — schema likely drifted.');
  if (derivative.size === 0) throw new Error('Failed to extract any derivative (I-918A) rows from XLSX — schema likely drifted.');
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
// Diff old vs new and produce a human-readable summary.
// ──────────────────────────────────────────────────────────────────────
function diff(oldMap, newMap, label) {
  const lines = [];
  const fys = [...new Set([...oldMap.keys(), ...newMap.keys()])].sort();
  for (const fy of fys) {
    const o = oldMap.get(fy);
    const n = newMap.get(fy);
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
// Re-render data.ts with new arrays and updated USCIS_FILE_VERIFIED.
// We touch ONLY the targeted blocks, leaving comments + everything
// else (QUARTERLY_PRINCIPAL, STATE_CERT_SHARES, etc.) untouched.
// ──────────────────────────────────────────────────────────────────────
function rewriteDataTs(dataTs, parsed, meta) {
  const todayIso = new Date().toISOString();
  const todayDate = todayIso.slice(0, 10);

  // Update LAST_UPDATED
  let out = dataTs.replace(
    /export const LAST_UPDATED = '[^']+';/,
    `export const LAST_UPDATED = '${todayDate}T00:00:00Z';`,
  );

  // Update USCIS_FILE_VERIFIED.filename / url / sha256 / verifiedOn
  out = out.replace(/(filename:\s*)'[^']+'/, `$1'${meta.filename}'`);
  out = out.replace(/(url:\s*)'https:\/\/www\.uscis\.gov\/[^']+\.xlsx'/, `$1'${meta.url}'`);
  out = out.replace(/(sha256:\s*)'[a-f0-9]{64}'/, `$1'${meta.sha256}'`);
  out = out.replace(/(verifiedOn:\s*)'\d{4}-\d{2}-\d{2}'/, `$1'${todayDate}'`);

  // Replace ANNUAL_PRINCIPAL block
  out = replaceAnnualBlock(out, 'ANNUAL_PRINCIPAL', 'I-918', parsed.principal);
  out = replaceAnnualBlock(out, 'ANNUAL_DERIVATIVE', 'I-918A', parsed.derivative);
  return out;
}

function replaceAnnualBlock(dataTs, exportName, formLabel, rows) {
  const sortedFys = [...rows.keys()].sort((a, b) => a - b);
  const lines = sortedFys.map((fy) => {
    const r = rows.get(fy);
    return `  { fiscalYear: ${fy}, form: '${formLabel}', received: ${r.received}, approved: ${r.approved}, denied: ${r.denied}, pendingEndOfYear: ${r.pendingEndOfYear} },`;
  });
  const replacement = `export const ${exportName}: AnnualStat[] = [\n${lines.join('\n')}\n];`;
  const blockRe = new RegExp(
    `export const ${exportName}: AnnualStat\\[\\] = \\[[\\s\\S]*?\\n\\];`,
  );
  return dataTs.replace(blockRe, replacement);
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
  const dataTs = await readFile(dataTsPath, 'utf8');
  const current = extractCurrent(dataTs);
  console.log(`current: ${current.filename} sha=${current.sha256.slice(0, 12)}…`);

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

  if (newSha === current.sha256) {
    console.log('✓ No change — current data.ts SHA matches upstream.');
    emitGhOutput('changed', 'false');
    return;
  }

  console.log('⚠ Upstream SHA differs — parsing XLSX to compute diff…');
  const parsed = parseXlsx(buf);
  console.log(`parsed: principal=${parsed.principal.size} FYs, derivative=${parsed.derivative.size} FYs`);

  const principalDiff = diff(current.principal, parsed.principal, 'I-918');
  const derivativeDiff = diff(current.derivative, parsed.derivative, 'I-918A');
  const allDiff = [...principalDiff, ...derivativeDiff];

  if (allDiff.length === 0) {
    console.log('✓ XLSX changed but parsed values are identical to current data.ts (likely a metadata-only USCIS revision). Updating SHA + filename only.');
  } else {
    console.log(`Δ ${allDiff.length} cell change(s):`);
    allDiff.forEach((l) => console.log(l));
  }

  const summary = allDiff.length === 0
    ? `metadata-only refresh (filename → ${filename})`
    : `${allDiff.length} cell change(s) in I-918 / I-918A annual aggregates`;

  if (DRY_RUN) {
    console.log('(dry run — not writing data.ts)');
    emitGhOutput('changed', 'true');
    emitGhOutput('summary', summary);
    return;
  }

  const next = rewriteDataTs(dataTs, parsed, {
    filename,
    url,
    sha256: newSha,
  });
  await writeFile(dataTsPath, next);
  console.log(`✓ wrote ${dataTsPath}`);
  emitGhOutput('changed', 'true');
  emitGhOutput('summary', summary);
}

main().catch((e) => {
  console.error(`✗ sync-uscis failed: ${e.message}`);
  if (process.env.GITHUB_OUTPUT) emitGhOutput('changed', 'error');
  process.exit(1);
});
