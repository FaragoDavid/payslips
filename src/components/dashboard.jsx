import React, { useCallback, useEffect, useState } from 'react';

import { Payslip } from '../data/payslip.js';
import { useCategories, useMonetaryCategoryKeys } from '../data/categories.js';
import { useDataset, useStore } from '../data/store.jsx';
import { useStrings } from '../i18n/strings.js';
import AddPayslipForm from './add-payslip-form.jsx';
import HourlyRateTrendChart from './charts/hourly-rate-trend-chart.jsx';
import MonthlyTrendChart from './charts/monthly-trend-chart.jsx';
import NormalizedBarChart from './charts/normalized-bar-chart.jsx';
import StandbyRatioChart from './charts/standby-ratio-chart.jsx';
import YearlyBarChart from './charts/yearly-bar-chart.jsx';
import DashboardHeader from './dashboard-header.jsx';
import PayslipTable from './tables/payslip-table.jsx';

const STORED_VIEW_KEY = 'payslips_view';
const STORED_YEAR_KEY = 'payslips_year';
const MONTHLY_TABLE = 'monthly-table';
const MONTHLY_NORM_BAR = 'monthly-norm-bar';
const YEARLY_TABLE = 'yearly-table';
const YEARLY_BAR = 'yearly-bar';
const YEARLY_NORM_BAR = 'yearly-norm-bar';
const TREND_LINE = 'trend-line';
const HOURLY_RATE_TREND = 'hourly-rate-trend';
const STANDBY_HOURLY_RATE = 'standby-hourly-rate';

export default function Dashboard() {
  const store = useStore();
  const { dataset } = useDataset();
  const strings = useStrings();
  const categories = useCategories();
  const monetaryCategoryKeys = useMonetaryCategoryKeys();
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

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(null);
      try {
        const payslips = await store.readPayslips(forceRefresh);
        setPayslips(payslips || []);
      } catch (err) {
        console.error('Error loading payslip data:', err);
        setError(strings.dashboard.errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [store],
  );

  useEffect(() => {
    setPayslips(null);
    setShowForm(false);
    setEditingPayslip(null);
    fetchData();
  }, [dataset]);

  const processedCategories = Payslip.processCategories(categories);
  const yearlyPayslips = payslips ? Payslip.aggregateByYear(payslips, processedCategories, monetaryCategoryKeys) : [];
  const years = yearlyPayslips.map(({ year }) => year);
  const payslipsOfSelectedYear = payslips && selectedYear !== null ? payslips.filter(({ year }) => year === selectedYear) : [];

  useEffect(() => {
    if (years.length > 0 && (selectedYear === null || !years.includes(selectedYear))) {
      setSelectedYear(years[years.length - 1]);
    }
  }, [years, selectedYear]);

  useEffect(() => {
    if (!showForm && !editingPayslip) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowForm(false);
        setEditingPayslip(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showForm, editingPayslip]);

  const handleViewChange = (newView) => {
    setView(newView);
    localStorage.setItem(STORED_VIEW_KEY, newView);
  };

  const handleAddPayslip = async (data) => {
    const newPayslip = await store.addPayslip(data);
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

  const getFormDefaults = () => {
    for (let i = 0; i < payslips.length - 1; i++) {
      const curr = payslips[i];
      const next = payslips[i + 1];
      const expectedNextMonth = curr.month === 12 ? 1 : curr.month + 1;
      const expectedNextYear = curr.month === 12 ? curr.year + 1 : curr.year;
      if (next.month !== expectedNextMonth || next.year !== expectedNextYear) {
        return { defaultFormYear: expectedNextYear, defaultFormMonth: expectedNextMonth };
      }
    }
    const last = payslips[payslips.length - 1];
    return {
      defaultFormYear: last.month === 12 ? last.year + 1 : last.year,
      defaultFormMonth: last.month === 12 ? 1 : last.month + 1,
    };
  };

  const { defaultFormYear, defaultFormMonth } = payslips ? getFormDefaults() : {};
  const takenMonths = (payslips || []).reduce((acc, { year, month }) => {
    if (!acc[year]) acc[year] = new Set();
    acc[year].add(month);
    return acc;
  }, {});

  return (
    <div className="section">
      <DashboardHeader
        onAdd={() => setShowForm(true)}
        onRefresh={() => fetchData(true)}
        loading={loading}
        addDisabled={showForm || !!editingPayslip || !payslips}
      />
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
              <button
                className={`view-btn ${view === HOURLY_RATE_TREND ? 'active' : ''}`}
                onClick={() => handleViewChange(HOURLY_RATE_TREND)}
              >
                {strings.dashboard.viewNames.hourlyRateTrend}
              </button>
              <button
                className={`view-btn ${view === STANDBY_HOURLY_RATE ? 'active' : ''}`}
                onClick={() => handleViewChange(STANDBY_HOURLY_RATE)}
              >
                {strings.dashboard.viewNames.standbyHourlyRate}
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
              <option value={STANDBY_HOURLY_RATE}>{strings.dashboard.viewNames.standbyHourlyRate}</option>
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
          {view === STANDBY_HOURLY_RATE && payslips && payslips.length > 0 && (
            <div className="chart-container">
              <StandbyRatioChart payslips={payslips} />
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
        <div
          className="popover-overlay"
          onClick={() => {
            setShowForm(false);
            setEditingPayslip(null);
          }}
        >
          <div className="popover" onClick={(e) => e.stopPropagation()}>
            <AddPayslipForm
              onSave={handleAddPayslip}
              onCancel={() => {
                setShowForm(false);
                setEditingPayslip(null);
              }}
              defaultYear={defaultFormYear}
              defaultMonth={defaultFormMonth}
              takenMonths={takenMonths}
              initialData={editingPayslip || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
