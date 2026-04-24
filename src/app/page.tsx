import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Newspaper } from 'lucide-react';
import HistoryTimeline from '@/components/HistoryTimeline';
import HistoryNarrator from '@/components/HistoryNarrator';
import HistoryRemotionPlayer from '@/components/HistoryRemotionPlayerLoader';
import { HISTORY } from '@/lib/u-visa-history';
import { TOTAL_DURATION, FPS } from '@/remotion/HistoryVideo';

export const metadata: Metadata = {
  title: 'U Visa Tracker — History of the U Nonimmigrant Visa',
  description:
    'An interactive history of the U nonimmigrant visa: from VAWA 1994 and the Victims of Trafficking and Violence Protection Act of 2000 to the Bona Fide Determination policy and todays quarter-million-case backlog. Read-aloud narration available.',
};

export default function HomePage() {
  const firstYear = Math.min(...HISTORY.map((e) => e.year));
  const lastYear = Math.max(...HISTORY.map((e) => e.year));
  const totalEvents = HISTORY.length;
  const pivotal = HISTORY.filter((e) => e.highlight).length;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-[#fdfbf4] dark:bg-[#2a2824] p-8 md:p-10">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(120,100,60,0.08) 0px, rgba(120,100,60,0.08) 1px, transparent 1px, transparent 32px)',
          }}
        />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] items-start">
          <div className="max-w-3xl space-y-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-semibold inline-flex items-center gap-2">
              <BookOpen className="h-3 w-3" /> Historical Archive · Interactive
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              How the U&nbsp;Visa came to be
            </h1>
            <p
              className="text-base md:text-lg text-foreground/80 leading-relaxed"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Born in the 106th Congress as Title V of the Victims of
              Trafficking and Violence Protection Act of 2000, the U
              nonimmigrant visa was designed so law-enforcement could solve
              more crimes by freeing undocumented victims to come forward.
              Seven years passed before DHS finalized regulations. The cap
              hit for the first time in 2010 and hasn&apos;t reset since. A
              quarter-million petitions now sit in the queue.
            </p>
            <p className="text-sm text-muted-foreground italic max-w-2xl">
              Scroll the timeline — or tap the{' '}
              <span className="font-medium text-foreground">
                &ldquo;Read the history aloud&rdquo;
              </span>{' '}
              button at the bottom to have the program&apos;s story narrated
              to you as you scroll.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                <Newspaper className="h-4 w-4" />
                Live news map
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Stats dashboard
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-3 md:grid-cols-1 gap-3 md:gap-2 text-sm min-w-[160px]">
            <Stat label="Span" value={`${firstYear}–${lastYear}`} />
            <Stat label="Events" value={`${totalEvents}`} />
            <Stat label="Pivotal" value={`${pivotal}`} />
          </dl>
        </div>
      </section>

      {/* Animated history video (Remotion) */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Watch the history
          </h2>
          <p className="text-sm text-muted-foreground">
            A {formatVideoDuration(TOTAL_DURATION / FPS)} narrated
            walk-through of every pivotal moment in the U-visa program.
          </p>
        </div>
        <HistoryRemotionPlayer />
      </section>

      {/* Timeline */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Interactive timeline
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Filter by category. Click a year in the left rail to jump to that
            event. Every event links out to the primary source — the Public
            Law, Federal Register publication, court opinion, or archived
            press coverage. Cards marked{' '}
            <span className="text-[10px] bg-amber-400 text-amber-950 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
              Pivotal
            </span>{' '}
            are turning points.
          </p>
        </div>
        <HistoryTimeline />
      </section>

      {/* Methodology note */}
      <section className="rounded-lg border bg-muted/30 p-5 text-sm text-muted-foreground space-y-2">
        <p>
          <strong className="text-foreground">A note on the archive:</strong>{' '}
          Every entry is a real historical event with a link to the primary
          source. Where you see an &ldquo;archive&rdquo; link, it&apos;s a
          Google News date-restricted search for that era&apos;s coverage —
          not a fabricated headline. We don&apos;t reproduce copyrighted
          newspaper images; instead, the &ldquo;From the archive&rdquo; boxes
          link directly to the Congress.gov bill page, the Federal Register
          notice, the CourtListener opinion, or a dated news search so you
          can read contemporaneous coverage yourself.
        </p>
        <p>
          For the live news map and current program stats, see{' '}
          <Link href="/news" className="text-primary hover:underline">
            /news
          </Link>
          ,{' '}
          <Link href="/dashboard" className="text-primary hover:underline">
            /dashboard
          </Link>
          , and{' '}
          <Link href="/backlog" className="text-primary hover:underline">
            /backlog
          </Link>
          .
        </p>
      </section>

      {/* Floating narrator — client component, uses Web Speech API */}
      <HistoryNarrator />
    </div>
  );
}

function formatVideoDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  if (m >= 10) return `${m}-minute`;
  if (m >= 1) return `${m}m ${s}s`;
  return `${s}-second`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/60 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="font-mono tabular-nums text-lg font-bold">{value}</dd>
    </div>
  );
}
