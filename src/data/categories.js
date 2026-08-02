import { useDataset } from './store.jsx';

export const davidConfig = {
  categories: [
    {
      key: 'income',
      groups: [
        { key: 'basePay', fields: ['base_salary', 'absence_pay', 'absence_pay_base'] },
        { key: 'bonus', fields: ['visp_bonus', 'rsu_bonus'] },
        {
          key: 'benefits',
          fields: [
            'car_allowance',
            'standby_supplement',
            'standby_supplement_correction',
            'cafeteria_cash',
            'commute_cost',
            'in_kind_pay',
            'safety_glasses',
          ],
        },
      ],
    },
    {
      key: 'cafeteria',
      fields: ['szep_card_accommodation'],
    },
    {
      key: 'deductions',
      fields: ['tax_advance', 'other_deductions', 'social_security', 'in_kind_pay_net'],
    },
    {
      key: 'workTime',
      fields: ['work_days', 'calendar_days', 'work_hours', 'standby_hours'],
    },
  ],
  monetaryCategoryKeys: ['income', 'cafeteria', 'deductions'],
};

export const nikiConfig = {
  categories: [
    {
      key: 'income',
      fields: [
        'monthly_basic_pay',
        'afternoon_shift_bonus',
        'weekend_allowance',
        'benefit_gross_up',
        'other_wage',
        'paid_public_holiday',
        'vacation',
        'overtime_basis',
        'balance_overtime',
        'paid_full_day_absence',
        'foreign_exchange_all',
      ],
    },
    {
      key: 'deductions',
      fields: ['szja', 'tb_hozzajarulas'],
    },
    {
      key: 'memoItems',
      fields: ['employees_discount', 'meal_contribution', 'gift_card'],
    },
    {
      key: 'workTime',
      fields: ['work_days', 'calendar_days', 'work_hours'],
    },
  ],
  monetaryCategoryKeys: ['income', 'deductions'],
};

const configs = { david: davidConfig, niki: nikiConfig };

export function useCategories() {
  const { dataset } = useDataset();
  return configs[dataset].categories;
}

export function useMonetaryCategoryKeys() {
  const { dataset } = useDataset();
  return configs[dataset].monetaryCategoryKeys;
}
