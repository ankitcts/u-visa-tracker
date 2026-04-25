import { Sliders, Filter, BarChart3, Table } from 'lucide-react';
import PipelineLoader from '@/components/PipelineLoader';

export default function AnalyzeLoading() {
  return (
    <div className="py-6">
      <PipelineLoader
        title="Preparing analyzer"
        subtitle="Building filterable views over USCIS I-918 receipts, approvals, and denials by year and state."
        steps={[
          {
            key: 'filters',
            label: 'Initializing filters',
            Icon: Sliders,
            color: '#3b82f6',
          },
          {
            key: 'data',
            label: 'Loading filtered series',
            Icon: Filter,
            color: '#a855f7',
          },
          {
            key: 'charts',
            label: 'Generating charts',
            Icon: BarChart3,
            color: '#10b981',
          },
          {
            key: 'table',
            label: 'Rendering data table',
            Icon: Table,
            color: '#f59e0b',
          },
        ]}
      />
    </div>
  );
}
