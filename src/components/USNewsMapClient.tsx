'use client';

import dynamic from 'next/dynamic';
import type { ClassifiedNewsItem } from '@/lib/news-classifier';
import type { StateCertShare } from '@/lib/types';

const USNewsMap = dynamic(() => import('./USNewsMap'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden aspect-[980/560] flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading map…</p>
    </div>
  ),
});

export default function USNewsMapClient({
  news,
  lastUpdated,
  stateShares,
}: {
  news: ClassifiedNewsItem[];
  lastUpdated?: string;
  stateShares: StateCertShare[];
}) {
  return <USNewsMap news={news} lastUpdated={lastUpdated} stateShares={stateShares} />;
}
