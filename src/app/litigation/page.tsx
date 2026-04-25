import type { Metadata } from 'next';
import LastUpdatedPill from '@/components/LastUpdatedPill';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Scale, Clock } from 'lucide-react';
import {
  LANDMARK_CASES,
  fetchRecentLitigation,
  CASE_TYPE_LABEL,
  CASE_TYPE_VARIANT,
} from '@/lib/litigation';

export const metadata: Metadata = {
  title: 'U Visa Litigation — Landmark Cases & Live Court Filings',
  description:
    'Landmark U-visa litigation — class actions on backlog delays, mandamus suits, substantial-similarity appeals, and USCIS policy responses. Supplemented by a live CourtListener feed.',
  alternates: { canonical: '/litigation' },
};

export const revalidate = 3600 * 6;

export default async function LitigationPage() {
  const recent = await fetchRecentLitigation(10);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary">Legal</Badge>
          <LastUpdatedPill routeKey="litigation" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          U Visa Litigation
        </h1>
        <p className="text-muted-foreground w-full text-justify">
          Courts have shaped U-visa administration in three ways: class
          actions against backlog inaction, individual mandamus suits
          forcing adjudication, and appellate decisions interpreting what
          crimes qualify as &quot;substantially similar&quot; under the
          statute. Below: curated landmark cases + a live feed of recent
          federal opinions mentioning U-visa filings, via{' '}
          <a
            href="https://www.courtlistener.com"
            className="text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            CourtListener
          </a>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Landmark cases &amp; policy shifts</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {LANDMARK_CASES.map((c) => (
            <Card key={c.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Scale className="h-4 w-4 text-primary shrink-0" />
                      <span>{c.title}</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.court} · {c.year}
                      {c.citation && ` · ${c.citation}`}
                    </p>
                  </div>
                  <Badge variant={CASE_TYPE_VARIANT[c.type]}>
                    {CASE_TYPE_LABEL[c.type]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                <p className="text-sm">{c.summary}</p>
                <div className="border-l-2 border-emerald-400/60 pl-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Outcome
                  </div>
                  <p className="text-sm text-foreground/90">{c.outcome}</p>
                </div>
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Read the record
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">
            Recent federal opinions mentioning U visa
          </h2>
          <span className="text-xs text-muted-foreground">
            Refreshed every 6 hours · CourtListener
          </span>
        </div>
        {recent.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Live CourtListener feed unavailable right now. Direct search:{' '}
              <a
                className="text-primary hover:underline"
                href="https://www.courtlistener.com/?q=%22U+visa%22&type=o"
                target="_blank"
                rel="noreferrer"
              >
                CourtListener U-visa opinions →
              </a>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {recent.map((op) => (
              <li key={op.absoluteUrl}>
                <Card className="transition-colors hover:border-primary/40">
                  <CardContent className="p-4">
                    <a
                      href={op.absoluteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block group space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-medium group-hover:text-primary inline-flex items-center gap-1.5">
                          {op.caseName}
                          <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {op.dateFiled}
                        </span>
                      </div>
                      {op.snippet && (
                        <p className="text-sm text-muted-foreground">
                          …{op.snippet}…
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <Badge variant="outline">{op.court}</Badge>
                        {op.citation && (
                          <span className="text-xs text-muted-foreground">
                            {op.citation}
                          </span>
                        )}
                      </div>
                    </a>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="prose-page !max-w-none w-full [&>p]:text-justify">
        <h2>What this page is not</h2>
        <p>
          This is <strong>not</strong> legal advice, and the cases listed are
          not exhaustive. The U-visa litigation docket is active across
          every federal circuit, particularly in individual mandamus
          actions. Nothing here identifies any individual U-visa petitioner
          — landmark cases are public record; individual petitioners filing
          mandamus actions frequently do so under pseudonym or sealed
          caption to protect § 1367 confidentiality.
        </p>
      </section>
    </div>
  );
}
