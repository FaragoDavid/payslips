import React, { useRef, useEffect } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Payslip } from '../../data/payslip.js';
import { strings } from '../../i18n/strings.js';
import { interpolateHexColor } from '../../utils/interpolate-hex-color.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CATEGORY_COLORS = { income: '#4caf50', deductions: '#e53935', cafeteria: '#ff9800' };
const FIELD_COLOR_RANGES = {
  income: ['#81c784', '#2e7d32'],
  deductions: ['#ef9a9a', '#b71c1c'],
  cafeteria: ['#ffcc80', '#e65100'],
};
const DATALABEL_FONT_SIZE = 11;
const MIN_LABEL_PERCENTAGE = 5;

function labelColor(bgHex) {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#333' : '#fff';
}

function buildBarData(payslips) {
  const labels = payslips.map((p) => strings.months[p.month - 1]);
  const categoryValues = Payslip.categories.map((cat) => payslips.map((p) => Math.abs(p.sumCategory(cat.key))));
  const totals = payslips.map((_, i) => categoryValues.reduce((sum, vals) => sum + vals[i], 0));

  const categoryDatasets = Payslip.categories.map((cat, ci) => ({
    label: strings.categories[cat.key],
    data: totals.map((total, i) => (total > 0 ? (categoryValues[ci][i] / total) * 100 : 0)),
    backgroundColor: CATEGORY_COLORS[cat.key],
    stack: 'categories',
    barPercentage: 1,
  }));

  const fieldDatasets = [];
  for (const category of Payslip.categories) {
    const [colorStart, colorEnd] = FIELD_COLOR_RANGES[category.key];
    const activeFields = category.fields.filter((field) => payslips.some((p) => p[field]));
    activeFields.forEach((field, index) => {
      const values = payslips.map((p) => Math.abs(p[field] || 0));
      const ratio = activeFields.length > 1 ? index / (activeFields.length - 1) : 0.5;
      fieldDatasets.push({
        label: strings.fields[field],
        data: totals.map((total, i) => (total > 0 ? (values[i] / total) * 100 : 0)),
        backgroundColor: interpolateHexColor(colorStart, colorEnd, ratio),
        stack: 'fields',
        barPercentage: 1,
        hidden: false,
      });
    });
  }

  return { labels, datasets: [...categoryDatasets, ...fieldDatasets] };
}

export default function MonthlyNormalizedBarChart({ payslips }) {
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
          legend: {
            position: 'top',
            labels: {
              filter: (item) =>
                item.text === strings.categories.income ||
                item.text === strings.categories.deductions ||
                item.text === strings.categories.cafeteria,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`,
            },
          },
          datalabels: {
            anchor: 'center',
            align: 'center',
            font: { size: DATALABEL_FONT_SIZE, weight: 'bold' },
            color: (context) => labelColor(context.dataset.backgroundColor),
            display: (context) => context.dataset.data[context.dataIndex] >= MIN_LABEL_PERCENTAGE,
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
  }, [payslips]);

  return <canvas ref={canvasRef} />;
}
