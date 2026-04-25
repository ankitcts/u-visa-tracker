import type { Metadata } from 'next';
import Link from 'next/link';
import { Archive } from 'lucide-react';
import ArchiveSearchPanel from '@/components/ArchiveSearchPanel';
import LastUpdatedPill from '@/components/LastUpdatedPill';
import AdSenseSlot from '@/components/AdSenseSlot';

export const metadata: Metadata = {
  title: 'Archive Search — Newspapers, Federal Register, Court Opinions',
  description:
    'One-click pre-built searches across 17 free and subscription archives covering U-visa history (1994–present): Newspapers.com, NewspaperArchive, ProQuest Historical, Internet Archive, Chronicling America, Federal Register, Congress.gov, CourtListener, GovInfo, and more.',
  alternates: { canonical: '/archives' },
};

export default function ArchivesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-semibold tracking-tight inline-flex items-center gap-2">
            <Archive className="h-6 w-6 text-primary" />
            Archive Search
          </h1>
          <LastUpdatedPill routeKey="archives" />
        </div>
        <p className="text-muted-foreground max-w-3xl">
          Pre-built searches into every major newspaper, government, and
          court archive that covers the U-visa era. Filter by access tier
          (free / paid / library card), switch between
          &ldquo;by source&rdquo; and &ldquo;by event&rdquo; views, and
          deep-link straight into the archive&apos;s own search UI.
        </p>
        <p className="text-xs text-muted-foreground max-w-3xl">
          For the program&apos;s own timeline see{' '}
          <Link href="/" className="text-primary hover:underline">
            History
          </Link>
          ; for live coverage see{' '}
          <Link href="/news" className="text-primary hover:underline">
            Live News
          </Link>
          ; for our own data sources see{' '}
          <Link href="/sources" className="text-primary hover:underline">
            Sources
          </Link>
          .
        </p>
      </header>

      <ArchiveSearchPanel />

      <AdSenseSlot slot="1234567892" />
    </div>
  );
}
