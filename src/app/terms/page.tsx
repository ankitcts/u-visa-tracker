import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Conditions for using U Visa Tracker — license, attribution, no-warranty, indemnity, and choice of law.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="prose-page !max-w-none w-full [&>p]:text-justify [&_li]:text-justify space-y-6">
      <header className="not-prose space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Terms of Use
        </h1>
        <p className="text-muted-foreground w-full text-justify">
          By using this site you agree to these terms. They are short by
          design.
        </p>
      </header>

      <h2>Permitted use</h2>
      <p>
        You may read, share links to, and quote short excerpts from this
        site for personal, educational, journalistic, or research
        purposes. Please attribute &quot;U Visa Tracker&quot; with a link
        to the page you are quoting. Wholesale republication, scraping,
        framing, or commercial reuse is not permitted without prior
        written consent.
      </p>

      <h2>Prohibited use</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Do not use the site to give legal advice to others or to
          represent yourself as a licensed attorney or accredited
          representative.
        </li>
        <li>
          Do not attempt to identify, link, or de-anonymise any U-visa
          petitioner from data found on this site or via any third-party
          source.
        </li>
        <li>
          Do not attempt to interfere with the site&apos;s operation,
          probe for vulnerabilities, exhaust API quotas, or scrape it at a
          rate likely to disrupt service.
        </li>
        <li>
          Do not use the chatbot to attempt prompt-injection,
          jailbreaking, or to elicit content prohibited by applicable
          law.
        </li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        Site code, custom charts, narrative text, and the &quot;clipping
        aesthetic&quot; CSS treatment are the work of this project&apos;s
        authors. Government-published statistics, hyperlinks, court
        opinions, and Federal Register notices are public records and
        belong to the respective issuing bodies. Image credits and
        licenses are shown alongside each image. News headlines, snippets,
        and thumbnails belong to their original publishers; we display
        them under fair use with a link to the source.
      </p>

      <h2>No warranty, no liability</h2>
      <p>
        The site is provided <strong>&quot;AS IS&quot;</strong> without
        warranty of any kind. To the maximum extent permitted by law, the
        operators of the site disclaim all warranties (express, implied,
        statutory) and shall not be liable for any direct, indirect,
        incidental, consequential, special, exemplary, or punitive
        damages, lost data, lost profits, or business interruption
        arising from your use of, or inability to use, the site or any
        content linked from it.
      </p>

      <h2>Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless the operators of this
        site from any claim, loss, or expense arising out of (a) your use
        of the site, (b) your violation of these terms, (c) your
        violation of any third-party right, or (d) any content you submit
        through the chatbot or any contact form.
      </p>

      <h2>Governing law</h2>
      <p>
        Disputes arising from these terms shall be governed by the laws
        of the State of California, without regard to conflict-of-law
        principles, and shall be resolved exclusively in courts located
        in San Francisco County, California, unless applicable law
        otherwise mandates.
      </p>

      <h2>Termination</h2>
      <p>
        We may withdraw or modify any feature of the site at any time
        without notice. We may also block access from any IP, browser, or
        user we reasonably believe is violating these terms.
      </p>

      <h2>Contact</h2>
      <p>
        Take-down requests for incorrect attributions, copyright
        concerns, or factual corrections may be sent through the
        repository issue tracker linked from the site footer. We endeavour
        to respond promptly but make no service-level commitment.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may be updated. The latest version is the one posted
        on this page. See also{' '}
        <Link href="/disclaimer">Legal Disclaimer</Link> and{' '}
        <Link href="/privacy">Privacy Notice</Link>.
      </p>
    </div>
  );
}
