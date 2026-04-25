/**
 * @jest-environment node
 *
 * Integration test for the on-demand TTS endpoint. The msedge-tts module
 * is mocked so the test stays hermetic (no outbound websocket). Runs under
 * the node environment so next/server can resolve fetch-spec globals
 * (Request/Response/Headers) at import time.
 */
import { Readable } from 'node:stream';

jest.mock('msedge-tts', () => {
  return {
    MsEdgeTTS: jest.fn().mockImplementation(() => ({
      setMetadata: jest.fn().mockResolvedValue(undefined),
      toStream: () => {
        const audioStream = Readable.from([Buffer.from('FAKE_MP3')]);
        return { audioStream };
      },
    })),
    OUTPUT_FORMAT: { AUDIO_24KHZ_48KBITRATE_MONO_MP3: 'mp3-fmt' },
  };
});

import { GET } from '@/app/api/narrate-timeline/[index]/route';
import { HISTORY } from '@/lib/u-visa-history';

const url = (idx: number | string) =>
  new Request(`http://localhost/api/narrate-timeline/${idx}`);

describe('GET /api/narrate-timeline/[index]', () => {
  it('returns audio/mpeg for a valid index', async () => {
    const res = await GET(url(0), {
      params: Promise.resolve({ index: '0' }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('audio/mpeg');
    expect(res.headers.get('Cache-Control')).toMatch(/immutable/);
    const body = Buffer.from(await res.arrayBuffer());
    expect(body.toString('utf8')).toBe('FAKE_MP3');
  });

  it('400s on a non-numeric index', async () => {
    const res = await GET(url('abc'), {
      params: Promise.resolve({ index: 'abc' }),
    });
    expect(res.status).toBe(400);
  });

  it('400s on an out-of-range index', async () => {
    const res = await GET(url(9999), {
      params: Promise.resolve({ index: '9999' }),
    });
    expect(res.status).toBe(400);
  });

  it('serves every event in the HISTORY array', async () => {
    const last = HISTORY.length - 1;
    const res = await GET(url(last), {
      params: Promise.resolve({ index: String(last) }),
    });
    expect(res.status).toBe(200);
  });
});
