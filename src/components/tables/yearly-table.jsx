import React from 'react';
import { strings } from '../../i18n/strings.js';
import { Payslip } from '../../data/payslip.js';
import Row from './row.jsx';

export default function YearlyTable({ yearlyPayslips, payslips }) {
  const columns = yearlyPayslips.map((p) => p.year);
  const fieldValues = (valueFn) => yearlyPayslips.map((p) => ({ column: p.year, value: valueFn(p) }));

  return (
    <table className="payslip-table">
      <thead>
        <tr>
          <th></th>
          {columns.map((year) => (
            <th key={year}>{year}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <Row className="row-net" label={strings.table.net} fieldValues={fieldValues((p) => p.netPay())} columns={columns} />
        {Payslip.categories.flatMap((category) => {
          const activeFields = category.fields.filter((f) => payslips.some((p) => p[f]));
          return [
            <Row
              key={category.key}
              className="row-category"
              label={strings.categories[category.key]}
              fieldValues={fieldValues((p) => p.sumCategory(category.key))}
              columns={columns}
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
                      fieldValues={fieldValues((p) => p.sum(group.fields))}
                      columns={columns}
                    />,
                    ...groupFields.map((field) => (
                      <Row
                        key={field}
                        className="row-item"
                        label={strings.fields[field]}
                        fieldValues={fieldValues((p) => p[field])}
                        columns={columns}
                      />
                    )),
                  ];
                })
              : activeFields.map((field) => (
                  <Row
                    key={field}
                    className="row-item"
                    label={strings.fields[field]}
                    fieldValues={fieldValues((p) => p[field])}
                    columns={columns}
                  />
                ))),
          ];
        })}
      </tbody>
    </table>
  );
}
