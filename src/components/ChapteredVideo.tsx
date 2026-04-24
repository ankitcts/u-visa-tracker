'use client';

import { useRef, useState } from 'react';
import { Play, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Chapter {
  id: string;
  title: string;
  seconds: number;
}

/**
 * YouTube IFrame API wrapper for a chaptered video experience.
 * Click a chapter → seeks the embedded player via postMessage (no external
 * script needed if we use the enablejsapi flag and the standard command
 * protocol).
 */
export default function ChapteredVideo({
  youtubeId,
  title,
  chapters,
}: {
  youtubeId: string;
  title: string;
  chapters: Chapter[];
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [activeId, setActiveId] = useState<string>(chapters[0]?.id ?? '');

  const seekTo = (seconds: number, id: string) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: 'command',
        func: 'seekTo',
        args: [seconds, true],
      }),
      '*',
    );
    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: 'command',
        func: 'playVideo',
        args: [],
      }),
      '*',
    );
    setActiveId(id);
  };

  return (
    <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
      <div className="aspect-video rounded-lg overflow-hidden border">
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&rel=0`}
          title={title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <Card>
        <CardContent className="p-3 space-y-1">
          <div className="flex items-center gap-2 px-1 pt-1 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Chapters
          </div>
          <ul className="space-y-1">
            {chapters.map((ch) => (
              <li key={ch.id}>
                <button
                  type="button"
                  onClick={() => seekTo(ch.seconds, ch.id)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                    activeId === ch.id
                      ? 'bg-primary/10 text-foreground'
                      : 'hover:bg-accent',
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Play
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        activeId === ch.id
                          ? 'text-primary'
                          : 'text-muted-foreground',
                      )}
                    />
                    <span className="truncate">{ch.title}</span>
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatTime(ch.seconds)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
