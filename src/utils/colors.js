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

export const NET_COLOR = '#2196f3';

export const FIELD_COLORS = {
  base_salary: '#81c784',
  absence_pay: '#79c07d',
  absence_pay_base: '#72ba75',
  visp_bonus: '#6ab36e',
  rsu_bonus: '#63ac66',
  car_allowance: '#5ba55f',
  standby_supplement: '#549f57',
  standby_supplement_correction: '#4c9850',
  cafeteria_cash: '#459148',
  commute_cost: '#3d8a41',
  in_kind_pay: '#368439',
  safety_glasses: '#2e7d32',
  szep_card_accommodation: '#f38f40',
  tax_advance: '#ef9a9a',
  other_deductions: '#dc7070',
  social_security: '#ca4646',
  in_kind_pay_net: '#b71c1c',
  monthly_basic_pay: '#81c784',
  afternoon_shift_bonus: '#79c07c',
  weekend_allowance: '#70b874',
  benefit_gross_up: '#68b16b',
  other_wage: '#60a963',
  paid_public_holiday: '#58a25b',
  vacation: '#4f9b53',
  overtime_basis: '#47934b',
  balance_overtime: '#3f8c42',
  paid_full_day_absence: '#36843a',
  foreign_exchange_all: '#2e7d32',
  szja: '#ef9a9a',
  tb_hozzajarulas: '#b71c1c',
  employees_discount: '#ce93d8',
  meal_contribution: '#9c57b9',
  gift_card: '#6a1b9a',
};

export function yearColor(index, count) {
  const lightness = count > 1 ? 80 - (index / (count - 1)) * 45 : 35;
  return `hsl(210, 70%, ${lightness}%)`;
}
