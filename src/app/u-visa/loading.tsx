'use client';

import { Scale, Users, CheckCircle2, Video } from 'lucide-react';
import PipelineLoader from '@/components/PipelineLoader';

export default function UVisaLoading() {
  return (
    <div className="py-6">
      <PipelineLoader
        title="Loading U-Visa explainer"
        subtitle="Categories, eligibility criteria, the law-enforcement certification, and the 10,000 annual cap."
        steps={[
          {
            key: 'crime',
            label: 'Qualifying-crime list',
            Icon: Scale,
            color: '#3b82f6',
          },
          {
            key: 'cooperate',
            label: 'Cooperation requirement',
            Icon: Users,
            color: '#a855f7',
          },
          {
            key: 'process',
            label: 'Adjudication & cap',
            Icon: CheckCircle2,
            color: '#10b981',
          },
          {
            key: 'video',
            label: 'Loading video explainer',
            Icon: Video,
            color: '#f59e0b',
          },
        ]}
      />
    </div>
  );
}