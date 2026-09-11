import React from 'react';
import { backgroundColour, textColour, secondaryColour, accentColour } from '../constants';
import EmployeeRow from './EmployeeRow';

function WeekTable({
  week,
  currentTab,
  employeeNames,
  dayTypes,
  setDayTypes,
  onNoteChange,
  onNameChange,
  onDeleteRow,
  onCellChange,
  totalsDateRange
}) {
  return (
    <div style={{ overflowX: 'auto', margin: '20px 0', borderRadius: '20px', boxShadow: '0 4px 20px rgba(242, 140, 104, 0.06)' }}>
      <table
        cellPadding="10"
        style={{ borderCollapse: 'collapse', width: '100%', background: backgroundColour, color: textColour, borderRadius: '18px', overflow: 'hidden' }}
      >
        <thead>
          <tr>
            <th style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '12px 10px', textAlign: 'left' }}>Employee</th>
            {week.map((w, idx) => (
              <th key={idx} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '12px 10px', textAlign: 'center', minWidth: '120px' }}>
                <div style={{ fontWeight: 700 }}>{w.day}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{w.date}</div>
              </th>
            ))}
            <th style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '12px 10px', width: '110px', textAlign: 'center' }}>Total Normal Hours</th>
            <th style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '12px 10px', width: '110px', textAlign: 'center' }}>Sunday Hours</th>
            <th style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '12px 10px', width: '110px', textAlign: 'center' }}>Holiday Hours</th>
            <th style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '12px 10px', width: '110px', textAlign: 'center' }}>Night Hours</th>
            <th style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '12px 10px', width: '110px', textAlign: 'center' }}>Total Hours</th>
          </tr>
          <tr>
            <th style={{ background: '#ffffff', border: '1px solid rgba(19,61,82,0.10)', padding: '10px' }}></th>
            {week.map((_, colIdx) => (
              <th key={colIdx + 'type'} style={{ background: '#ffffff', border: '1px solid rgba(19,61,82,0.10)', padding: '10px', textAlign: 'center' }}>
                <select
                  value={dayTypes[colIdx]}
                  onChange={e => {
                    const newTypes = [...dayTypes];
                    newTypes[colIdx] = e.target.value;
                    setDayTypes(newTypes);
                  }}
                  style={{ width: '110px', background: '#ffffff', color: textColour, border: '1px solid rgba(19,61,82,0.12)', borderRadius: '8px', padding: '6px 8px' }}
                >
                  <option value="normal day">Normal Day</option>
                  <option value="holiday">Holiday</option>
                </select>
              </th>
            ))}
            <th style={{ background: '#ffffff', border: '1px solid rgba(19,61,82,0.10)', padding: '10px' }}></th>
            <th style={{ background: '#ffffff', border: '1px solid rgba(19,61,82,0.10)', padding: '10px' }}></th>
            <th style={{ background: '#ffffff', border: '1px solid rgba(19,61,82,0.10)', padding: '10px' }}></th>
            <th style={{ background: '#ffffff', border: '1px solid rgba(19,61,82,0.10)', padding: '10px' }}></th>
          </tr>
          <tr>
            <th style={{ background: '#ffffff', border: '1px solid rgba(19,61,82,0.10)', padding: '10px 8px', textAlign: 'left' }}>Notes</th>
            {week.map((_, colIdx) => (
              <th key={colIdx + 'notes'} style={{ background: '#ffffff', border: '1px solid rgba(19,61,82,0.10)', padding: '10px 8px', verticalAlign: 'top' }}>
                <textarea
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    resize: 'vertical',
                    fontSize: '0.9em',
                    background: secondaryColour,
                    color: textColour,
                    border: `1px solid ${accentColour}`,
                    borderRadius: '8px',
                    padding: '8px 10px'
                  }}
                  placeholder="Enter notes for this day..."
                  value={currentTab.notes && currentTab.notes[colIdx] ? currentTab.notes[colIdx] : ''}
                  onChange={e => onNoteChange(colIdx, e.target.value)}
                />
              </th>
            ))}
            <th style={{ background: '#ffffff', border: '1px solid rgba(19,61,82,0.10)', padding: '10px' }}></th>
            <th style={{ background: '#ffffff', border: '1px solid rgba(19,61,82,0.10)', padding: '10px' }}></th>
            <th style={{ background: '#ffffff', border: '1px solid rgba(19,61,82,0.10)', padding: '10px' }}></th>
            <th style={{ background: '#ffffff', border: '1px solid rgba(19,61,82,0.10)', padding: '10px' }}></th>
          </tr>
        </thead>
        <tbody>
          {currentTab.rows.map((row, rowIdx) => (
            <EmployeeRow
              key={rowIdx}
              row={row}
              rowIdx={rowIdx}
              week={week}
              dayTypes={dayTypes}
              employeeName={employeeNames[rowIdx]}
              onNameChange={onNameChange}
              onDelete={onDeleteRow}
              canDelete={employeeNames.length > 1}
              onCellChange={onCellChange}
              totalsDateRange={totalsDateRange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WeekTable;
