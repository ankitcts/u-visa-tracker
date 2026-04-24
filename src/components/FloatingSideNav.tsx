'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Info, BookOpen, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Floating secondary-nav widget docked to the left edge of the viewport.
 * Collapsed by default to a thin tab; expands to reveal the About + Sources
 * links so the main Navbar can stay on one line.
 */
const ITEMS = [
  { href: '/about', label: 'About', Icon: Info },
  { href: '/sources', label: 'Sources', Icon: BookOpen },
];

export default function FloatingSideNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-30 hidden md:block">
      <div className="relative">
        {/* Collapsed tab */}
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open secondary navigation"
            className="group inline-flex flex-col items-center gap-1 rounded-r-lg border border-l-0 bg-background/90 backdrop-blur px-1.5 py-3 shadow-md hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground"
              style={{ writingMode: 'vertical-rl' }}
            >
              More
            </span>
          </button>
        )}

        {/* Expanded panel */}
        {open && (
          <div className="rounded-r-lg border border-l-0 bg-background/95 backdrop-blur shadow-lg min-w-[140px] py-1">
            <div className="flex items-center justify-between px-3 py-1.5 border-b">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Secondary
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="py-1">
              {ITEMS.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors',
                    )}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
