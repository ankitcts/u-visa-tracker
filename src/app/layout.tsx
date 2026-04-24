import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/theme-provider';
import ChatBot from '@/components/ChatBot';
import FloatingSideNav from '@/components/FloatingSideNav';
import { Analytics } from '@vercel/analytics/react';
import { GradientDots } from '@/components/ui/gradient-dots';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'U Visa Tracker — USCIS I-918 Filings, Approvals & Backlog',
    template: '%s | U Visa Tracker',
  },
  description:
    'Aggregate public statistics on U nonimmigrant visa (Form I-918) filings, approvals, denials, and backlog from USCIS and DHS reports. Individual petitioner details are protected under 8 U.S.C. § 1367 and are never shown.',
  keywords: [
    'U visa',
    'Form I-918',
    'USCIS statistics',
    'U nonimmigrant status',
    'immigration backlog',
    'crime victim visa',
    'bona fide determination',
    '8 USC 1367',
  ],
  authors: [{ name: 'U Visa Tracker' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'U Visa Tracker',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_ID;
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {adsenseClient && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
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
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
            <Footer />
            <ChatBot />
            <FloatingSideNav />
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
