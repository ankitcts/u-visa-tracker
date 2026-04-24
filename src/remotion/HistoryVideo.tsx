'use client';

import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { HISTORY, KIND_META, type EventKind } from '@/lib/u-visa-history';

// Per-voice manifests live under public/narration/<voice>/manifest.json.
// Pre-import all generated voices so Remotion can select at runtime with no
// async fetch. The `voiceKey` input prop picks which manifest drives the scene
// durations and <Audio> sources.
import ariaManifest from '../../public/narration/aria/manifest.json';
import jennyManifest from '../../public/narration/jenny/manifest.json';
import michelleManifest from '../../public/narration/michelle/manifest.json';
import soniaManifest from '../../public/narration/sonia/manifest.json';
import archiveClippings from '../../public/narration/archive-clippings.json';

// ──────────────────────────────────────────────────────────────────────────
export const FPS = 30;
const PADDING_SEC = 0.4;

export type ManifestFile = {
  filename: string;
  duration: number | null;
  year?: number;
  title?: string;
};
type VoiceManifest = {
  voice: string;
  voiceKey: string;
  files: ManifestFile[];
};

const VOICE_MANIFESTS: Record<string, VoiceManifest> = {
  aria: ariaManifest as VoiceManifest,
  jenny: jennyManifest as VoiceManifest,
  michelle: michelleManifest as VoiceManifest,
  sonia: soniaManifest as VoiceManifest,
};

export const AVAILABLE_VOICES: { key: string; label: string }[] = [
  { key: 'aria', label: 'Aria (US, warm)' },
  { key: 'jenny', label: 'Jenny (US, friendly)' },
  { key: 'michelle', label: 'Michelle (US, newscaster)' },
  { key: 'sonia', label: 'Sonia (UK, warm)' },
];

export const DEFAULT_VOICE_KEY = 'aria';

function durOf(e: ManifestFile | undefined, fallback: number): number {
  if (!e || e.duration == null) return fallback;
  return e.duration + PADDING_SEC;
}

function secToFrames(sec: number): number {
  return Math.max(1, Math.round(sec * FPS));
}

/**
 * Durations depend on the chosen voice (different voices speak at different
 * paces). We base the canonical timing on the DEFAULT voice so the external
 * Player always passes the right `durationInFrames`. The per-voice manifests
 * agree to within ~5%, and the per-scene fade-out uses the active scene's
 * own frame count so mismatches are imperceptible.
 */
function computeTimings(voiceKey: string) {
  const vm = VOICE_MANIFESTS[voiceKey] ?? VOICE_MANIFESTS[DEFAULT_VOICE_KEY];
  const files = vm.files;
  const introEntry = files[0];
  const outroEntry = files[files.length - 1];
  const eventEntries = files.slice(1, -1);

  const introDur = secToFrames(durOf(introEntry, 5));
  const outroDur = secToFrames(durOf(outroEntry, 5));
  const eventDurs = HISTORY.map((_, i) =>
    secToFrames(durOf(eventEntries[i], 8)),
  );
  const total =
    introDur + eventDurs.reduce((a, b) => a + b, 0) + outroDur;
  return { introDur, outroDur, eventDurs, total, introEntry, outroEntry, eventEntries };
}

const DEFAULT_TIMINGS = computeTimings(DEFAULT_VOICE_KEY);

// Exports used by the <Player> outside this composition. We fix the length
// to the default voice's timing; voices within ~5% of each other mean
// switching voices at the Player is seamless.
export const INTRO_DURATION = DEFAULT_TIMINGS.introDur;
export const OUTRO_DURATION = DEFAULT_TIMINGS.outroDur;
export const EVENT_DURATIONS: number[] = DEFAULT_TIMINGS.eventDurs;
export const TOTAL_DURATION = DEFAULT_TIMINGS.total;

export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
// ──────────────────────────────────────────────────────────────────────────

const PAPER_BG = '#fdfbf4';
const PAPER_INK = '#1d1a14';
const PAPER_MUTED = '#6b6352';
const PAPER_RULE = 'rgba(120,100,60,0.18)';

const KIND_LABEL_LONG: Record<EventKind, string> = {
  law: 'Statute',
  rule: 'Final Rule',
  court: 'Court Decision',
  policy: 'Agency Policy',
  milestone: 'Program Milestone',
  coverage: 'Press Coverage',
};

export default function HistoryVideo({
  voiceKey = DEFAULT_VOICE_KEY,
}: {
  voiceKey?: string;
}) {
  const vm = VOICE_MANIFESTS[voiceKey] ?? VOICE_MANIFESTS[DEFAULT_VOICE_KEY];
  const key = vm.voiceKey;
  const timings = DEFAULT_TIMINGS; // length-agreed frames across voices
  const { introDur, outroDur, eventDurs, introEntry, outroEntry, eventEntries } = timings;

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER_BG }}>
      <Sequence from={0} durationInFrames={introDur}>
        <IntroScene />
        {introEntry && (
          <Audio src={staticFile(`narration/${key}/${introEntry.filename}`)} />
        )}
      </Sequence>

      {HISTORY.map((event, i) => {
        const start = introDur + sum(eventDurs.slice(0, i));
        const duration = eventDurs[i];
        const audioEntry = eventEntries[i];
        const archiveItems =
          (archiveClippings as Record<string, ArchiveItem[]>)[
            String(event.year)
          ] ?? [];
        return (
          <Sequence
            key={`${event.year}-${event.title}`}
            from={start}
            durationInFrames={duration}
          >
            <EventScene
              year={event.year}
              date={event.date}
              title={event.title}
              body={event.body}
              kind={event.kind}
              highlight={event.highlight}
              index={i}
              total={HISTORY.length}
              sceneDuration={duration}
              archiveItems={archiveItems}
            />
            {audioEntry && (
              <Audio
                src={staticFile(`narration/${key}/${audioEntry.filename}`)}
              />
            )}
          </Sequence>
        );
      })}

      <Sequence
        from={introDur + sum(eventDurs)}
        durationInFrames={outroDur}
      >
        <OutroScene />
        {outroEntry && (
          <Audio src={staticFile(`narration/${key}/${outroEntry.filename}`)} />
        )}
      </Sequence>

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(120,100,60,0.05) 0px, rgba(120,100,60,0.05) 1px, transparent 1px, transparent 30px)',
          mixBlendMode: 'multiply',
        }}
      />
    </AbsoluteFill>
  );
}

type ArchiveItem = {
  identifier: string;
  title: string;
  date: string | null;
  mediatype: string;
  itemUrl: string;
  thumbnailUrl: string;
};

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}

function ArchiveOverlay({
  items,
  sceneDuration,
  frame,
}: {
  items: ArchiveItem[];
  sceneDuration: number;
  frame: number;
}) {
  const shown = items.slice(0, 3);
  // Reveal the overlay halfway through the scene, fade out near the end.
  const reveal = interpolate(
    frame,
    [Math.floor(sceneDuration * 0.45), Math.floor(sceneDuration * 0.6)],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const fadeOut = interpolate(
    frame,
    [sceneDuration - 30, sceneDuration - 4],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const opacity = reveal * fadeOut;

  return (
    <div
      style={{
        position: 'absolute',
        left: 100,
        bottom: 50,
        display: 'flex',
        gap: 18,
        opacity,
        transform: `translateY(${(1 - reveal) * 20}px)`,
      }}
    >
      {shown.map((item, i) => (
        <div
          key={item.identifier}
          style={{
            width: 180,
            height: 100,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(120,100,60,0.35)',
            borderRadius: 4,
            padding: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transform: `rotate(${(i - 1) * 1.5}deg)`,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: '"Georgia", "Times New Roman", serif',
              fontSize: 9,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#8a7548',
              fontWeight: 700,
            }}
          >
            archive.org · {item.mediatype}
          </div>
          <div
            style={{
              fontFamily: '"Georgia", "Times New Roman", serif',
              fontSize: 11,
              lineHeight: 1.25,
              color: '#1d1a14',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.title}
          </div>
          {item.date && (
            <div
              style={{
                marginTop: 'auto',
                fontFamily: '"Georgia", "Times New Roman", serif',
                fontSize: 9,
                color: '#6b6352',
                fontStyle: 'italic',
              }}
            >
              {String(item.date).slice(0, 10)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function IntroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 110, mass: 0.8 },
  });
  const shrink = spring({
    frame: frame - 30,
    fps,
    config: { damping: 20, stiffness: 90 },
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 80,
      }}
    >
      <div
        style={{
          transform: `translateY(${(1 - rise) * 40}px)`,
          opacity: rise,
        }}
      >
        <div
          style={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: 18,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: PAPER_MUTED,
            marginBottom: 28,
          }}
        >
          The U Nonimmigrant Visa
        </div>
        <h1
          style={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: 92,
            fontWeight: 700,
            color: PAPER_INK,
            lineHeight: 1.05,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          A Quarter-Century
          <br />
          in the Making
        </h1>
        <div
          style={{
            width: Math.min(480, 480 * shrink),
            height: 3,
            backgroundColor: PAPER_INK,
            margin: '40px auto 32px',
          }}
        />
        <p
          style={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: 24,
            color: PAPER_MUTED,
            fontStyle: 'italic',
            maxWidth: 900,
            lineHeight: 1.5,
            margin: '0 auto',
          }}
        >
          From VAWA 1994 and the Victims of Trafficking and Violence
          Protection Act, through the 2007 final rule, to today&apos;s
          quarter-million pending petitions.
        </p>
      </div>
    </AbsoluteFill>
  );
}

function OutroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 80,
        opacity: rise,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: 14,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: PAPER_MUTED,
            marginBottom: 24,
          }}
        >
          End of archive
        </div>
        <h2
          style={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: 56,
            color: PAPER_INK,
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          The story isn&apos;t over.
        </h2>
        <p
          style={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: 22,
            color: PAPER_MUTED,
            marginTop: 28,
            maxWidth: 820,
            lineHeight: 1.5,
            marginInline: 'auto',
          }}
        >
          See the live news map for what&apos;s happening right now in the
          U-visa program. Every number on this site traces back to public
          USCIS data — individual petitioners are protected by 8 U.S.C. §
          1367.
        </p>
      </div>
    </AbsoluteFill>
  );
}

function EventScene({
  year,
  date,
  title,
  body,
  kind,
  highlight,
  index,
  total,
  sceneDuration,
  archiveItems = [],
}: {
  year: number;
  date?: string;
  title: string;
  body: string;
  kind: EventKind;
  highlight?: boolean;
  index: number;
  total: number;
  sceneDuration: number;
  archiveItems?: ArchiveItem[];
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = KIND_META[kind];

  const yearRise = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const titleRise = spring({
    frame: frame - 14,
    fps,
    config: { damping: 20, stiffness: 120 },
  });
  const bodyOpacity = interpolate(frame, [28, 60], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const bodyTranslate = interpolate(frame, [28, 60], [20, 0], {
    extrapolateRight: 'clamp',
  });
  const chipScale = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, stiffness: 200 },
  });
  const fadeOut = interpolate(
    frame,
    [sceneDuration - 20, sceneDuration - 4],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        padding: '80px 100px',
        opacity: fadeOut,
      }}
    >
      {/* Dateline bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingBottom: 18,
          borderBottom: `2px solid ${PAPER_INK}`,
          marginBottom: 48,
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: 18,
          color: PAPER_MUTED,
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
        }}
      >
        <span>The U-Visa Archive</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          № {String(index + 1).padStart(2, '0')} /{' '}
          {String(total).padStart(2, '0')}
        </span>
      </div>

      {/* Year + kind chip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 28,
          marginBottom: 20,
          transform: `translateY(${(1 - yearRise) * 40}px)`,
          opacity: yearRise,
        }}
      >
        <span
          style={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: 140,
            fontWeight: 700,
            lineHeight: 1,
            color: PAPER_INK,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {year}
        </span>
        <div style={{ transform: `scale(${chipScale})` }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 18px',
              border: `2px solid ${meta.color}`,
              borderRadius: 999,
              fontFamily: '"Georgia", "Times New Roman", serif',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: meta.color,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: meta.color,
              }}
            />
            {KIND_LABEL_LONG[kind]}
          </span>
          {highlight && (
            <span
              style={{
                marginLeft: 12,
                padding: '6px 14px',
                backgroundColor: '#fbbf24',
                color: '#78350f',
                fontFamily: '"Georgia", "Times New Roman", serif',
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                borderRadius: 4,
              }}
            >
              Pivotal
            </span>
          )}
        </div>
      </div>

      {date && (
        <div
          style={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: 22,
            color: PAPER_MUTED,
            fontStyle: 'italic',
            marginBottom: 28,
            opacity: titleRise,
          }}
        >
          {date}
        </div>
      )}

      <h2
        style={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: 56,
          fontWeight: 700,
          color: PAPER_INK,
          lineHeight: 1.1,
          margin: '0 0 32px',
          maxWidth: 1050,
          letterSpacing: '-0.01em',
          transform: `translateY(${(1 - titleRise) * 30}px)`,
          opacity: titleRise,
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: 26,
          color: PAPER_INK,
          lineHeight: 1.55,
          maxWidth: 1080,
          margin: 0,
          transform: `translateY(${bodyTranslate}px)`,
          opacity: bodyOpacity,
        }}
      >
        {body}
      </p>

      {/* Archive overlay — shows attributed IA items when available */}
      {archiveItems.length > 0 && (
        <ArchiveOverlay
          items={archiveItems}
          sceneDuration={sceneDuration}
          frame={frame}
        />
      )}

      {/* Progress meter */}
      <div
        style={{
          position: 'absolute',
          right: 100,
          bottom: 60,
          width: 220,
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: 14,
          color: PAPER_MUTED,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        <div
          style={{
            height: 4,
            backgroundColor: PAPER_RULE,
            borderRadius: 2,
            marginBottom: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${((index + 1) / total) * 100}%`,
              backgroundColor: PAPER_INK,
            }}
          />
        </div>
        <div style={{ textAlign: 'right' }}>
          {Math.round(((index + 1) / total) * 100)}%
        </div>
      </div>
    </AbsoluteFill>
  );
}
