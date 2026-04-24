/**
 * Live U-visa news feed — pulls Google News RSS and parses a minimal item
 * shape. Next.js `fetch` ISR caching (revalidate) keeps network pressure
 * low while the page stays fresh.
 */

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description: string;
}

// Multiple angles to accumulate ≥100 distinct items after link+title dedupe.
// Google News RSS rarely returns much beyond ~1 week of content per query
// anyway, so dropping `when:7d` mostly just loosens the upper bound without
// adding much stale content.
const FEED_QUERIES: string[] = [
  '"U visa" OR "U nonimmigrant" OR "I-918"',
  '"visa fraud" OR "immigration fraud" OR "marriage fraud"',
  '"U visa" fraud OR certification OR lawsuit',
  '"visa fraud" indictment OR charged OR scheme',
  '"I-918" OR "U visa" certification',
  '"USCIS" fraud investigation',
  '"visa fraud scheme" OR "visa fraud ring"',
  '"crime victim visa" OR "T visa" OR "VAWA petition"',
  'immigration fraud indictment OR "US Attorney"',
  '"U nonimmigrant status" OR "I-918B" certification',
  '"immigration attorney" fraud OR indicted',
  '"work visa fraud" OR "H-1B fraud" OR "EB fraud"',
  '"visa scam" OR "immigration scam"',
  '"certifying agency" U visa',
];

function buildFeedUrl(query: string): string {
  return (
    'https://news.google.com/rss/search?' +
    new URLSearchParams({
      q: query,
      hl: 'en-US',
      gl: 'US',
      ceid: 'US:en',
    }).toString()
  );
}

// News RSS refreshes hourly (user-facing requirement: news must feel live).
// Other site data — USCIS stats, history timeline, category content — stays
// on a daily cadence via LAST_UPDATED / unstable_cache at a 24h revalidate.
const REVALIDATE_SECONDS = 60 * 60; // 1 hour

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '').trim();
}

function extractFirst(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!m) return '';
  const cdata = m[1].match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return (cdata ? cdata[1] : m[1]).trim();
}

function extractItems(xml: string): string[] {
  const out: string[] = [];
  const re = /<item[\s\S]*?<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[0]);
  return out;
}

function parseItem(raw: string): NewsItem {
  const rawTitle = extractFirst(raw, 'title');
  const link = extractFirst(raw, 'link');
  const pubDate = extractFirst(raw, 'pubDate');
  const descRaw = extractFirst(raw, 'description');
  const source = extractFirst(raw, 'source') || 'Google News';

  // Google News wraps the publisher inside the title as "Headline - Publisher"
  const titleParts = rawTitle.split(' - ');
  const publisher = titleParts.length > 1 ? titleParts[titleParts.length - 1] : source;
  const headline =
    titleParts.length > 1 ? titleParts.slice(0, -1).join(' - ') : rawTitle;

  // Google News RSS <description> is typically just the title wrapped in
  // an anchor tag plus the publisher — redundant with `title` + `source`.
  // Decode entities, strip tags, and drop it if it's just a restatement
  // of the title.
  const decodedDesc = decodeHtmlEntities(descRaw);
  const plainDesc = stripTags(decodedDesc).replace(/\s+/g, ' ').trim();
  const titleText = decodeHtmlEntities(headline);
  const suppressDesc =
    !plainDesc ||
    plainDesc.toLowerCase().startsWith(titleText.toLowerCase().slice(0, 30));

  return {
    title: titleText,
    link,
    source: decodeHtmlEntities(publisher),
    pubDate,
    description: suppressDesc ? '' : plainDesc.slice(0, 280),
  };
}

async function fetchOneQuery(query: string, perQueryCap: number): Promise<NewsItem[]> {
  try {
    const res = await fetch(buildFeedUrl(query), {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { 'User-Agent': 'Mozilla/5.0 (u-visa-tracker; +news-feed)' },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return extractItems(xml).slice(0, perQueryCap).map(parseItem);
  } catch {
    return [];
  }
}

export async function fetchUVisaNews(limit = 12): Promise<NewsItem[]> {
  // Oversample per query so that after link+title dedupe we still clear `limit`.
  const perQueryCap = Math.max(30, Math.ceil((limit * 3) / FEED_QUERIES.length));
  const batches = await Promise.all(
    FEED_QUERIES.map((q) => fetchOneQuery(q, perQueryCap)),
  );

  // Dedupe by link, then by normalized title.
  const seenLink = new Set<string>();
  const seenTitle = new Set<string>();
  const merged: NewsItem[] = [];
  for (const batch of batches) {
    for (const item of batch) {
      const linkKey = item.link || item.title;
      const titleKey = item.title.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!linkKey || seenLink.has(linkKey) || seenTitle.has(titleKey)) continue;
      seenLink.add(linkKey);
      seenTitle.add(titleKey);
      merged.push(item);
    }
  }

  // Sort newest-first by pubDate.
  merged.sort((a, b) => {
    const ta = Date.parse(a.pubDate) || 0;
    const tb = Date.parse(b.pubDate) || 0;
    return tb - ta;
  });

  return merged.slice(0, limit);
}

/**
 * Returns the last time the news feed refreshed its RSS cache, rounded to the
 * daily bucket we revalidate on. Uses `unstable_cache` so every caller inside
 * a given day sees the same value — the timestamp only advances once per day.
 */
import { unstable_cache as _unstable_cache } from 'next/cache';

export const getNewsLastUpdated = _unstable_cache(
  async () => new Date().toISOString(),
  ['u-visa-news-last-updated'],
  { revalidate: 60 * 60, tags: ['news-classify'] }, // hourly bucket
);

export function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diffMs = Date.now() - t;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}
