import React, { useRef, useEffect, useState } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Payslip } from '../../data/payslip.js';
import { strings } from '../../i18n/strings.js';
import { interpolateHexColor, labelColor, CATEGORY_COLORS, FIELD_COLOR_RANGES } from '../../utils/colors.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const DATALABEL_FONT_SIZE = 11;
const MIN_LABEL_PERCENTAGE = 5;

function buildBarData(payslips, labels, shownCategories) {
  const visibleCategories = Payslip.categories.filter((cat) => shownCategories.includes(cat.key));
  const categoryValues = Payslip.categories.map((cat) => payslips.map((p) => Math.abs(p.sumCategory(cat.key))));
  const totals = payslips.map((_, i) =>
    visibleCategories.reduce((sum, category) => {
      return sum + categoryValues[Payslip.categories.indexOf(category)][i];
    }, 0),
  );

  const categoryDatasets = Payslip.categories.map(({ key }, ci) => ({
    label: strings.categories[key],
    data: totals.map((total, i) => (total > 0 ? (categoryValues[ci][i] / total) * 100 : 0)),
    backgroundColor: CATEGORY_COLORS[key],
    categoryKey: key,
    stack: 'categories',
    barPercentage: 1,
    hidden: !shownCategories.includes(key) || visibleCategories.length === 1,
  }));

  const fieldDatasets = [];
  for (const { key, fields } of Payslip.categories) {
    const [colorStart, colorEnd] = FIELD_COLOR_RANGES[key];
    const activeFields = fields.filter((field) => payslips.some((payslip) => payslip[field]));
    activeFields.forEach((field) => {
      const values = payslips.map((payslip) => Math.abs(payslip[field] || 0));
      const ratio = fields.length > 1 ? fields.indexOf(field) / (fields.length - 1) : 0.5;
      fieldDatasets.push({
        label: strings.fields[field],
        data: totals.map((total, i) => (total > 0 ? (values[i] / total) * 100 : 0)),
        backgroundColor: interpolateHexColor(colorStart, colorEnd, ratio),
        categoryKey: key,
        stack: 'fields',
        barPercentage: 1,
        hidden: !shownCategories.includes(key),
      });
    });
  }

  return { labels, datasets: [...categoryDatasets, ...fieldDatasets] };
}

export default function NormalizedBarChart({ payslips, labels }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [shownCategories, setShownCategories] = useState(Payslip.categories.map((cat) => cat.key));

  const toggleCategory = (categoryKey) => {
    setShownCategories((current) => {
      if (current.includes(categoryKey)) {
        if (current.length === 1) return current;
        return current.filter((key) => key !== categoryKey);
      }
      return [...current, categoryKey];
    });
  };

  useEffect(() => {
    if (!canvasRef.current || payslips.length === 0) return;

    const chartData = buildBarData(payslips, labels, shownCategories);

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
  }, [payslips, labels, shownCategories]);

  return (
    <div style={{ width: '100%' }}>
      <div className="chart-legend">
        {Payslip.categories.map((cat) => (
          <button
            key={cat.key}
            className={`chart-legend-btn ${shownCategories.includes(cat.key) ? '' : 'inactive'}`}
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
