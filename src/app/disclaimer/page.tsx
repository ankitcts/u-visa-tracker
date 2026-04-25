import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Legal Disclaimer',
  description:
    'U Visa Tracker is an independent informational project. Nothing on this site is legal advice. Read the full disclaimer.',
  alternates: { canonical: '/disclaimer' },
};

export default function DisclaimerPage() {
  return (
    <div className="prose-page !max-w-none w-full [&>p]:text-justify [&_li]:text-justify space-y-6">
      <header className="not-prose space-y-3">
        <div className="inline-flex items-center gap-2 rounded-md border border-amber-400/60 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5" />
          Read this first
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Legal Disclaimer
        </h1>
        <p className="text-muted-foreground w-full text-justify">
          U Visa Tracker is an independent, non-commercial informational
          project. By accessing or using this website you accept the terms
          below. If you do not agree, do not use the site.
        </p>
      </header>

      <h2>No legal advice</h2>
      <p>
        Nothing on this website constitutes legal advice, immigration
        counsel, or an attorney–client relationship. The site is published
        for general informational purposes only. U-visa eligibility, filing
        strategy, and immigration consequences are highly fact-specific and
        change frequently. Consult a licensed immigration attorney or an
        accredited representative recognized by the U.S. Department of
        Justice (Executive Office for Immigration Review) before acting on
        any information you read here.
      </p>

      <h2>No government affiliation</h2>
      <p>
        This site is <strong>not</strong> affiliated with, endorsed by, or
        sponsored by U.S. Citizenship and Immigration Services (USCIS), the
        Department of Homeland Security (DHS), the U.S. Department of
        Justice, the U.S. Department of State, or any other federal, state,
        local, or tribal government agency. References to government
        agencies, statutes, and reports are made for educational
        attribution only.
      </p>

      <h2>Aggregate data only</h2>
      <p>
        Every figure, chart, and table on this site is an aggregate
        statistic published in public USCIS or DHS reports. We do not
        ingest, host, or display individual U-visa petitioner information.
        Such information is sealed under{' '}
        <a
          href="https://www.law.cornell.edu/uscode/text/8/1367"
          target="_blank"
          rel="noreferrer"
        >
          8 U.S.C. § 1367
        </a>{' '}
        and is never displayed here regardless of whether it appears on
        third-party sites.
      </p>

      <h2>Accuracy and completeness</h2>
      <p>
        We do our best to summarize public reports faithfully and to update
        figures as new USCIS quarterly and DHS annual statistics are
        released. However:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Numbers may be revised by the source agency after publication.
        </li>
        <li>
          Manual transcription from PDF / XLSX source files can introduce
          errors.
        </li>
        <li>
          Charts may lag behind the latest USCIS release while we re-verify.
        </li>
        <li>
          Hyperlinks to outside sources may break or change destination.
        </li>
      </ul>
      <p>
        The site is provided <strong>&quot;AS IS&quot;</strong> and{' '}
        <strong>&quot;AS AVAILABLE&quot;</strong> without warranties of
        any kind, express or implied, including without limitation
        merchantability, fitness for a particular purpose,
        non-infringement, accuracy, or timeliness. To the maximum extent
        permitted by law, the operators of this site disclaim all
        liability for any direct, indirect, incidental, consequential,
        special, exemplary, or punitive damages arising from or relating
        to your use of, or inability to use, this site.
      </p>

      <h2>News aggregation, fair use, and AI-generated tags</h2>
      <p>
        The Live News section displays headlines, deep links, and short
        summaries discovered via public RSS, Atom, and JSON feeds from
        Google News, Reddit, GDELT, Hacker News, YouTube channel feeds,
        and CourtListener. Headline excerpts and links are presented under
        the doctrine of fair use for non-commercial news commentary and
        education; full articles remain the copyright of their respective
        publishers and we link readers back to the original source.
        Categorisations, summaries, geographic tags, and country flags on
        news cards are generated by automated heuristics and large
        language models — they may be incorrect, incomplete, or
        outdated. We do not represent any classification as definitive.
      </p>

      <h2>Litigation, integrity, and case examples</h2>
      <p>
        Landmark cases and federal court opinions are summarised from
        public records (CourtListener, the Federal Reporter, and the
        Federal Register). Case examples on the <Link href="/integrity">Integrity</Link> page
        reproduce USCIS&apos;s own published descriptions of borderline
        filings — these are <strong>not</strong> accusations of fraud or
        wrongdoing against any individual or organisation. The
        site&apos;s &quot;fraud lean&quot; metric is a derived analytic
        and is not a USCIS finding. Nothing on the Litigation or
        Integrity pages should be read as a charge of misconduct against
        any named or unnamed party.
      </p>

      <h2>Public figures</h2>
      <p>
        Names of public officials, judges, legislators, and agency heads
        appear in their official capacities. Inclusion on this site
        carries no implication of endorsement, criticism, or personal
        accusation beyond what is stated in the cited public record.
      </p>

      <h2>Third-party links and content</h2>
      <p>
        We link to external archives, government databases, news outlets,
        court systems, and academic resources for the reader&apos;s
        convenience. We do not control and are not responsible for
        third-party content, advertising, privacy practices, paywalls,
        availability, or accuracy. Linking does not imply endorsement.
      </p>

      <h2>Image credits and licensing</h2>
      <p>
        Images on the History timeline and gallery are sourced from
        Wikimedia Commons (public-domain U.S. federal works or Creative
        Commons), the Library of Congress, or other clearly licensed
        public archives. Each image displays its caption, credit, and
        license. We do not redistribute paywalled or copyrighted
        newspaper scans; the &quot;clipping&quot; visual treatment
        applied via CSS is a stylistic effect on freely-licensed
        photographs.
      </p>

      <h2>No solicitation, no representation</h2>
      <p>
        This site does not solicit clients, accept retainers, prepare
        immigration filings, or hold itself out as a law firm or
        accredited representative. It does not collect personal
        information about the reader&apos;s immigration situation. Any
        chatbot interaction, search query, or bug report sent through
        this site is informational and is not protected by
        attorney–client privilege.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this disclaimer at any time without prior notice.
        Continued use of the site after a change constitutes acceptance
        of the revised terms. See also{' '}
        <Link href="/privacy">Privacy</Link> and{' '}
        <Link href="/terms">Terms of Use</Link>.
      </p>
    </div>
  );
}
