import { PlaySquare, Search } from 'lucide-react';

export default function VideoEmbed({
  youtubeId,
  title,
  searchQuery,
}: {
  youtubeId?: string;
  title: string;
  searchQuery?: string;
}) {
  if (!youtubeId) {
    const href = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      searchQuery ?? title,
    )}`;
    return (
      <div className="aspect-video rounded-lg border border-dashed bg-muted/30 flex items-center justify-center text-center p-6">
        <div className="space-y-2">
          <PlaySquare className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium">Video placeholder</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Add a verified YouTube video ID for this section in{' '}
            <code className="px-1 bg-muted rounded">src/lib/categories.ts</code>.
          </p>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Search className="h-3 w-3" />
            Search YouTube for &ldquo;{title}&rdquo;
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="aspect-video rounded-lg overflow-hidden border">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
          title={title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p className="text-[10px] text-muted-foreground/80 leading-tight">
        Source:{' '}
        <a
          href={`https://www.youtube.com/watch?v=${youtubeId}`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-foreground"
        >
          YouTube
        </a>
        . Embedded under{' '}
        <a
          href="https://www.youtube.com/static?template=terms"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-foreground"
        >
          YouTube&apos;s Terms of Service
        </a>
        . Not hosted on this site.
      </p>
    </div>
  );
}
