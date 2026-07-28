import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './app.jsx';
import { localStore } from './data/local-store.js';
import { remoteStore } from './data/remote-store.js';
import { StoreProvider } from './data/store.jsx';
import './styles.css';

const store = import.meta.env.DEV ? localStore : remoteStore;

createRoot(document.getElementById('root')).render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
);
