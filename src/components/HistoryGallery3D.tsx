'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'motion/react';
import { Music, Pause } from 'lucide-react';
import { HISTORY, type HistoryImage } from '@/lib/u-visa-history';

// 3D gallery is WebGL-only; load client-side with an SSR-safe fallback.
const InfiniteGallery = dynamic(
  () => import('./ui/3d-gallery-photography'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-xl border bg-muted/30 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading gallery…</span>
      </div>
    ),
  },
);

interface GallerySlide {
  year: number;
  url: string;
  caption: string;
  credit: string;
  license: string;
  eventTitle: string;
}

function flattenHistoryImages(): GallerySlide[] {
  // three.js TextureLoader handles raster formats reliably but chokes on SVGs
  // (no intrinsic dimensions → NaN aspect → broken plane). Filter them out —
  // the grid gallery below still shows every SVG with full attribution.
  const isRaster = (url: string) =>
    /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(url);
  const out: GallerySlide[] = [];
  for (const e of HISTORY) {
    if (e.image && isRaster(e.image.url))
      out.push(toSlide(e.year, e.title, e.image));
    for (const extra of e.extraImages ?? []) {
      if (isRaster(extra.url)) out.push(toSlide(e.year, e.title, extra));
    }
  }
  return out;
}

function toSlide(
  year: number,
  eventTitle: string,
  img: HistoryImage,
): GallerySlide {
  return {
    year,
    eventTitle,
    url: img.url,
    caption: img.caption,
    credit: img.credit,
    license: img.license,
  };
}

/**
 * 3D photo-wall for the historical gallery. Images float in depth, cross-fade
 * with a cloth-like shader, and auto-play. The caption card syncs to whichever
 * image is closest to the camera. "America the Beautiful" plays as a period
 * soundtrack — auto-starts on view, toggleable from the bottom-right button.
 */
export default function HistoryGallery3D() {
  const slides = useMemo(flattenHistoryImages, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [ambient, setAmbient] = useState(false);

  const ambientRef = useRef<{
    ctx: AudioContext;
    timer: number;
    masterGain: GainNode;
  } | null>(null);

  const handleActiveImageChange = useCallback((i: number) => {
    setActiveIndex(i);
  }, []);

  // Period-piece soundtrack: "America the Beautiful" — Samuel A. Ward's
  // 1888 hymn tune "Materna" (public domain). Synthesized as a stately
  // piano with a low-pass filter to evoke an old recording. Each note has
  // a short plucked envelope; the sequence is scheduled by a JS timer.
  const startAmbient = useCallback(() => {
    if (ambientRef.current) return;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();

      // Master chain: low-pass + gentle compressor → destination. LP at
      // ~2.4 kHz softens digital harshness so the synth reads as period.
      const master = ctx.createGain();
      master.gain.value = 0.0001;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2400;
      lp.Q.value = 0.6;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -22;
      comp.knee.value = 24;
      comp.ratio.value = 3;
      master.connect(lp);
      lp.connect(comp);
      comp.connect(ctx.destination);
      master.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.5);

      // Note frequencies — C major (the standard hymn key for Materna).
      const C2 = 65.41, F2 = 87.31, G2 = 98.0, A2 = 110.0;
      const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23,
        G4 = 392.0, A4 = 440.0;

      // Beat = 0.65s (≈92 BPM). The tune is 32 beats end-to-end.
      const BEAT = 0.65;

      // Melody — "Materna" (Samuel A. Ward, 1888). Each entry is
      // [pitch, beat, dur].
      const MELODY: [number, number, number][] = [
        // "O beau-ti-ful for spa-cious skies"
        [C4, 0, 1], [C4, 1, 1], [E4, 2, 1], [G4, 3, 1],
        [G4, 4, 1], [F4, 5, 1], [E4, 6, 2],
        // "for am-ber waves of grain"
        [D4, 8, 1], [D4, 9, 1], [F4, 10, 1], [F4, 11, 1],
        [E4, 12, 1], [D4, 13, 1], [C4, 14, 2],
        // "For pur-ple moun-tain ma-jes-ties"
        [C4, 16, 1], [C4, 17, 1], [E4, 18, 1], [G4, 19, 1],
        [G4, 20, 1], [F4, 21, 1], [E4, 22, 2],
        // "a-bove the fruit-ed plain"
        [D4, 24, 1], [G4, 25, 1], [F4, 26, 1], [E4, 27, 1],
        [D4, 28, 1], [C4, 29, 3],
      ];

      // Bass line — root of the prevailing chord on each measure.
      const BASS: [number, number, number][] = [
        [C2, 0, 4], [F2, 4, 2], [C2, 6, 2],
        [F2, 8, 2], [C2, 10, 2], [G2, 12, 2], [C2, 14, 2],
        [C2, 16, 4], [F2, 20, 2], [C2, 22, 2],
        [F2, 24, 2], [G2, 26, 2], [A2, 28, 2], [C2, 30, 2],
      ];

      function pluck(when: number, freq: number, beats: number, vel: number) {
        const isBass = freq < 130;
        const o = ctx.createOscillator();
        o.type = isBass ? 'sine' : 'triangle';
        o.frequency.value = freq;
        const g = ctx.createGain();
        const peak = (isBass ? 0.5 : 0.32) * vel;
        const release = Math.max(beats * BEAT * 0.95, isBass ? 1.4 : 0.9);
        g.gain.setValueAtTime(0.0001, when);
        g.gain.linearRampToValueAtTime(peak, when + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, when + release);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 4.5 + Math.random() * 1.5;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 4;
        lfo.connect(lfoGain);
        lfoGain.connect(o.detune);
        lfo.start(when);
        o.connect(g);
        g.connect(master);
        o.start(when);
        o.stop(when + release + 0.05);
        lfo.stop(when + release + 0.05);
      }

      const PATTERN_SECONDS = 32 * BEAT;
      const schedule = () => {
        const start = ctx.currentTime + 0.05;
        for (const [f, b, d] of MELODY) pluck(start + b * BEAT, f, d, 1.0);
        for (const [f, b, d] of BASS) pluck(start + b * BEAT, f, d, 0.9);
      };
      schedule();
      const timer = window.setInterval(schedule, PATTERN_SECONDS * 1000);

      ambientRef.current = { ctx, timer, masterGain: master };
      setAmbient(true);
    } catch {
      setAmbient(false);
    }
  }, []);

  const stopAmbient = useCallback(() => {
    const cur = ambientRef.current;
    if (!cur) return;
    try {
      window.clearInterval(cur.timer);
      cur.masterGain.gain.cancelScheduledValues(cur.ctx.currentTime);
      cur.masterGain.gain.setValueAtTime(
        cur.masterGain.gain.value,
        cur.ctx.currentTime,
      );
      cur.masterGain.gain.linearRampToValueAtTime(
        0.0001,
        cur.ctx.currentTime + 0.4,
      );
      setTimeout(() => {
        try {
          cur.ctx.close();
        } catch {}
      }, 600);
    } catch {}
    ambientRef.current = null;
    setAmbient(false);
  }, []);

  // Tracks whether the user has manually controlled the music. Once they
  // do, the IntersectionObserver stops auto-managing it.
  const userOverrideRef = useRef(false);
  // While narration is running, suppress the gallery soundtrack.
  const narrationActiveRef = useRef(false);

  useEffect(() => {
    const onStart = () => {
      narrationActiveRef.current = true;
      stopAmbient();
    };
    const onStop = () => {
      narrationActiveRef.current = false;
    };
    window.addEventListener('uvt:narration-start', onStart);
    window.addEventListener('uvt:narration-stop', onStop);
    return () => {
      window.removeEventListener('uvt:narration-start', onStart);
      window.removeEventListener('uvt:narration-stop', onStop);
    };
  }, [stopAmbient]);

  const toggleAmbient = useCallback(() => {
    userOverrideRef.current = true;
    if (ambient) stopAmbient();
    else startAmbient();
  }, [ambient, startAmbient, stopAmbient]);

  // Auto-start the soundtrack when the reel scrolls into view; auto-stop
  // when it scrolls out. Once the user manually toggles the button,
  // userOverrideRef flips and the observer stops auto-managing.
  // Modern browsers block AudioContext.start() without a prior user
  // gesture — startAmbient catches that, and the user can still tap the
  // button to start manually.
  const reelRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = reelRootRef.current;
    if (!node) return;
    // Multi-threshold observer with a 100px top/bottom margin so the
    // mute fires *before* the reel fully leaves the viewport on mobile,
    // where fast scroll can otherwise skip past a single threshold tick.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (userOverrideRef.current) continue;
          if (narrationActiveRef.current) continue;
          if (e.isIntersecting && e.intersectionRatio >= 0.2 && !ambient) {
            startAmbient();
          } else if (e.intersectionRatio < 0.05 && ambient) {
            stopAmbient();
          }
        }
      },
      {
        threshold: [0, 0.05, 0.2, 0.5, 0.8, 1],
        rootMargin: '0px 0px -100px 0px',
      },
    );
    observer.observe(node);

    // Stop the music whenever the page is hidden — covers tab switch,
    // app background on mobile, screen lock, etc. The observer alone
    // can't catch these because the element technically stays in
    // the layout viewport.
    const onVisibility = () => {
      if (userOverrideRef.current) return;
      if (document.visibilityState === 'hidden' && ambient) {
        stopAmbient();
      }
    };
    // pagehide fires for iOS Safari bfcache page transitions where
    // visibilitychange sometimes doesn't.
    const onPageHide = () => {
      if (ambient) stopAmbient();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [ambient, startAmbient, stopAmbient]);

  if (slides.length === 0) return null;

  const active = slides[activeIndex] ?? slides[0];

  return (
    <div
      ref={reelRootRef}
      className="relative w-full rounded-xl overflow-hidden border bg-[#0b0a08]"
    >
      <InfiniteGallery
        images={slides.map((s) => ({ src: s.url, alt: s.caption }))}
        speed={0.8}
        visibleCount={Math.min(12, slides.length * 2)}
        className="h-[520px] md:h-[620px] w-full"
        onActiveImageChange={handleActiveImageChange}
      />

      {/* Top overlay — title */}
      <div className="pointer-events-none absolute top-4 left-0 right-0 flex justify-center px-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur px-3 py-1.5 text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">
            The U-Visa Archive · Image Reel
          </span>
        </div>
      </div>

      {/* Bottom overlay — synced caption card */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl mx-auto text-center text-white"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            <div className="inline-flex items-center gap-3">
              <span className="font-mono tabular-nums text-3xl md:text-4xl font-bold">
                {active.year}
              </span>
              <span className="text-xs md:text-sm uppercase tracking-[0.2em] text-white/80">
                {active.eventTitle}
              </span>
            </div>
            <p className="mt-2 text-sm md:text-base italic text-white/90 leading-snug">
              {active.caption}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/60">
              {active.credit} · {active.license}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Audio controls — bottom right */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleAmbient}
          aria-pressed={ambient}
          aria-label={
            ambient
              ? 'Stop "America the Beautiful"'
              : 'Play "America the Beautiful"'
          }
          className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur hover:bg-black/80 text-white px-3 py-1.5 text-xs shadow-lg transition-colors"
        >
          {ambient ? <Pause className="h-3.5 w-3.5" /> : <Music className="h-3.5 w-3.5" />}
          <span>America the Beautiful</span>
        </button>
      </div>

      {/* Hint — bottom left */}
      <div className="pointer-events-none absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.2em] text-white/50 font-mono">
        <span className="hidden sm:inline">
          Scroll · drag · arrow keys — auto-resumes after 3s
        </span>
        <span className="sm:hidden">Swipe to scrub</span>
      </div>
    </div>
  );
}
