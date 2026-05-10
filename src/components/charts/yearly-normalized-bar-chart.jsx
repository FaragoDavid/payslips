import React, { useRef, useEffect } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { strings } from '../../i18n/strings.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const NET_COLOR = '#2196f3';
const DEDUCTIONS_COLOR = '#e53935';
const CAFETERIA_COLOR = '#ff9800';
const BAR_BORDER_RADIUS = 3;
const DATALABEL_FONT_SIZE = 12;

function buildBarData(yearlyPayslips) {
  const netValues = yearlyPayslips.map((p) => p.netPay());
  const deductionValues = yearlyPayslips.map((p) => Math.abs(p.sumCategory('deductions')));
  const cafeteriaValues = yearlyPayslips.map((p) => p.sumCategory('cafeteria'));
  const totals = yearlyPayslips.map((_, i) => netValues[i] + deductionValues[i] + cafeteriaValues[i]);

  return {
    labels: yearlyPayslips.map((p) => String(p.year)),
    datasets: [
      {
        label: strings.table.net,
        data: totals.map((total, i) => (total > 0 ? (netValues[i] / total) * 100 : 0)),
        backgroundColor: NET_COLOR,
        borderRadius: BAR_BORDER_RADIUS,
        stack: 'stack',
      },
      {
        label: strings.categories.deductions,
        data: totals.map((total, i) => (total > 0 ? (deductionValues[i] / total) * 100 : 0)),
        backgroundColor: DEDUCTIONS_COLOR,
        borderRadius: BAR_BORDER_RADIUS,
        stack: 'stack',
      },
      {
        label: strings.categories.cafeteria,
        data: totals.map((total, i) => (total > 0 ? (cafeteriaValues[i] / total) * 100 : 0)),
        backgroundColor: CAFETERIA_COLOR,
        borderRadius: BAR_BORDER_RADIUS,
        stack: 'stack',
      },
    ],
  };
}

export default function YearlyNormalizedBarChart({ yearlyPayslips }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || yearlyPayslips.length === 0) return;

    const chartData = buildBarData(yearlyPayslips);

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
              label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`,
            },
          },
          datalabels: {
            anchor: 'center',
            align: 'center',
            font: { size: DATALABEL_FONT_SIZE, weight: 'bold' },
            color: '#fff',
            display: (context) => context.dataset.data[context.dataIndex] >= 5,
            formatter: (value) => value.toFixed(0) + '%',
          },
        },
        scales: {
          x: { stacked: true },
          y: {
            stacked: true,
            min: 0,
            max: 100,
            ticks: {
              callback: (value) => value + '%',
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [yearlyPayslips]);

  return <canvas ref={canvasRef} />;
}
