import React, { useRef, useEffect } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Payslip } from '../../data/payslip.js';
import { strings } from '../../i18n/strings.js';
import { interpolateHexColor, labelColor, CATEGORY_COLORS, FIELD_COLOR_RANGES } from '../../utils/colors.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DATALABEL_FONT_SIZE = 11;
const MIN_LABEL_PERCENTAGE = 5;

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
    activeFields.forEach((field) => {
      const values = payslips.map((p) => Math.abs(p[field] || 0));
      const ratio = category.fields.length > 1 ? category.fields.indexOf(field) / (category.fields.length - 1) : 0.5;
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
