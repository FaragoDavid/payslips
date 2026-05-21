import React, { useState, useEffect, useCallback } from 'react';
import { loadPayslipData, addPayslip } from '../data/index.js';
import { Payslip } from '../data/payslip.js';
import { strings } from '../i18n/strings.js';
import PayslipTable from './tables/payslip-table.jsx';
import MonthlyTrendChart from './charts/monthly-trend-chart.jsx';
import YearlyBarChart from './charts/yearly-bar-chart.jsx';
import NormalizedBarChart from './charts/normalized-bar-chart.jsx';
import HourlyRateTrendChart from './charts/hourly-rate-trend-chart.jsx';
import DashboardHeader from './dashboard-header.jsx';
import AddPayslipForm from './add-payslip-form.jsx';

const STORED_VIEW_KEY = 'payslips_view';
const STORED_YEAR_KEY = 'payslips_year';
const MONTHLY_TABLE = 'monthly-table';
const MONTHLY_NORM_BAR = 'monthly-norm-bar';
const YEARLY_TABLE = 'yearly-table';
const YEARLY_BAR = 'yearly-bar';
const YEARLY_NORM_BAR = 'yearly-norm-bar';
const TREND_LINE = 'trend-line';
const HOURLY_RATE_TREND = 'hourly-rate-trend';

export default function Dashboard() {
  const [payslips, setPayslips] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(() => localStorage.getItem(STORED_VIEW_KEY) || MONTHLY_TABLE);
  const [selectedYear, setSelectedYear] = useState(() => {
    const stored = localStorage.getItem(STORED_YEAR_KEY);
    return stored ? Number(stored) : null;
  });
  const [showForm, setShowForm] = useState(false);
  const [editingPayslip, setEditingPayslip] = useState(null);

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
    localStorage.setItem(STORED_VIEW_KEY, newView);
  };

  const handleAddPayslip = async (data) => {
    const newPayslip = await addPayslip(data);
    setPayslips((prev) => {
      const filtered = prev.filter(({ year, month }) => year !== data.year || month !== data.month);
      return [...filtered, newPayslip].sort((a, b) => a.year - b.year || a.month - b.month);
    });
    setShowForm(false);
    setEditingPayslip(null);
  };

  const handleEditColumn = (monthNum) => {
    const payslip = payslipsOfSelectedYear.find((payslip) => payslip.month === monthNum);
    if (payslip) setEditingPayslip(payslip);
  };

  const needsYearSelect = view === MONTHLY_TABLE || view === MONTHLY_NORM_BAR;

  return (
    <div className="section">
      <DashboardHeader onAdd={() => setShowForm(true)} onRefresh={() => fetchData(true)} loading={loading} addDisabled={showForm || !!editingPayslip} />
      <div className="cards-container">
        <div className="card">
          <div className="card-header">
            <div className="view-toggle">
              <button className={`view-btn ${view === MONTHLY_TABLE ? 'active' : ''}`} onClick={() => handleViewChange(MONTHLY_TABLE)}>
                {strings.dashboard.viewNames.monthlyTable}
              </button>
              <button
                className={`view-btn ${view === MONTHLY_NORM_BAR ? 'active' : ''}`}
                onClick={() => handleViewChange(MONTHLY_NORM_BAR)}
              >
                {strings.dashboard.viewNames.monthlyNormBar}
              </button>
              <button className={`view-btn ${view === YEARLY_TABLE ? 'active' : ''}`} onClick={() => handleViewChange(YEARLY_TABLE)}>
                {strings.dashboard.viewNames.yearlyTable}
              </button>
              <button className={`view-btn ${view === YEARLY_NORM_BAR ? 'active' : ''}`} onClick={() => handleViewChange(YEARLY_NORM_BAR)}>
                {strings.dashboard.viewNames.yearlyNormBar}
              </button>
              <button className={`view-btn ${view === YEARLY_BAR ? 'active' : ''}`} onClick={() => handleViewChange(YEARLY_BAR)}>
                {strings.dashboard.viewNames.yearlyBar}
              </button>
              <button className={`view-btn ${view === TREND_LINE ? 'active' : ''}`} onClick={() => handleViewChange(TREND_LINE)}>
                {strings.dashboard.viewNames.trendLine}
              </button>
              <button className={`view-btn ${view === HOURLY_RATE_TREND ? 'active' : ''}`} onClick={() => handleViewChange(HOURLY_RATE_TREND)}>
                {strings.dashboard.viewNames.hourlyRateTrend}
              </button>
            </div>
            <select className="view-select" value={view} onChange={(e) => handleViewChange(e.target.value)}>
              <option value={MONTHLY_TABLE}>{strings.dashboard.viewNames.monthlyTable}</option>
              <option value={MONTHLY_NORM_BAR}>{strings.dashboard.viewNames.monthlyNormBar}</option>
              <option value={YEARLY_TABLE}>{strings.dashboard.viewNames.yearlyTable}</option>
              <option value={YEARLY_NORM_BAR}>{strings.dashboard.viewNames.yearlyNormBar}</option>
              <option value={YEARLY_BAR}>{strings.dashboard.viewNames.yearlyBar}</option>
              <option value={TREND_LINE}>{strings.dashboard.viewNames.trendLine}</option>
              <option value={HOURLY_RATE_TREND}>{strings.dashboard.viewNames.hourlyRateTrend}</option>
            </select>
            {needsYearSelect && (
              <select
                className="year-select"
                value={selectedYear || ''}
                onChange={(event) => {
                  const year = Number(event.target.value);
                  setSelectedYear(year);
                  localStorage.setItem(STORED_YEAR_KEY, year);
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
          {view === MONTHLY_TABLE && payslipsOfSelectedYear.length > 0 && (
            <div className="table-wrapper">
              <PayslipTable
                payslips={payslipsOfSelectedYear}
                columns={Array.from({ length: 12 }, (_, i) => i + 1)}
                headers={strings.months}
                columnKey="month"
                showTotal
                onEditColumn={handleEditColumn}
              />
            </div>
          )}
          {view === TREND_LINE && payslips && payslips.length > 0 && (
            <div className="chart-container">
              <MonthlyTrendChart payslips={payslips} />
            </div>
          )}
          {view === HOURLY_RATE_TREND && payslips && payslips.length > 0 && (
            <div className="chart-container">
              <HourlyRateTrendChart payslips={payslips} />
            </div>
          )}
          {view === YEARLY_BAR && payslips && payslips.length > 0 && (
            <div className="chart-container">
              <YearlyBarChart yearlyPayslips={yearlyPayslips} />
            </div>
          )}
          {view === MONTHLY_NORM_BAR && payslipsOfSelectedYear.length > 0 && (
            <div className="chart-container">
              <NormalizedBarChart
                payslips={payslipsOfSelectedYear}
                labels={payslipsOfSelectedYear.map(({ month }) => strings.months[month - 1])}
              />
            </div>
          )}
          {view === YEARLY_NORM_BAR && payslips && payslips.length > 0 && (
            <div className="chart-container">
              <NormalizedBarChart payslips={yearlyPayslips} labels={yearlyPayslips.map(({ year }) => String(year))} />
            </div>
          )}
          {view === YEARLY_TABLE && payslips && payslips.length > 0 && (
            <div className="table-wrapper">
              <PayslipTable payslips={yearlyPayslips} columns={years} headers={years.map(String)} columnKey="year" />
            </div>
          )}
        </div>
      </div>
      {(showForm || editingPayslip) && (
        <div className="popover-overlay" onClick={() => { setShowForm(false); setEditingPayslip(null); }}>
          <div className="popover" onClick={(e) => e.stopPropagation()}>
            <AddPayslipForm
              onSave={handleAddPayslip}
              onCancel={() => { setShowForm(false); setEditingPayslip(null); }}
              defaultYear={selectedYear}
              defaultMonth={
                Array.from({ length: 12 }, (_, i) => i + 1).find((m) => !payslipsOfSelectedYear.some((payslip) => payslip.month === m)) || 1
              }
              initialData={editingPayslip || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
