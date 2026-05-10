import React, { useRef, useEffect } from 'react';
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Payslip } from '../../data/payslip.js';
import { strings } from '../../i18n/strings.js';
import { interpolateHexColor, labelColor, CATEGORY_COLORS, FIELD_COLOR_RANGES } from '../../utils/colors.js';
import { formatCurrency } from '../../utils/format.js';

Chart.register(DoughnutController, ArcElement, Tooltip);

const SINGLE_ITEM_RATIO = 0.5;
const CUTOUT_PERCENTAGE = '25%';
const LAYOUT_PADDING = 10;
const OUTER_LABEL_FONT_SIZE = 11;
const INNER_LABEL_FONT_SIZE = 13;
const INNER_RING_WEIGHT = 1.5;
const MIN_LABEL_PERCENTAGE = 0.05;

function buildChartData(payslips) {
  const allFields = Payslip.categories.flatMap(({ fields }) => fields);
  const aggregated = {};
  for (const payslip of payslips) {
    for (const field of allFields) {
      aggregated[field] = (aggregated[field] || 0) + (payslip[field] || 0);
    }
  }

  const innerLabels = [];
  const innerValues = [];
  const innerColors = [];
  const outerLabels = [];
  const outerValues = [];
  const outerColors = [];

  for (const category of Payslip.categories) {
    const categoryTotal = Math.abs(payslips.reduce((sum, payslip) => sum + payslip.sumCategory(category.key), 0));
    if (categoryTotal === 0) continue;

    innerLabels.push(strings.categories[category.key]);
    innerValues.push(categoryTotal);
    innerColors.push(CATEGORY_COLORS[category.key]);

    const activeFields = category.fields.filter((field) => aggregated[field]);
    const [colorStart, colorEnd] = FIELD_COLOR_RANGES[category.key];

    activeFields.forEach((field) => {
      outerLabels.push(strings.fields[field]);
      outerValues.push(Math.abs(aggregated[field]));
      const ratio = category.fields.length > 1 ? category.fields.indexOf(field) / (category.fields.length - 1) : SINGLE_ITEM_RATIO;
      outerColors.push(interpolateHexColor(colorStart, colorEnd, ratio));
    });
  }

  return { innerLabels, innerValues, innerColors, outerLabels, outerValues, outerColors };
}

export default function CategoryChart({ payslips }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || payslips.length === 0) return;

    const { innerLabels, innerValues, innerColors, outerLabels, outerValues, outerColors } = buildChartData(payslips);

    if (chartRef.current) {
      chartRef.current.data.datasets[0].data = outerValues;
      chartRef.current.data.datasets[0].backgroundColor = outerColors;
      chartRef.current.data.datasets[0].labels = outerLabels;
      chartRef.current.data.datasets[1].data = innerValues;
      chartRef.current.data.datasets[1].backgroundColor = innerColors;
      chartRef.current.data.datasets[1].labels = innerLabels;
      chartRef.current.update();
      return;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            label: 'Tételek',
            data: outerValues,
            backgroundColor: outerColors,
            labels: outerLabels,
            datalabels: {
              display: (context) => {
                const total = context.dataset.data.reduce((s, v) => s + v, 0);
                return context.dataset.data[context.dataIndex] / total >= MIN_LABEL_PERCENTAGE;
              },
              anchor: 'center',
              align: 'center',
              font: { size: OUTER_LABEL_FONT_SIZE },
              color: (context) => labelColor(context.dataset.backgroundColor[context.dataIndex]),
              formatter: (value, context) => {
                const label = context.dataset.labels[context.dataIndex];
                return `${label}\n${formatCurrency(value)}`;
              },
            },
          },
          {
            label: 'Kategóriák',
            data: innerValues,
            backgroundColor: innerColors,
            labels: innerLabels,
            weight: INNER_RING_WEIGHT,
            datalabels: {
              anchor: 'center',
              align: 'center',
              font: { size: INNER_LABEL_FONT_SIZE, weight: 'bold' },
              color: '#fff',
              formatter: (value, context) => {
                const label = context.dataset.labels[context.dataIndex];
                return `${label}\n${formatCurrency(value)}`;
              },
            },
          },
        ],
      },
      plugins: [ChartDataLabels],
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: false,
        cutout: CUTOUT_PERCENTAGE,
        layout: { padding: LAYOUT_PADDING },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.labels[context.dataIndex];
                return `${label}: ${formatCurrency(context.raw)}`;
              },
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
