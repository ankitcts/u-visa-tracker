'use client';

import { Clock, Database, TrendingUp, Calculator, Hourglass } from 'lucide-react';
import PipelineLoader from '@/components/PipelineLoader';

export default function BacklogLoading() {
  return (
    <div className="py-6">
      <PipelineLoader
        title="Calculating backlog"
        subtitle="Reading USCIS pending-inventory snapshots and projecting clear-out timelines under the 10,000 statutory cap."
        steps={[
          {
            key: 'pending',
            label: 'Pending principals by FY',
            Icon: Database,
            color: '#3b82f6',
          },
          {
            key: 'quarterly',
            label: 'Rolling quarterly stats',
            Icon: Clock,
            color: '#0ea5e9',
          },
          {
            key: 'rate',
            label: 'Approval rate vs cap',
            Icon: TrendingUp,
            color: '#a855f7',
          },
          {
            key: 'projection',
            label: 'Time-to-clear projection',
            Icon: Calculator,
            color: '#f59e0b',
          },
          {
            key: 'wait',
            label: 'Estimated wait time',
            Icon: Hourglass,
            color: '#ef4444',
          },
        ]}
      />
    </div>
  );
}