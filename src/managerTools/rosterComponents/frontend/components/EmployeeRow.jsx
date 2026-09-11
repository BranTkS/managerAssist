import React from 'react';
import {
  textColour,
  secondaryColour,
  accentColour,
  primaryColour,
  hourOptions,
  dayStatusOptions
} from '../constants';
import {
  calculateTotalHours,
  calculateSundayHours,
  calculateHolidayHours,
  calculateNightHours
} from '../utils/hoursUtils';
import { filterWeekByDateRange } from '../utils/dateUtils';

const hourCellStyle = {
  fontWeight: 'bold',
  color: textColour,
  padding: '2px 6px',
  width: '36px'
};

function EmployeeRow({
  row,
  rowIdx,
  week,
  dayTypes,
  employeeName,
  onNameChange,
  onDelete,
  canDelete,
  onCellChange,
  totalsDateRange
}) {
  const filteredWeek = filterWeekByDateRange(row.tableData, week, dayTypes, totalsDateRange);
  const sundayHours = calculateSundayHours(filteredWeek.tableData, filteredWeek.week);
  const holidayHours = calculateHolidayHours(filteredWeek.tableData, filteredWeek.dayTypes);
  const totalNormalHours = calculateTotalHours(filteredWeek.tableData) - sundayHours - holidayHours;
  const totalHours = totalNormalHours + sundayHours + holidayHours;
  const nightHours = calculateNightHours(filteredWeek.tableData);

  return (
    <tr>
      <td style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '12px 10px', verticalAlign: 'top' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <input
            type="text"
            value={employeeName}
            onChange={e => onNameChange(rowIdx, e.target.value)}
            placeholder="Enter employee..."
            style={{
              width: '130px',
              background: secondaryColour,
              color: textColour,
              border: `1px solid ${accentColour}`,
              borderRadius: '8px',
              padding: '7px 9px'
            }}
          />
          <button
            onClick={() => onDelete(rowIdx)}
            disabled={!canDelete}
            style={{
              fontSize: '0.9em',
              padding: '5px 10px',
              background: 'var(--color-surface)',
              color: textColour,
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              cursor: canDelete ? 'pointer' : 'not-allowed',
              opacity: canDelete ? 1 : 0.5
            }}
          >
            Delete
          </button>
        </div>
      </td>
      {row.tableData.map((cell, colIdx) => (
        <td key={colIdx} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '12px 10px', verticalAlign: 'top' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: '4px', color: '#49657e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Start</div>
              <select
                value={cell.start}
                disabled={cell.end === 'leave day' || cell.end === 'sick day'}
                onChange={e => onCellChange(rowIdx, colIdx, 'start', e.target.value)}
                style={{
                  width: '100%',
                  background: secondaryColour,
                  color: textColour,
                  border: `1px solid ${accentColour}`,
                  borderRadius: '8px',
                  padding: '6px 8px'
                }}
              >
                <option value="">--</option>
                {hourOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                {dayStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: '4px', color: '#49657e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>End</div>
              <select
                value={cell.end}
                disabled={cell.start === 'leave day' || cell.start === 'sick day'}
                onChange={e => onCellChange(rowIdx, colIdx, 'end', e.target.value)}
                style={{
                  width: '100%',
                  background: secondaryColour,
                  color: textColour,
                  border: `1px solid ${accentColour}`,
                  borderRadius: '8px',
                  padding: '6px 8px'
                }}
              >
                <option value="">--</option>
                {hourOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                {dayStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </td>
      ))}
      <td style={{ ...hourCellStyle, background: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>{totalNormalHours}</td>
      <td style={{ ...hourCellStyle, background: 'var(--color-neutral-soft)', border: '1px solid var(--color-border)' }}>{sundayHours}</td>
      <td style={{ ...hourCellStyle, background: 'var(--color-leave)', border: '1px solid var(--color-border)' }}>{holidayHours}</td>
      <td style={{ ...hourCellStyle, background: 'var(--color-neutral-tint)', border: '1px solid var(--color-border)' }}>{nightHours}</td>
      <td style={{ ...hourCellStyle, background: 'var(--color-highlight)', border: '1px solid var(--color-border)' }}>{totalHours}</td>
    </tr>
  );
}

export default EmployeeRow;
