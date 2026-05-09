import Cell from './cell.jsx';

export default function Row({ className, label, fieldValues, columns, showTotal }) {
  let total = fieldValues.reduce((sum, { value }) => sum + (value || 0), 0);
  const cells = columns.map((column, colIndex) => {
    const value = fieldValues.find((fv) => fv.column === column)?.value || 0;
    return <Cell key={colIndex} value={value} />;
  });
  return (
    <tr className={className}>
      <td>{label}</td>
      {cells}
      {showTotal && <Cell className="col-total" value={total} />}
    </tr>
  );
}
