import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import IntegritySignalCard from '@/components/IntegritySignalCard';
import CategoryBarChart from '@/components/CategoryBarChart';
import FraudLeanChart from '@/components/FraudLeanChart';
import {
  INTEGRITY_SIGNALS,
  CASE_EXAMPLES,
  CASE_OUTCOME_FUNNEL,
  HELPFULNESS_EVIDENCE,
  HELPFULNESS_TYPES,
  computeFraudLean,
  fraudLeanLabel,
  NATIONAL_FA_LEAN,
} from '@/lib/integrity';
import OutcomeFunnel from '@/components/OutcomeFunnel';
import { Scale, Gavel } from 'lucide-react';
import { STATE_CERT_SHARES } from '@/lib/data';
import ClassifiedNewsFeed from '@/components/ClassifiedNewsFeed';

export const metadata: Metadata = {
  title: 'Program Integrity & Concerns — USCIS-Reported Signals',
  description:
    'USCIS-reported program-integrity signals for the U visa: rising share of likely ineligible filings, missing certification fields, case examples. All figures from the 2020 USCIS Trends Report.',
};

export const revalidate = 3600;

export default function IntegrityPage() {
  const feloniousBreakdown = [
    { label: 'Clear felonious assault (checkbox)', share: 34 },
    { label: 'Likely-qualifying via "Other" box', share: 9 },
    { label: 'Likely non-qualifying via "Other" box', share: 13 },
  ];

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <Badge variant="warning">USCIS-reported</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Program Integrity &amp; Concerns
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          The only data on this page comes from USCIS&apos;s own 2020 research
          report on the U-visa program. USCIS calls these &quot;fraud and
          benefit-integrity concerns&quot; and describes many of the filings
          as &quot;<em>likely</em> ineligible,&quot; not confirmed fraud. We
          preserve that framing — no allegations, only the agency&apos;s
          published observations.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Signal summary</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {INTEGRITY_SIGNALS.map((s) => (
            <IntegritySignalCard key={s.id} signal={s} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Felonious-assault category breakdown
        </h2>
        <p className="text-muted-foreground max-w-3xl text-sm">
          Of all I-918B certifications naming felonious assault (46% of the
          total), here is how USCIS subdivided them during manual review.
          The &quot;likely non-qualifying&quot; slice rose from ~9% to ~21%
          of the felonious-assault category between FY2012 and FY2018.
        </p>
        <Card>
          <CardContent className="p-6">
            <CategoryBarChart
              items={feloniousBreakdown}
              color="rgba(239, 68, 68, 0.8)"
              max={40}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Where the concern is concentrated — state-by-state fraud lean
        </h2>
        <p className="text-muted-foreground max-w-3xl text-sm">
          <strong>Fraud lean</strong> is a derived metric, not a USCIS
          finding. It expresses the share of a state&apos;s certifications
          that fall into <em>felonious assault</em> versus{' '}
          <em>domestic violence</em> — the two largest crime categories. A
          higher lean means a larger fraction of that state&apos;s filings
          sit in the crime category USCIS flagged for rising
          likely-ineligible filings (the 9%→21% trend above). National
          average ≈ {(NATIONAL_FA_LEAN * 100).toFixed(0)}%.
        </p>
        <Card>
          <CardContent className="p-6">
            <FraudLeanChart states={STATE_CERT_SHARES} />
          </CardContent>
        </Card>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {[...STATE_CERT_SHARES]
            .map((s) => ({ state: s.state, lean: computeFraudLean(s) }))
            .filter(
              (x): x is { state: string; lean: number } => x.lean !== null,
            )
            .sort((a, b) => b.lean - a.lean)
            .map((x) => {
              const pct = x.lean * 100;
              const variant: 'destructive' | 'warning' | 'secondary' =
                pct >= 60 ? 'destructive' : pct >= 50 ? 'warning' : 'secondary';
              return (
                <Card key={x.state}>
                  <CardContent className="p-3 flex flex-col gap-1">
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium">{x.state}</span>
                      <Badge variant={variant}>{pct.toFixed(0)}%</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {fraudLeanLabel(x.lean)}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
        </div>
        <p className="text-xs text-muted-foreground max-w-3xl">
          <strong>Caveat:</strong> a high FA lean does not mean a state has
          more fraud. Differences reflect variance in state criminal codes
          (e.g. assault-statute definitions) and certifying practices. The
          metric just points to where USCIS&apos;s own flagged category is
          more concentrated, which is where scrutiny would be
          disproportionately applied.
        </p>
      </section>

      {/* Case outcome funnel */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Case outcome funnel</h2>
        <p className="text-muted-foreground max-w-3xl text-sm">
          How many petitions translated into arrests, prosecutions, and
          convictions. Stages are not mutually exclusive — a single case
          can have multiple outcomes. Source: USCIS Trends Report §Arrests,
          Convictions.
        </p>
        <Card>
          <CardContent className="p-6">
            <OutcomeFunnel steps={CASE_OUTCOME_FUNNEL} />
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground max-w-3xl">
          Attrition from 59% arrest → 27% conviction is consistent with
          general criminal-justice attrition. USCIS does not require
          conviction for U-1 approval; the statutory standard is that the
          petitioner was, is, or is likely to be helpful.
        </p>
      </section>

      {/* Helpfulness breakdown */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">How petitioners showed helpfulness</h2>
        <p className="text-muted-foreground max-w-3xl text-sm">
          USCIS reviewed what helpfulness looked like for each petition.
          Multi-mode helpfulness (reporting + evidence + identification +
          testimony) declined ~20% across FY2012–FY2018, while
          report-only helpfulness rose — a trend USCIS flagged as a thinner
          helpfulness profile on newer filings.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {HELPFULNESS_EVIDENCE.map((item) => (
            <Card key={item.label}>
              <CardContent className="p-5 space-y-2">
                <div className="text-3xl font-semibold tabular-nums">
                  {item.share}%
                </div>
                <div className="font-medium">{item.label}</div>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Types of helpfulness evidence</CardTitle>
            <p className="text-xs text-muted-foreground">
              The categories USCIS looks for in the file review.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {HELPFULNESS_TYPES.map((t) => (
                <li key={t.name} className="border-l-2 border-primary/40 pl-3">
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.description}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Case examples from the USCIS report
        </h2>
        <p className="text-muted-foreground max-w-3xl text-sm">
          USCIS included the following examples to illustrate filings that
          may not clearly meet the statutory qualifying-crime definition.
          These are <strong>not</strong> accusations — they are the report&apos;s
          own text. They help convey the kinds of submissions USCIS flagged.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {CASE_EXAMPLES.map((ex) => (
            <Card key={ex.id}>
              <CardHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base">{ex.crimeType}</CardTitle>
                  <Badge variant="warning">Borderline</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    USCIS summary
                  </div>
                  <p className="text-sm text-foreground">{ex.summary}</p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Ineligibility concern
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    {ex.ineligibilityConcern}
                  </p>
                </div>
                {ex.legalAnalysis && (
                  <div className="border-l-2 border-primary/60 pl-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                      <Scale className="h-3 w-3" /> Legal analysis
                    </div>
                    <p className="text-sm text-foreground/90">
                      {ex.legalAnalysis}
                    </p>
                  </div>
                )}
                {ex.statutoryReference && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Gavel className="h-3 w-3" /> {ex.statutoryReference}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">
            Live news: policy and integrity signals
          </h2>
          <span className="text-xs text-muted-foreground">
            Auto-classified by LLM · hourly refresh
          </span>
        </div>
        <p className="text-muted-foreground max-w-3xl text-sm">
          The feed below is filtered from the general news pipeline and
          auto-tagged into <em>policy change</em>, <em>litigation</em>,
          <em> fraud concern</em>, <em>data report</em>, and{' '}
          <em>commentary</em>. When no LLM key is configured, all articles
          appear as &quot;general&quot;.
        </p>
        <ClassifiedNewsFeed filter={['fraud-concern', 'litigation', 'policy-change']} />
      </section>

      <section className="prose-page">
        <h2>Important caveats</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            None of the figures above should be read as &quot;X% of U-visa
            filings are fraud.&quot; USCIS&apos;s own framing is &quot;likely
            ineligible&quot; or &quot;integrity concerns.&quot;
          </li>
          <li>
            The largest signals (felonious-assault category misuse) are
            explained by state-to-state variance in statutes and by
            certifying officials using the &quot;Other&quot; box when
            uncertain — not necessarily by deliberate fraud.
          </li>
          <li>
            The 2020 Trends Report is the most recent USCIS research on this
            topic. No comparable 2021+ analysis has been published as of
            April 2026.
          </li>
          <li>
            All figures are aggregate. No individual petitioner is named,
            located, or identified anywhere on this site (8 U.S.C. § 1367).
          </li>
        </ul>
      </section>
    </div>
  );
}
