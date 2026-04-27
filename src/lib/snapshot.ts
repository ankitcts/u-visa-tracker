/**
 * Timestamped data snapshot loader.
 *
 * The site no longer ships data inside the Next.js bundle. Instead,
 * every USCIS reconciliation produces an immutable JSON snapshot in
 * `public/data/snapshots/<id>.json` and adds an entry to
 * `public/data/index.json`. Pages call `getLatestSnapshot()` (or
 * `getSnapshot(id)` for time travel) and read the data from there.
 *
 * Why: separating data from code means a USCIS data refresh ships a
 * single JSON file and does NOT require a code build / deploy. Old
 * snapshots are preserved forever and remain CDN-cacheable as
 * immutable assets.
 *
 * Read paths:
 *   - Server-side (default): direct fs read from `public/data/...`,
 *     wrapped in unstable_cache so we don't hit the disk on every
 *     request. Cache busts when the underlying file mtime changes.
 *   - Future client-side: the same JSON files are reachable via plain
 *     HTTP at `/data/snapshots/<id>.json` and `/data/index.json` —
 *     not used yet but available without code changes if needed.
 */
import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { unstable_cache } from 'next/cache';
import type {
  AnnualStat,
  CategoryShare,
  QuarterlyStat,
  StateCertShare,
  YearlyCrimeShare,
} from './types';

export interface SourceFile {
  filename: string;
  url: string;
  verifiedOn: string;
  sha256: string;
  crossCheck?: { filename: string; url: string; sha256: string };
}

export interface DataSnapshot {
  id: string; // matches the index.json entry id (filesystem-safe ISO)
  createdAt: string; // canonical ISO timestamp
  source: SourceFile;
  ANNUAL_PRINCIPAL: AnnualStat[];
  ANNUAL_DERIVATIVE: AnnualStat[];
  QUARTERLY_PRINCIPAL: QuarterlyStat[];
  STATE_CERT_SHARES: StateCertShare[];
  CERTIFIED_CRIME_SHARES: CategoryShare[];
  CERTIFYING_AGENCY_SHARES: CategoryShare[];
  CERTIFYING_AGENCY_LEVEL_SHARES: CategoryShare[];
  YEARLY_CRIME_TRENDS: YearlyCrimeShare[];
  FILING_DELAY_BUCKETS: CategoryShare[];
  CASE_OUTCOMES: CategoryShare[];
}

export interface SnapshotIndexEntry {
  id: string;
  createdAt: string;
  filename: string;
  summary?: string;
}

export interface SnapshotIndex {
  latest: string; // id of the newest snapshot
  snapshots: SnapshotIndexEntry[]; // newest first
}

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const INDEX_PATH = path.join(DATA_DIR, 'index.json');

const _readIndex = unstable_cache(
  async (): Promise<SnapshotIndex> => {
    const raw = await readFile(INDEX_PATH, 'utf8');
    return JSON.parse(raw) as SnapshotIndex;
  },
  ['snapshot-index-v1'],
  { revalidate: 60, tags: ['data-snapshot'] },
);

const _readSnapshot = (filename: string) =>
  unstable_cache(
    async (): Promise<DataSnapshot> => {
      const raw = await readFile(
        path.join(DATA_DIR, 'snapshots', filename),
        'utf8',
      );
      return JSON.parse(raw) as DataSnapshot;
    },
    [`snapshot-${filename}`],
    { revalidate: 60, tags: ['data-snapshot'] },
  );

/** Load the index of all known snapshots, newest first. */
export async function getSnapshotIndex(): Promise<SnapshotIndex> {
  return _readIndex();
}

/** Load the latest snapshot — the default for every data page. */
export async function getLatestSnapshot(): Promise<DataSnapshot> {
  const idx = await _readIndex();
  const entry =
    idx.snapshots.find((s) => s.id === idx.latest) ?? idx.snapshots[0];
  if (!entry) {
    throw new Error(
      'No snapshots found in public/data/index.json — repo data is empty.',
    );
  }
  return _readSnapshot(entry.filename)();
}

/**
 * Load a specific historical snapshot by id (the value of `index.snapshots[].id`).
 * Returns null if not found. Use this for future "view past data" features.
 */
export async function getSnapshotById(
  id: string,
): Promise<DataSnapshot | null> {
  const idx = await _readIndex();
  const entry = idx.snapshots.find((s) => s.id === id);
  if (!entry) return null;
  return _readSnapshot(entry.filename)();
}

/**
 * Convenience — the canonical ISO timestamp of the active snapshot.
 * Pages use this for the "Last updated" pill so it advances every time
 * a new snapshot lands, without needing a code deploy.
 */
export async function getLastUpdatedIso(): Promise<string> {
  const snap = await getLatestSnapshot();
  return snap.createdAt;
}
