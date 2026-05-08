export const LOCALE = 'hu-HU';
const FORMAT_OPTIONS = { maximumFractionDigits: 0 };
const formatter = new Intl.NumberFormat(LOCALE, FORMAT_OPTIONS);

export function formatNumber(value) {
  if (value == null || value === 0) return '-';
  return formatter.format(value);
}

export function formatCurrency(value) {
  if (value == null) return '-';
  return formatter.format(value) + ' Ft';
}

export function formatCell(value, negative) {
  if (value == null || value === 0) return '-';
  const display = negative ? -value : value;
  const formatted = formatter.format(display);
  return negative ? `<span class="negative">${formatted}</span>` : formatted;
}
