import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * Nightly refresh hook.
 *
 * Vercel Cron pings this every night per the schedule in vercel.json.
 * It busts the `daily-refresh` tag, which forces the per-route
 * unstable_cache entries in `src/lib/refresh.ts` to regenerate on the
 * next request — so the "Last updated" pill shows the actual time the
 * cache was refreshed, not whenever the page was first hit.
 *
 * Vercel Cron requests carry an `Authorization: Bearer <CRON_SECRET>`
 * header (when CRON_SECRET is set in the project env). Manual hits with
 * the same token are also allowed for testing.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  // Next 16 requires a cache profile name; "max" forces immediate revalidation.
  revalidateTag('daily-refresh', 'max');

  return NextResponse.json({
    ok: true,
    refreshedAt: new Date().toISOString(),
    revalidatedTag: 'daily-refresh',
  });
}
