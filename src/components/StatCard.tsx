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
      <CardContent className="p-3.5 flex flex-col gap-0.5">
        <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
          {label}
        </span>
        {typeof value === 'number' ? (
          <AnimatedNumber
            value={value}
            className="text-lg sm:text-xl font-semibold tabular-nums leading-tight"
          />
        ) : (
          <span className="text-lg sm:text-xl font-semibold tabular-nums leading-tight">
            {value}
          </span>
        )}
        {sublabel && (
          <span className="text-[11px] text-muted-foreground leading-snug">
            {sublabel}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
