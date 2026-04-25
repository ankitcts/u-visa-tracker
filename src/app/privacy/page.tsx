import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Notice',
  description:
    'How U Visa Tracker handles requests, analytics, cookies, and any data the site or its embedded services collect.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="prose-page !max-w-none w-full [&>p]:text-justify [&_li]:text-justify space-y-6">
      <header className="not-prose space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Privacy Notice
        </h1>
        <p className="text-muted-foreground w-full text-justify">
          We minimise the data this site collects. Read what we do (and do
          not) keep about you.
        </p>
      </header>

      <h2>What we do not collect</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>We do not ask you to create an account.</li>
        <li>
          We do not collect names, addresses, alien registration numbers,
          A-numbers, receipt numbers, or any other identifying
          immigration data.
        </li>
        <li>
          We do not request or store information about your immigration
          case, your family, or your interactions with law enforcement.
        </li>
        <li>
          We do not sell, rent, or share user data with advertisers or
          data brokers.
        </li>
      </ul>

      <h2>What is collected automatically</h2>
      <p>
        Like most websites, the host platform records standard server log
        information for security and basic operation: IP address, browser
        user-agent, request URL, referrer, and timestamp. These logs are
        kept by the hosting provider for a limited period and are not used
        to identify individuals.
      </p>

      <h2>Analytics</h2>
      <p>
        The site uses{' '}
        <a
          href="https://vercel.com/docs/analytics"
          target="_blank"
          rel="noreferrer"
        >
          Vercel Analytics
        </a>{' '}
        for aggregate traffic measurement. Vercel Analytics is designed to
        be cookie-less and not to track individuals across sites. We use
        it to understand which pages are read and which links are
        clicked.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        The site uses minimal browser storage: a theme preference (light /
        dark), a state for the chatbot widget, and Next.js framework
        cookies required for caching and routing. No advertising,
        retargeting, or tracking cookies are set by us. If advertising is
        introduced in the future via Google AdSense, an additional cookie
        notice will be presented and AdSense&apos;s own privacy practices
        will apply (see{' '}
        <a
          href="https://policies.google.com/technologies/ads"
          target="_blank"
          rel="noreferrer"
        >
          Google&apos;s ads policy
        </a>
        ).
      </p>

      <h2>Chatbot</h2>
      <p>
        The optional chat widget on this site sends your typed prompt to a
        third-party large-language-model provider (currently Groq) over
        encrypted transport. It does not associate your prompt with your
        identity. Do <strong>not</strong> enter personal information,
        immigration case details, or anything you would not want stored
        by a third party. Conversations are not protected by any privilege
        and may be processed and retained by the model provider per its
        own policies. Treat the chatbot as a general explainer, not as
        legal counsel.
      </p>

      <h2>Embedded third-party content</h2>
      <p>
        Some pages embed YouTube videos, link to court records via
        CourtListener, and pull headlines via public RSS / Atom / JSON
        feeds. Loading these may cause your browser to contact the
        third-party server, which may set its own cookies subject to
        that server&apos;s privacy policy.
      </p>

      <h2>Children</h2>
      <p>
        The site is not directed at children under 13. We do not
        knowingly collect data from children. If you believe a child has
        provided information through the chatbot, contact us so we can
        purge the request.
      </p>

      <h2>Your choices</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Block analytics in your browser settings or with extensions like
          uBlock Origin.
        </li>
        <li>
          Avoid the chatbot if you are uncomfortable sending text to a
          third-party model.
        </li>
        <li>
          Use a private / incognito window to limit local-storage
          persistence.
        </li>
      </ul>

      <h2>Changes</h2>
      <p>
        We may update this Privacy Notice as the site changes. Material
        changes will be reflected on this page. See also{' '}
        <Link href="/disclaimer">Legal Disclaimer</Link> and{' '}
        <Link href="/terms">Terms of Use</Link>.
      </p>
    </div>
  );
}
