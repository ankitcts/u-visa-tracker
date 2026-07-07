import Link from 'next/link';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { LAST_UPDATED } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { getNewsLastUpdated } from '@/lib/news';

const FOOTER_SECTIONS: {
  label: string;
  links: { href: string; label: string }[];
}[] = [
  {
    label: 'Explore',
    links: [
      { href: '/', label: 'History' },
      { href: '/u-visa', label: 'U Visa overview' },
      { href: '/news', label: 'Live news' },
      { href: '/dashboard', label: 'Dashboard' },
    ],
  },
  {
    label: 'Data',
    links: [
      { href: '/analyze', label: 'Analyze' },
      { href: '/backlog', label: 'Backlog' },
      { href: '/geography', label: 'Geography' },
      { href: '/integrity', label: 'Integrity' },
      { href: '/litigation', label: 'Litigation' },
    ],
  },
  {
    label: 'About',
    links: [
      { href: '/about', label: 'About this site' },
      { href: '/faq', label: 'FAQ' },
      { href: '/sources', label: 'Sources & methodology' },
      { href: '/archives', label: 'Archive search' },
    ],
  },
  {
    label: 'Legal',
    links: [
      { href: '/disclaimer', label: 'Disclaimer' },
      { href: '/privacy', label: 'Privacy notice' },
      { href: '/terms', label: 'Terms of use' },
    ],
  },
];

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
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-card mt-8">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Prominent legal banner — visible on every page */}
        <div className="rounded-md border border-amber-400/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-amber-900 dark:text-amber-100">
            <strong className="uppercase tracking-wider">
              Not legal advice ·
            </strong>{' '}
            This site is an independent informational project and is not
            affiliated with USCIS, DHS, or any government agency. Nothing
            here constitutes legal advice or creates an attorney-client
            relationship. Consult a licensed immigration attorney before
            acting on any information you read here. Read the full{' '}
            <Link
              href="/disclaimer"
              className="font-semibold underline hover:text-amber-700 dark:hover:text-amber-200"
            >
              Disclaimer
            </Link>{' '}
            ·{' '}
            <Link
              href="/privacy"
              className="font-semibold underline hover:text-amber-700 dark:hover:text-amber-200"
            >
              Privacy
            </Link>{' '}
            ·{' '}
            <Link
              href="/terms"
              className="font-semibold underline hover:text-amber-700 dark:hover:text-amber-200"
            >
              Terms
            </Link>
            .
          </div>
        </div>

        {/* Link columns */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 text-sm">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.label}>
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-2">
                {section.label}
              </h3>
              <ul className="space-y-1">
                {section.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-foreground/80 hover:text-primary hover:underline underline-offset-4"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground space-y-3">
          <p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-2 py-0.5 mr-2 text-[10px] font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
            News feed last refreshed {newsUpdated} · refreshes every 5 min. USCIS
            aggregate data last updated {updated} · refreshes daily.
          </p>
          <p>
            All figures shown are aggregate statistics published by USCIS
            and DHS in their public reports. Individual U-visa petitioner
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
          <p className="flex items-start gap-2">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Live news is aggregated from public RSS / Atom / JSON feeds
              (Google News, Reddit, GDELT, Hacker News, YouTube,
              CourtListener) and tagged automatically by an AI classifier.
              Headlines, snippets, and thumbnails belong to their original
              publishers; we link readers to the source. AI-generated tags
              may be incorrect.
            </span>
          </p>
          <p>
            © {year} U Visa Tracker · Provided AS-IS without warranty ·
            Built with public data · Source on{' '}
            <a
              href="https://github.com/ankitcts/u-visa-tracker"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
