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
import type { CategoryShare } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CategoryBarChart({
  items,
  color = 'rgba(239, 68, 68, 0.8)',
  suffix = '%',
  max,
}: {
  items: CategoryShare[];
  color?: string;
  suffix?: string;
  max?: number;
}) {
  const sorted = [...items].sort((a, b) => b.share - a.share);
  return (
    <div className="h-[320px]">
      <Bar
        data={{
          labels: sorted.map((i) => i.label),
          datasets: [
            {
              label: 'Share',
              data: sorted.map((i) => i.share),
              backgroundColor: color,
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
                label: (ctx) => `${(ctx.parsed.x ?? 0).toFixed(2)}${suffix}`,
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              max,
              ticks: { callback: (v) => `${v}${suffix}` },
            },
          },
        }}
      />
    </div>
  );
}
