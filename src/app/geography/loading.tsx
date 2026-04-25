'use client';

import { MapPin, Database, ShieldCheck, Layers } from 'lucide-react';
import PipelineLoader from '@/components/PipelineLoader';

export default function GeographyLoading() {
  return (
    <div className="py-6">
      <PipelineLoader
        title="Mapping I-918B certifications"
        subtitle="Loading FY2012–18 state shares, qualifying-crime mix, and certifying-agency breakdown."
        steps={[
          {
            key: 'states',
            label: 'State certification shares',
            Icon: MapPin,
            color: '#3b82f6',
          },
          {
            key: 'crimes',
            label: 'Qualifying-crime mix',
            Icon: Database,
            color: '#a855f7',
          },
          {
            key: 'agencies',
            label: 'Certifying-agency breakdown',
            Icon: ShieldCheck,
            color: '#10b981',
          },
          {
            key: 'render',
            label: 'Rendering choropleth',
            Icon: Layers,
            color: '#f59e0b',
          },
        ]}
      />
    </div>
  );
}