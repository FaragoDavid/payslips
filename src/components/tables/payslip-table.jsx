import React from 'react';
import { Pencil } from 'lucide-react';
import { strings } from '../../i18n/strings.js';
import { Payslip } from '../../data/payslip.js';
import Row from './row.jsx';

export default function PayslipTable({ payslips, columns, headers, columnKey, showTotal, onEditColumn }) {
  const columnsWithData = onEditColumn ? new Set(payslips.map((p) => p[columnKey])) : null;

  return (
    <table className="payslip-table">
      <thead>
        <tr>
          <th></th>
          {columns.map((column, index) => (
            <th key={index}>
              {headers[index]}
              {onEditColumn && columnsWithData.has(column) && (
                <button className="th-edit-btn" onClick={() => onEditColumn(column)}>
                  <Pencil size={11} />
                </button>
              )}
            </th>
          ))}
          {showTotal && <th className="col-total">Total</th>}
        </tr>
      </thead>
      <tbody>
        <Row
          className="row-net"
          label={strings.table.net}
          fieldValues={payslips.map((payslip) => ({ column: payslip[columnKey], value: payslip.netPay() }))}
          columns={columns}
          showTotal={showTotal}
        />
        {Payslip.categories.flatMap(({ key, fields, groups }) => {
          const activeFields = fields.filter((field) => payslips.some((payslip) => payslip[field]));
          return [
            <Row
              key={key}
              className="row-category"
              label={strings.categories[key]}
              fieldValues={payslips.map((payslip) => ({ column: payslip[columnKey], value: payslip.sumCategory(key) }))}
              columns={columns}
              showTotal={showTotal}
            />,
            ...(groups
              ? groups.flatMap(({ key: groupKey, fields: groupFields }) => {
                  const activeGroupFields = groupFields.filter((field) => activeFields.includes(field));
                  if (activeGroupFields.length === 0) return [];
                  return [
                    <Row
                      key={`group-${key}-${groupKey}`}
                      className="row-group"
                      label={strings.groups[groupKey]}
                      fieldValues={payslips.map((payslip) => ({ column: payslip[columnKey], value: payslip.sum(groupFields) }))}
                      columns={columns}
                      showTotal={showTotal}
                    />,
                    ...activeGroupFields.map((field) => (
                      <Row
                        key={field}
                        className="row-item"
                        label={strings.fields[field]}
                        fieldValues={payslips.map((payslip) => ({ column: payslip[columnKey], value: payslip[field] }))}
                        columns={columns}
                        showTotal={showTotal}
                      />
                    )),
                  ];
                })
              : activeFields.map((field) => (
                  <Row
                    key={field}
                    className="row-item"
                    label={strings.fields[field]}
                    fieldValues={payslips.map((payslip) => ({ column: payslip[columnKey], value: payslip[field] }))}
                    columns={columns}
                    showTotal={showTotal}
                  />
                ))),
          ];
        })}
      </tbody>
    </table>
  );
}
