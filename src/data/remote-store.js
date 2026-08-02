import { Payslip } from './payslip.js';
import { fetchPayslipsFromFirestore, addPayslipToFirestore } from './firestore.js';

export function createRemoteStore(collectionName, cacheKey, { categories, monetaryCategoryKeys }) {
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
        if (cached && cached.length > 0) return Payslip.hydrate(cached, categories, monetaryCategoryKeys);
      } else {
        localStorage.removeItem(cacheKey);
      }
      const records = await fetchPayslipsFromFirestore(collectionName);
      cacheWrite(records);
      return Payslip.hydrate(records, categories, monetaryCategoryKeys);
    },

    async addPayslip(data) {
      await addPayslipToFirestore(collectionName, data);
      const records = cacheRead() ?? [];
      const existingIndex = records.findIndex((p) => p.year === data.year && p.month === data.month);
      if (existingIndex >= 0) records[existingIndex] = data;
      else records.push(data);
      cacheWrite(records);
      const payslips = Payslip.hydrate(records, categories, monetaryCategoryKeys);
      return payslips.find((p) => p.year === data.year && p.month === data.month);
    },
  };
}
