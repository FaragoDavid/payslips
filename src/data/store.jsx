import { createContext, useContext, useState } from 'react';

const StoreContext = createContext(null);
const DatasetContext = createContext(null);

const STORED_DATASET_KEY = 'payslips_dataset';

export function DatasetProvider({ stores, children }) {
  const [dataset, setDataset] = useState(() => localStorage.getItem(STORED_DATASET_KEY) ?? 'david');

  const handleSetDataset = (name) => {
    localStorage.setItem(STORED_DATASET_KEY, name);
    setDataset(name);
  };

  return (
    <DatasetContext.Provider value={{ dataset, setDataset: handleSetDataset }}>
      <StoreContext.Provider value={stores[dataset]}>{children}</StoreContext.Provider>
    </DatasetContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}

export function useDataset() {
  return useContext(DatasetContext);
}
