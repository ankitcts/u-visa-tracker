'use client';

import {
  BookOpen,
  Image as ImageIcon,
  Layers,
  Volume2,
  Archive,
} from 'lucide-react';
import PipelineLoader from '@/components/PipelineLoader';

/**
 * Loader for the / (history) landing page AND the global fallback for any
 * route that doesn't ship its own loading.tsx. The bespoke per-route
 * loaders under dashboard / backlog / geography / integrity / litigation /
 * analyze / archives / sources / u-visa / about / news already override
 * this; what's left for this loader to cover is the history homepage.
 */
export default function Loading() {
  return (
    <div className="py-6">
      <PipelineLoader
        title="Loading history"
        subtitle="Hero, interactive timeline, period photo gallery, 3D image reel, and animated narrated video."
        steps={[
          {
            key: 'timeline',
            label: 'Historical timeline (16 events)',
            Icon: BookOpen,
            color: '#3b82f6',
          },
          {
            key: 'images',
            label: 'Verifying period images',
            Icon: ImageIcon,
            color: '#a855f7',
          },
          {
            key: 'reel',
            label: 'Loading 3D photo reel',
            Icon: Layers,
            color: '#10b981',
          },
          {
            key: 'narrator',
            label: 'Preparing narrator',
            Icon: Volume2,
            color: '#f59e0b',
          },
          {
            key: 'archive',
            label: 'Archive-search CTA',
            Icon: Archive,
            color: '#ef4444',
          },
        ]}
      />
    </div>
  );
}