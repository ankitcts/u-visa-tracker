'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ExternalLink } from 'lucide-react';
import { HISTORY } from '@/lib/u-visa-history';

/**
 * Gallery of all verified public-domain / CC-licensed period images from
 * the U-visa timeline. Click any image to open a lightbox with full caption
 * and credit. Designed to feel like a curated archive — aged paper frame,
 * subtle sepia tone, masonry grid.
 */
interface GalleryImage {
  year: number;
  url: string;
  caption: string;
  credit: string;
  license: string;
  eventTitle: string;
}

export default function ClippingGallery() {
  const images: GalleryImage[] = HISTORY.flatMap((e) => {
    const rows: GalleryImage[] = [];
    if (e.image) {
      rows.push({
        year: e.year,
        url: e.image.url,
        caption: e.image.caption,
        credit: e.image.credit,
        license: e.image.license,
        eventTitle: e.title,
      });
    }
    for (const extra of e.extraImages ?? []) {
      rows.push({
        year: e.year,
        url: extra.url,
        caption: extra.caption,
        credit: extra.credit,
        license: extra.license,
        eventTitle: e.title,
      });
    }
    return rows;
  });

  const [active, setActive] = useState<GalleryImage | null>(null);

  if (images.length === 0) return null;

  // Convert /wikipedia/commons/... image URL into a /wiki/File:... credit page.
  // Defined inline so the helper stays co-located with the component using it.
  function commonsPageUrlFor(imageUrl: string): string {
    try {
      const u = new URL(imageUrl);
      if (u.hostname === 'upload.wikimedia.org') {
        const parts = u.pathname.split('/').filter(Boolean);
        const file = parts[parts.length - 1];
        return `https://commons.wikimedia.org/wiki/File:${file}`;
      }
    } catch {
      // fall through
    }
    return imageUrl;
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <motion.button
            key={`${img.year}-${i}`}
            type="button"
            onClick={() => setActive(img)}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.25 }}
            className="group text-left rounded-sm overflow-hidden border border-[#c8bb96] dark:border-[#5a5040] bg-[#fdfbf4] dark:bg-[#2a2824] shadow-sm hover:shadow-md transition-shadow"
            aria-label={`${img.year}: ${img.caption}`}
          >
            <div className="relative aspect-[4/3] bg-[#f4ecd8] dark:bg-[#1d1a14] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.caption}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                style={{ filter: 'sepia(0.08) saturate(0.95)' }}
              />
              <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-foreground shadow">
                {img.year}
              </span>
              <span className="absolute bottom-1.5 right-1.5 inline-flex items-center justify-center h-6 w-6 rounded-full bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-3 w-3" />
              </span>
            </div>
            <div
              className="px-2 py-1.5 border-t border-dashed border-[#c8bb96] dark:border-[#5a5040]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              <p className="text-[11px] italic leading-snug line-clamp-2 text-foreground/80">
                {img.caption}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-4xl w-full max-h-full rounded-xl overflow-hidden bg-[#fdfbf4] dark:bg-[#2a2824] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close"
                className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur hover:bg-background shadow"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="bg-[#f4ecd8] dark:bg-[#1d1a14] flex items-center justify-center max-h-[70vh] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.url}
                  alt={active.caption}
                  className="max-h-[70vh] w-auto object-contain"
                  style={{ filter: 'sepia(0.06)' }}
                />
              </div>
              <div
                className="p-4 md:p-5 space-y-1.5"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono tabular-nums text-2xl font-bold">
                    {active.year}
                  </span>
                  <span className="text-sm font-semibold">{active.eventTitle}</span>
                </div>
                <p className="text-sm italic text-foreground/80">
                  {active.caption}
                </p>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  {active.credit} · {active.license}
                </p>
                <a
                  href={commonsPageUrlFor(active.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline pt-1"
                >
                  Open source page on Wikimedia Commons
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
