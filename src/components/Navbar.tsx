'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ShareButtons from './ShareButtons';

const LINKS = [
  { href: '/', label: 'History' },
  { href: '/u-visa', label: 'U Visa' },
  { href: '/news', label: 'Live News' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/analyze', label: 'Analyze' },
  { href: '/backlog', label: 'Backlog' },
  { href: '/geography', label: 'Geography' },
  { href: '/integrity', label: 'Integrity' },
  { href: '/litigation', label: 'Litigation' },
  { href: '/about', label: 'About' },
  { href: '/sources', label: 'Sources' },
];

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname() ?? '/';
  // Track which link the user just clicked so we can show a spinner on it
  // until Next.js settles the new route. `usePathname` updates once the new
  // server component has streamed in, which clears the pending state.
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    // Pathname has caught up with the click — clear the spinner.
    setPending(null);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground"
          onClick={() => setPending('/')}
        >
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>U Visa Tracker</span>
        </Link>
        <div className="flex items-center gap-3">
        <ul className="flex flex-wrap gap-1 text-sm">
          {LINKS.map((l) => {
            const active = isActive(l.href, pathname);
            const isPending = pending === l.href && !active;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  aria-busy={isPending || undefined}
                  onClick={() => setPending(l.href)}
                  className={cn(
                    'relative inline-flex h-9 items-center gap-1.5 rounded-md px-3 transition-colors',
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    isPending && 'opacity-80',
                  )}
                >
                  {isPending && (
                    <Loader2
                      aria-hidden="true"
                      className="h-3 w-3 animate-spin text-primary"
                    />
                  )}
                  {l.label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute left-3 right-3 -bottom-[13px] h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
          <ShareButtons />
        </div>
      </nav>
    </header>
  );
}
