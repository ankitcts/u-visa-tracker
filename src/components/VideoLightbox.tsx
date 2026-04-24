'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';

/**
 * Inline video snapshot lightbox. When a news card has a YouTube URL in
 * `videoUrl`, clicking the card opens this modal with an embedded iframe
 * instead of navigating off-site. Esc or backdrop click closes.
 */
export interface VideoLightboxItem {
  title: string;
  source: string;
  videoUrl: string;
  articleUrl: string;
}

export default function VideoLightbox({
  item,
  onClose,
}: {
  item: VideoLightboxItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // Lock scroll while open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Video preview: ${item.title}`}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl rounded-xl bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close video"
              className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur hover:bg-background text-foreground shadow"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Video */}
            <div className="aspect-video bg-black">
              <YouTubeEmbed url={item.videoUrl} title={item.title} />
            </div>

            {/* Meta footer */}
            <div className="p-4 space-y-1.5">
              <h3 className="text-base font-semibold leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground">{item.source}</p>
              <a
                href={item.articleUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Open original
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Turns a YouTube watch / youtu.be URL into an embed URL with autoplay. */
function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const id = extractYouTubeId(url);
  if (!id) {
    // Fallback for non-YouTube video URLs: render a plain HTML5 <video>. The
    // browser will play it if the CORS / MIME lets it.
    return (
      <video
        src={url}
        controls
        autoPlay
        className="h-full w-full"
        aria-label={title}
      />
    );
  }
  const embedUrl =
    `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
  return (
    <iframe
      src={embedUrl}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="h-full w-full border-0"
    />
  );
}

/** Returns the 11-char video ID from any common YouTube URL shape, or null. */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1).split('/')[0] || null;
    }
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      // /embed/ID or /shorts/ID
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex((p) => p === 'embed' || p === 'shorts' || p === 'v');
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
  } catch {
    // fall through
  }
  return null;
}

/** True when the URL is a YouTube link we can iframe-embed. */
export function isYouTubeUrl(url?: string | null): boolean {
  if (!url) return false;
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i.test(
    url,
  );
}
