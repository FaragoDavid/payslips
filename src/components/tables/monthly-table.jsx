import React from 'react';
import { strings } from '../../i18n/strings.js';
import { Payslip } from '../../data/payslip.js';
import Row from './row.jsx';

export default function MonthlyTable({ payslips }) {
  const columns = Array.from({ length: 12 }, (_, i) => i + 1);
  const commonProps = { columns, showTotal: true };

  return (
    <table className="payslip-table">
      <thead>
        <tr>
          <th></th>
          {strings.months.map((month, index) => (
            <th key={index}>{month}</th>
          ))}
          <th className="col-total">Total</th>
        </tr>
      </thead>
      <tbody>
        <Row
          className="row-net"
          label={strings.table.net}
          fieldValues={payslips.map((p) => ({ column: p.month, value: p.netPay() }))}
          {...commonProps}
        />
        {Payslip.categories.flatMap((category) => {
          const activeFields = category.fields.filter((f) => payslips.some((p) => p && p[f]));
          return [
            <Row
              key={category.key}
              className="row-category"
              label={strings.categories[category.key]}
              fieldValues={payslips.map((p) => ({ column: p.month, value: p.sumCategory(category.key) }))}
              {...commonProps}
            />,
            ...(category.groups
              ? category.groups.flatMap((group) => {
                  const groupFields = group.fields.filter((f) => activeFields.includes(f));
                  if (groupFields.length === 0) return [];
                  return [
                    <Row
                      key={`group-${category.key}-${group.key}`}
                      className="row-group"
                      label={strings.groups[group.key]}
                      fieldValues={payslips.map((p) => ({ column: p.month, value: p.sum(group.fields) }))}
                      {...commonProps}
                    />,
                    ...groupFields.map((field) => (
                      <Row
                        key={field}
                        className="row-item"
                        label={strings.fields[field]}
                        fieldValues={payslips.map((p) => ({ column: p.month, value: p[field] }))}
                        {...commonProps}
                      />
                    )),
                  ];
                })
              : activeFields.map((field) => (
                  <Row
                    key={field}
                    className="row-item"
                    label={strings.fields[field]}
                    fieldValues={payslips.map((p) => ({ column: p.month, value: p[field] }))}
                    {...commonProps}
                  />
                ))),
          ];
        })}
      </tbody>
    </table>
  );
}
