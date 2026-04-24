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
    <div className="group relative overflow-hidden border-y bg-card">
      <div className="flex items-center gap-2 absolute top-0 bottom-0 left-0 px-4 bg-gradient-to-r from-card via-card to-transparent z-10">
        <Radio className="h-4 w-4 text-destructive animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          Live
        </span>
      </div>
      <div className="flex gap-10 whitespace-nowrap py-3 animate-marquee group-hover:[animation-play-state:paused] pl-28">
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
    </div>
  );
}
