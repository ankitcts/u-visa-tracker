import { unstable_cache } from 'next/cache';
import type { NewsItem } from './news';
import {
  inferStateFromItem,
  inferTagFromItem,
  inferCountryFromItem,
} from './geotag';

const VALID_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY','PR',
]);

/**
 * LLM news classifier — provider-agnostic OpenAI-compatible REST.
 *
 * Defaults to Groq (free tier, very fast). Override via env:
 *   LLM_BASE_URL    — default https://api.groq.com/openai/v1
 *   LLM_API_KEY     — falls back to GROQ_API_KEY or OPENAI_API_KEY
 *   LLM_MODEL       — default llama-3.3-70b-versatile
 *
 * Gemini: set LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai,
 *         LLM_MODEL=gemini-2.5-flash, LLM_API_KEY=<Gemini key>.
 * Anthropic: not OpenAI-compatible; use separate classifyWithAnthropic if needed.
 *
 * When no key is configured, classify() returns items tagged as "general".
 */

export type NewsTag =
  | 'policy-change'
  | 'litigation'
  | 'fraud-concern'
  | 'data-report'
  | 'commentary'
  | 'general';

export interface ClassifiedNewsItem extends NewsItem {
  tag: NewsTag;
  summary?: string;
  /** Two-letter US state code when the article is primarily about one state, else null. */
  state?: string | null;
  /** ISO 3166-1 alpha-2 country code ("US","IN","MX","NG"…) or null. */
  country?: string | null;
}

const DEFAULT_BASE = 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

function getConfig() {
  const apiKey =
    process.env.LLM_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.OPENAI_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || DEFAULT_BASE;
  const model = process.env.LLM_MODEL || DEFAULT_MODEL;
  return { apiKey, baseUrl, model };
}

const SYSTEM_PROMPT = `Classify US U-visa / immigration-fraud news. Output minified JSON ONLY: {"items":[{"i":0,"t":"<tag>","s":"<state>"},...]}.
Tags (t): policy-change, litigation, fraud-concern, data-report, commentary, general.
State (s): 2-letter USPS code for a US state (e.g. CA, TX, NY, FL). Infer generously from US city/county, US Attorney district, state court, US publisher. Use null if story is about a non-US country, or is purely federal-level with no US locational hint. NEVER output "US", country codes (GR, NG, IN, CA for Canada, etc.), or anything that isn't a valid USPS state code.
Return same count and order as input.`;

/**
 * Public classifier — delegates to a cached successful-path impl. On any
 * failure (rate limit, network, parse), falls back to the in-memory last-good
 * map so the UI keeps showing state tags. The fallback is NOT cached, so a
 * later render can still succeed and populate the cache.
 */
export async function classifyNews(
  items: NewsItem[],
): Promise<ClassifiedNewsItem[]> {
  if (items.length === 0) return [];
  let classified: ClassifiedNewsItem[];
  try {
    classified = await classifyNewsCached(items);
  } catch (err) {
    console.warn('classifyNews failed — returning fallback:', err);
    classified =
      lastGoodByLink(items) ??
      items.map((it) => ({ ...it, tag: 'general' as NewsTag, state: null }));
  }

  // Rule-based fallback for items the LLM left unlocated or defaulted to
  // "general" tag (happens when the classifier is rate-limited and the code
  // path falls back to `tag: 'general' as NewsTag`). Pure local scan of
  // headline/description/publisher — zero LLM tokens.
  return classified.map((item) => {
    const state = item.state ?? inferStateFromItem(item);
    const tag =
      item.tag !== 'general' ? item.tag : inferTagFromItem(item) ?? 'general';
    const country =
      item.country ?? inferCountryFromItem({ ...item, state });
    return { ...item, state, tag, country };
  });
}

const classifyNewsCached = unstable_cache(
  (items: NewsItem[]) => classifyNewsImpl(items),
  ['u-visa-news-classify-v6'],
  {
    revalidate: 60 * 60, // hourly — matches RSS refresh cadence
    tags: ['news-classify'],
  },
);

// When we hit a 429, honor Retry-After by refusing to call Groq again until
// this timestamp (ms since epoch). Prevents tight retry loops from re-hammering
// an already-exhausted quota bucket.
let coolingUntil = 0;

const CHUNK_SIZE = 40;

async function classifyNewsImpl(
  items: NewsItem[],
): Promise<ClassifiedNewsItem[]> {
  const { apiKey } = getConfig();
  if (!apiKey) {
    return items.map((it) => ({ ...it, tag: 'general' as NewsTag, state: null }));
  }

  // Split into smaller chunks so each Groq request fits under per-request
  // token limits (8b-instant 413s on ~120-item payloads).
  const results: ClassifiedNewsItem[] = [];
  for (let start = 0; start < items.length; start += CHUNK_SIZE) {
    const chunk = items.slice(start, start + CHUNK_SIZE);
    const classified = await classifyChunk(chunk);
    results.push(...classified);
  }
  rememberGood(results);
  return results;
}

async function classifyChunk(
  items: NewsItem[],
): Promise<ClassifiedNewsItem[]> {
  const { apiKey, baseUrl, model } = getConfig();
  if (Date.now() < coolingUntil) {
    throw new Error(
      `classifier cooling down for ${Math.ceil((coolingUntil - Date.now()) / 1000)}s`,
    );
  }

  const userPayload = items.map((it, i) => ({
    i,
    title: it.title.slice(0, 160),
    source: it.source,
  }));

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(userPayload) },
      ],
      temperature: 0,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) {
      const retrySec = parseRetrySec(res.headers.get('retry-after'), body);
      coolingUntil = Date.now() + retrySec * 1000;
    }
    // Throw so unstable_cache does NOT store the failure.
    throw new Error(`classifier ${res.status}: ${body.slice(0, 160)}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content ?? '';
  const parsed = safeParse(text);
  if (!parsed?.items) {
    throw new Error('classifier returned unparseable payload');
  }

  const tagMap = new Map<number, NewsTag>();
  const stateMap = new Map<number, string | null>();
  for (const row of parsed.items) {
    if (typeof row.i !== 'number') continue;
    if (isValidTag(row.t)) tagMap.set(row.i, row.t);
    if (typeof row.s === 'string' && VALID_STATES.has(row.s.toUpperCase())) {
      stateMap.set(row.i, row.s.toUpperCase());
    } else {
      stateMap.set(row.i, null);
    }
  }

  return items.map((it, i) => ({
    ...it,
    tag: tagMap.get(i) ?? 'general',
    state: stateMap.get(i) ?? null,
  }));
}

// In-memory map: link → classified result. Survives within the server process
// (dev or serverless warm instance). Lets us keep showing tags + states on the
// map when Groq briefly 429s or errors on a subsequent render.
const lastGood = new Map<string, ClassifiedNewsItem>();

function rememberGood(items: ClassifiedNewsItem[]) {
  for (const it of items) {
    if (it.link) lastGood.set(it.link, it);
  }
}

function lastGoodByLink(items: NewsItem[]): ClassifiedNewsItem[] | null {
  const hits = items.map((it) => lastGood.get(it.link));
  const hitCount = hits.filter(Boolean).length;
  if (hitCount / Math.max(1, items.length) < 0.3) return null;
  return items.map(
    (it, i) =>
      hits[i] ?? { ...it, tag: 'general' as NewsTag, state: null },
  );
}

function parseRetrySec(header: string | null, body: string): number {
  if (header) {
    const n = Number(header);
    if (Number.isFinite(n) && n > 0) return Math.min(n, 3600);
  }
  // Groq embeds "Please try again in 16m29.28s" in the error body.
  const m = body.match(/try again in\s+(?:(\d+)m)?\s*([\d.]+)s/i);
  if (m) {
    const mins = m[1] ? parseInt(m[1], 10) : 0;
    const secs = m[2] ? parseFloat(m[2]) : 0;
    return Math.min(mins * 60 + secs, 3600);
  }
  return 65; // default one-minute-ish if we can't parse
}

function safeParse(
  s: string,
): { items?: { i: number; t: string; s?: string | null }[] } | null {
  try {
    return JSON.parse(s);
  } catch {
    const m = s.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function isValidTag(t: unknown): t is NewsTag {
  return (
    t === 'policy-change' ||
    t === 'litigation' ||
    t === 'fraud-concern' ||
    t === 'data-report' ||
    t === 'commentary' ||
    t === 'general'
  );
}

export const TAG_LABELS: Record<NewsTag, string> = {
  'policy-change': 'Policy',
  litigation: 'Litigation',
  'fraud-concern': 'Fraud concern',
  'data-report': 'Data',
  commentary: 'Commentary',
  general: 'General',
};

export const TAG_BADGE_VARIANT: Record<
  NewsTag,
  'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline'
> = {
  'policy-change': 'default',
  litigation: 'warning',
  'fraud-concern': 'destructive',
  'data-report': 'success',
  commentary: 'secondary',
  general: 'outline',
};
