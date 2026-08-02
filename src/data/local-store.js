import { Payslip } from './payslip.js';

export function createLocalStore(mockData, cacheKey, { categories, monetaryCategoryKeys }) {
  return {
    async readPayslips() {
      localStorage.setItem(cacheKey, JSON.stringify(mockData));
      return Payslip.hydrate(mockData, categories, monetaryCategoryKeys);
    },

    async addPayslip(data) {
      const records = JSON.parse(localStorage.getItem(cacheKey));
      const existingIndex = records.findIndex(({ year, month }) => year === data.year && month === data.month);
      if (existingIndex >= 0) records[existingIndex] = data;
      else records.push(data);
      localStorage.setItem(cacheKey, JSON.stringify(records));
      const payslips = Payslip.hydrate(records, categories, monetaryCategoryKeys);
      return payslips.find((p) => p.year === data.year && p.month === data.month);
    },
  };
}
