'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { AnnualStat } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function FilingsTrendChart({ stats }: { stats: AnnualStat[] }) {
  const sorted = [...stats].sort((a, b) => a.fiscalYear - b.fiscalYear);
  const labels = sorted.map((s) => `FY${s.fiscalYear}`);

  return (
    <div className="h-[340px]">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: 'Received',
              data: sorted.map((s) => s.received),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderRadius: 4,
            },
            {
              label: 'Approved',
              data: sorted.map((s) => s.approved),
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderRadius: 4,
            },
            {
              label: 'Denied',
              data: sorted.map((s) => s.denied),
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              borderRadius: 4,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString()}` } },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (v) => Number(v).toLocaleString() },
            },
          },
        }}
      />
    </div>
  );
}
