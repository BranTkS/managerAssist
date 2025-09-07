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
        color: textColour,
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
        color: textColour,
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
        background: '#06a39bff',
        border: '1px solid #ccc',
        cursor: 'pointer',
        borderRadius: '4px',
        color: textColour
      }}>Upload Excel</span>
    </label>
    {/* Navigation buttons can be added here as well */}
  </>
);

export default RosterControls;