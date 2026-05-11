import React, { useRef, useEffect, useState } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Payslip } from '../../data/payslip.js';
import { strings } from '../../i18n/strings.js';
import { interpolateHexColor, labelColor, CATEGORY_COLORS, FIELD_COLOR_RANGES } from '../../utils/colors.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const DATALABEL_FONT_SIZE = 11;
const MIN_LABEL_PERCENTAGE = 5;

function buildBarData(payslips, hiddenCategories) {
  const labels = payslips.map((p) => strings.months[p.month - 1]);
  const visibleCategories = Payslip.categories.filter((cat) => !hiddenCategories[cat.key]);
  const categoryValues = Payslip.categories.map((cat) => payslips.map((p) => Math.abs(p.sumCategory(cat.key))));
  const totals = payslips.map((_, i) =>
    visibleCategories.reduce((sum, cat) => {
      const ci = Payslip.categories.indexOf(cat);
      return sum + categoryValues[ci][i];
    }, 0),
  );

  const categoryDatasets = Payslip.categories.map((cat, ci) => ({
    label: strings.categories[cat.key],
    data: totals.map((total, i) => (total > 0 ? (categoryValues[ci][i] / total) * 100 : 0)),
    backgroundColor: CATEGORY_COLORS[cat.key],
    categoryKey: cat.key,
    stack: 'categories',
    barPercentage: 1,
    hidden: !!hiddenCategories[cat.key] || visibleCategories.length === 1,
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
        categoryKey: category.key,
        stack: 'fields',
        barPercentage: 1,
        hidden: !!hiddenCategories[category.key],
      });
    });
  }

  return { labels, datasets: [...categoryDatasets, ...fieldDatasets] };
}

export default function MonthlyNormalizedBarChart({ payslips }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [hiddenCategories, setHiddenCategories] = useState({});

  const toggleCategory = (key) => {
    setHiddenCategories((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (Payslip.categories.every((cat) => next[cat.key])) return prev;
      return next;
    });
  };

  useEffect(() => {
    if (!canvasRef.current || payslips.length === 0) return;

    const chartData = buildBarData(payslips, hiddenCategories);

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
          legend: { display: false },
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
  }, [payslips, hiddenCategories]);

  return (
    <div style={{ width: '100%' }}>
      <div className="chart-legend">
        {Payslip.categories.map((cat) => (
          <button
            key={cat.key}
            className={`chart-legend-btn ${hiddenCategories[cat.key] ? 'inactive' : ''}`}
            style={{ '--cat-color': CATEGORY_COLORS[cat.key] }}
            onClick={() => toggleCategory(cat.key)}
          >
            {strings.categories[cat.key]}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
}
