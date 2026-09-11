import React from 'react';

const RosterControls = ({
  isMonthlyTab,
  addRow,
  downloadExcel,
  uploadExcel,
  moveDays,
  accentColour,
  textColour
}) => !isMonthlyTab && (
  <>
    <button
      onClick={addRow}
      style={{
        marginLeft: '20px',
        background: accentColour,
        color: 'var(--color-surface)',
        border: `1px solid ${accentColour}`,
        padding: '6px 12px',
        borderRadius: '4px'
      }}
    >
      Add Row
    </button>
    <button
      onClick={downloadExcel}
      style={{
        marginLeft: '10px',
        background: accentColour,
        color: 'var(--color-surface)',
        border: `1px solid ${accentColour}`,
        padding: '6px 12px',
        borderRadius: '4px'
      }}
    >
      Download Excel
    </button>
    <label style={{ marginLeft: '10px' }}>
      <input
        type="file"
        accept=".xlsx, .xls"
        style={{ display: 'none' }}
        onChange={uploadExcel}
      />
      <span style={{
        padding: '6px 12px',
        background: 'var(--color-primary-hover)',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        borderRadius: '4px',
        color: 'var(--color-surface)'
      }}>Upload Excel</span>
    </label>
    {/* Navigation buttons can be added here as well */}
  </>
);

export default RosterControls;