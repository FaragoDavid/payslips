export class Payslip {
  constructor(data, categories, monetaryCategoryKeys) {
    Object.assign(this, data);
    this._categories = categories;
    this._monetaryCategoryKeys = monetaryCategoryKeys;
  }

  sum(fields) {
    return fields.reduce((sum, key) => sum + (this[key] || 0), 0);
  }

  sumCategory(key) {
    const category = this._categories.find((category) => category.key === key);
    return category ? this.sum(category.fields) : 0;
  }

  netPay() {
    return this._categories
      .filter(({ key }) => this._monetaryCategoryKeys.includes(key))
      .reduce((sum, { fields }) => sum + this.sum(fields), 0);
  }

  static processCategories(categories) {
    return categories.map((category) => ({
      ...category,
      fields: category.groups ? category.groups.flatMap((group) => group.fields) : [...category.fields],
    }));
  }

  static hydrate(records, categories, monetaryCategoryKeys) {
    const categoriesWithFields = Payslip.processCategories(categories);
    const payslips = records.map((r) => new Payslip(r, categoriesWithFields, monetaryCategoryKeys));
    Payslip.updateSortIndices(payslips, categoriesWithFields);
    return payslips;
  }

  static updateSortIndices(payslips, categories) {
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

  static aggregateByYear(payslips, categories, monetaryCategoryKeys) {
    if (payslips.length === 0) return [];
    const map = {};
    for (const payslip of payslips) {
      if (!map[payslip.year]) map[payslip.year] = { year: payslip.year };
      for (const field in payslip) {
        if (field !== 'year' && field !== 'month' && !field.startsWith('_')) {
          map[payslip.year][field] = (map[payslip.year][field] || 0) + (payslip[field] || 0);
        }
      }
    }
    return Object.values(map).map((data) => new Payslip(data, categories, monetaryCategoryKeys));
  }
}
