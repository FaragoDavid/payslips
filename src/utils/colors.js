import { davidConfig, nikiConfig } from '../data/categories.js';

const parseHex = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];

export function interpolateHexColor(hex1, hex2, ratio) {
  const [r1, g1, b1] = parseHex(hex1);
  const [r2, g2, b2] = parseHex(hex2);
  const lerp = (a, b) =>
    Math.round(a + (b - a) * ratio)
      .toString(16)
      .padStart(2, '0');
  return `#${lerp(r1, r2)}${lerp(g1, g2)}${lerp(b1, b2)}`;
}

export function labelColor(bgHex) {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#333' : '#fff';
}

export const CATEGORY_COLORS = {
  income: '#4caf50',
  deductions: '#e53935',
  cafeteria: '#ff9800',
  memoItems: '#9c27b0',
};

const FIELD_COLOR_RANGES = {
  income: ['#81c784', '#2e7d32'],
  deductions: ['#ef9a9a', '#b71c1c'],
  cafeteria: ['#ffcc80', '#e65100'],
  memoItems: ['#ce93d8', '#6a1b9a'],
};

const seen = new Set();
export const FIELD_COLORS = Object.fromEntries(
  [davidConfig, nikiConfig]
    .flatMap(({ categories }) => categories)
    .filter(({ key }) => key in FIELD_COLOR_RANGES)
    .flatMap(({ key, fields }) => {
      const [start, end] = FIELD_COLOR_RANGES[key];
      return fields
        .filter((field) => !seen.has(field) && seen.add(field))
        .map((field, i) => [field, interpolateHexColor(start, end, fields.length > 1 ? i / (fields.length - 1) : 0.5)]);
    }),
);

export const NET_COLOR = '#2196f3';

export function yearColor(index, count) {
  const lightness = count > 1 ? 80 - (index / (count - 1)) * 45 : 35;
  return `hsl(210, 70%, ${lightness}%)`;
}
