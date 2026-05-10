import React, { useRef, useEffect } from 'react';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { strings } from '../../i18n/strings.js';
import { formatCurrency } from '../../utils/format.js';
import { yearColor } from '../../utils/colors.js';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

function buildLineData(payslips) {
  const years = [...new Set(payslips.map((p) => p.year))].sort();

  const datasets = years.map((year, index) => {
    const yearPayslips = payslips.filter((p) => p.year === year);
    const data = new Array(12).fill(null);
    for (const p of yearPayslips) {
      data[p.month - 1] = p.netPay();
    }
    const color = yearColor(index, years.length);
    return {
      label: String(year),
      data,
      borderColor: color,
      backgroundColor: color,
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
