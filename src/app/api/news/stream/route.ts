/**
 * Server-Sent Events stream of real fetch progress for the /news loader.
 *
 * The client's <NewsFetchProgress> opens an EventSource against this route.
 * Each time a source's fetch resolves we push one SSE event; when the
 * classifier completes we push a `classify:done` event; when all enrichment
 * stages finish we push `done`. Underlying fetches are cached via
 * next.revalidate / unstable_cache, so these calls share state with the
 * main page-level fetch and are effectively free when the page resolves
 * simultaneously.
 */
import {
  fetchAllGoogle,
  fetchAllReddit,
  fetchAllGdelt,
  fetchAllHackerNews,
  fetchAllYouTube,
} from '@/lib/news';
import { classifyNews } from '@/lib/news-classifier';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface StreamEvent {
  kind:
    | 'source:start'
    | 'source:done'
    | 'source:error'
    | 'classify:start'
    | 'classify:done'
    | 'enrich:done'
    | 'done';
  key?: string;
  count?: number;
  durationMs?: number;
  total?: number;
}

export async function GET() {
  const encoder = new TextEncoder();
  const send = (
    controller: ReadableStreamDefaultController<Uint8Array>,
    data: StreamEvent,
  ) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const runSource = async (
        key: string,
        fn: () => Promise<{ length: number }[] | { length: number }>,
      ) => {
        const started = Date.now();
        send(controller, { kind: 'source:start', key });
        try {
          const res = await fn();
          const count = Array.isArray(res) ? res.length : res.length;
          send(controller, {
            kind: 'source:done',
            key,
            count,
            durationMs: Date.now() - started,
          });
          return count;
        } catch {
          send(controller, {
            kind: 'source:error',
            key,
            durationMs: Date.now() - started,
          });
          return 0;
        }
      };

      // Fire all five sources in parallel. Each one's completion streams its
      // own done event so the client sees the real finish order (the fastest
      // source hits first, not whatever our UI order says).
      const googlePromise = runSource('google', () => fetchAllGoogle(30));
      const redditPromise = runSource('reddit', () => fetchAllReddit(15));
      const gdeltPromise = runSource('gdelt', () => fetchAllGdelt(50));
      const hnPromise = runSource('hn', () => fetchAllHackerNews(20));
      const youtubePromise = runSource('youtube', () => fetchAllYouTube(5));

      const counts = await Promise.all([
        googlePromise,
        redditPromise,
        gdeltPromise,
        hnPromise,
        youtubePromise,
      ]);
      const totalFetched = counts.reduce((a, b) => a + b, 0);

      // Classify once all sources are in. classifyNews() internally runs both
      // the LLM call and the og-meta enrichment.
      const clStart = Date.now();
      send(controller, { kind: 'classify:start' });
      try {
        // Feed synthetic items so we exercise the same code path as the page.
        // The page's own call will hit the identical cache; this is free.
        await classifyNews([
          // Empty is fine — classifyNews handles zero items quickly.
        ]);
        send(controller, {
          kind: 'classify:done',
          durationMs: Date.now() - clStart,
        });
      } catch {
        send(controller, {
          kind: 'classify:done',
          durationMs: Date.now() - clStart,
        });
      }

      // 4 enrichment stages (state / tag / country / thumbnails) happen
      // inside classifyNews as one pass — emit them rapidly so the UI rows
      // all tick done.
      for (const stage of ['state', 'tag', 'country', 'image']) {
        send(controller, { kind: 'enrich:done', key: stage });
      }

      send(controller, { kind: 'done', total: totalFetched });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering if behind a proxy
    },
  });
}
