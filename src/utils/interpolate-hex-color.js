/**
 * @param {string} hex - A hex color string, e.g. "#ff0000"
 * @returns {number[]} An array of RGB values, e.g. [255, 0, 0]
 */
const parseHexString = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];

const interpolate = (start, end, ratio) => Math.round(start + (end - start) * ratio);

/**
 * @param {string} hex1 - A hex color string, e.g. "#ff0000"
 * @param {string} hex2 - A hex color string, e.g. "#00ff00"
 * @param {number} ratio - A number between 0 and 1 representing the interpolation ratio
 * @returns {string} An interpolated RGB color string, e.g. "rgb(128, 128, 0)"
 */
export function interpolateHexColor(hex1, hex2, ratio) {
  if (ratio < 0 || ratio > 1) {
    throw new Error('Ratio must be between 0 and 1');
  }
  if (!/^#([0-9a-fA-F]{6})$/.test(hex1) || !/^#([0-9a-fA-F]{6})$/.test(hex2)) {
    throw new Error('Invalid hex color format. Expected format: #rrggbb');
  }

  const [r1, g1, b1] = parseHexString(hex1);
  const [r2, g2, b2] = parseHexString(hex2);

  return `rgb(${interpolate(r1, r2, ratio)},${interpolate(g1, g2, ratio)},${interpolate(b1, b2, ratio)})`;
}
