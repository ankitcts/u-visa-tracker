import { NextResponse } from 'next/server';
import { HISTORY } from '@/lib/u-visa-history';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = false;

/**
 * Server-side TTS for the homepage "Read the history aloud" button.
 *
 * Synthesises each timeline event's `body` text in the same Aria voice the
 * Remotion video uses (en-US-AriaNeural). Returns audio/mpeg with
 * year-long immutable cache headers so the Vercel CDN caches the bytes
 * after the first request — subsequent listeners get a 304 / CDN hit
 * with no extra TTS cost.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ index: string }> },
) {
  const { index } = await params;
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0 || idx >= HISTORY.length) {
    return NextResponse.json({ error: 'invalid index' }, { status: 400 });
  }
  const ev = HISTORY[idx];
  const dateStr = ev.date ? `${ev.date}. ` : '';
  const text = `${ev.year}. ${dateStr}${ev.title}. ${ev.body}`;

  try {
    const mp3 = await synthesizeAriaMp3(text);
    return new NextResponse(new Uint8Array(mp3), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(mp3.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('TTS failed for index', idx, err);
    return NextResponse.json({ error: 'tts failed' }, { status: 500 });
  }
}

async function synthesizeAriaMp3(text: string): Promise<Buffer> {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
  const tts = new MsEdgeTTS();
  await tts.setMetadata(
    'en-US-AriaNeural',
    OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
  );
  const xml = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  const { audioStream } = tts.toStream(xml, {
    rate: '-5%',
    pitch: '+0Hz',
    volume: '+0%',
  });
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    audioStream.on('data', (c: Buffer) => chunks.push(c));
    audioStream.on('close', () => resolve());
    audioStream.on('error', reject);
  });
  return Buffer.concat(chunks);
}
