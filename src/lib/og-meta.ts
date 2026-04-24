/**
 * Open-Graph metadata fetcher. For each article URL, pulls the `og:image`
 * (and where possible, `og:video`) so the news UI can show a real thumbnail
 * and a play badge for articles that embed video.
 *
 * Strategies:
 * 1. Google News RSS wraps links in a redirect (`https://news.google.com/rss/articles/...`).
 *    We follow the redirect to get the real publisher URL.
 * 2. Fetch the publisher HTML once, scan for og:image / og:video / twitter:image
 *    / twitter:player. Extract the thumbnail URL.
 * 3. Cache everything via `unstable_cache` for 6h so we don't hammer publishers.
 */

import { unstable_cache } from 'next/cache';

export interface OgMeta {
  imageUrl: string | null;
  videoUrl: string | null;
  /** Final resolved (non-redirect) URL, for analytics / debugging. */
  resolvedUrl: string | null;
}

const EMPTY: OgMeta = { imageUrl: null, videoUrl: null, resolvedUrl: null };
const FETCH_TIMEOUT_MS = 4000; // shorter so a single slow publisher can't stall the page

async function fetchOgMetaImpl(url: string): Promise<OgMeta> {
  if (!url) return EMPTY;
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        // Some publishers gate on UA; mimic a normal browser.
        'User-Agent':
          'Mozilla/5.0 (compatible; U-Visa-Tracker/1.0; +news-feed-thumbs)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return { ...EMPTY, resolvedUrl: res.url || url };

    // Only parse HTML responses.
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html') && !ct.includes('application/xhtml')) {
      return { ...EMPTY, resolvedUrl: res.url || url };
    }

    // We only need the <head>; bail as soon as we've seen it.
    const text = await res.text();
    const head = text.slice(0, Math.min(text.length, 100_000));

    const imageUrl =
      pickMeta(head, 'og:image:secure_url') ||
      pickMeta(head, 'og:image') ||
      pickMeta(head, 'twitter:image') ||
      pickMeta(head, 'twitter:image:src') ||
      null;
    const videoUrl =
      pickMeta(head, 'og:video:secure_url') ||
      pickMeta(head, 'og:video:url') ||
      pickMeta(head, 'og:video') ||
      pickMeta(head, 'twitter:player:stream') ||
      null;

    return {
      imageUrl: normalize(imageUrl, res.url),
      videoUrl: normalize(videoUrl, res.url),
      resolvedUrl: res.url || url,
    };
  } catch {
    return EMPTY;
  }
}

function pickMeta(html: string, prop: string): string | null {
  // <meta property="og:image" content="...">  OR
  // <meta name="twitter:image" content="...">
  const esc = prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Try property= first, then name=. Attribute order varies.
  const patterns = [
    new RegExp(
      `<meta[^>]*\\s(?:property|name)=["']${esc}["'][^>]*\\scontent=["']([^"']+)["']`,
      'i',
    ),
    new RegExp(
      `<meta[^>]*\\scontent=["']([^"']+)["'][^>]*\\s(?:property|name)=["']${esc}["']`,
      'i',
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeEntities(m[1].trim());
  }
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/');
}

function normalize(url: string | null, base: string): string | null {
  if (!url) return null;
  try {
    return new URL(url, base).toString();
  } catch {
    return null;
  }
}

// Per-URL cache: 6h TTL keeps publishers happy and keeps ~100 page fetches
// out of every visitor's request path. The cache key includes the URL.
export const fetchOgMeta = unstable_cache(
  (url: string) => fetchOgMetaImpl(url),
  ['u-visa-og-meta-v1'],
  { revalidate: 60 * 60 * 6, tags: ['news-og-meta'] },
);

/** Concurrency-limited Promise.all so we don't open 120 sockets at once. */
export async function enrichWithOg<
  T extends {
    link: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
  },
>(items: T[], concurrency = 8): Promise<(T & OgMeta)[]> {
  const out: (T & OgMeta)[] = new Array(items.length);
  let cursor = 0;
  const worker = async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      const src = items[i];
      // Items that already carry imageUrl/videoUrl (e.g. YouTube feed) skip
      // the network fetch — we already have everything we need.
      if (src.imageUrl) {
        out[i] = {
          ...src,
          imageUrl: src.imageUrl,
          videoUrl: src.videoUrl ?? null,
          resolvedUrl: src.link,
        } as T & OgMeta;
        continue;
      }
      const meta = await fetchOgMeta(src.link);
      out[i] = { ...src, ...meta };
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return out;
}
