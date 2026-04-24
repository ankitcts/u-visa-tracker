import { LAST_UPDATED } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { getNewsLastUpdated } from '@/lib/news';

export default async function Footer() {
  const updated = new Date(LAST_UPDATED).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const newsUpdatedIso = await getNewsLastUpdated();
  const newsUpdated = new Date(newsUpdatedIso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return (
    <footer className="border-t bg-card mt-8">
      <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-muted-foreground space-y-3">
        <p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-2 py-0.5 mr-2 text-[10px] font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
          News feed last refreshed {newsUpdated} · refreshes daily. USCIS
          aggregate data last updated {updated}. All figures are aggregate
          statistics published by USCIS and DHS. Individual petitioner
          information is protected by{' '}
          <a
            className="underline hover:text-foreground"
            href="https://www.law.cornell.edu/uscode/text/8/1367"
            target="_blank"
            rel="noreferrer"
          >
            8 U.S.C. § 1367
          </a>{' '}
          and is never displayed here.
        </p>
        <Separator />
        <p>
          This site is not affiliated with USCIS, DHS, or any government
          agency. Nothing on this site constitutes legal advice.
        </p>
      </div>
    </footer>
  );
}
