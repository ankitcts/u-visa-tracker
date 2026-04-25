/**
 * Renders JSON-LD structured data for the site (Organization + WebSite).
 * Helps Google understand the site identity and surface a sitelinks
 * search box. Site-wide; mounted in the root layout.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://uvisatracker.com';

export default function SiteJsonLd() {
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'U Visa Tracker',
      alternateName: 'UVT',
      url: SITE_URL,
      description:
        'Aggregate public statistics, history, and live news on the U nonimmigrant visa (Form I-918).',
      publisher: { '@type': 'Organization', name: 'U Visa Tracker' },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/news?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'en-US',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'U Visa Tracker',
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      sameAs: ['https://github.com/ankitcts/u-visa-tracker'],
    },
  ];

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
