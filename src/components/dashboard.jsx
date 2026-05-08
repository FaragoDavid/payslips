import React, { useState, useEffect, useCallback } from 'react';
import { signOut } from '../services/auth.js';
import { loadPayslipData, addPayslip } from '../data/index.js';
import { strings } from '../i18n/strings.js';
import MonthlyTable from './tables/monthly-table.jsx';
import CategoryChart from './charts/category-chart.jsx';
import YearlyTable from './tables/yearly-table.jsx';
import MonthlyTrendChart from './charts/monthly-trend-chart.jsx';
import YearlyBarChart from './charts/yearly-bar-chart.jsx';
import AddPayslipForm from './add-payslip-form.jsx';

const VIEW_KEY = 'payslips_view';
const TABLE = 'table';
const CHART = 'chart';
const YEARLY = 'yearly';
const YOY_LINE = 'yoy-line';
const YOY_BAR = 'yoy-bar';

export default function Dashboard() {
  const [payslips, setPayslips] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || TABLE);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const payslips = await loadPayslipData(forceRefresh);
      setPayslips(payslips || []);
    } catch (err) {
      console.error('Error loading payslip data:', err);
      setError(strings.dashboard.errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const years = payslips ? [...new Set(payslips.map((payslip) => payslip.year))].sort() : [];

  useEffect(() => {
    if (years.length > 0 && selectedYear === null) {
      setSelectedYear(years[years.length - 1]);
    }
  }, [years, selectedYear]);

  const handleViewChange = (newView) => {
    setView(newView);
    localStorage.setItem(VIEW_KEY, newView);
  };

  const handleRefresh = () => fetchData(true);

  const handleAddPayslip = async (data) => {
    const newPayslip = await addPayslip(data);
    setPayslips((prev) => {
      const filtered = prev.filter((p) => p.year !== data.year || p.month !== data.month);
      return [...filtered, newPayslip].sort((a, b) => a.year - b.year || a.month - b.month);
    });
    setShowForm(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error during sign-out:', err);
    }
  };

  const payslipsOfSelectedYear = payslips && selectedYear !== null ? payslips.filter((payslip) => payslip.year === selectedYear) : [];

  const needsYearSelect = view === TABLE || view === CHART;

  return (
    <div className="section">
      <div className="header">
        <div>
          <h1>{strings.title}</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-small" onClick={() => setShowForm(true)} disabled={showForm}>
            {strings.addForm.addButton}
          </button>
          <button className="btn btn-small btn-refresh" onClick={handleRefresh} disabled={loading}>
            {loading ? strings.dashboard.loading : strings.dashboard.refreshButton}
          </button>
          <button className="btn btn-small" onClick={handleSignOut}>
            {strings.dashboard.signOut}
          </button>
        </div>
      </div>
      <div className="cards-container">
        <div className="card">
          <div className="card-header">
            <div className="view-toggle">
              <button className={`view-btn ${view === TABLE ? 'active' : ''}`} onClick={() => handleViewChange(TABLE)}>
                {strings.dashboard.monthly}
              </button>
              <button className={`view-btn ${view === YEARLY ? 'active' : ''}`} onClick={() => handleViewChange(YEARLY)}>
                {strings.dashboard.yearly}
              </button>
              <button className={`view-btn ${view === CHART ? 'active' : ''}`} onClick={() => handleViewChange(CHART)}>
                {strings.dashboard.chart}
              </button>
              <button className={`view-btn ${view === YOY_LINE ? 'active' : ''}`} onClick={() => handleViewChange(YOY_LINE)}>
                {strings.dashboard.yoyLine}
              </button>
              <button className={`view-btn ${view === YOY_BAR ? 'active' : ''}`} onClick={() => handleViewChange(YOY_BAR)}>
                {strings.dashboard.yoyBar}
              </button>
            </div>
            {needsYearSelect && (
              <select className="year-select" value={selectedYear || ''} onChange={(event) => setSelectedYear(Number(event.target.value))}>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>
          {error && <p>{error}</p>}
          {!error && payslips && payslips.length === 0 && <p>{strings.dashboard.noData}</p>}
          {view === TABLE && payslipsOfSelectedYear.length > 0 && (
            <div className="table-wrapper">
              <MonthlyTable payslips={payslipsOfSelectedYear} />
            </div>
          )}
          {view === CHART && payslipsOfSelectedYear.length > 0 && (
            <div className="chart-container">
              <CategoryChart payslips={payslipsOfSelectedYear} />
            </div>
          )}
          {view === YOY_LINE && payslips && payslips.length > 0 && (
            <div className="chart-container">
              <MonthlyTrendChart payslips={payslips} />
            </div>
          )}
          {view === YOY_BAR && payslips && payslips.length > 0 && (
            <div className="chart-container">
              <YearlyBarChart payslips={payslips} />
            </div>
          )}
          {view === YEARLY && payslips && payslips.length > 0 && (
            <div className="table-wrapper">
              <YearlyTable payslips={payslips} />
            </div>
          )}
        </div>
      </div>
      {showForm && (
        <div className="popover-overlay" onClick={() => setShowForm(false)}>
          <div className="popover" onClick={(e) => e.stopPropagation()}>
            <AddPayslipForm onSave={handleAddPayslip} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
