import React from 'react';
import { Pencil } from 'lucide-react';
import { useCategories, useMonetaryCategoryKeys } from '../../data/categories.js';
import { useStrings } from '../../i18n/strings.js';
import Row from './row.jsx';

export default function PayslipTable({ payslips, columns, headers, columnKey, showTotal, onEditColumn }) {
  const strings = useStrings();
  const categories = useCategories();
  const monetaryCategoryKeys = useMonetaryCategoryKeys();
  const columnsWithData = onEditColumn ? new Set(payslips.map((payslip) => payslip[columnKey])) : null;

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
        {categories.flatMap(({ key, fields, groups }) => {
          const activeFields = fields.filter((field) => payslips.some((payslip) => payslip[field]));
          const isMonetary = monetaryCategoryKeys.includes(key);
          return [
            isMonetary ? (
              <Row
                key={key}
                className="row-category"
                label={strings.categories[key]}
                fieldValues={payslips.map((payslip) => ({ column: payslip[columnKey], value: payslip.sumCategory(key) }))}
                columns={columns}
                showTotal={showTotal}
              />
            ) : (
              <tr key={key} className="row-category">
                <td colSpan={columns.length + 1 + (showTotal ? 1 : 0)}>{strings.categories[key]}</td>
              </tr>
            ),
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
