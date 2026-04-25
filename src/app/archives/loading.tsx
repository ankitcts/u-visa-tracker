'use client';

import {
  Archive,
  Newspaper,
  Library,
  Landmark,
  Filter,
} from 'lucide-react';
import PipelineLoader from '@/components/PipelineLoader';

export default function ArchivesLoading() {
  return (
    <div className="py-6">
      <PipelineLoader
        title="Loading archive search"
        subtitle="17 catalogued archives across 4 access tiers, with deep-link search URLs for every pivotal U-visa moment."
        steps={[
          {
            key: 'commercial',
            label: 'Commercial newspaper archives',
            Icon: Newspaper,
            color: '#3b82f6',
          },
          {
            key: 'niche',
            label: 'Specialized & niche databases',
            Icon: Archive,
            color: '#a855f7',
          },
          {
            key: 'free',
            label: 'Free & institutional archives',
            Icon: Library,
            color: '#10b981',
          },
          {
            key: 'gov',
            label: 'Government & legal sources',
            Icon: Landmark,
            color: '#ef4444',
          },
          {
            key: 'queries',
            label: 'Building deep-link searches',
            Icon: Filter,
            color: '#f59e0b',
          },
        ]}
      />
    </div>
  );
}