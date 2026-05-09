import React from 'react';
import { strings } from '../../i18n/strings.js';
import { Payslip } from '../../data/payslip.js';
import { formatNumber } from '../../utils/format.js';

const MONTHS_PER_YEAR = 12;

function Cell({ value }) {
  if (!value) return <td>-</td>;
  const formatted = formatNumber(value);
  return <td>{value < 0 ? <span className="negative">{formatted}</span> : formatted}</td>;
}

function NetRow({ monthlySlots }) {
  let total = 0;
  const cells = monthlySlots.map((payslip, index) => {
    const value = payslip ? payslip.netPay() : 0;
    total += value;
    return <Cell key={index} value={value} />;
  });
  return (
    <tr className="row-net">
      <td>{strings.fields.net}</td>
      {cells}
      <Cell value={total} />
    </tr>
  );
}

function FieldRow({ field, monthlySlots }) {
  let total = 0;
  const cells = monthlySlots.map((payslip, index) => {
    const value = payslip ? payslip[field] || 0 : 0;
    total += value;
    return <Cell key={index} value={value} />;
  });
  return (
    <tr className="row-item">
      <td>{strings.fields[field]}</td>
      {cells}
      <Cell value={total} />
    </tr>
  );
}

function GroupRow({ group, monthlySlots }) {
  let total = 0;
  const cells = monthlySlots.map((payslip, index) => {
    if (payslip) {
      const groupSum = payslip.sum(group.fields);
      total += groupSum;
      return <Cell key={index} value={groupSum} />;
    } else {
      return <Cell key={index} value={0} />;
    }
  });

  return (
    <tr className="row-group">
      <td>{strings.groups[group.key]}</td>
      {cells}
      <Cell value={total} />
    </tr>
  );
}

function CategoryRow({ category, monthlySlots }) {
  let total = 0;
  const cells = monthlySlots.map((payslip, index) => {
    if (payslip) {
      const categorySum = payslip.sumCategory(category.key);
      total += categorySum;
      return <Cell key={index} value={categorySum} />;
    } else {
      return <Cell key={index} value={0} />;
    }
  });

  return (
    <tr className="row-category">
      <td>{strings.categories[category.key]}</td>
      {cells}
      <Cell value={total} />
    </tr>
  );
}

export default function MonthlyTable({ payslips }) {
  const monthlySlots = new Array(MONTHS_PER_YEAR).fill(null);
  for (const payslip of payslips) {
    monthlySlots[payslip.month - 1] = payslip;
  }

  return (
    <table className="payslip-table">
      <thead>
        <tr>
          <th></th>
          {strings.months.map((month, index) => (
            <th key={index}>{month}</th>
          ))}
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <NetRow monthlySlots={monthlySlots} />
        {Payslip.categories.flatMap((category) => {
          const activeFields = category.fields.filter((f) => monthlySlots.some((p) => p && p[f]));
          return [
            <CategoryRow key={category.key} category={category} monthlySlots={monthlySlots} />,
            ...(category.groups
              ? category.groups.flatMap((group) => {
                  const groupFields = group.fields.filter((f) => activeFields.includes(f));
                  if (groupFields.length === 0) return [];
                  return [
                    <GroupRow key={`group-${category.key}-${group.key}`} group={group} monthlySlots={monthlySlots} />,
                    ...groupFields.map((field) => <FieldRow key={field} field={field} monthlySlots={monthlySlots} />),
                  ];
                })
              : activeFields.map((field) => <FieldRow key={field} field={field} monthlySlots={monthlySlots} />)),
          ];
        })}
      </tbody>
    </table>
  );
}
