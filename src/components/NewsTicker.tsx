import { Radio } from 'lucide-react';
import { fetchUVisaNews, relativeTime } from '@/lib/news';

/**
 * Auto-scrolling marquee ticker of the latest U-visa headlines.
 * CSS-only animation — no JS or motion lib needed. Pauses on hover.
 *
 * Inspired by 21st.dev community "Marquee" pattern.
 */
export default async function NewsTicker({ limit = 10 }: { limit?: number }) {
  const items = await fetchUVisaNews(limit);
  if (items.length === 0) return null;

  return (
    <div className="group relative overflow-hidden rounded-md border bg-card">
      {/* Scrolling lane — leaves room on the left for the fixed pill. */}
      <div className="flex gap-10 whitespace-nowrap py-3 pl-[120px] pr-4 animate-marquee group-hover:[animation-play-state:paused]">
        {[...items, ...items].map((item, idx) => (
          <a
            key={`${item.link}-${idx}`}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="text-sm hover:text-primary inline-flex items-center gap-2"
          >
            <span>{item.title}</span>
            <span className="text-xs text-muted-foreground">
              · {item.source} · {relativeTime(item.pubDate)}
            </span>
          </a>
        ))}
      </div>
      {/* LIVE pill anchored to the left, with a wider gradient fade-out so
          the scrolling text never visibly overlaps the label. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center"
        aria-hidden
      >
        <span className="h-full w-[140px] bg-gradient-to-r from-card via-card to-transparent" />
      </div>
      <div className="absolute inset-y-0 left-0 z-30 flex items-center gap-1.5 pl-3 pr-2">
        <Radio className="h-4 w-4 text-destructive animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
          Live
        </span>
      </div>
    </div>
  );
}
