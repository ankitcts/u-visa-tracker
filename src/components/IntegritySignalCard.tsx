import { AlertTriangle, Info, TriangleAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { IntegritySignal } from '@/lib/integrity';

const SEVERITY_META = {
  info: {
    label: 'Context',
    icon: Info,
    badge: 'secondary' as const,
    border: 'border-muted',
  },
  moderate: {
    label: 'Moderate concern',
    icon: AlertTriangle,
    badge: 'warning' as const,
    border: 'border-amber-400/60',
  },
  high: {
    label: 'High concern',
    icon: TriangleAlert,
    badge: 'destructive' as const,
    border: 'border-destructive/50',
  },
};

export default function IntegritySignalCard({ signal }: { signal: IntegritySignal }) {
  const meta = SEVERITY_META[signal.severity];
  const Icon = meta.icon;
  return (
    <Card className={meta.border}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <Icon className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
            <CardTitle className="text-base leading-tight">
              {signal.headline}
            </CardTitle>
          </div>
          <Badge variant={meta.badge}>{meta.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-semibold tabular-nums">{signal.figure}</div>
        <p className="text-sm text-muted-foreground">{signal.explanation}</p>
        <p className="text-xs text-muted-foreground italic">— {signal.source}</p>
      </CardContent>
    </Card>
  );
}
