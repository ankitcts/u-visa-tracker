'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { AnnualStat } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

export default function DerivativeLinkedChart({
  principal,
  derivative,
}: {
  principal: AnnualStat[];
  derivative: AnnualStat[];
}) {
  const sortedP = [...principal].sort((a, b) => a.fiscalYear - b.fiscalYear);
  const sortedD = [...derivative].sort((a, b) => a.fiscalYear - b.fiscalYear);
  const labels = sortedP.map((s) => `FY${s.fiscalYear}`);
  const ratios = sortedP.map((s, i) => {
    const d = sortedD[i];
    return d && s.approved > 0 ? d.approved / s.approved : 0;
  });

  return (
    <div className="h-[360px]">
      <Chart
        type="bar"
        data={{
          labels,
          datasets: [
            {
              type: 'bar' as const,
              label: 'Principal (U-1) approved',
              data: sortedP.map((s) => s.approved),
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderRadius: 4,
              yAxisID: 'y',
            },
            {
              type: 'bar' as const,
              label: 'Derivatives (U-2/3/4/5) approved',
              data: sortedD.map((s) => s.approved),
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderRadius: 4,
              yAxisID: 'y',
            },
            {
              type: 'line' as const,
              label: 'Derivatives per principal',
              data: ratios,
              borderColor: 'rgba(239, 68, 68, 1)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              yAxisID: 'y1',
              tension: 0.3,
              pointRadius: 3,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const v = ctx.parsed.y ?? 0;
                  if (ctx.dataset.yAxisID === 'y1') {
                    return `${ctx.dataset.label}: ${v.toFixed(2)}×`;
                  }
                  return `${ctx.dataset.label}: ${v.toLocaleString()}`;
                },
              },
            },
          },
          scales: {
            y: {
              position: 'left',
              beginAtZero: true,
              ticks: { callback: (v) => Number(v).toLocaleString() },
              title: { display: true, text: 'Approvals' },
            },
            y1: {
              position: 'right',
              beginAtZero: true,
              grid: { drawOnChartArea: false },
              title: { display: true, text: 'Derivatives per principal' },
              ticks: { callback: (v) => `${Number(v).toFixed(1)}×` },
            },
          },
        }}
      />
    </div>
  );
}
