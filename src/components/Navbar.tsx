'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShieldCheck, Loader2, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ShareButtons from './ShareButtons';

const LINKS = [
  { href: '/', label: 'History' },
  { href: '/u-visa', label: 'U Visa' },
  { href: '/news', label: 'Live News' },
  { href: '/archives', label: 'Archives' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/analyze', label: 'Analyze' },
  { href: '/backlog', label: 'Backlog' },
  { href: '/geography', label: 'Geography' },
  { href: '/integrity', label: 'Integrity' },
  { href: '/litigation', label: 'Litigation' },
];

const FOOTER_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/sources', label: 'Sources' },
];

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname() ?? '/';
  const [pending, setPending] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setPending(null);
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-semibold text-foreground shrink-0"
          onClick={() => setPending('/')}
        >
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline whitespace-nowrap">U Visa Tracker</span>
          <span className="sm:hidden">UVT</span>
        </Link>

        {/* Desktop nav — hidden below md */}
        <ul className="hidden md:flex flex-1 min-w-0 items-center gap-0.5 text-sm overflow-x-auto scrollbar-thin whitespace-nowrap">
          {LINKS.map((l) => {
            const active = isActive(l.href, pathname);
            const isPending = pending === l.href && !active;
            return (
              <li key={l.href} className="shrink-0">
                <Link
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  aria-busy={isPending || undefined}
                  onClick={() => setPending(l.href)}
                  className={cn(
                    'relative inline-flex h-9 items-center gap-1 rounded-md px-2.5 transition-colors',
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
                      className="absolute left-2.5 right-2.5 -bottom-[13px] h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right-side controls — Share + mobile hamburger */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <ShareButtons />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground hover:bg-accent transition-colors"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile drawer — slides down below the header */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-[57px] z-30 bg-background/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-label="Mobile navigation"
            className="md:hidden fixed left-0 right-0 top-[57px] z-40 max-h-[calc(100vh-57px)] overflow-y-auto border-b bg-background shadow-lg"
          >
            <ul className="flex flex-col divide-y">
              {LINKS.map((l) => {
                const active = isActive(l.href, pathname);
                const isPending = pending === l.href && !active;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setPending(l.href)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3.5 text-sm transition-colors',
                        active
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-accent',
                      )}
                    >
                      {isPending && (
                        <Loader2
                          aria-hidden
                          className="h-3.5 w-3.5 animate-spin text-primary shrink-0"
                        />
                      )}
                      <span>{l.label}</span>
                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="border-t py-2">
              <p className="px-4 pb-1 pt-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                More
              </p>
              <ul>
                {FOOTER_LINKS.map((l) => {
                  const active = isActive(l.href, pathname);
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className={cn(
                          'flex items-center gap-2 px-4 py-3 text-sm transition-colors',
                          active
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )}
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
