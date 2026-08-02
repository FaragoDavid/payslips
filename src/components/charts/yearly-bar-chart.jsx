import React, { useRef, useEffect } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useStrings } from '../../i18n/strings.js';
import { formatCurrency } from '../../utils/format.js';
import { NET_COLOR, CATEGORY_COLORS } from '../../utils/colors.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BAR_BORDER_RADIUS = 3;
const DATALABEL_FONT_SIZE = 12;

function buildBarData(yearlyPayslips, strings) {
  return {
    labels: yearlyPayslips.map((p) => String(p.year)),
    datasets: [
      {
        label: strings.table.net,
        data: yearlyPayslips.map((p) => p.netPay()),
        backgroundColor: NET_COLOR,
        borderRadius: BAR_BORDER_RADIUS,
        stack: 'stack',
      },
      {
        label: strings.categories.deductions,
        data: yearlyPayslips.map((p) => -p.sumCategory('deductions')),
        backgroundColor: CATEGORY_COLORS.deductions,
        borderRadius: BAR_BORDER_RADIUS,
        stack: 'stack',
      },
    ],
  };
}

export default function YearlyBarChart({ yearlyPayslips }) {
  const strings = useStrings();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || yearlyPayslips.length === 0) return;

    const chartData = buildBarData(yearlyPayslips, strings);

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
  }, [yearlyPayslips]);

  return <canvas ref={canvasRef} />;
}
