import { Payslip } from './payslip.js';

const STORAGE_KEY = 'payslips_data';

function hydrate(rawArray) {
  return rawArray.map((raw) => new Payslip(raw));
}

async function fetchFromSource() {
  if (import.meta.env.VITE_MOCK_PAYSLIPS) {
    return JSON.parse(import.meta.env.VITE_MOCK_PAYSLIPS);
  }
  const { fetchPayslipsFromFirestore } = await import('./firestore.js');
  return fetchPayslipsFromFirestore();
}

export async function loadPayslipData(forceRefresh = false) {
  if (!forceRefresh) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && cached.length > 0) {
          const payslips = hydrate(cached);
          Payslip.updateSortIndices(payslips);
          return payslips;
        }
      }
    } catch {}
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }

  const data = await fetchFromSource();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const payslips = hydrate(data);
  Payslip.updateSortIndices(payslips);
  return payslips;
}

export async function addPayslip(data) {
  if (!import.meta.env.VITE_MOCK_PAYSLIPS) {
    const { addPayslipToFirestore } = await import('./firestore.js');
    await addPayslipToFirestore(data);
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const cached = raw ? JSON.parse(raw) : [];
    const idx = cached.findIndex((p) => p.year === data.year && p.month === data.month);
    if (idx >= 0) cached[idx] = data;
    else cached.push(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch {}
  return new Payslip(data);
}
