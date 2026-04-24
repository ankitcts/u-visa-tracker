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
import manifest from '../../public/narration/manifest.json';

// ──────────────────────────────────────────────────────────────────────────
// Each scene's duration is driven by the length of its narration audio.
// The manifest is built by `npm run narrate` and stores measured durations.
export const FPS = 30;
const PADDING_SEC = 0.4; // brief beat after each narration clip

type ManifestEntry = { filename: string; duration: number | null };

const MANIFEST = manifest as ManifestEntry[];
const INTRO_ENTRY = MANIFEST[0];
const OUTRO_ENTRY = MANIFEST[MANIFEST.length - 1];
const EVENT_ENTRIES = MANIFEST.slice(1, MANIFEST.length - 1);

// Fallback duration (seconds) if afinfo didn't provide one.
function durOf(e: ManifestEntry | undefined, fallback: number): number {
  if (!e || e.duration == null) return fallback;
  return e.duration + PADDING_SEC;
}

function secToFrames(sec: number): number {
  return Math.max(1, Math.round(sec * FPS));
}

export const INTRO_DURATION = secToFrames(durOf(INTRO_ENTRY, 5));
export const OUTRO_DURATION = secToFrames(durOf(OUTRO_ENTRY, 5));
export const EVENT_DURATIONS: number[] = HISTORY.map((_, i) =>
  secToFrames(durOf(EVENT_ENTRIES[i], 8)),
);
export const TOTAL_DURATION =
  INTRO_DURATION +
  EVENT_DURATIONS.reduce((a, b) => a + b, 0) +
  OUTRO_DURATION;

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

export default function HistoryVideo() {
  let cursor = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER_BG }}>
      {/* Intro */}
      <Sequence from={cursor} durationInFrames={INTRO_DURATION}>
        <IntroScene />
        {INTRO_ENTRY && (
          <Audio src={staticFile(`narration/${INTRO_ENTRY.filename}`)} />
        )}
      </Sequence>

      {HISTORY.map((event, i) => {
        const start = INTRO_DURATION + sum(EVENT_DURATIONS.slice(0, i));
        const duration = EVENT_DURATIONS[i];
        const audioEntry = EVENT_ENTRIES[i];
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
            />
            {audioEntry && (
              <Audio src={staticFile(`narration/${audioEntry.filename}`)} />
            )}
          </Sequence>
        );
      })}

      <Sequence
        from={INTRO_DURATION + sum(EVENT_DURATIONS)}
        durationInFrames={OUTRO_DURATION}
      >
        <OutroScene />
        {OUTRO_ENTRY && (
          <Audio src={staticFile(`narration/${OUTRO_ENTRY.filename}`)} />
        )}
      </Sequence>

      {/* Newspaper texture overlay */}
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

  // unused binding reference; keeps the unused-var linter quiet in stricter configs
  cursor;
}

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
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
