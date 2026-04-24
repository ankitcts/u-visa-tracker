'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Floating "read the history" control. Uses the browser Web Speech API
 * (speechSynthesis) — no audio files, no API cost. Auto-picks a feminine
 * English voice (Samantha / Victoria / Google US English) and reads the
 * currently-visible timeline card. Scrolling to a new card automatically
 * queues the next narration unless the user has paused.
 */
export default function HistoryNarrator() {
  const [enabled, setEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const currentUtterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const spokenIds = useRef<Set<string>>(new Set());
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Detect support + pick the best voice once.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;
    setSupported(true);

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;
      // Priority order of known feminine English voices.
      const preferred = [
        /samantha/i,
        /victoria/i,
        /serena/i,
        /^Google UK English Female$/i,
        /^Google US English Female$/i,
        /^Google US English$/i, // often female on Chrome
        /allison/i,
        /ava/i,
        /karen/i,
        /moira/i,
        /tessa/i,
        /female/i,
      ];
      for (const re of preferred) {
        const match = voices.find(
          (v) => /en[-_]/i.test(v.lang) && re.test(v.name),
        );
        if (match) {
          voiceRef.current = match;
          return;
        }
      }
      // Fallback: any en-US voice
      voiceRef.current =
        voices.find((v) => v.lang === 'en-US') ??
        voices.find((v) => v.lang.startsWith('en')) ??
        voices[0];
    };

    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  // Intersection observer on each year-anchored card.
  useEffect(() => {
    if (!enabled) return;
    const sections = document.querySelectorAll<HTMLElement>('[data-narrate-id]');
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
            const id = entry.target.getAttribute('data-narrate-id') ?? '';
            const text = entry.target.getAttribute('data-narrate-text') ?? '';
            if (!id || !text) continue;
            setActiveYear(id);
            if (!paused && !spokenIds.current.has(id)) {
              spokenIds.current.add(id);
              speak(text);
            }
          }
        }
      },
      { threshold: [0.55, 0.7, 0.85] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, paused]);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) utter.voice = voiceRef.current;
    utter.rate = 1.0;
    utter.pitch = 1.15; // slightly brighter / lighter
    utter.lang = voiceRef.current?.lang ?? 'en-US';
    currentUtterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, []);

  const handleStart = () => {
    setEnabled(true);
    setPaused(false);
    spokenIds.current.clear();
    // Trigger immediate narration of the currently-centered card.
    requestAnimationFrame(() => {
      const centerY = window.innerHeight / 2;
      const cards = document.querySelectorAll<HTMLElement>('[data-narrate-id]');
      let closest: HTMLElement | null = null;
      let best = Infinity;
      cards.forEach((c) => {
        const rect = c.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const d = Math.abs(mid - centerY);
        if (d < best) {
          best = d;
          closest = c;
        }
      });
      if (closest) {
        const id = (closest as HTMLElement).getAttribute('data-narrate-id') ?? '';
        const text = (closest as HTMLElement).getAttribute('data-narrate-text') ?? '';
        if (id && text) {
          spokenIds.current.add(id);
          setActiveYear(id);
          speak(text);
        }
      }
    });
  };

  const handlePauseToggle = () => {
    if (!('speechSynthesis' in window)) return;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  const handleSkip = () => {
    window.speechSynthesis.cancel();
    // Find the next section after the current active one
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>('[data-narrate-id]'),
    );
    if (cards.length === 0) return;
    const idx = activeYear
      ? cards.findIndex((c) => c.getAttribute('data-narrate-id') === activeYear)
      : -1;
    const next = cards[idx + 1];
    if (next) {
      next.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const id = next.getAttribute('data-narrate-id') ?? '';
      const text = next.getAttribute('data-narrate-text') ?? '';
      if (id && text) {
        spokenIds.current.add(id);
        setActiveYear(id);
        setTimeout(() => speak(text), 450);
      }
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setEnabled(false);
    setPaused(false);
    setActiveYear(null);
    spokenIds.current.clear();
  };

  if (!supported) return null;

  return (
    <AnimatePresence>
      {!enabled ? (
        <motion.button
          key="start"
          type="button"
          onClick={handleStart}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 shadow-xl hover:scale-[1.03] transition-transform"
        >
          <Sparkles className="h-4 w-4" />
          <span className="font-medium text-sm">
            Read the history aloud
          </span>
          <Volume2 className="h-4 w-4" />
        </motion.button>
      ) : (
        <motion.div
          key="controls"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 rounded-full bg-background/95 backdrop-blur shadow-xl border px-2 py-2"
        >
          <button
            type="button"
            onClick={handlePauseToggle}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-accent text-foreground"
            aria-label={paused ? 'Resume narration' : 'Pause narration'}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-accent text-foreground"
            aria-label="Skip to next event"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <span
            className={cn(
              'px-2 text-xs font-mono tabular-nums',
              paused ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {activeYear ? activeYear.replace(/[^0-9]/g, '').slice(0, 4) : '—'}
          </span>
          <button
            type="button"
            onClick={handleStop}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-accent text-destructive"
            aria-label="Stop narration"
          >
            <VolumeX className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
