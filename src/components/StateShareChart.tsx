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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function StateShareChart({ states }: { states: StateCertShare[] }) {
  const sorted = [...states].sort((a, b) => b.share - a.share);
  const allStatesShare = sorted.reduce((sum, s) => sum + s.share, 0);
  const remainder = Math.max(0, 100 - allStatesShare);

  const labels = [...sorted.map((s) => s.state), 'All other states'];
  const shares = [...sorted.map((s) => s.share), remainder];

  return (
    <div className="h-[420px]">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: 'Share of national I-918B certifications (FY2012–18)',
              data: shares,
              backgroundColor: labels.map((_, i) =>
                i === labels.length - 1
                  ? 'rgba(148, 163, 184, 0.6)'
                  : 'rgba(59, 130, 246, 0.8)',
              ),
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
                label: (ctx) => `${(ctx.parsed.x ?? 0).toFixed(1)}% of national total`,
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              max: 40,
              ticks: { callback: (v) => `${v}%` },
            },
          },
        }}
      />
    </div>
  );
}
