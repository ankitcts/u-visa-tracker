'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
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
  const playerRef = useRef<PlayerRef>(null);

  const renderPoster = useCallback(() => <HistoryVideoPoster />, []);

  // Pause the video whenever the page narrator ("Read the history aloud")
  // starts. Resume control is left to the user — they can press play again.
  useEffect(() => {
    const onNarrationStart = () => {
      const p = playerRef.current;
      if (p && p.isPlaying()) p.pause();
    };
    window.addEventListener('uvt:narration-start', onNarrationStart);
    return () =>
      window.removeEventListener('uvt:narration-start', onNarrationStart);
  }, []);

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
          ref={playerRef}
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
 * Designed as a documentary title card crediting the actual architects
 * of the U-visa rather than the bill's signer:
 *
 *   - Sen. Joe Biden (D-DE) — principal author of the original VAWA in
 *     1994. The U visa was built directly on top of VAWA's framework
 *     and Biden cosponsored every successor bill of his career.
 *   - Sen. Paul Wellstone (D-MN) and Sen. Sam Brownback (R-KS) — the
 *     bipartisan Senate pair who shepherded the trafficking title of
 *     VTVPA 2000, which is the parent statute that created the U visa.
 *   - Rep. Christopher H. Smith (R-NJ) — House sponsor of TVPA.
 *
 * All four portraits are public-domain US-government works on
 * Wikimedia Commons (verified).
 */
const ARCHITECTS = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Bill_Clinton.jpg',
    name: 'Pres. Bill Clinton',
    label: 'Signed VTVPA · Oct 28 2000',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Paul_Wellstone%2C_official_Senate_photo_portrait.jpg',
    name: 'Sen. Paul Wellstone',
    label: 'D-MN · Senate trafficking title',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Sam_Brownback_official_Senate_portrait.jpg',
    name: 'Sen. Sam Brownback',
    label: 'R-KS · Senate trafficking title',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Chris_Smith%2C_official_109th_Congress_photo.jpg',
    name: 'Rep. Christopher Smith',
    label: 'R-NJ · House sponsor of TVPA',
  },
];

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
      {/* Lead architect — Biden, principal author of VAWA */}
      <div
        className="absolute inset-y-0 left-0 w-[34%] bg-cover bg-top"
        style={{
          backgroundImage:
            "url('https://upload.wikimedia.org/wikipedia/commons/7/74/Joe_Biden%2C_official_103rd_Congress_photo.png')",
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
        <div
          className="absolute bottom-[1.5vw] left-[1.5vw] right-[3vw]"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          <div className="text-[0.8vw] uppercase tracking-[0.25em] text-[#fdfbf4] font-semibold drop-shadow">
            VAWA author · 103rd Congress
          </div>
          <div className="text-[1.4vw] font-bold text-[#fdfbf4] drop-shadow">
            Sen. Joe Biden
          </div>
        </div>
      </div>

      {/* Right-side title block */}
      <div className="relative ml-[34%] w-[66%] pr-[4%] pl-[3%] py-[4%]">
        <div
          className="text-[0.95vw] uppercase tracking-[0.3em] font-semibold text-[#8a7548] mb-[1.2vw]"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Architects of the U Nonimmigrant Visa
        </div>
        <h2
          className="font-serif font-bold leading-[1.05] text-[3.8vw] tracking-tight"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: '#1d1a14',
          }}
        >
          The Coalition That<br />Built It
        </h2>
        <div className="my-[1.1vw] h-[2px] w-[7vw] bg-[#1d1a14]" />
        <p
          className="italic text-[1.15vw] text-[#6b6352] max-w-[40vw] leading-snug"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          From VAWA 1994 to VTVPA 2000 — the people who wrote and passed
          the U visa.
        </p>

        {/* Three secondary portraits — Wellstone, Brownback, Chris Smith */}
        <div className="mt-[1.4vw] flex items-stretch gap-[0.8vw]">
          {ARCHITECTS.map((p) => (
            <div
              key={p.name}
              className="flex-1 rounded-sm overflow-hidden border border-[#c8bb96] bg-white shadow-sm"
            >
              <div
                className="aspect-[4/5] bg-cover bg-top"
                style={{
                  backgroundImage: `url('${p.url}')`,
                  filter: 'sepia(0.1) saturate(0.95)',
                }}
                aria-hidden
              />
              <div
                className="px-[0.6vw] py-[0.4vw] border-t border-dashed border-[#c8bb96]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                <div className="text-[0.85vw] font-bold text-[#1d1a14] leading-tight">
                  {p.name}
                </div>
                <div className="text-[0.65vw] uppercase tracking-[0.1em] text-[#8a7548]">
                  {p.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[1.4vw] flex items-center justify-between gap-[1vw]">
          <ul
            className="grid grid-cols-1 gap-y-[0.25vw] text-[0.85vw]"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {pivotal.slice(0, 3).map((e) => (
              <li
                key={e.year}
                className="flex items-baseline gap-[0.4vw] text-[#1d1a14]"
              >
                <span className="font-mono tabular-nums font-bold">
                  {e.year}
                </span>
                <span className="text-[#6b6352] truncate">{e.title}</span>
              </li>
            ))}
          </ul>

          <div className="inline-flex items-center gap-[0.7vw] text-[0.85vw] text-[#8a7548] font-semibold uppercase tracking-[0.25em] shrink-0">
            <span
              className="inline-flex h-[2.6vw] w-[2.6vw] items-center justify-center rounded-full bg-[#1d1a14] text-[#fdfbf4] shadow-lg"
              aria-label="Play"
            >
              <Play
                className="h-[1.2vw] w-[1.2vw] translate-x-[0.1vw]"
                fill="currentColor"
                strokeWidth={0}
              />
            </span>
            Press play
          </div>
        </div>
      </div>

      {/* Bottom dateline */}
      <div
        className="absolute bottom-[1.2vw] left-[36%] right-[4%] flex items-baseline justify-between border-t border-[#1d1a14] pt-[0.4vw]"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        <span className="text-[0.7vw] uppercase tracking-[0.25em] text-[#6b6352] font-semibold">
          1994 — 2025 · Narrated
        </span>
        <span className="text-[0.7vw] font-mono tabular-nums text-[#6b6352]">
          {HISTORY.length} events · all portraits public domain
        </span>
      </div>
    </div>
  );
}
