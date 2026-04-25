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
  /** Pre-resolved thumbnail (e.g. YouTube). If present, og-meta fetch is skipped. */
  imageUrl?: string | null;
  /** Pre-resolved video URL (YouTube items set this directly). */
  videoUrl?: string | null;
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

// Fallback queries — Reddit RSS search. Works even when Google News is
// rate-limiting our IP (which it does aggressively during dev). Each entry
// picks a subreddit + query; results are merged.
const REDDIT_QUERIES: { subreddit: string | null; query: string }[] = [
  { subreddit: 'immigration', query: '"U visa"' },
  { subreddit: 'immigration', query: '"I-918" OR "U nonimmigrant"' },
  { subreddit: 'immigration', query: '"visa fraud" OR "immigration fraud"' },
  { subreddit: 'immigration', query: '"Bona Fide Determination"' },
  { subreddit: 'USCIS', query: '"U visa"' },
  { subreddit: 'legaladvice', query: '"U visa"' },
  { subreddit: 'Asylum', query: '"U visa"' },
  // Unrestricted (cross-subreddit) — catch mainstream article shares.
  { subreddit: null, query: '"U visa" fraud OR scheme OR indictment' },
  { subreddit: null, query: '"visa fraud" indicted OR charged' },
  { subreddit: null, query: '"I-918" OR "U nonimmigrant"' },
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

// News RSS refreshes every 5 minutes — feed must feel live. Other site
// data (USCIS stats, history, category content) stays on the daily
// cadence via LAST_UPDATED / unstable_cache at a 24h revalidate.
//
// Keep this in sync with NEWS_REFRESH_SECONDS exported below — the
// client polls /api/news/feed at the same cadence so users see fresh
// items without reloading.
const REVALIDATE_SECONDS = 60 * 5; // 5 minutes
export const NEWS_REFRESH_SECONDS = REVALIDATE_SECONDS;

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

function buildRedditFeedUrl(subreddit: string | null, query: string): string {
  const base = subreddit
    ? `https://www.reddit.com/r/${subreddit}/search.rss`
    : 'https://www.reddit.com/search.rss';
  return (
    base +
    '?' +
    new URLSearchParams({
      q: query,
      ...(subreddit ? { restrict_sr: '1' } : {}),
      sort: 'new',
      t: 'year',
    }).toString()
  );
}

async function fetchRedditQuery(
  subreddit: string | null,
  query: string,
  perQueryCap: number,
): Promise<NewsItem[]> {
  try {
    const res = await fetch(buildRedditFeedUrl(subreddit, query), {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        // Reddit rejects requests without a descriptive UA.
        'User-Agent': 'u-visa-tracker-news/1.0 (+news-feed)',
      },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return extractAtomEntries(xml).slice(0, perQueryCap).map(parseAtomEntry);
  } catch {
    return [];
  }
}

// ── GDELT Doc API ──────────────────────────────────────────────────────
// Free global news archive (artlist mode returns JSON with url/title/domain/
// seendate/sourcecountry). Reliable when Google is 503'ing.
const GDELT_QUERIES: string[] = [
  '"U visa"',
  '"visa fraud"',
  '"immigration fraud"',
  '"I-918"',
  '"marriage fraud" visa',
  '"U nonimmigrant"',
];

async function fetchGdeltQuery(query: string, limit: number): Promise<NewsItem[]> {
  const url =
    'https://api.gdeltproject.org/api/v2/doc/doc?' +
    new URLSearchParams({
      query,
      mode: 'artlist',
      format: 'json',
      maxrecords: String(Math.min(75, limit)),
      sort: 'datedesc',
      timespan: '14d',
    }).toString();
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { 'User-Agent': 'u-visa-tracker-news/1.0' },
      signal: AbortSignal.timeout(5000), // fail fast — GDELT is flaky
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      articles?: Array<{
        url: string;
        title: string;
        seendate: string;
        domain: string;
        sourcecountry?: string;
      }>;
    };
    const arts = json.articles ?? [];
    return arts.map((a) => ({
      title: a.title ?? '',
      link: a.url,
      source: a.domain || 'GDELT',
      // GDELT seendate is YYYYMMDDHHMMSS — convert to ISO.
      pubDate: formatGdeltDate(a.seendate),
      description: '',
    }));
  } catch {
    return [];
  }
}

function formatGdeltDate(s?: string): string {
  if (!s || s.length < 14) return new Date().toISOString();
  const yyyy = s.slice(0, 4);
  const mm = s.slice(4, 6);
  const dd = s.slice(6, 8);
  const hh = s.slice(8, 10);
  const mi = s.slice(10, 12);
  const ss = s.slice(12, 14);
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}Z`;
}

// ── YouTube channel RSS ────────────────────────────────────────────────
// Public YouTube channel feeds (no API key, no rate limit). Each channel
// returns its 15 newest uploads in Atom; we filter to U-visa/immigration-
// relevant items locally by keyword match on title+description.
const YOUTUBE_CHANNELS: { id: string; name: string }[] = [
  { id: 'UC16niRr50-MSBwiO3YDb3RA', name: 'BBC News' },
  { id: 'UCupvZG-5ko_eiXAupbDfxWw', name: 'CNN' },
  { id: 'UCeY0bbntWzzVIaj2z3QigXg', name: 'NBC News' },
  { id: 'UCBi2mrWuNuyYy4gbM6fU18Q', name: 'ABC News' },
  { id: 'UC8p1vwvWtl6T73JiExfWs1g', name: 'CBS News' },
  { id: 'UCXIJgqnII2ZOINSWNOGFThA', name: 'Fox News' },
  { id: 'UC52X5wxOL_s5yw0dQk7NtgA', name: 'AP News' },
  { id: 'UCK7tptUDHh-RYDsdxO1-5QQ', name: 'WSJ' },
  { id: 'UCHd62-u_v4DvJ8TCFtpi4GA', name: 'Washington Post' },
  { id: 'UCb--64Gl51jIEVE-GLDAVTg', name: 'C-SPAN' },
];

// Keyword filter for YouTube channel feeds.
//
// Learned the hard way: matching on tangential mentions ("trafficking",
// "immigration reform") lets through political roundup shows (C-SPAN
// "Washington Today") and unrelated crime stories (BBC Epstein flats)
// because their descriptions brush past those words in a different context.
//
// Current strict rule: the TITLE must contain an immigration-document /
// agency / case-type token. Descriptions are ignored (too noisy on
// mainstream feeds). This trades recall for precision — we'd rather show
// zero YouTube hits than irrelevant ones.
const YOUTUBE_KEYWORDS = new RegExp(
  [
    // Program-specific — always accept
    '\\bu[-\\s]visa\\b',
    '\\bu[-\\s]nonimmigrant\\b',
    '\\bi-?918\\b',
    '\\bI-918B\\b',
    '\\bbona fide determination\\b',
    '\\bcrime victim visa\\b',
    '\\bVAWA\\b',
    // Fraud terms that are unambiguous
    '\\bvisa fraud\\b',
    '\\bimmigration fraud\\b',
    '\\bmarriage fraud\\b',
    '\\bgreen card fraud\\b',
    // Agency / document anchors
    '\\bUSCIS\\b',
    '\\bICE raid\\b',
    '\\bICE detainer\\b',
    // Specific immigration proceedings / roles
    '\\bimmigration (?:court|judge|attorney|detention|detainee)\\b',
    '\\basylum (?:seeker|seekers|claim|ruling|denial|grant)\\b',
    '\\bdeportation (?:order|case|flight|hearing|raid)\\b',
    '\\bwork permit (?:fraud|scheme|revocation)\\b',
    '\\bgreen card (?:fraud|scheme|denial|interview)\\b',
    // Specific visa types (narrow, crime-victim-adjacent)
    '\\bT[-\\s]visa\\b',
    '\\bSIJS\\b',
    '\\bDACA\\b',
    '\\bTPS (?:holder|recipient|revocation)\\b',
  ].join('|'),
  'i',
);

// Require the anchor to appear in the TITLE only (descriptions on mainstream
// channels are too noisy — "Senate takes up immigration reform" filler in a
// political-roundup description shouldn't promote a non-immigration video).
function isYouTubeRelevant(title: string): boolean {
  return YOUTUBE_KEYWORDS.test(title);
}

async function fetchYouTubeChannel(
  channel: { id: string; name: string },
  perChannelCap: number,
): Promise<NewsItem[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { 'User-Agent': 'Mozilla/5.0 (u-visa-tracker; +youtube-feed)' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const entries = extractAtomEntries(xml);
    const items: NewsItem[] = [];
    for (const raw of entries) {
      const titleRaw = stripTags(extractFirst(raw, 'title'));
      const title = decodeHtmlEntities(titleRaw);
      // `<media:description>` holds the video description
      const descMatch = raw.match(
        /<media:description[^>]*>([\s\S]*?)<\/media:description>/,
      );
      const description = decodeHtmlEntities(
        stripTags(descMatch ? descMatch[1] : ''),
      )
        .replace(/\s+/g, ' ')
        .trim();
      // Only keep videos whose TITLE hits the strict filter. Descriptions on
      // mainstream channels are too noisy (political roundups, ad copy).
      if (!isYouTubeRelevant(title)) continue;

      const videoIdMatch = raw.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const videoId = videoIdMatch ? videoIdMatch[1] : '';
      const published = extractFirst(raw, 'published');
      // Grab the HD thumbnail from `<media:thumbnail url="..."/>`
      const thumbMatch = raw.match(/<media:thumbnail[^>]*url="([^"]+)"/);
      const thumb = thumbMatch ? thumbMatch[1] : videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;

      items.push({
        title,
        link: videoId
          ? `https://www.youtube.com/watch?v=${videoId}`
          : extractFirst(raw, 'link'),
        source: `YouTube · ${channel.name}`,
        pubDate: published || new Date().toISOString(),
        description: description.slice(0, 280),
        imageUrl: thumb,
        videoUrl: videoId
          ? `https://www.youtube.com/watch?v=${videoId}`
          : null,
      });

      if (items.length >= perChannelCap) break;
    }
    return items;
  } catch {
    return [];
  }
}

// ── Hacker News Algolia ────────────────────────────────────────────────
async function fetchHackerNewsQuery(query: string, limit: number): Promise<NewsItem[]> {
  const url =
    'https://hn.algolia.com/api/v1/search?' +
    new URLSearchParams({
      query,
      tags: 'story',
      hitsPerPage: String(Math.min(40, limit)),
    }).toString();
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      hits?: Array<{ url?: string; title?: string; created_at?: string; author?: string }>;
    };
    const hits = (json.hits ?? []).filter((h) => h.url && h.title);
    return hits.map((h) => ({
      title: h.title!,
      link: h.url!,
      source: `HN · ${h.author ?? ''}`,
      pubDate: h.created_at ?? new Date().toISOString(),
      description: '',
    }));
  } catch {
    return [];
  }
}

function extractAtomEntries(xml: string): string[] {
  const out: string[] = [];
  const re = /<entry[\s\S]*?<\/entry>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[0]);
  return out;
}

function parseAtomEntry(raw: string): NewsItem {
  const title = decodeHtmlEntities(stripTags(extractFirst(raw, 'title')));
  const linkMatch = raw.match(/<link[^>]*href="([^"]+)"/i);
  const link = linkMatch ? linkMatch[1] : '';
  const updated = extractFirst(raw, 'updated') || extractFirst(raw, 'published');
  const authorMatch = raw.match(
    /<author>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/author>/,
  );
  const author = authorMatch ? authorMatch[1].trim() : 'Reddit';
  // Reddit feed includes a content block with HTML — strip it.
  const contentMatch = raw.match(/<content[^>]*>([\s\S]*?)<\/content>/);
  const contentRaw = contentMatch ? contentMatch[1] : '';
  const description = stripTags(decodeHtmlEntities(contentRaw))
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 280);
  return {
    title,
    link,
    source: `r/immigration · ${author}`,
    pubDate: updated,
    description: description.toLowerCase().startsWith(title.toLowerCase().slice(0, 20))
      ? ''
      : description,
  };
}

export async function fetchUVisaNews(limit = 12): Promise<NewsItem[]> {
  // Oversample per query so that after link+title dedupe we still clear `limit`.
  const perQueryCap = Math.max(30, Math.ceil((limit * 3) / FEED_QUERIES.length));

  // Run every available source in parallel. Each source has failure isolation
  // — if Google News 503s, Reddit/GDELT/HN/YouTube still populate the feed.
  const [googleBatches, redditBatches, gdeltBatches, hnBatches, ytBatches] =
    await Promise.all([
      Promise.all(FEED_QUERIES.map((q) => fetchOneQuery(q, perQueryCap))),
      Promise.all(
        REDDIT_QUERIES.map((r) =>
          fetchRedditQuery(r.subreddit, r.query, Math.max(15, perQueryCap)),
        ),
      ),
      Promise.all(GDELT_QUERIES.map((q) => fetchGdeltQuery(q, 50))),
      Promise.all(
        ['"U visa"', '"I-918"', '"visa fraud"'].map((q) =>
          fetchHackerNewsQuery(q, 20),
        ),
      ),
      Promise.all(
        YOUTUBE_CHANNELS.map((c) => fetchYouTubeChannel(c, 5)),
      ),
    ]);
  const batches = [
    ...googleBatches,
    ...redditBatches,
    ...gdeltBatches,
    ...hnBatches,
    ...ytBatches,
  ];

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
  ['u-visa-news-last-updated-v2'],
  { revalidate: NEWS_REFRESH_SECONDS, tags: ['news-classify'] },
);

/**
 * Per-source wrappers used by the SSE stream endpoint (`/api/news/stream`)
 * so the client-side loader can observe real per-source completion. Each
 * one runs all of that source's queries and returns the aggregated items.
 * Underlying fetches are cached via `unstable_cache` / `next.revalidate`, so
 * these calls share their result with the main `fetchUVisaNews` aggregator.
 */
export async function fetchAllGoogle(perQueryCap = 30): Promise<NewsItem[]> {
  const batches = await Promise.all(
    FEED_QUERIES.map((q) => fetchOneQuery(q, perQueryCap)),
  );
  return batches.flat();
}

export async function fetchAllReddit(perQueryCap = 15): Promise<NewsItem[]> {
  const batches = await Promise.all(
    REDDIT_QUERIES.map((r) =>
      fetchRedditQuery(r.subreddit, r.query, perQueryCap),
    ),
  );
  return batches.flat();
}

export async function fetchAllGdelt(perQueryCap = 50): Promise<NewsItem[]> {
  const batches = await Promise.all(
    GDELT_QUERIES.map((q) => fetchGdeltQuery(q, perQueryCap)),
  );
  return batches.flat();
}

export async function fetchAllHackerNews(perQueryCap = 20): Promise<NewsItem[]> {
  const queries = ['"U visa"', '"I-918"', '"visa fraud"'];
  const batches = await Promise.all(
    queries.map((q) => fetchHackerNewsQuery(q, perQueryCap)),
  );
  return batches.flat();
}

export async function fetchAllYouTube(perChannelCap = 5): Promise<NewsItem[]> {
  const batches = await Promise.all(
    YOUTUBE_CHANNELS.map((c) => fetchYouTubeChannel(c, perChannelCap)),
  );
  return batches.flat();
}

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
