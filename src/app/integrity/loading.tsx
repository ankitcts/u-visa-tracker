import {
  ShieldAlert,
  AlertTriangle,
  FileText,
  Newspaper,
  Search,
} from 'lucide-react';
import PipelineLoader from '@/components/PipelineLoader';

export default function IntegrityLoading() {
  return (
    <div className="py-6">
      <PipelineLoader
        title="Loading integrity signals"
        subtitle="USCIS-reported fraud-detection metrics, certification gaps, and recent indictment coverage."
        steps={[
          {
            key: 'lean',
            label: 'Fraud-lean rate trend',
            Icon: AlertTriangle,
            color: '#ef4444',
          },
          {
            key: 'cert-gap',
            label: 'I-918B certification gaps',
            Icon: ShieldAlert,
            color: '#f59e0b',
          },
          {
            key: 'omb',
            label: 'USCIS Ombudsman reports',
            Icon: FileText,
            color: '#a855f7',
          },
          {
            key: 'recent',
            label: 'Recent fraud-case coverage',
            Icon: Newspaper,
            color: '#3b82f6',
          },
          {
            key: 'classify',
            label: 'Classifying integrity tags',
            Icon: Search,
            color: '#10b981',
          },
        ]}
      />
    </div>
  );
}
