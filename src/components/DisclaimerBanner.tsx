import Link from 'next/link';
import { Info } from 'lucide-react';

/**
 * Slim disclaimer that renders site-wide above the main content. Reminds
 * every reader (a) this is not legal advice, (b) we are not USCIS, and
 * (c) where to read the full terms.
 */
export default function DisclaimerBanner() {
  return (
    <div
      role="note"
      className="border-b bg-muted/40 text-[11px] sm:text-xs text-muted-foreground"
    >
      <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center gap-2">
        <Info className="h-3 w-3 shrink-0" aria-hidden />
        <span className="leading-tight min-w-0 flex-1 truncate sm:whitespace-normal sm:truncate-none">
          <strong className="text-foreground uppercase tracking-wider">
            Not legal advice
          </strong>
          <span className="hidden sm:inline">
            {' '}· Independent project, not affiliated with USCIS or DHS
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/disclaimer"
            className="hover:text-foreground hover:underline underline-offset-4"
          >
            Disclaimer
          </Link>
          <span aria-hidden className="text-muted-foreground/60">·</span>
          <Link
            href="/privacy"
            className="hover:text-foreground hover:underline underline-offset-4"
          >
            Privacy
          </Link>
          <span aria-hidden className="hidden xs:inline text-muted-foreground/60">·</span>
          <Link
            href="/terms"
            className="hidden xs:inline hover:text-foreground hover:underline underline-offset-4"
          >
            Terms
          </Link>
        </span>
      </div>
    </div>
  );
}
