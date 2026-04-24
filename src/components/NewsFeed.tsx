import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { fetchUVisaNews, relativeTime } from '@/lib/news';
import {
  inferCountryFromItem,
  flagEmoji,
  countryNote,
} from '@/lib/geotag';

export default async function NewsFeed({
  limit = 12,
  compact = false,
}: {
  limit?: number;
  compact?: boolean;
}) {
  const items = await fetchUVisaNews(limit);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Live feed unavailable right now — try again later.
      </p>
    );
  }

  return (
    <ul className={compact ? 'space-y-2' : 'space-y-3'}>
      {items.map((item) => {
        const country = inferCountryFromItem(item);
        return compact ? (
          <li
            key={item.link}
            className="border-b pb-2 last:border-0"
          >
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="block group"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-medium group-hover:text-primary">
                  {country && (
                    <span
                      className="mr-1 align-[-1px]"
                      title={countryNote(country)}
                      aria-label={`Country: ${country}`}
                    >
                      {flagEmoji(country)}
                    </span>
                  )}
                  {item.title}
                </h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                  {relativeTime(item.pubDate)}
                </span>
              </div>
              {country && (
                <p className="text-[11px] italic text-muted-foreground mt-0.5">
                  {countryNote(country)}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.source}
              </p>
            </a>
          </li>
        ) : (
          <li key={item.link}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="p-4">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-medium group-hover:text-primary inline-flex items-center gap-1.5">
                      {country && (
                        <span
                          className="text-lg leading-none align-[-2px]"
                          title={countryNote(country)}
                          aria-label={`Country: ${country}`}
                        >
                          {flagEmoji(country)}
                        </span>
                      )}
                      {item.title}
                      <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                      {relativeTime(item.pubDate)}
                    </span>
                  </div>
                  {country && (
                    <p className="text-xs italic text-muted-foreground mt-1">
                      {countryNote(country)}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {item.description}
                      {item.description.length >= 280 && '…'}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.source}
                  </p>
                </a>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
