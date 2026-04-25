import { NextResponse } from 'next/server';
import {
  fetchUVisaNews,
  getNewsLastUpdated,
  NEWS_REFRESH_SECONDS,
} from '@/lib/news';
import { classifyNews } from '@/lib/news-classifier';

/**
 * Snapshot of the live news feed in the same shape the SSR page consumes.
 * Polled by the client every NEWS_REFRESH_SECONDS so visitors see new
 * items without a page reload.
 *
 * Cache-Control: same window as the underlying RSS revalidate, so Vercel
 * CDN absorbs the polling traffic — only one upstream RSS hit per 5 min
 * regardless of how many clients are watching.
 */
export const runtime = 'nodejs';
export const revalidate = NEWS_REFRESH_SECONDS;

export async function GET() {
  const items = await fetchUVisaNews(120);
  const classified = await classifyNews(items);
  const lastUpdated = await getNewsLastUpdated();

  return NextResponse.json(
    {
      items: classified,
      lastUpdated,
      refreshSeconds: NEWS_REFRESH_SECONDS,
    },
    {
      headers: {
        'Cache-Control': `public, s-maxage=${NEWS_REFRESH_SECONDS}, stale-while-revalidate=60`,
      },
    },
  );
}
