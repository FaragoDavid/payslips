import { Payslip } from './payslip.js';
import { CACHE_KEY } from './store.jsx';

function read() {
  const raw = localStorage.getItem(CACHE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function write(records) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(records));
}

export const localStore = {
  async readPayslips() {
    if (import.meta.env.VITE_MOCK_PAYSLIPS) {
      const records = JSON.parse(import.meta.env.VITE_MOCK_PAYSLIPS);
      write(records);
      return Payslip.hydrate(records);
    }
    return Payslip.hydrate(read());
  },

  async addPayslip(data) {
    const records = read();
    const idx = records.findIndex((p) => p.year === data.year && p.month === data.month);
    if (idx >= 0) records[idx] = data;
    else records.push(data);
    write(records);
    const payslips = Payslip.hydrate(records);
    return payslips.find((p) => p.year === data.year && p.month === data.month);
  },
};
