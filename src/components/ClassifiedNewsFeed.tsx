import { ExternalLink, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchUVisaNews, relativeTime } from '@/lib/news';
import {
  classifyNews,
  TAG_BADGE_VARIANT,
  TAG_LABELS,
  type NewsTag,
} from '@/lib/news-classifier';
import { flagEmoji, countryNote } from '@/lib/geotag';

export default async function ClassifiedNewsFeed({
  limit = 20,
  filter,
}: {
  limit?: number;
  filter?: NewsTag[];
}) {
  const items = await fetchUVisaNews(limit);
  const classified = await classifyNews(items);
  const visible = filter
    ? classified.filter((it) => filter.includes(it.tag))
    : classified;

  const llmActive =
    !!(
      process.env.LLM_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.OPENAI_API_KEY
    );

  if (visible.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          {filter
            ? `No current articles matched the ${filter.map((f) => TAG_LABELS[f]).join(', ')} filter.`
            : 'Live feed unavailable right now — try again later.'}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {!llmActive && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          LLM classifier not configured — set <code>GROQ_API_KEY</code> in
          .env.local to enable auto-tagging.
        </p>
      )}
      <ul className="space-y-2">
        {visible.map((item) => (
          <li key={item.link}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="p-4">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block group space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium group-hover:text-primary inline-flex items-center gap-1.5">
                      {item.country && (
                        <span
                          className="text-lg leading-none align-[-2px]"
                          title={countryNote(item.country)}
                          aria-label={`Country: ${item.country}`}
                        >
                          {flagEmoji(item.country)}
                        </span>
                      )}
                      {item.title}
                      <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                      {relativeTime(item.pubDate)}
                    </span>
                  </div>
                  {item.country && (
                    <p className="text-xs italic text-muted-foreground">
                      {countryNote(item.country)}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                      {item.description.length >= 280 && '…'}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant={TAG_BADGE_VARIANT[item.tag]}>
                      {TAG_LABELS[item.tag]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.source}
                    </span>
                    {item.state && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0 text-[10px] uppercase tracking-wider text-foreground">
                        📍 {item.state}
                      </span>
                    )}
                  </div>
                </a>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
