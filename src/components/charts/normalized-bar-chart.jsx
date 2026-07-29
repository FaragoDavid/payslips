import React, { useRef, useEffect, useState } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Payslip } from '../../data/payslip.js';
import { strings } from '../../i18n/strings.js';
import { labelColor, CATEGORY_COLORS, FIELD_COLORS } from '../../utils/colors.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const DATALABEL_FONT_SIZE = 11;
const MIN_LABEL_PERCENTAGE = 5;
const chartCategories = Payslip.categories.filter(({ key }) => Payslip.monetaryCategories.includes(key));

function buildBarData(payslips, labels, shownCategories) {
  const visibleCategories = chartCategories.filter(({ key }) => shownCategories.includes(key));
  const categoryValues = chartCategories.map(({ key }) => payslips.map((payslip) => Math.abs(payslip.sumCategory(key))));
  const totals = payslips.map((_, i) =>
    visibleCategories.reduce((sum, category) => {
      return sum + categoryValues[chartCategories.indexOf(category)][i];
    }, 0),
  );

  const categoryDatasets = chartCategories.map(({ key }, categoryIndex) => ({
    label: strings.categories[key],
    data: totals.map((total, i) => (total > 0 ? (categoryValues[categoryIndex][i] / total) * 100 : 0)),
    backgroundColor: CATEGORY_COLORS[key],
    categoryKey: key,
    stack: 'categories',
    barPercentage: 1,
    hidden: !shownCategories.includes(key) || visibleCategories.length === 1,
  }));

  const fieldDatasets = [];
  for (const { key, fields } of chartCategories) {
    const activeFields = fields.filter((field) => payslips.some((payslip) => payslip[field]));
    const avgByField = Object.fromEntries(
      activeFields.map((field) => [field, payslips.reduce((sum, p) => sum + Math.abs(p[field] || 0), 0) / payslips.length]),
    );
    activeFields.sort((a, b) => avgByField[b] - avgByField[a]);
    activeFields.forEach((field) => {
      const values = payslips.map((payslip) => Math.abs(payslip[field] || 0));
      fieldDatasets.push({
        label: strings.fields[field],
        data: totals.map((total, i) => (total > 0 ? (values[i] / total) * 100 : 0)),
        backgroundColor: FIELD_COLORS[field],
        categoryKey: key,
        stack: 'fields',
        barPercentage: 1,
        hidden: !shownCategories.includes(key),
      });
    });
  }

  return { labels, datasets: [...categoryDatasets, ...fieldDatasets] };
}

const STORED_CATEGORIES_KEY = 'payslips_shown_categories';

export default function NormalizedBarChart({ payslips, labels }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [shownCategories, setShownCategories] = useState(() => {
    const stored = localStorage.getItem(STORED_CATEGORIES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const valid = parsed.filter((key) => chartCategories.some(({ key: categoryKey }) => categoryKey === key));
      if (valid.length > 0) return valid;
    }
    return chartCategories.map(({ key }) => key);
  });

  const toggleCategory = (categoryKey) => {
    setShownCategories((current) => {
      let next;
      if (current.includes(categoryKey)) {
        if (current.length === 1) return current;
        next = current.filter((key) => key !== categoryKey);
      } else {
        next = [...current, categoryKey];
      }
      localStorage.setItem(STORED_CATEGORIES_KEY, JSON.stringify(next));
      return next;
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
        {chartCategories.map(({ key }) => (
          <button
            key={key}
            className={`chart-legend-btn ${shownCategories.includes(key) ? '' : 'inactive'}`}
            style={{ '--cat-color': CATEGORY_COLORS[key] }}
            onClick={() => toggleCategory(key)}
          >
            {strings.categories[key]}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
}
