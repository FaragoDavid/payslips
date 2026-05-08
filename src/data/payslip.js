const categories = [
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
    key: 'deductions',
    fields: ['tax_advance', 'other_deductions', 'social_security', 'in_kind_pay_net'],
  },
  {
    key: 'cafeteria',
    fields: ['szep_card_accommodation'],
  },
];

for (const category of categories) {
  if (category.groups) category.fields = category.groups.flatMap((g) => g.fields);
}

export class Payslip {
  constructor(data) {
    Object.assign(this, data);
  }

  sum(fields) {
    return fields.reduce((sum, key) => sum + (this[key] || 0), 0);
  }

  sumCategory(key) {
    const category = categories.find((c) => c.key === key);
    return category ? this.sum(category.fields) : 0;
  }

  netPay() {
    return categories.reduce((sum, c) => sum + this.sum(c.fields), 0);
  }

  static get categories() {
    return categories;
  }
}
