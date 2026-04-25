'use client';

import {
  Database,
  TrendingUp,
  BarChart3,
  Activity,
  PieChart,
} from 'lucide-react';
import PipelineLoader from '@/components/PipelineLoader';

export default function DashboardLoading() {
  return (
    <div className="py-6">
      <PipelineLoader
        title="Building dashboard"
        subtitle="Aggregating USCIS I-918 receipts, approvals, denials, and pending inventory across every fiscal year."
        steps={[
          {
            key: 'principal',
            label: 'I-918 principal stats',
            Icon: Database,
            color: '#3b82f6',
          },
          {
            key: 'derivative',
            label: 'I-918A derivative stats',
            Icon: Database,
            color: '#0ea5e9',
          },
          {
            key: 'trends',
            label: 'Receipts vs approvals trend',
            Icon: TrendingUp,
            color: '#10b981',
          },
          {
            key: 'charts',
            label: 'Generating chart series',
            Icon: BarChart3,
            color: '#a855f7',
          },
          {
            key: 'kpis',
            label: 'Headline KPI cards',
            Icon: Activity,
            color: '#f59e0b',
          },
          {
            key: 'breakdown',
            label: 'Category & state breakdown',
            Icon: PieChart,
            color: '#ef4444',
          },
        ]}
      />
    </div>
  );
}