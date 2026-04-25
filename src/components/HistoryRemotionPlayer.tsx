'use client';

import { useCallback, useState } from 'react';
import { Player } from '@remotion/player';
import { Mic2, Play } from 'lucide-react';
import HistoryVideo, {
  FPS,
  TOTAL_DURATION,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
  AVAILABLE_VOICES,
  DEFAULT_VOICE_KEY,
} from '@/remotion/HistoryVideo';
import { HISTORY } from '@/lib/u-visa-history';

export default function HistoryRemotionPlayer() {
  const [voiceKey, setVoiceKey] = useState<string>(DEFAULT_VOICE_KEY);

  const renderPoster = useCallback(() => <HistoryVideoPoster />, []);

  return (
    <div className="space-y-3">
      <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Mic2 className="h-4 w-4" />
        <span>Narrator voice:</span>
        <select
          value={voiceKey}
          onChange={(e) => setVoiceKey(e.target.value)}
          className="rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {AVAILABLE_VOICES.map((v) => (
            <option key={v.key} value={v.key}>
              {v.label}
            </option>
          ))}
        </select>
      </label>
      <div className="rounded-xl overflow-hidden border shadow-lg bg-black w-full aspect-video relative">
        <Player
          key={voiceKey /* force remount on voice switch */}
          component={HistoryVideo}
          inputProps={{ voiceKey }}
          durationInFrames={TOTAL_DURATION}
          compositionWidth={VIDEO_WIDTH}
          compositionHeight={VIDEO_HEIGHT}
          fps={FPS}
          controls
          loop
          style={{ width: '100%', height: '100%' }}
          acknowledgeRemotionLicense
          renderPoster={renderPoster}
          showPosterWhenUnplayed
          showPosterWhenEnded
        />
      </div>
    </div>
  );
}

/**
 * Poster shown before the user presses play (and after the video ends).
 * Designed to read like a documentary title card: aged-paper background
 * with column-rule lines, period photo of Clinton signing the 2000 VTVPA,
 * a serif title, "1994 — 2025" year span, list of pivotal moments, and
 * a centered play badge.
 */
function HistoryVideoPoster() {
  const pivotal = HISTORY.filter((e) => e.highlight).slice(0, 5);
  return (
    <div
      className="relative h-full w-full text-[#1d1a14] flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: '#fdfbf4',
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(120,100,60,0.05) 0px, rgba(120,100,60,0.05) 1px, transparent 1px, transparent 28px)',
      }}
    >
      {/* Period photo on the left, full-bleed */}
      <div
        className="absolute inset-y-0 left-0 w-[42%] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://upload.wikimedia.org/wikipedia/commons/d/d3/Bill_Clinton.jpg')",
          filter: 'sepia(0.18) saturate(0.9)',
        }}
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(253,251,244,0) 70%, #fdfbf4 100%)',
          }}
        />
      </div>

      {/* Right-side title block */}
      <div className="relative ml-auto w-[58%] pr-[5%] pl-[3%] py-[5%]">
        <div
          className="text-[1.1vw] uppercase tracking-[0.3em] font-semibold text-[#8a7548] mb-[2vw]"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          The U Nonimmigrant Visa
        </div>
        <h2
          className="font-serif font-bold leading-[1.05] text-[4.6vw] tracking-tight"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: '#1d1a14',
          }}
        >
          A Quarter-Century<br />in the Making
        </h2>
        <div className="my-[1.5vw] h-[3px] w-[8vw] bg-[#1d1a14]" />
        <p
          className="italic text-[1.4vw] text-[#6b6352] max-w-[40vw] leading-snug"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          From VAWA 1994 to a quarter-million pending files — narrated.
        </p>

        <ul
          className="mt-[2vw] grid grid-cols-2 gap-x-[1.5vw] gap-y-[0.5vw] text-[1.05vw]"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {pivotal.map((e) => (
            <li
              key={e.year}
              className="flex items-baseline gap-[0.5vw] text-[#1d1a14]"
            >
              <span className="font-mono tabular-nums font-bold text-[1vw]">
                {e.year}
              </span>
              <span className="text-[#6b6352] truncate">{e.title}</span>
            </li>
          ))}
        </ul>

        <div className="mt-[2vw] inline-flex items-center gap-[1vw] text-[1.05vw] text-[#8a7548] font-semibold uppercase tracking-[0.25em]">
          <span
            className="inline-flex h-[3.5vw] w-[3.5vw] items-center justify-center rounded-full bg-[#1d1a14] text-[#fdfbf4] shadow-lg"
            aria-label="Play"
          >
            <Play
              className="h-[1.6vw] w-[1.6vw] translate-x-[0.15vw]"
              fill="currentColor"
              strokeWidth={0}
            />
          </span>
          Press play
        </div>
      </div>

      {/* Subtle bottom dateline */}
      <div
        className="absolute bottom-[2vw] left-[44%] right-[5%] flex items-baseline justify-between border-t border-[#1d1a14] pt-[0.6vw]"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        <span className="text-[0.85vw] uppercase tracking-[0.25em] text-[#6b6352] font-semibold">
          1994 — 2025 · Narrated
        </span>
        <span className="text-[0.85vw] font-mono tabular-nums text-[#6b6352]">
          {HISTORY.length} events
        </span>
      </div>
    </div>
  );
}
