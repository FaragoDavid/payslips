import React, { useRef, useEffect } from 'react';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useStrings } from '../../i18n/strings.js';
import { formatHourlyRate } from '../../utils/format.js';
import { yearColor } from '../../utils/colors.js';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

function buildLineData(payslips, strings) {
  const years = [...new Set(payslips.map((payslip) => payslip.year))].sort();

  const datasets = years.map((year, index) => {
    const yearPayslips = payslips.filter((payslip) => payslip.year === year);
    const data = new Array(12).fill(null);
    for (const payslip of yearPayslips) {
      if (payslip.work_hours) data[payslip.month - 1] = Math.round(payslip.netPay() / payslip.work_hours);
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

export default function HourlyRateTrendChart({ payslips }) {
  const strings = useStrings();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || payslips.length === 0) return;

    const chartData = buildLineData(payslips, strings);

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
              label: (context) => `${context.dataset.label}: ${formatHourlyRate(context.raw)}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => formatHourlyRate(value),
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
