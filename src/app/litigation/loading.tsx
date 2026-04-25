import { Gavel, FileText, Scale, BookOpen, Search } from 'lucide-react';
import PipelineLoader from '@/components/PipelineLoader';

export default function LitigationLoading() {
  return (
    <div className="py-6">
      <PipelineLoader
        title="Loading litigation"
        subtitle="Fetching U-visa case opinions, plaintiff rosters, and circuit-court rulings on USCIS processing duties."
        steps={[
          {
            key: 'opinions',
            label: 'Federal court opinions',
            Icon: Gavel,
            color: '#f59e0b',
          },
          {
            key: 'cases',
            label: 'Cataloguing cases',
            Icon: FileText,
            color: '#3b82f6',
          },
          {
            key: 'rulings',
            label: 'Circuit-court rulings',
            Icon: Scale,
            color: '#a855f7',
          },
          {
            key: 'cites',
            label: 'Pulling primary citations',
            Icon: BookOpen,
            color: '#10b981',
          },
          {
            key: 'render',
            label: 'Rendering case law',
            Icon: Search,
            color: '#ef4444',
          },
        ]}
      />
    </div>
  );
}
