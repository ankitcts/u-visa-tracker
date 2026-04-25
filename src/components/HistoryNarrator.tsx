'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HISTORY } from '@/lib/u-visa-history';

/**
 * Floating "read the history aloud" control. Reads the *timeline* detail
 * (year + date + title + body for each event) end-to-end, with no
 * scroll-coupling. Audio is synthesised on the server in the same Aria
 * voice the Remotion video uses, via /api/narrate-timeline/<idx>.
 * Vercel CDN caches each event's mp3 after the first request.
 */
export default function HistoryNarrator() {
  const [enabled, setEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tear down on unmount.
  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.src = '';
      }
    };
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playTrack = useCallback((idx: number) => {
    if (idx < 0 || idx >= HISTORY.length) return;
    const url = `/api/narrate-timeline/${idx}`;
    const a = audioRef.current ?? new Audio();
    audioRef.current = a;
    a.preload = 'auto';
    a.src = url;
    setLoading(true);
    setError(null);

    a.onended = () => {
      setTrackIdx((i) => {
        const next = i + 1;
        if (next < HISTORY.length) {
          playTrack(next);
          return next;
        }
        setEnabled(false);
        setPaused(false);
        setLoading(false);
        return 0;
      });
    };
    a.oncanplay = () => setLoading(false);
    a.onplaying = () => setLoading(false);
    a.onerror = () => {
      setError('Audio failed to load');
      setLoading(false);
    };

    a.load();
    const p = a.play();
    if (p && typeof p.then === 'function') {
      p.catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('Narration play() blocked:', err);
        setError('Playback blocked — tap play');
        setLoading(false);
      });
    }
    setPaused(false);
  }, []);

  const handleStart = () => {
    // Tell any other audio components on the page to mute themselves
    // while the narration runs (the gallery music listens for this).
    window.dispatchEvent(new CustomEvent('uvt:narration-start'));
    setEnabled(true);
    setTrackIdx(0);
    playTrack(0);
  };

  const handlePauseToggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (paused) {
      a.play().catch(() => {});
      setPaused(false);
    } else {
      a.pause();
      setPaused(true);
    }
  };

  const handleSkip = () => {
    setTrackIdx((i) => {
      const next = i + 1;
      if (next < HISTORY.length) {
        playTrack(next);
        return next;
      }
      // Last track — stop.
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.src = '';
      }
      setEnabled(false);
      setPaused(false);
      return 0;
    });
  };

  const handleStop = () => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.src = '';
    }
    setEnabled(false);
    setPaused(false);
    setTrackIdx(0);
    setLoading(false);
    setError(null);
    window.dispatchEvent(new CustomEvent('uvt:narration-stop'));
  };

  if (HISTORY.length === 0) return null;

  const current = HISTORY[trackIdx];
  const yearLabel = current ? String(current.year) : '—';

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
          <span className="font-medium text-sm">Read the history aloud</span>
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
              'px-2 text-xs font-mono tabular-nums whitespace-nowrap',
              error
                ? 'text-destructive'
                : loading
                  ? 'text-muted-foreground animate-pulse'
                  : paused
                    ? 'text-muted-foreground'
                    : 'text-foreground',
            )}
          >
            {error
              ? error
              : loading
                ? `Loading ${yearLabel}…`
                : `${yearLabel} · ${trackIdx + 1}/${HISTORY.length}`}
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
