'use client';

import { useMemo, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'motion/react';
import { Volume2, VolumeX, Music, Pause, Play, X } from 'lucide-react';
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
  const out: GallerySlide[] = [];
  for (const e of HISTORY) {
    if (e.image) out.push(toSlide(e.year, e.title, e.image));
    for (const extra of e.extraImages ?? []) {
      out.push(toSlide(e.year, e.title, extra));
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
 * image is closest to the camera. A soft ambient drone + the existing Edge-TTS
 * narrator can be toggled on for documentary feel.
 */
export default function HistoryGallery3D() {
  const slides = useMemo(flattenHistoryImages, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [ambient, setAmbient] = useState(false);
  const [narration, setNarration] = useState(false);

  const ambientRef = useRef<{
    ctx: AudioContext;
    nodes: OscillatorNode[];
    gain: GainNode;
  } | null>(null);
  const narratorRef = useRef<HTMLAudioElement | null>(null);

  const handleActiveImageChange = useCallback((i: number) => {
    setActiveIndex(i);
  }, []);

  const startAmbient = useCallback(() => {
    if (ambientRef.current) return;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = 0.06; // very subtle
      master.connect(ctx.destination);

      // Soft minor-9 chord drone (A2, E3, A3, C4, E4) with slow LFO on gain.
      const freqs = [110, 164.81, 220, 261.63, 329.63];
      const oscs: OscillatorNode[] = freqs.map((f, i) => {
        const o = ctx.createOscillator();
        o.type = i === 0 ? 'sine' : 'triangle';
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = 0.18 - i * 0.025;
        // slow detune drift for organic feel
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.05 + i * 0.02;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 3; // cents
        lfo.connect(lfoGain);
        lfoGain.connect(o.detune);
        lfo.start();
        o.connect(g);
        g.connect(master);
        o.start();
        return o;
      });

      ambientRef.current = { ctx, nodes: oscs, gain: master };
      setAmbient(true);
    } catch {
      setAmbient(false);
    }
  }, []);

  const stopAmbient = useCallback(() => {
    const cur = ambientRef.current;
    if (!cur) return;
    try {
      cur.gain.gain.cancelScheduledValues(cur.ctx.currentTime);
      cur.gain.gain.setValueAtTime(cur.gain.gain.value, cur.ctx.currentTime);
      cur.gain.gain.linearRampToValueAtTime(0.0001, cur.ctx.currentTime + 0.3);
      setTimeout(() => {
        cur.nodes.forEach((o) => {
          try {
            o.stop();
          } catch {}
        });
        cur.ctx.close();
      }, 400);
    } catch {}
    ambientRef.current = null;
    setAmbient(false);
  }, []);

  const toggleAmbient = useCallback(() => {
    if (ambient) stopAmbient();
    else startAmbient();
  }, [ambient, startAmbient, stopAmbient]);

  const toggleNarration = useCallback(() => {
    if (!narratorRef.current) {
      const audio = new Audio('/narration/aria/intro.mp3');
      audio.loop = true;
      audio.volume = 0.8;
      narratorRef.current = audio;
    }
    const a = narratorRef.current;
    if (narration) {
      a.pause();
      setNarration(false);
    } else {
      a.play().then(() => setNarration(true)).catch(() => setNarration(false));
    }
  }, [narration]);

  if (slides.length === 0) return null;

  const active = slides[activeIndex] ?? slides[0];

  return (
    <div className="relative w-full rounded-xl overflow-hidden border bg-[#0b0a08]">
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
          aria-label={ambient ? 'Stop ambient music' : 'Play ambient music'}
          className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur hover:bg-black/80 text-white px-3 py-1.5 text-xs shadow-lg transition-colors"
        >
          {ambient ? <Pause className="h-3.5 w-3.5" /> : <Music className="h-3.5 w-3.5" />}
          <span>Ambient</span>
        </button>
        <button
          type="button"
          onClick={toggleNarration}
          aria-pressed={narration}
          aria-label={narration ? 'Stop narration' : 'Play narration'}
          className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur hover:bg-black/80 text-white px-3 py-1.5 text-xs shadow-lg transition-colors"
        >
          {narration ? (
            <VolumeX className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
          <span>Narration</span>
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
