import { Payslip } from './payslip.js';
import { CACHE_KEY } from './store.jsx';
import mockPayslips from './mock-payslips.js';

function read() {
  const raw = localStorage.getItem(CACHE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function write(records) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(records));
}

export const localStore = {
  async readPayslips() {
    write(mockPayslips);
    return Payslip.hydrate(mockPayslips);
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
