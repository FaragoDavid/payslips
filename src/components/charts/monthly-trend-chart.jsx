import React, { useRef, useEffect } from 'react';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { strings } from '../../i18n/strings.js';
import { formatCurrency } from '../../utils/format.js';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const YEAR_COLORS = ['#4caf50', '#2196f3', '#ff9800', '#e53935', '#9c27b0', '#00bcd4'];

function buildLineData(payslips) {
  const years = [...new Set(payslips.map((p) => p.year))].sort();

  const datasets = years.map((year, index) => {
    const yearPayslips = payslips.filter((p) => p.year === year);
    const data = new Array(12).fill(null);
    for (const p of yearPayslips) {
      data[p.month - 1] = p.netPay();
    }
    return {
      label: String(year),
      data,
      borderColor: YEAR_COLORS[index % YEAR_COLORS.length],
      backgroundColor: YEAR_COLORS[index % YEAR_COLORS.length],
      tension: 0,
      spanGaps: false,
    };
  });

  return { labels: strings.months, datasets };
}

export default function MonthlyTrendChart({ payslips }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || payslips.length === 0) return;

    const chartData = buildLineData(payslips);

    if (chartRef.current) {
      chartRef.current.data = chartData;
      chartRef.current.update();
      return;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => formatCurrency(value),
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [payslips]);

  return <canvas ref={canvasRef} />;
}
