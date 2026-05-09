import { formatNumber } from '../../utils/format.js';

export default function Cell({ value, className }) {
  if (!value) return <td className={className}>-</td>;
  const formatted = formatNumber(value);
  return <td className={className}>{value < 0 ? <span className="negative">{formatted}</span> : formatted}</td>;
}
