'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { StateCertShare } from '@/lib/types';
import { computeFraudLean, NATIONAL_FA_LEAN } from '@/lib/integrity';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function FraudLeanChart({ states }: { states: StateCertShare[] }) {
  const withLean = states
    .map((s) => ({ state: s.state, lean: computeFraudLean(s) }))
    .filter((s): s is { state: string; lean: number } => s.lean !== null)
    .sort((a, b) => b.lean - a.lean);

  const labels = withLean.map((s) => s.state);
  const values = withLean.map((s) => s.lean * 100);
  const nationalPct = NATIONAL_FA_LEAN * 100;

  const bgColors = values.map((v) => {
    if (v >= 60) return 'rgba(239, 68, 68, 0.85)'; // high
    if (v >= 50) return 'rgba(234, 179, 8, 0.85)'; // elevated
    if (v >= 40) return 'rgba(59, 130, 246, 0.7)'; // near avg
    return 'rgba(148, 163, 184, 0.7)'; // DV-heavy
  });

  return (
    <div className="h-[360px]">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: 'Felonious Assault share of top two crimes (%)',
              data: values,
              backgroundColor: bgColors,
              borderRadius: 4,
            },
          ],
        }}
        options={{
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `FA lean: ${(ctx.parsed.x ?? 0).toFixed(1)}%  (nat'l ~${nationalPct.toFixed(0)}%)`,
              },
            },
          },
          scales: {
            x: {
              min: 0,
              max: 80,
              ticks: { callback: (v) => `${v}%` },
              title: {
                display: true,
                text: 'FA lean — higher = larger share of state certs in the USCIS-flagged category',
              },
            },
          },
        }}
      />
    </div>
  );
}
