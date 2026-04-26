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
// The route MUST re-run on every poll, otherwise Vercel's edge cache
// serves the same snapshot for the whole revalidate window and the
// client's "Next refresh in 0s" countdown ticks against frozen data.
// Underlying RSS / classifier work is still cached inside lib/news.ts
// via unstable_cache (5 min), so re-running this route is cheap — it
// just re-reads the cached values + re-stamps `lastUpdated`.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
      // No CDN caching — every poll must reach the route handler so the
      // server-side `lastUpdated` actually advances. The route itself is
      // cheap because the data dependencies are cached at the lib layer.
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
      },
    },
  );
}
