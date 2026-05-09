import React, { useState } from 'react';
import { Payslip } from '../data/payslip.js';
import { strings } from '../i18n/strings.js';

const allFields = Payslip.categories.flatMap((c) => c.fields);

export default function AddPayslipForm({ onSave, onCancel, defaultYear, defaultMonth }) {
  const [year, setYear] = useState(defaultYear || new Date().getFullYear());
  const [month, setMonth] = useState(defaultMonth || 1);
  const [fields, setFields] = useState(() => Object.fromEntries(allFields.map((f) => [f, ''])));

  const handleFieldChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { year, month };
    for (const key of allFields) {
      const val = parseFloat(fields[key]);
      if (!isNaN(val) && val !== 0) data[key] = val;
    }
    onSave(data);
  };

  return (
    <>
      <form id="add-payslip-form" className="add-payslip-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>{strings.addForm.year}</label>
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} required />
        </div>
        <div className="form-row">
          <label>{strings.addForm.month}</label>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {strings.months.map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
        {sortedCategories.map((category) => (
          <fieldset key={category.key}>
            <legend>{strings.categories[category.key]}</legend>
            {category.groups
              ? category.groups.map((group) => (
                  <div key={group.key} className="form-group">
                    <div className="form-group-label">{strings.groups[group.key]}</div>
                    {group.fields.map((field) => (
                      <div className="form-row" key={field}>
                        <label>{strings.fields[field]}</label>
                        <input
                          type="number"
                          step="any"
                          value={fields[field]}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          placeholder="0"
                          autoFocus={field === allFields[0]}
                        />
                      </div>
                    ))}
                  </div>
                ))
              : category.fields.map((field) => (
                  <div className="form-row" key={field}>
                    <label>{strings.fields[field]}</label>
                    <input
                      type="number"
                      step="any"
                      value={fields[field]}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                ))}
          </fieldset>
        ))}
      </form>
      <div className="form-actions">
        <button type="submit" form="add-payslip-form" className="btn btn-small">
          {strings.addForm.save}
        </button>
        <button type="button" className="btn btn-small btn-cancel" onClick={onCancel}>
          {strings.addForm.cancel}
        </button>
      </div>
    </>
  );
}
