'use client';

import { Database, FileText, Lock, Archive } from 'lucide-react';
import PipelineLoader from '@/components/PipelineLoader';

export default function SourcesLoading() {
  return (
    <div className="py-6">
      <PipelineLoader
        title="Loading data sources"
        subtitle="Government datasets that back every aggregate figure on this site."
        steps={[
          {
            key: 'uscis',
            label: 'USCIS quarterly data',
            Icon: Database,
            color: '#3b82f6',
          },
          {
            key: 'reports',
            label: 'DHS / OHSS yearbooks',
            Icon: FileText,
            color: '#a855f7',
          },
          {
            key: 'protected',
            label: '§ 1367 confidentiality note',
            Icon: Lock,
            color: '#ef4444',
          },
          {
            key: 'archive',
            label: 'Archive-search affordance',
            Icon: Archive,
            color: '#10b981',
          },
        ]}
      />
    </div>
  );
}