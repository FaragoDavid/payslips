import { Plus, RefreshCw } from 'lucide-react';
import { useDataset } from '../data/store.jsx';
import { useStrings } from '../i18n/strings.js';

export default function DashboardHeader({ onAdd, onRefresh, loading, addDisabled }) {
  const strings = useStrings();
  const { dataset, setDataset } = useDataset();

  return (
    <div className="header">
      <div>
        <h1>
          {strings.title}
          <div className="dataset-toggle">
            <button className={`btn btn-small ${dataset === 'david' ? 'active' : ''}`} onClick={() => setDataset('david')}>
              {strings.dataset.david}
            </button>
            <button className={`btn btn-small ${dataset === 'niki' ? 'active' : ''}`} onClick={() => setDataset('niki')}>
              {strings.dataset.niki}
            </button>
          </div>
        </h1>
      </div>
      <div className="header-actions">
        <button className="btn btn-small" onClick={onAdd} disabled={addDisabled}>
          <Plus className="btn-icon" size={18} />
          <span className="btn-label">{strings.addForm.addButton}</span>
        </button>
        <button className="btn btn-small btn-refresh" onClick={onRefresh} disabled={loading}>
          <RefreshCw className="btn-icon" size={18} />
          <span className="btn-label">{loading ? strings.dashboard.loading : strings.dashboard.refreshButton}</span>
        </button>
      </div>
    </div>
  );
}
