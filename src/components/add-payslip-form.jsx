import React, { useState } from 'react';
import { useCategories } from '../data/categories.js';
import { useStrings } from '../i18n/strings.js';
import { formatInputValue, parseInputValue } from '../utils/format.js';

export default function AddPayslipForm({ onSave, onCancel, defaultYear, defaultMonth, initialData, takenMonths = {} }) {
  const strings = useStrings();
  const categories = useCategories();
  const isEditing = !!initialData;

  const allFields = categories.flatMap(({ fields }) => fields);
  const deductionFields = new Set(categories.find(({ key }) => key === 'deductions').fields);

  const [year, setYear] = useState(initialData?.year ?? defaultYear ?? new Date().getFullYear());
  const [month, setMonth] = useState(initialData?.month ?? defaultMonth ?? 1);
  const [fields, setFields] = useState(() =>
    Object.fromEntries(allFields.map((f) => [f, initialData?.[f] != null ? formatInputValue(String(initialData[f])) : ''])),
  );

  const handleFieldChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: parseInputValue(value) }));
  };

  const handleFieldBlur = (key) => {
    setFields((prev) => ({ ...prev, [key]: formatInputValue(prev[key]) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { year, month };
    for (const key of allFields) {
      const val = parseFloat(parseInputValue(fields[key]));
      if (!isNaN(val) && val !== 0) {
        if (deductionFields.has(key)) data[key] = -Math.abs(val);
        else data[key] = Math.abs(val);
      }
    }
    onSave(data);
  };

  return (
    <>
      <form id="add-payslip-form" className="add-payslip-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>{strings.addForm.year}</label>
          {isEditing ? (
            <span className="form-readonly">{year}</span>
          ) : (
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} required />
          )}
        </div>
        <div className="form-row">
          <label>{strings.addForm.month}</label>
          {isEditing ? (
            <span className="form-readonly">{strings.months[month - 1]}</span>
          ) : (
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {strings.months.map((name, i) => (
                <option key={i + 1} value={i + 1} disabled={takenMonths[year]?.has(i + 1)}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>
        {categories.map((category) => (
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
                          type="text"
                          inputMode="numeric"
                          value={fields[field]}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          onBlur={() => handleFieldBlur(field)}
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
                      type="text"
                      inputMode="numeric"
                      value={fields[field]}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      onBlur={() => handleFieldBlur(field)}
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
