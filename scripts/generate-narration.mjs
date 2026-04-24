#!/usr/bin/env node
/**
 * Generates per-event narration audio for the Remotion History video using
 * Microsoft Edge's free Neural TTS (Azure Speech voices). Voices like Aria,
 * Jenny, Ava, and Michelle sound genuinely human — far better than macOS say.
 *
 * Run:  npm run narrate
 *
 * No API key required. Uses the public Edge Read Aloud endpoint via the
 * `msedge-tts` npm package.
 *
 * Voice override:  NARRATOR_VOICE=en-US-JennyNeural npm run narrate
 *   Recommended feminine voices:
 *     en-US-AriaNeural   — warm, expressive (default)
 *     en-US-JennyNeural  — conversational, friendly
 *     en-US-AvaNeural    — bright, young
 *     en-US-MichelleNeural — newscaster clarity
 *     en-US-SaraNeural   — calm, narrative
 *     en-GB-SoniaNeural  — UK English, warm
 */
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  unlinkSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// msedge-tts is ESM-compatible
const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public/narration');
const MANIFEST_PATH = resolve(OUT_DIR, 'manifest.json');

// Multi-voice mode: space- or comma-separated. Each voice writes into its own
// subdirectory with its own manifest so the UI can switch between voices at
// runtime.
const VOICES = (process.env.NARRATOR_VOICE || 'en-US-AriaNeural en-US-JennyNeural en-US-MichelleNeural en-GB-SoniaNeural')
  .split(/[\s,]+/)
  .filter(Boolean);
const RATE = process.env.NARRATOR_RATE || '-5%';
const PITCH = process.env.NARRATOR_PITCH || '+0Hz';
const VOLUME = process.env.NARRATOR_VOLUME || '+0%';

mkdirSync(OUT_DIR, { recursive: true });

// ── Load HISTORY events by light-parsing the TS source. ──────────────────
const historySrc = readFileSync(
  resolve(ROOT, 'src/lib/u-visa-history.ts'),
  'utf8',
);

function findMatchingBracket(s, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    if (s[i] === '[') depth++;
    else if (s[i] === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractString(src, field, fromIdx = 0) {
  const re = new RegExp(`${field}:\\s*`, 'g');
  re.lastIndex = fromIdx;
  const m = re.exec(src);
  if (!m) return null;
  let i = m.index + m[0].length;
  if (src[i] !== "'" && src[i] !== '"') return null;
  const quote = src[i];
  i++;
  let out = '';
  while (i < src.length) {
    const c = src[i];
    if (c === '\\' && src[i + 1]) {
      out += src[i + 1];
      i += 2;
      continue;
    }
    if (c === quote) return out;
    out += c;
    i++;
  }
  return out;
}

function extractEvents(src) {
  const start = src.indexOf('export const HISTORY');
  if (start < 0) throw new Error('Could not find HISTORY export');
  const after = src.slice(start);
  const eq = after.indexOf('= [');
  const open = eq + 2;
  const close = findMatchingBracket(after, open);
  const arrText = after.slice(open + 1, close);
  const events = [];
  let depth = 0;
  let startIdx = 0;
  for (let i = 0; i < arrText.length; i++) {
    const c = arrText[i];
    if (c === '{') {
      if (depth === 0) startIdx = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0) {
        const text = arrText.slice(startIdx, i + 1);
        const ym = text.match(/year:\s*(\d+)/);
        const title = extractString(text, 'title');
        const body = extractString(text, 'body');
        const narration = extractString(text, 'narration');
        const date = extractString(text, 'date');
        if (ym && title && body) {
          events.push({
            year: Number(ym[1]),
            title,
            body,
            narration: narration || null,
            date,
          });
        }
      }
    }
  }
  return events;
}

function extractTopLevelString(src, name) {
  const re = new RegExp(`export const ${name}\\s*=\\s*`, 'g');
  const m = re.exec(src);
  if (!m) return null;
  let i = m.index + m[0].length;
  if (src[i] !== "'" && src[i] !== '"') return null;
  const quote = src[i];
  i++;
  let out = '';
  while (i < src.length) {
    const c = src[i];
    if (c === '\\' && src[i + 1]) {
      out += src[i + 1];
      i += 2;
      continue;
    }
    if (c === quote) return out;
    out += c;
    i++;
  }
  return out;
}

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

function narrationText(ev) {
  // Prefer the hand-authored storyteller narration. Fall back to a
  // concatenation of visible fields if no narration string was provided.
  if (ev.narration && ev.narration.trim()) return ev.narration.trim();
  const dateStr = ev.date ? `${ev.date}. ` : '';
  return `${ev.year}. ${dateStr}${ev.title}. ${ev.body}`;
}

function xmlEscape(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateOne(tts, outPath, text) {
  // Stream the MP3 bytes from Edge TTS into our output file.
  const { audioStream } = tts.toStream(xmlEscape(text), {
    rate: RATE,
    pitch: PITCH,
    volume: VOLUME,
  });
  const chunks = [];
  return new Promise((resolve, reject) => {
    audioStream.on('data', (chunk) => chunks.push(chunk));
    audioStream.on('close', () => {
      writeFileSync(outPath, Buffer.concat(chunks));
      resolve(outPath);
    });
    audioStream.on('error', reject);
  });
}

function probeDuration(path) {
  try {
    const info = execFileSync('afinfo', [path]).toString();
    const m = info.match(/estimated duration:\s*([\d.]+)/i);
    return m ? Number(m[1]) : null;
  } catch {
    // afinfo is macOS-only. On other platforms we fall back to a rough estimate
    // based on text length; this is only used for scene pacing.
    return null;
  }
}

function voiceKey(voice) {
  // en-US-AriaNeural → aria
  const m = voice.match(/([A-Z][a-z]+)Neural$/);
  return (m ? m[1] : voice).toLowerCase();
}

async function generateForVoice(voice, events, introText, outroText) {
  const key = voiceKey(voice);
  const voiceDir = resolve(OUT_DIR, key);
  mkdirSync(voiceDir, { recursive: true });

  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const manifest = { voice, voiceKey: key, files: [] };

  console.log(`  → intro.mp3`);
  const introPath = resolve(voiceDir, 'intro.mp3');
  await generateOne(tts, introPath, introText);
  manifest.files.push({ filename: 'intro.mp3', duration: probeDuration(introPath) });

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const filename = `${String(i + 1).padStart(2, '0')}-${ev.year}-${slug(ev.title)}.mp3`;
    const outPath = resolve(voiceDir, filename);
    console.log(`  → ${filename}`);
    await generateOne(tts, outPath, narrationText(ev));
    manifest.files.push({
      filename,
      year: ev.year,
      title: ev.title,
      duration: probeDuration(outPath),
    });
  }

  console.log(`  → outro.mp3`);
  const outroPath = resolve(voiceDir, 'outro.mp3');
  await generateOne(tts, outroPath, outroText);
  manifest.files.push({ filename: 'outro.mp3', duration: probeDuration(outroPath) });

  writeFileSync(resolve(voiceDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}

async function main() {
  const events = extractEvents(historySrc);
  const introText =
    extractTopLevelString(historySrc, 'INTRO_NARRATION') ||
    'The U Nonimmigrant Visa. A Quarter-Century in the Making.';
  const outroText =
    extractTopLevelString(historySrc, 'OUTRO_NARRATION') ||
    'The story is not over.';

  console.log(`Voices: ${VOICES.join(', ')}`);
  console.log(`Events: ${events.length}`);
  console.log();

  const index = [];
  for (const voice of VOICES) {
    console.log(`── ${voice} ──`);
    const manifest = await generateForVoice(voice, events, introText, outroText);
    index.push({
      voice,
      key: voiceKey(voice),
      label: friendlyVoiceLabel(voice),
      files: manifest.files.length,
    });
    console.log();
  }

  // Top-level index so the UI can enumerate available voices.
  writeFileSync(
    resolve(OUT_DIR, 'index.json'),
    JSON.stringify({ voices: index }, null, 2),
  );

  console.log(`Wrote top-level index: public/narration/index.json`);
  console.log(`Voices available: ${index.length}`);

  process.exit(0);
}

function friendlyVoiceLabel(voice) {
  const nameMap = {
    'en-US-AriaNeural': 'Aria (US, warm)',
    'en-US-JennyNeural': 'Jenny (US, friendly)',
    'en-US-AvaNeural': 'Ava (US, bright)',
    'en-US-MichelleNeural': 'Michelle (US, newscaster)',
    'en-US-SaraNeural': 'Sara (US, calm)',
    'en-GB-SoniaNeural': 'Sonia (UK, warm)',
    'en-AU-NatashaNeural': 'Natasha (AU)',
  };
  return nameMap[voice] || voice;
}

main().catch((err) => {
  console.error('Narration generation failed:', err);
  process.exit(1);
});
