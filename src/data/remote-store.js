import { Payslip } from './payslip.js';
import { processCategories } from './categories.js';
import { fetchPayslipsFromFirestore, addPayslipToFirestore } from './firestore.js';

export function createRemoteStore(collectionName, cacheKey, { categories, monetaryCategoryKeys, fieldAliases = {} }) {
  const processedCategories = processCategories(categories);

  function cacheRead() {
    const raw = localStorage.getItem(cacheKey);
    return raw ? JSON.parse(raw) : null;
  }

  function cacheWrite(records) {
    localStorage.setItem(cacheKey, JSON.stringify(records));
  }

  return {
    async readPayslips(forceRefresh = false) {
      if (!forceRefresh) {
        const cached = cacheRead();
        if (cached && cached.length > 0) return Payslip.hydrate(cached, processedCategories, monetaryCategoryKeys, fieldAliases);
      } else {
        localStorage.removeItem(cacheKey);
      }
      const records = await fetchPayslipsFromFirestore(collectionName);
      cacheWrite(records);
      return Payslip.hydrate(records, processedCategories, monetaryCategoryKeys, fieldAliases);
    },

    async addPayslip(data) {
      await addPayslipToFirestore(collectionName, data);
      const records = cacheRead() ?? [];
      const existingIndex = records.findIndex((p) => p.year === data.year && p.month === data.month);
      if (existingIndex >= 0) records[existingIndex] = data;
      else records.push(data);
      cacheWrite(records);
      const payslips = Payslip.hydrate(records, processedCategories, monetaryCategoryKeys, fieldAliases);
      return payslips.find((p) => p.year === data.year && p.month === data.month);
    },
  };
}
