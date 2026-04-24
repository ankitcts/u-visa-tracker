'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { AnnualStat } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function BacklogChart({
  principal,
  derivative,
}: {
  principal: AnnualStat[];
  derivative: AnnualStat[];
}) {
  const sortedP = [...principal].sort((a, b) => a.fiscalYear - b.fiscalYear);
  const sortedD = [...derivative].sort((a, b) => a.fiscalYear - b.fiscalYear);
  const labels = sortedP.map((s) => `FY${s.fiscalYear}`);

  return (
    <div className="h-[340px]">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: 'I-918 Principal Pending',
              data: sortedP.map((s) => s.pendingEndOfYear),
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              fill: true,
              tension: 0.25,
            },
            {
              label: 'I-918A Derivative Pending',
              data: sortedD.map((s) => s.pendingEndOfYear),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              fill: true,
              tension: 0.25,
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
