import { Card, CardContent } from '@/components/ui/card';
import AnimatedNumber from '@/components/AnimatedNumber';

export default function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <Card className="transition-colors hover:border-primary/40">
      <CardContent className="p-4 flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {typeof value === 'number' ? (
          <AnimatedNumber
            value={value}
            className="text-2xl sm:text-3xl font-semibold tabular-nums"
          />
        ) : (
          <span className="text-2xl sm:text-3xl font-semibold tabular-nums">
            {value}
          </span>
        )}
        {sublabel && (
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        )}
      </CardContent>
    </Card>
  );
}
