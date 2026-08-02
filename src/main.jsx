import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app.jsx';
import { davidConfig, nikiConfig } from './data/categories.js';
import { createLocalStore } from './data/local-store.js';
import { createRemoteStore } from './data/remote-store.js';
import { DatasetProvider } from './data/store.jsx';
import davidMockPayslips from './data/mock-payslips-david.js';
import nikiMockPayslips from './data/mock-payslips-niki.js';
import './styles.css';

const DEV = import.meta.env.DEV;

const davidStore = DEV
  ? createLocalStore(davidMockPayslips, 'payslips_david', davidConfig)
  : createRemoteStore('payslips', 'payslips_david', davidConfig);

const nikiStore = DEV
  ? createLocalStore(nikiMockPayslips, 'payslips_niki', nikiConfig)
  : createRemoteStore('payslips_niki', 'payslips_niki', nikiConfig);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DatasetProvider stores={{ david: davidStore, niki: nikiStore }}>
      <App />
    </DatasetProvider>
  </StrictMode>,
);
