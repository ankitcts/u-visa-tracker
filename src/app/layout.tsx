import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import SiteJsonLd from '@/components/SiteJsonLd';
import { ThemeProvider } from '@/components/theme-provider';
import ChatBot from '@/components/ChatBot';
import FloatingSideNav from '@/components/FloatingSideNav';
import { Analytics } from '@vercel/analytics/react';
import { GradientDots } from '@/components/ui/gradient-dots';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const SITE_URL_FALLBACK = 'https://uvisatracker.com';
const SITE_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return SITE_URL_FALLBACK;
  try {
    return new URL(raw).toString().replace(/\/$/, '');
  } catch {
    return SITE_URL_FALLBACK;
  }
})();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'U Visa Tracker — USCIS I-918 Filings, Approvals & Backlog',
    template: '%s | U Visa Tracker',
  },
  description:
    'Aggregate public statistics, history, and live news on the U nonimmigrant visa (Form I-918) — filings, approvals, denials, and the multi-decade backlog. Individual petitioner details are protected under 8 U.S.C. § 1367 and are never shown.',
  applicationName: 'U Visa Tracker',
  generator: 'Next.js',
  category: 'Reference',
  keywords: [
    'U visa',
    'Form I-918',
    'I-918B certification',
    'USCIS statistics',
    'U nonimmigrant status',
    'U visa backlog',
    'immigration data',
    'crime victim visa',
    'bona fide determination',
    'BFD',
    '8 USC 1367',
    'TVPA 2000',
    'VAWA',
  ],
  authors: [{ name: 'U Visa Tracker' }],
  creator: 'U Visa Tracker',
  publisher: 'U Visa Tracker',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'U Visa Tracker',
    title: 'U Visa Tracker — USCIS I-918 Filings, Approvals & Backlog',
    description:
      'Aggregate public statistics, history, and live news on the U nonimmigrant visa.',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'U Visa Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'U Visa Tracker',
    description:
      'Aggregate public statistics, history, and live news on the U nonimmigrant visa.',
    images: ['/icon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_ID;
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="canonical" href={SITE_URL} />
        {adsenseClient && (
          <meta name="google-adsense-account" content={adsenseClient} />
        )}
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
            <GradientDots duration={40} />
          </div>
          <div className="relative">
            <DisclaimerBanner />
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
            <Footer />
            <ChatBot />
            <FloatingSideNav />
          </div>
          <Analytics />
        </ThemeProvider>
        <SiteJsonLd />
        {adsenseClient && (
          <Script
            id="adsbygoogle-init"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}
