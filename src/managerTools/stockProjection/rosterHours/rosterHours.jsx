import React, { useState } from 'react';
import * as XLSX from 'xlsx';

// Colour variables
const textColour = '#2B2625';
const headerColour = '#2B2625';
const backgroundColour = '#FAF8F5';
const accentColour = '#F28C68';
const secondaryColour = '#FCD5CE';
const primaryColour = '#FCD5CE';

// Helper to get 7 days from a start date
function getWeekDates(startDate) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days.push({ day: dayName, date: dateStr });
  }
  return days;
}

// Generate 24 hour options
const hourOptions = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, '0')}:00`
);

// Helper to calculate total hours for the row
function calculateTotalHours(tableData) {
  let total = 0;
  let daysWithBoth = 0;
  tableData.forEach(cell => {
    if (cell.start && cell.end) {
      const [startHour] = cell.start.split(':').map(Number);
      const [endHour] = cell.end.split(':').map(Number);
      let diff = endHour - startHour;
      if (diff < 0) diff += 24; // handle overnight shifts
      total += diff;
      daysWithBoth += 1;
    }
  });
  // Subtract 1 hour for each day that has both a start and end time
  total -= daysWithBoth;
  return total;
}

// Helper to calculate total hours for Sundays in the window
function calculateSundayHours(tableData, week) {
  let total = 0;
  week.forEach((w, idx) => {
    // Sunday is 'Sun'
    if (w.day === 'Sun') {
      const cell = tableData[idx];
      if (cell.start && cell.end) {
        const [startHour] = cell.start.split(':').map(Number);
        const [endHour] = cell.end.split(':').map(Number);
        let diff = endHour - startHour;
        if (diff < 0) diff += 24;
        // Subtract 1 hour for Sunday as well if both times exist
        diff -= 1;
        total += diff;
      }
    }
  });
  return total;
}

// Helper to calculate total hours for holidays in the window
function calculateHolidayHours(tableData, dayTypes) {
  let total = 0;
  tableData.forEach((cell, idx) => {
    if (dayTypes[idx] === 'holiday' && cell.start && cell.end) {
      const [startHour] = cell.start.split(':').map(Number);
      const [endHour] = cell.end.split(':').map(Number);
      let diff = endHour - startHour;
      if (diff < 0) diff += 24;
      // Subtract 1 hour for each holiday day with both times
      diff -= 1;
      total += diff;
    }
  });
  return total;
}

// Helper to calculate total night hours (after 18:00) for the row
function calculateNightHours(tableData) {
  let total = 0;
  tableData.forEach(cell => {
    if (cell.start && cell.end) {
      const [startHour] = cell.start.split(':').map(Number);
      const [endHour] = cell.end.split(':').map(Number);

      // If shift starts before 18:00 and ends after 18:00
      if (endHour > 18) {
        // If startHour < 18, only count hours after 18:00
        if (startHour < 18) {
          total += endHour - 18;
        } else {
          total += endHour - startHour;
        }
      }
      // Overnight shift: startHour > endHour
      if (startHour > endHour) {
        // Count hours from 18:00 to midnight if startHour < 24
        if (startHour < 24 && startHour < 18) {
          total += 24 - 18;
        } else if (startHour < 24 && startHour >= 18) {
          total += 24 - startHour;
        }
        // Count hours from midnight to endHour if endHour > 0
        if (endHour > 0) {
          total += endHour;
        }
      }
    }
  });
  return total;
}

function RosterHours() {
  // Tabs: each tab is a week section with its own rows and startDate
  const [tabs, setTabs] = useState([
    {
      startDate: new Date(),
      rows: [
        {
          tableData: Array(7).fill().map(() => ({ start: '', end: '' })),
        }
      ]
    }
  ]);
  const [activeTab, setActiveTab] = useState(0);

  // Shared employee names for each row
  const [employeeNames, setEmployeeNames] = useState(['']);

  // Move window backward or forward by days for the active tab
  const moveDays = (days) => {
    setTabs(tabs => {
      const newTabs = [...tabs];
      const newStart = new Date(newTabs[activeTab].startDate);
      newStart.setDate(newStart.getDate() + days);
      newTabs[activeTab].startDate = newStart;
      // Reset rows for new window, keep row count and employee names
      newTabs[activeTab].rows = newTabs[activeTab].rows.map(() => ({
        tableData: Array(7).fill().map(() => ({ start: '', end: '' })),
      }));
      return newTabs;
    });
  };

  // Add a new row to the active tab and employee names
  const addRow = () => {
    setTabs(tabs => {
      const newTabs = [...tabs];
      newTabs.forEach(tab => {
        tab.rows.push({
          tableData: Array(7).fill().map(() => ({ start: '', end: '' })),
        });
      });
      return newTabs;
    });
    setEmployeeNames(names => [...names, '']);
  };

  // Delete a row by index in all tabs and employee names
  const deleteRow = (idx) => {
    if (employeeNames.length === 1) return;
    setTabs(tabs => {
      const newTabs = tabs.map(tab => ({
        ...tab,
        rows: tab.rows.filter((_, i) => i !== idx)
      }));
      return newTabs;
    });
    setEmployeeNames(names => names.filter((_, i) => i !== idx));
  };

  // Add a new tab (week)
  const addTab = () => {
    setTabs(tabs => [
      ...tabs,
      {
        startDate: new Date(),
        rows: Array(employeeNames.length).fill().map(() => ({
          tableData: Array(7).fill().map(() => ({ start: '', end: '' })),
        })),
        dayTypes: Array(7).fill('normal day')
      }
    ]);
    setActiveTab(tabs.length); // Switch to new tab
  };

  // Day type for each column (shared across all tabs)
  const [dayTypes, setDayTypes] = useState(Array(7).fill('normal day'));

  // Calculate totals across all tabs
  let grandTotalHours = 0;
  let grandSundayHours = 0;
  let grandHolidayHours = 0;

  tabs.forEach(tab => {
    const week = getWeekDates(tab.startDate);
    tab.rows.forEach(row => {
      const sundayHours = calculateSundayHours(row.tableData, week);
      const holidayHours = calculateHolidayHours(row.tableData, dayTypes);
      const totalHours = calculateTotalHours(row.tableData) - sundayHours - holidayHours;
      grandTotalHours += totalHours;
      grandSundayHours += sundayHours;
      grandHolidayHours += holidayHours;
    });
  });

  // Current tab data
  const currentTab = activeTab === tabs.length
    ? null
    : tabs[activeTab];
  const week = currentTab ? getWeekDates(currentTab.startDate) : null;

  // Monthly total tab logic
  const isMonthlyTab = activeTab === tabs.length;
  let monthlyRows = [];
  if (isMonthlyTab) {
    for (let rowIdx = 0; rowIdx < employeeNames.length; rowIdx++) {
      let totalHours = 0;
      let sundayHours = 0;
      let holidayHours = 0;
      let nightHours = 0;
      for (let tabIdx = 0; tabIdx < tabs.length; tabIdx++) {
        const tab = tabs[tabIdx];
        const week = getWeekDates(tab.startDate);
        const row = tab.rows[rowIdx];
        if (row) {
          sundayHours += calculateSundayHours(row.tableData, week);
          holidayHours += calculateHolidayHours(row.tableData, dayTypes);
          totalHours += calculateTotalHours(row.tableData) -
            calculateSundayHours(row.tableData, week) -
            calculateHolidayHours(row.tableData, dayTypes);
          nightHours += calculateNightHours(row.tableData);
        }
      }
      monthlyRows.push({
        employee: employeeNames[rowIdx],
        totalHours,
        sundayHours,
        holidayHours,
        nightHours
      });
    }
  }

  // Download current tab as Excel
  const downloadExcel = () => {
    const week = getWeekDates(currentTab.startDate);
    const wsData = [
      [
        'Employee',
        ...week.map(w => `${w.day} ${w.date}`),
        'Total Hours',
        'Sunday Hours',
        'Holiday Hours',
        'Night Hours'
      ]
    ];
    // Add notes row
    wsData.push([
      'Notes',
      ...(currentTab.notes ? currentTab.notes : Array(7).fill('')),
      '', '', '', ''
    ]);
    currentTab.rows.forEach((row, rowIdx) => {
      const sundayHours = calculateSundayHours(row.tableData, week);
      const holidayHours = calculateHolidayHours(row.tableData, dayTypes);
      const totalHours = calculateTotalHours(row.tableData) - sundayHours - holidayHours;
      const nightHours = calculateNightHours(row.tableData);
      wsData.push([
        employeeNames[rowIdx],
        ...row.tableData.map(cell => `${cell.start || ''} - ${cell.end || ''}`),
        totalHours,
        sundayHours,
        holidayHours
      ]);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Roster');
    XLSX.writeFile(wb, `Roster_Week${activeTab + 1}.xlsx`);
  };

  // Upload Excel and populate current tab
  const uploadExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const ws = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (rows.length < 2) return;

      // First row is header, second row may be notes
      let notesRow = null;
      let dataStartIdx = 1;
      if (rows[1][0] && rows[1][0].toLowerCase() === 'notes') {
        notesRow = rows[1];
        dataStartIdx = 2;
      }

      // Set notes if present
      if (notesRow) {
        setTabs(tabs => {
          const newTabs = [...tabs];
          newTabs[activeTab].notes = [];
          for (let j = 1; j <= 7; j++) {
            newTabs[activeTab].notes[j - 1] = notesRow[j] || '';
          }
          return newTabs;
        });
      } else {
        // If no notes row, clear notes
        setTabs(tabs => {
          const newTabs = [...tabs];
          newTabs[activeTab].notes = Array(7).fill('');
          return newTabs;
        });
      }

      // Employee rows
      const newEmployeeNames = [];
      const newRows = [];
      for (let i = dataStartIdx; i < rows.length; i++) {
        const row = rows[i];
        newEmployeeNames.push(row[0] || '');
        const tableData = [];
        for (let j = 1; j <= 7; j++) {
          const val = row[j] || '';
          const [start, end] = val.split('-').map(s => s.trim());
          tableData.push({ start: start || '', end: end || '' });
        }
        newRows.push({ tableData });
      }
      setEmployeeNames(newEmployeeNames);
      setTabs(tabs => {
        const newTabs = [...tabs];
        newTabs[activeTab].rows = newRows;
        return newTabs;
      });
    };
    reader.readAsArrayBuffer(file);
  };

  // Download monthly total tab as Excel
  const downloadMonthlyExcel = () => {
    const wsData = [
      [
        'Employee',
        'Total Hours',
        'Sunday Hours',
        'Holiday Hours',
        'Night Hours'
      ]
    ];
    monthlyRows.forEach(row => {
      wsData.push([
        row.employee,
        row.totalHours,
        row.sundayHours,
        row.holidayHours,
        row.nightHours
      ]);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Total');
    XLSX.writeFile(wb, `Roster_Monthly_Total.xlsx`);
  };

  return (
    <div style={{ background: backgroundColour, color: textColour }}>
      <h2 style={{ color: headerColour }}>Roster Hours Calendar</h2>
      <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
        <div>
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              style={{
                fontWeight: activeTab === idx ? 'bold' : 'normal',
                marginRight: '5px',
                background: accentColour,
                color: textColour,
                border: `1px solid ${accentColour}`,
                padding: '6px 12px',
                borderRadius: '4px'
              }}
            >
              Week {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setActiveTab(tabs.length)}
            style={{
              fontWeight: isMonthlyTab ? 'bold' : 'normal',
              marginRight: '5px',
              background: accentColour,
              color: textColour,
              border: `1px solid ${accentColour}`,
              padding: '6px 12px',
              borderRadius: '4px'
            }}
          >
            Monthly Total
          </button>
          <button
            onClick={addTab}
            style={{
              marginLeft: '10px',
              background: accentColour,
              color: textColour,
              border: `1px solid ${accentColour}`,
              padding: '6px 12px',
              borderRadius: '4px'
            }}
          >
            Add Week
          </button>
        </div>
        {!isMonthlyTab && (
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
                background: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                borderRadius: '4px',
                color: textColour
              }}>Upload Excel</span>
            </label>
          </>
        )}
      </div>
      {!isMonthlyTab && (
        <>
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={() => moveDays(-7)}
              style={{
                marginLeft: '5px',
                background: accentColour,
                color: textColour,
                border: `1px solid ${accentColour}`,
                padding: '6px 12px',
                borderRadius: '4px'
              }}
            >
              &lt;&lt; Previous 7 Days
            </button>
            <button
              onClick={() => moveDays(-1)}
              style={{
                background: accentColour,
                color: textColour,
                border: `1px solid ${accentColour}`,
                padding: '6px 12px',
                borderRadius: '4px'
              }}
            >
              &lt; Previous Day
            </button>
            <span style={{ margin: '0 15px' }}>
              {week[0].date} - {week[6].date}
            </span>
            <button
              onClick={() => moveDays(1)}
              style={{
                background: accentColour,
                color: textColour,
                border: `1px solid ${accentColour}`,
                padding: '6px 12px',
                borderRadius: '4px'
              }}
            >
              Next Day &gt;
            </button>
            <button
              onClick={() => moveDays(7)}
              style={{
                marginLeft: '5px',
                background: accentColour,
                color: textColour,
                border: `1px solid ${accentColour}`,
                padding: '6px 12px',
                borderRadius: '4px'
              }}
            >
              Next 7 Days &gt;&gt;
            </button>
          </div>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', margin: '20px 0', background: backgroundColour, color: textColour }}>
            <thead>
              <tr>
                <th>Employee</th>
                {week.map((w, idx) => (
                  <th key={idx}>{w.day}<br />{w.date}</th>
                ))}
                <th style={{ padding: '2px 6px', width: '36px' }}>Total Hours</th>
                <th style={{ padding: '2px 6px', width: '36px' }}>Sunday Hours</th>
                <th style={{ padding: '2px 6px', width: '36px' }}>Holiday Hours</th>
                <th style={{ padding: '2px 6px', width: '36px' }}>Night Hours</th>
              </tr>
              <tr>
                <th></th>
                {week.map((_, colIdx) => (
                  <th key={colIdx + 'type'}>
                    <select
                      value={dayTypes[colIdx]}
                      onChange={e => {
                        const newTypes = [...dayTypes];
                        newTypes[colIdx] = e.target.value;
                        setDayTypes(newTypes);
                      }}
                      style={{ width: '100px' }}
                    >
                      <option value="normal day">Normal Day</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </th>
                ))}
                <th style={{ padding: '2px 6px', width: '36px' }}></th>
                <th style={{ padding: '2px 6px', width: '36px' }}></th>
                <th style={{ padding: '2px 6px', width: '36px' }}></th>
                <th style={{ padding: '2px 6px', width: '36px' }}></th>
              </tr>
              {/* Notes row below day type dropdowns */}
              <tr>
                <th>Notes</th>
                {week.map((_, colIdx) => (
                  <th key={colIdx + 'notes'}>
                    <textarea
                      style={{
                        width: '100%',
                        minHeight: '40px',
                        resize: 'vertical',
                        fontSize: '0.95em',
                        background: secondaryColour,
                        color: textColour,
                        border: `1px solid ${accentColour}`,
                        borderRadius: '4px'
                      }}
                      placeholder="Enter notes for this day..."
                      value={currentTab.notes && currentTab.notes[colIdx] ? currentTab.notes[colIdx] : ''}
                      onChange={e => {
                        setTabs(tabs => {
                          const newTabs = [...tabs];
                          if (!newTabs[activeTab].notes) {
                            newTabs[activeTab].notes = Array(7).fill('');
                          }
                          newTabs[activeTab].notes[colIdx] = e.target.value;
                          return newTabs;
                        });
                      }}
                    />
                  </th>
                ))}
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentTab.rows.map((row, rowIdx) => {
                const sundayHours = calculateSundayHours(row.tableData, week);
                const holidayHours = calculateHolidayHours(row.tableData, dayTypes);
                const totalHours = calculateTotalHours(row.tableData) - sundayHours - holidayHours;
                const nightHours = calculateNightHours(row.tableData);
                return (
                  <tr key={rowIdx}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <input
                          type="text"
                          value={employeeNames[rowIdx]}
                          onChange={e => {
                            const newNames = [...employeeNames];
                            newNames[rowIdx] = e.target.value;
                            setEmployeeNames(newNames);
                          }}
                          placeholder="Enter employee..."
                          style={{
                            width: '120px',
                            background: secondaryColour,
                            color: textColour,
                            border: `1px solid ${accentColour}`,
                            borderRadius: '4px'
                          }}
                        />
                        <button
                          onClick={() => deleteRow(rowIdx)}
                          disabled={employeeNames.length === 1}
                          style={{
                            marginTop: '4px',
                            fontSize: '0.95em',
                            padding: '2px 8px',
                            background: accentColour,
                            color: textColour,
                            border: `1px solid ${accentColour}`,
                            borderRadius: '4px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    {row.tableData.map((cell, colIdx) => (
                      <td key={colIdx}>
                        <div>
                          <label>
                            Start:
                            <select
                              value={cell.start}
                              onChange={e => {
                                setTabs(tabs => {
                                  const newTabs = [...tabs];
                                  newTabs[activeTab].rows[rowIdx].tableData[colIdx].start = e.target.value;
                                  return newTabs;
                                });
                              }}
                              style={{
                                marginLeft: '5px',
                                background: secondaryColour,
                                color: textColour,
                                border: `1px solid ${accentColour}`,
                                borderRadius: '4px'
                              }}
                            >
                              <option value="">--</option>
                              {hourOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <label>
                            End:
                            <select
                              value={cell.end}
                              onChange={e => {
                                setTabs(tabs => {
                                  const newTabs = [...tabs];
                                  newTabs[activeTab].rows[rowIdx].tableData[colIdx].end = e.target.value;
                                  return newTabs;
                                });
                              }}
                              style={{
                                marginLeft: '12px',
                                background: secondaryColour,
                                color: textColour,
                                border: `1px solid ${accentColour}`,
                                borderRadius: '4px'
                              }}
                            >
                              <option value="">--</option>
                              {hourOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </td>
                    ))}
                    <td style={{ fontWeight: 'bold', background: primaryColour, color: textColour, padding: '2px 6px', width: '36px' }}>
                      {totalHours}
                    </td>
                    <td style={{ fontWeight: 'bold', background: accentColour, color: textColour, padding: '2px 6px', width: '36px' }}>
                      {sundayHours}
                    </td>
                    <td style={{ fontWeight: 'bold', background: secondaryColour, color: textColour, padding: '2px 6px', width: '36px' }}>
                      {holidayHours}
                    </td>
                    <td style={{ fontWeight: 'bold', background: secondaryColour, color: textColour, padding: '2px 6px', width: '36px' }}>
                      {nightHours}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
      {isMonthlyTab && (
        <>
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={downloadMonthlyExcel}
              style={{
                background: accentColour,
                color: textColour,
                border: `1px solid ${accentColour}`,
                padding: '6px 12px',
                borderRadius: '4px'
              }}
            >
              Download Monthly Excel
            </button>
          </div>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', margin: '20px 0', background: backgroundColour, color: textColour }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th style={{ padding: '2px 6px', width: '36px' }}>Total Hours</th>
                <th style={{ padding: '2px 6px', width: '36px' }}>Sunday Hours</th>
                <th style={{ padding: '2px 6px', width: '36px' }}>Holiday Hours</th>
                <th style={{ padding: '2px 6px', width: '36px' }}>Night Hours</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.employee}</td>
                  <td style={{ fontWeight: 'bold', background: primaryColour, color: textColour, padding: '2px 6px', width: '36px' }}>{row.totalHours}</td>
                  <td style={{ fontWeight: 'bold', background: accentColour, color: textColour, padding: '2px 6px', width: '36px' }}>{row.sundayHours}</td>
                  <td style={{ fontWeight: 'bold', background: secondaryColour, color: textColour, padding: '2px 6px', width: '36px' }}>{row.holidayHours}</td>
                  <td style={{ fontWeight: 'bold', background: backgroundColour, color: textColour, padding: '2px 6px', width: '36px' }}>{row.nightHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <div style={{ marginTop: '20px', fontWeight: 'bold', color: accentColour }}>
        <span>Grand Total Hours: {grandTotalHours}</span>
        <span style={{ marginLeft: '30px' }}>Grand Sunday Hours: {grandSundayHours}</span>
        <span style={{ marginLeft: '30px' }}>Grand Holiday Hours: {grandHolidayHours}</span>
      </div>
    </div>
  );
}

export default RosterHours;