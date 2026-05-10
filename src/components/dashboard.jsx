import React, { useState, useEffect, useCallback } from 'react';
import { loadPayslipData, addPayslip } from '../data/index.js';
import { Payslip } from '../data/payslip.js';
import { strings } from '../i18n/strings.js';
import MonthlyTable from './tables/monthly-table.jsx';
import CategoryChart from './charts/category-chart.jsx';
import YearlyTable from './tables/yearly-table.jsx';
import MonthlyTrendChart from './charts/monthly-trend-chart.jsx';
import YearlyBarChart from './charts/yearly-bar-chart.jsx';
import MonthlyNormalizedBarChart from './charts/monthly-normalized-bar-chart.jsx';
import YearlyNormalizedBarChart from './charts/yearly-normalized-bar-chart.jsx';
import DashboardHeader from './dashboard-header.jsx';
import AddPayslipForm from './add-payslip-form.jsx';

const VIEW_KEY = 'payslips_view';
const YEAR_KEY = 'payslips_year';
const TABLE = 'table';
const CHART = 'chart';
const YEARLY = 'yearly';
const YOY_LINE = 'yoy-line';
const YOY_BAR = 'yoy-bar';
const MONTHLY_BAR = 'monthly-bar';
const YEARLY_NORM_BAR = 'yearly-norm-bar';

export default function Dashboard() {
  const [payslips, setPayslips] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || TABLE);
  const [selectedYear, setSelectedYear] = useState(() => {
    const stored = localStorage.getItem(YEAR_KEY);
    return stored ? Number(stored) : null;
  });
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

  const yearlyPayslips = payslips ? Payslip.aggregateByYear(payslips) : [];
  const years = yearlyPayslips.map(({ year }) => year);
  const payslipsOfSelectedYear = payslips && selectedYear !== null ? payslips.filter(({ year }) => year === selectedYear) : [];

  useEffect(() => {
    if (years.length > 0 && (selectedYear === null || !years.includes(selectedYear))) {
      setSelectedYear(years[years.length - 1]);
    }
  }, [years, selectedYear]);

  const handleViewChange = (newView) => {
    setView(newView);
    localStorage.setItem(VIEW_KEY, newView);
  };

  const handleAddPayslip = async (data) => {
    const newPayslip = await addPayslip(data);
    setPayslips((prev) => {
      const filtered = prev.filter(({ year, month }) => year !== data.year || month !== data.month);
      return [...filtered, newPayslip].sort((a, b) => a.year - b.year || a.month - b.month);
    });
    setShowForm(false);
  };

  const needsYearSelect = view === TABLE || view === CHART || view === MONTHLY_BAR;

  return (
    <div className="section">
      <DashboardHeader onAdd={() => setShowForm(true)} onRefresh={() => fetchData(true)} loading={loading} addDisabled={showForm} />
      <div className="cards-container">
        <div className="card">
          <div className="card-header">
            <div className="view-toggle">
              <button className={`view-btn ${view === TABLE ? 'active' : ''}`} onClick={() => handleViewChange(TABLE)}>
                {strings.dashboard.monthly}
              </button>
              <button className={`view-btn ${view === CHART ? 'active' : ''}`} onClick={() => handleViewChange(CHART)}>
                {strings.dashboard.chart}
              </button>
              <button className={`view-btn ${view === MONTHLY_BAR ? 'active' : ''}`} onClick={() => handleViewChange(MONTHLY_BAR)}>
                {strings.dashboard.monthlyBar}
              </button>
              <button className={`view-btn ${view === YEARLY ? 'active' : ''}`} onClick={() => handleViewChange(YEARLY)}>
                {strings.dashboard.yearly}
              </button>
              <button className={`view-btn ${view === YOY_BAR ? 'active' : ''}`} onClick={() => handleViewChange(YOY_BAR)}>
                {strings.dashboard.yoyBar}
              </button>
              <button className={`view-btn ${view === YEARLY_NORM_BAR ? 'active' : ''}`} onClick={() => handleViewChange(YEARLY_NORM_BAR)}>
                {strings.dashboard.yearlyNormBar}
              </button>
              <button className={`view-btn ${view === YOY_LINE ? 'active' : ''}`} onClick={() => handleViewChange(YOY_LINE)}>
                {strings.dashboard.yoyLine}
              </button>
            </div>
            <select className="view-select" value={view} onChange={(e) => handleViewChange(e.target.value)}>
              <option value={TABLE}>{strings.dashboard.monthly}</option>
              <option value={CHART}>{strings.dashboard.chart}</option>
              <option value={MONTHLY_BAR}>{strings.dashboard.monthlyBar}</option>
              <option value={YEARLY}>{strings.dashboard.yearly}</option>
              <option value={YOY_BAR}>{strings.dashboard.yoyBar}</option>
              <option value={YEARLY_NORM_BAR}>{strings.dashboard.yearlyNormBar}</option>
              <option value={YOY_LINE}>{strings.dashboard.yoyLine}</option>
            </select>
            {needsYearSelect && (
              <select
                className="year-select"
                value={selectedYear || ''}
                onChange={(event) => {
                  const year = Number(event.target.value);
                  setSelectedYear(year);
                  localStorage.setItem(YEAR_KEY, year);
                }}
              >
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
              <YearlyBarChart yearlyPayslips={yearlyPayslips} />
            </div>
          )}
          {view === MONTHLY_BAR && payslipsOfSelectedYear.length > 0 && (
            <div className="chart-container">
              <MonthlyNormalizedBarChart payslips={payslipsOfSelectedYear} />
            </div>
          )}
          {view === YEARLY_NORM_BAR && payslips && payslips.length > 0 && (
            <div className="chart-container">
              <YearlyNormalizedBarChart yearlyPayslips={yearlyPayslips} payslips={payslips} />
            </div>
          )}
          {view === YEARLY && payslips && payslips.length > 0 && (
            <div className="table-wrapper">
              <YearlyTable yearlyPayslips={yearlyPayslips} payslips={payslips} />
            </div>
          )}
        </div>
      </div>
      {showForm && (
        <div className="popover-overlay" onClick={() => setShowForm(false)}>
          <div className="popover" onClick={(e) => e.stopPropagation()}>
            <AddPayslipForm
              onSave={handleAddPayslip}
              onCancel={() => setShowForm(false)}
              defaultYear={selectedYear}
              defaultMonth={
                Array.from({ length: 12 }, (_, i) => i + 1).find((m) => !payslipsOfSelectedYear.some((p) => p.month === m)) || 1
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
