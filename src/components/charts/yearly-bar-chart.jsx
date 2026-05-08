import React, { useRef, useEffect } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Payslip } from '../../data/payslip.js';
import { strings } from '../../i18n/strings.js';
import { formatCurrency } from '../../utils/format.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const NET_COLOR = '#2196f3';
const DEDUCTIONS_COLOR = '#e53935';
const BAR_BORDER_RADIUS = 3;
const DATALABEL_FONT_SIZE = 12;

function buildBarData(payslips) {
  const years = [...new Set(payslips.map((p) => p.year))].sort();

  const netData = years.map((year) => {
    const yp = payslips.filter((p) => p.year === year);
    return yp.reduce((sum, p) => sum + p.netPay(), 0);
  });

  const deductionsData = years.map((year) => {
    const yp = payslips.filter((p) => p.year === year);
    return -yp.reduce((sum, p) => sum + p.sumCategory('deductions'), 0);
  });

  return {
    labels: years.map(String),
    datasets: [
      {
        label: strings.table.net,
        data: netData,
        backgroundColor: NET_COLOR,
        borderRadius: BAR_BORDER_RADIUS,
        stack: 'stack',
      },
      {
        label: strings.categories.deductions,
        data: deductionsData,
        backgroundColor: DEDUCTIONS_COLOR,
        borderRadius: BAR_BORDER_RADIUS,
        stack: 'stack',
      },
    ],
  };
}

export default function YearlyBarChart({ payslips }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || payslips.length === 0) return;

    const chartData = buildBarData(payslips);

    if (chartRef.current) {
      chartRef.current.data = chartData;
      chartRef.current.update();
      return;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: chartData,
      plugins: [ChartDataLabels],
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
          datalabels: {
            anchor: 'center',
            align: 'center',
            font: { size: DATALABEL_FONT_SIZE, weight: 'bold' },
            color: '#fff',
            formatter: (value) => formatCurrency(value),
          },
        },
        scales: {
          x: { stacked: true },
          y: {
            stacked: true,
            beginAtZero: true,
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
