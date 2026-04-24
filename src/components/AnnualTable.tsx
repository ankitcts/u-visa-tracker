import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AnnualStat } from '@/lib/types';

export default function AnnualTable({ stats, form }: { stats: AnnualStat[]; form: string }) {
  const sorted = [...stats].sort((a, b) => b.fiscalYear - a.fiscalYear);
  return (
    <Table>
      <TableCaption className="text-left">
        {form} — annual aggregates (source: USCIS quarterly data)
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>FY</TableHead>
          <TableHead className="text-right">Received</TableHead>
          <TableHead className="text-right">Approved</TableHead>
          <TableHead className="text-right">Denied</TableHead>
          <TableHead className="text-right">Pending (end of FY)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((s) => (
          <TableRow key={`${s.form}-${s.fiscalYear}`} className="tabular-nums">
            <TableCell>FY{s.fiscalYear}</TableCell>
            <TableCell className="text-right">{s.received.toLocaleString()}</TableCell>
            <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
              {s.approved.toLocaleString()}
            </TableCell>
            <TableCell className="text-right text-rose-600 dark:text-rose-400">
              {s.denied.toLocaleString()}
            </TableCell>
            <TableCell className="text-right text-amber-600 dark:text-amber-400">
              {s.pendingEndOfYear.toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
