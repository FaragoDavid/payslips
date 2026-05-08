import React from 'react';
import { strings } from '../../i18n/strings.js';
import { Payslip } from '../../data/payslip.js';
import { formatNumber } from '../../utils/format.js';

function Cell({ value }) {
  if (!value) return <td>-</td>;
  const formatted = formatNumber(value);
  return <td>{value < 0 ? <span className="negative">{formatted}</span> : formatted}</td>;
}

function NetRow({ yearlyData }) {
  const cells = yearlyData.map(({ payslips }, index) => {
    const value = payslips.reduce((sum, p) => sum + p.netPay(), 0);
    return <Cell key={index} value={value} />;
  });
  return (
    <tr className="row-net">
      <td>{strings.fields.net}</td>
      {cells}
    </tr>
  );
}

function FieldRow({ field, yearlyData }) {
  const cells = yearlyData.map(({ payslips }, index) => {
    const value = payslips.reduce((sum, p) => sum + (p[field] || 0), 0);
    return <Cell key={index} value={value} />;
  });
  return (
    <tr className="row-item">
      <td>{strings.fields[field]}</td>
      {cells}
    </tr>
  );
}

function GroupRow({ group, yearlyData }) {
  const cells = yearlyData.map(({ payslips }, index) => {
    const value = payslips.reduce((sum, p) => sum + p.sum(group.fields), 0);
    return <Cell key={index} value={value} />;
  });
  return (
    <tr className="row-group">
      <td>{strings.groups[group.key]}</td>
      {cells}
    </tr>
  );
}

function CategoryRow({ category, yearlyData }) {
  const cells = yearlyData.map(({ payslips }, index) => {
    const value = payslips.reduce((sum, p) => sum + p.sumCategory(category.key), 0);
    return <Cell key={index} value={value} />;
  });
  return (
    <tr className="row-category">
      <td>{strings.categories[category.key]}</td>
      {cells}
    </tr>
  );
}

export default function YearlyTable({ payslips }) {
  const years = [...new Set(payslips.map((p) => p.year))].sort();
  const yearlyData = years.map((year) => ({
    year,
    payslips: payslips.filter((p) => p.year === year),
  }));

  const activeFields = (category) => category.fields.filter((f) => payslips.some((p) => p[f]));

  return (
    <table className="payslip-table">
      <thead>
        <tr>
          <th></th>
          {years.map((year) => (
            <th key={year}>{year}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <NetRow yearlyData={yearlyData} />
        {Payslip.categories.flatMap((category) => {
          const fields = activeFields(category);
          return [
            <CategoryRow key={category.key} category={category} yearlyData={yearlyData} />,
            ...(category.groups
              ? category.groups.flatMap((group) => {
                  const groupFields = group.fields.filter((f) => fields.includes(f));
                  if (groupFields.length === 0) return [];
                  return [
                    <GroupRow key={`group-${category.key}-${group.key}`} group={group} yearlyData={yearlyData} />,
                    ...groupFields.map((field) => <FieldRow key={field} field={field} yearlyData={yearlyData} />),
                  ];
                })
              : fields.map((field) => <FieldRow key={field} field={field} yearlyData={yearlyData} />)),
          ];
        })}
      </tbody>
    </table>
  );
}
