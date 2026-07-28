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
];

for (const category of categories) {
  if (category.groups) category.fields = category.groups.flatMap((group) => group.fields);
}

export class Payslip {
  constructor(data) {
    Object.assign(this, data);
  }

  sum(fields) {
    return fields.reduce((sum, key) => sum + (this[key] || 0), 0);
  }

  sumCategory(key) {
    const category = categories.find((category) => category.key === key);
    return category ? this.sum(category.fields) : 0;
  }

  static monetaryCategories = ['income', 'cafeteria', 'deductions'];

  netPay() {
    return categories.filter(({ key }) => Payslip.monetaryCategories.includes(key)).reduce((sum, { fields }) => sum + this.sum(fields), 0);
  }

  static hydrate(records) {
    const payslips = records.map((r) => new Payslip(r));
    Payslip.updateSortIndices(payslips);
    return payslips;
  }

  static updateSortIndices(payslips) {
    function sortFields(fields) {
      const counts = Object.fromEntries(fields.map((field) => [field, 0]));
      for (const payslip of payslips) {
        for (const field of fields) {
          if (payslip[field]) counts[field]++;
        }
      }
      fields.sort((fieldA, fieldB) => counts[fieldB] - counts[fieldA]);
    }
    for (const category of categories) {
      if (category.groups) {
        for (const group of category.groups) sortFields(group.fields);
        category.fields = category.groups.flatMap((group) => group.fields);
      } else {
        sortFields(category.fields);
      }
    }
  }

  static aggregateByYear(payslips) {
    const map = {};
    for (const payslip of payslips) {
      if (!map[payslip.year]) map[payslip.year] = { year: payslip.year };
      for (const field in payslip) {
        if (field !== 'year' && field !== 'month') {
          map[payslip.year][field] = (map[payslip.year][field] || 0) + (payslip[field] || 0);
        }
      }
    }
    return Object.values(map).map((data) => new Payslip(data));
  }

  static get categories() {
    return categories;
  }
}
