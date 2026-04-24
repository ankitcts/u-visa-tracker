import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DATA_SOURCES } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Data Sources',
  description:
    'Official government sources used to compile U visa aggregate statistics — USCIS quarterly data, DHS OHSS yearbooks, and Ombudsman reports.',
};

export default function SourcesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Data Sources</h1>
      <p className="text-muted-foreground max-w-3xl">
        Every figure on this site is drawn from publicly published government
        reports. Individual petitioner information is legally protected under
        8 U.S.C. § 1367 and is not part of any of these sources.
      </p>

      <ul className="space-y-3">
        {DATA_SOURCES.map((s) => (
          <li key={s.id}>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-base">{s.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{s.agency}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="warning">{s.cadence}</Badge>
                    <Badge variant="success">{s.format}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {s.url}
                </a>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <section className="prose-page">
        <h2>What is NOT available and why</h2>
        <p>
          The following are{' '}
          <strong>not published and cannot be obtained via FOIA</strong>:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Names or any identifying information of U visa petitioners</li>
          <li>Specific crime details of any individual petition</li>
          <li>City or state where the qualifying crime occurred</li>
          <li>Country of citizenship of individual petitioners</li>
          <li>
            Which law enforcement agency issued the I-918B certification for
            any particular case
          </li>
        </ul>
        <p>
          All of this is sealed under{' '}
          <a
            href="https://www.law.cornell.edu/uscode/text/8/1367"
            target="_blank"
            rel="noreferrer"
          >
            8 U.S.C. § 1367
          </a>{' '}
          to protect crime victims from retaliation.
        </p>
      </section>
    </div>
  );
}
