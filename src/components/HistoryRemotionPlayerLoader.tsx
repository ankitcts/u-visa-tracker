'use client';

import dynamic from 'next/dynamic';

const HistoryRemotionPlayer = dynamic(
  () => import('./HistoryRemotionPlayer'),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border w-full aspect-video bg-muted/40 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading video…</p>
      </div>
    ),
  },
);

export default function HistoryRemotionPlayerLoader() {
  return <HistoryRemotionPlayer />;
}
