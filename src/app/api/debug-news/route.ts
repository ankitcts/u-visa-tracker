import { NextResponse } from 'next/server';
import { fetchUVisaNews } from '@/lib/news';
import { classifyNews } from '@/lib/news-classifier';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await fetchUVisaNews(120);
  const classified = await classifyNews(items);
  const withState = classified.filter((c) => c.state);
  return NextResponse.json({
    totalFetched: items.length,
    totalClassified: classified.length,
    withState: withState.length,
    stateBreakdown: Object.fromEntries(
      Object.entries(
        classified.reduce<Record<string, number>>((acc, c) => {
          const key = c.state ?? 'null';
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {}),
      ).sort((a, b) => b[1] - a[1]),
    ),
    sample: classified.slice(0, 20).map((c) => ({
      title: c.title,
      source: c.source,
      tag: c.tag,
      state: c.state,
      country: c.country,
    })),
    countryBreakdown: Object.fromEntries(
      Object.entries(
        classified.reduce<Record<string, number>>((acc, c) => {
          const k = c.country ?? 'null';
          acc[k] = (acc[k] ?? 0) + 1;
          return acc;
        }, {}),
      ).sort((a, b) => b[1] - a[1]),
    ),
  });
}
