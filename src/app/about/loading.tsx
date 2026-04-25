import { Info, BookOpen, Users, Shield } from 'lucide-react';
import PipelineLoader from '@/components/PipelineLoader';

export default function AboutLoading() {
  return (
    <div className="py-6">
      <PipelineLoader
        title="Loading about page"
        steps={[
          {
            key: 'mission',
            label: 'Site mission',
            Icon: Info,
            color: '#3b82f6',
          },
          {
            key: 'method',
            label: 'Methodology',
            Icon: BookOpen,
            color: '#a855f7',
          },
          {
            key: 'audience',
            label: 'Who this is for',
            Icon: Users,
            color: '#10b981',
          },
          {
            key: 'priv',
            label: '§ 1367 protections',
            Icon: Shield,
            color: '#ef4444',
          },
        ]}
      />
    </div>
  );
}
