import React from 'react';
import { strings } from '../../i18n/strings.js';
import { Payslip } from '../../data/payslip.js';
import Row from './row.jsx';

export default function YearlyTable({ payslips }) {
  const years = [...new Set(payslips.map((p) => p.year))].sort();
  const yearlyData = payslips.reduce((data, payslip) => {
    let yearData = data.find((d) => d.year === payslip.year);
    if (!yearData) {
      yearData = { year: payslip.year };
      data.push(yearData);
    }

    for (const field in payslip) {
      if (field !== 'year' && field !== 'month') {
        yearData[field] = (yearData[field] || 0) + (payslip[field] || 0);
      }
    }

    return data;
  }, []);

  const columns = years;
  const fieldValues = (valueFn) => yearlyData.map((d) => ({ column: d.year, value: valueFn(d) }));

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
        <Row
          className="row-net"
          label={strings.table.net}
          fieldValues={fieldValues((d) =>
            Payslip.categories.reduce((sum, cat) => sum + cat.fields.reduce((s, f) => s + (d[f] || 0), 0), 0),
          )}
          columns={columns}
        />
        {Payslip.categories.flatMap((category) => {
          const activeFields = category.fields.filter((f) => payslips.some((p) => p[f]));
          return [
            <Row
              key={category.key}
              className="row-category"
              label={strings.categories[category.key]}
              fieldValues={fieldValues((d) => category.fields.reduce((sum, f) => sum + (d[f] || 0), 0))}
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
                      fieldValues={fieldValues((d) => group.fields.reduce((sum, f) => sum + (d[f] || 0), 0))}
                      columns={columns}
                    />,
                    ...groupFields.map((field) => (
                      <Row
                        key={field}
                        className="row-item"
                        label={strings.fields[field]}
                        fieldValues={fieldValues((d) => d[field])}
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
                    fieldValues={fieldValues((d) => d[field])}
                    columns={columns}
                  />
                ))),
          ];
        })}
      </tbody>
    </table>
  );
}
