import { Card, CardContent } from '@/components/ui/card';

export default function OutcomeFunnel({
  steps,
}: {
  steps: { label: string; share: number; note?: string }[];
}) {
  const max = Math.max(...steps.map((s) => s.share));
  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const width = Math.max(10, (s.share / max) * 100);
        const colorIntensity = Math.round(220 - i * 30);
        return (
          <div key={s.label}>
            <div className="flex items-baseline justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-medium">{s.label}</span>
              </div>
              <span className="font-semibold tabular-nums">{s.share}%</span>
            </div>
            <div
              className="h-8 rounded-md flex items-center justify-start pl-3 text-xs text-white transition-all"
              style={{
                width: `${width}%`,
                backgroundColor: `rgb(${Math.max(80, colorIntensity)}, ${Math.max(50, colorIntensity - 60)}, ${Math.max(40, colorIntensity - 80)})`,
              }}
            >
              {s.note && (
                <span className="opacity-90 truncate">{s.note}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
