import { Payslip } from './payslip.js';
import { CACHE_KEY } from './store.jsx';

function cacheRead() {
  const raw = localStorage.getItem(CACHE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function cacheWrite(records) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(records));
}

export const remoteStore = {
  async readPayslips(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = cacheRead();
      if (cached && cached.length > 0) return Payslip.hydrate(cached);
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
    const { fetchPayslipsFromFirestore } = await import('./firestore.js');
    const records = await fetchPayslipsFromFirestore();
    cacheWrite(records);
    return Payslip.hydrate(records);
  },

  async addPayslip(data) {
    const { addPayslipToFirestore } = await import('./firestore.js');
    await addPayslipToFirestore(data);
    const records = cacheRead() ?? [];
    const idx = records.findIndex((p) => p.year === data.year && p.month === data.month);
    if (idx >= 0) records[idx] = data;
    else records.push(data);
    cacheWrite(records);
    const payslips = Payslip.hydrate(records);
    return payslips.find((p) => p.year === data.year && p.month === data.month);
  },
};
