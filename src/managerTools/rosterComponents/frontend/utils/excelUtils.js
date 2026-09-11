import * as XLSX from 'xlsx';
import { calculateTotalHours, calculateSundayHours, calculateHolidayHours, calculateNightHours } from './hoursUtils';

// Download the given week (currentTab) as an Excel file
export function downloadWeekExcel({ currentTab, week, employeeNames, dayTypes, activeTab }) {
  const wsData = [
    [
      'Employee',
      ...week.map(w => `${w.day} ${w.date}`),
      'Total Normal Hours',
      'Sunday Hours',
      'Holiday Hours',
      'Night Hours',
      'Total Hours'
    ]
  ];
  // Add notes row
  wsData.push([
    'Notes',
    ...(currentTab.notes ? currentTab.notes : Array(7).fill('')),
    '', '', '', '', ''
  ]);
  currentTab.rows.forEach((row, rowIdx) => {
    const sundayHours = calculateSundayHours(row.tableData, week);
    const holidayHours = calculateHolidayHours(row.tableData, dayTypes);
    const totalNormalHours = calculateTotalHours(row.tableData) - sundayHours - holidayHours;
    const totalHours = totalNormalHours + sundayHours + holidayHours;
    const nightHours = calculateNightHours(row.tableData);
    wsData.push([
      employeeNames[rowIdx],
      ...row.tableData.map(cell => `${cell.start || ''} - ${cell.end || ''}`),
      totalNormalHours,
      sundayHours,
      holidayHours,
      nightHours,
      totalHours
    ]);
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Roster');
  XLSX.writeFile(wb, `Roster_Week${activeTab + 1}.xlsx`);
}

const normalizeEmployeeName = (name = '') => String(name).trim().toLowerCase();

const isBlueFill = (cell) => {
  const rgb = cell?.s?.fgColor?.rgb || cell?.s?.bgColor?.rgb || '';
  return ['FF99CCFF', 'FF9CC2E5', '99CCFF', '9CC2E5'].includes(rgb.toUpperCase());
};

const getTemplateHeaderMap = (worksheet, headerRow) => {
  const headers = {};
  for (let column = 0; column <= 26; column += 1) {
    const address = XLSX.utils.encode_cell({ r: headerRow, c: column });
    const value = worksheet[address]?.v;
    if (value) headers[String(value).trim().toLowerCase()] = column;
  }
  return headers;
};

const setTemplateCell = (worksheet, row, column, value) => {
  const address = XLSX.utils.encode_cell({ r: row, c: column });
  const existingCell = worksheet[address] || {};
  worksheet[address] = { ...existingCell, t: typeof value === 'number' ? 'n' : 's', v: value };
};

// Download the monthly totals into the supplied payroll template.
export async function downloadMonthlyExcel(monthlyRows) {
  const templateUrl = `${process.env.PUBLIC_URL || ''}/template Payroll NMW_galitos.xlsx`;
  const response = await fetch(encodeURI(templateUrl));
  if (!response.ok) {
    throw new Error('Unable to load the payroll Excel template. Please check that the template file is available.');
  }

  const templateData = new Uint8Array(await response.arrayBuffer());
  if (templateData[0] !== 0x50 || templateData[1] !== 0x4b) {
    throw new Error('The payroll template could not be loaded. Please refresh the page and try again.');
  }

  const workbook = XLSX.read(templateData, { type: 'array', cellStyles: true });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  const headerRow = rows.findIndex(row => row.some(cell => String(cell).trim().toLowerCase() === 'employee name'));
  if (headerRow === -1) {
    throw new Error('The payroll Excel template is missing the Employee Name column.');
  }

  const headers = getTemplateHeaderMap(worksheet, headerRow);
  const employeeNameColumn = headers['employee name'];
  const hourlyRateColumn = headers.hourly;
  const employeeRows = new Map();

  for (let row = headerRow + 1; row < rows.length; row += 1) {
    const nameCell = worksheet[XLSX.utils.encode_cell({ r: row, c: employeeNameColumn })];
    const name = normalizeEmployeeName(nameCell?.v);
    if (name) {
      if (!employeeRows.has(name)) employeeRows.set(name, []);
      employeeRows.get(name).push(row);
    }
  }

  const blueColumns = Object.entries(headers)
    .filter(([, column]) => isBlueFill(worksheet[XLSX.utils.encode_cell({ r: headerRow + 1, c: column })]))
    .map(([header, column]) => ({ header, column }));

  const findColumn = (text) => blueColumns.find(({ header }) => header.includes(text))?.column;
  const normalHoursColumn = findColumn('normal hours worked');
  const sundayHoursColumn = findColumn('sunday hours');
  const holidayHoursColumn = findColumn('public holiday hours');
  const annualLeaveColumn = findColumn('annual leave hours');
  const sickHoursColumn = findColumn('sick hours');
  const nightHoursColumn = findColumn('night shift allowance hours');
  const usedRows = new Set();
  const blankEmployeeRows = [];

  for (let row = headerRow + 1; row < rows.length; row += 1) {
    const nameCell = worksheet[XLSX.utils.encode_cell({ r: row, c: employeeNameColumn })];
    if (!nameCell?.v) blankEmployeeRows.push(row);
  }

  monthlyRows.forEach(row => {
    const matchingRows = employeeRows.get(normalizeEmployeeName(row.employee)) || [];
    const templateRow = matchingRows.find(candidate => !usedRows.has(candidate)) ?? blankEmployeeRows.shift();
    if (templateRow === undefined) return;
    usedRows.add(templateRow);
    if (!matchingRows.includes(templateRow)) setTemplateCell(worksheet, templateRow, employeeNameColumn, row.employee);

    const values = [
      [hourlyRateColumn, row.rate],
      [normalHoursColumn, row.totalNormalHours],
      [sundayHoursColumn, row.sundayHours],
      [holidayHoursColumn, row.holidayHours],
      [annualLeaveColumn, 0],
      [sickHoursColumn, 0],
      [nightHoursColumn, row.nightHours]
    ];
    values.forEach(([column, value]) => {
      if (column !== undefined) setTemplateCell(worksheet, templateRow, column, value);
    });
  });

  XLSX.writeFile(workbook, 'Payroll NMW_galitos.xlsx');
}

export function downloadMonthlySummaryExcel(monthlyRows, stats) {
  const wsData = [
    [
      'Employee',
      'Total Normal Hours',
      'Sunday Hours',
      'Holiday Hours',
      'Night Hours',
      'Total Hours',
      'Rate Type',
      'Rate',
      'Pay'
    ]
  ];
  monthlyRows.forEach(row => {
    wsData.push([
      row.employee,
      row.totalNormalHours,
      row.sundayHours,
      row.holidayHours,
      row.nightHours,
      row.totalHours,
      row.rateType,
      row.rate,
      row.pay
    ]);
  });
  wsData.push([]);
  wsData.push(['Stats', 'Total Pay', stats?.totalPay ?? 0, 'Cost Per Labour Hour', stats?.costPerLabourHour ?? 0]);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Monthly Total');
  XLSX.writeFile(wb, `Roster_Monthly_Total.xlsx`);
}

// Parse an uploaded Excel file and hand the results back via callbacks.
// onResult receives { notes, employeeNames, rows }
export function parseUploadedExcel(file, onResult) {
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

    let notes = Array(7).fill('');
    if (notesRow) {
      for (let j = 1; j <= 7; j++) {
        notes[j - 1] = notesRow[j] || '';
      }
    }

    // Employee rows
    const employeeNames = [];
    const newRows = [];
    for (let i = dataStartIdx; i < rows.length; i++) {
      const row = rows[i];
      employeeNames.push(row[0] || '');
      const tableData = [];
      for (let j = 1; j <= 7; j++) {
        const val = row[j] || '';
        const [start, end] = val.split('-').map(s => s.trim());
        tableData.push({ start: start || '', end: end || '' });
      }
      newRows.push({ tableData });
    }

    onResult({ notes, employeeNames, rows: newRows });
  };
  reader.readAsArrayBuffer(file);
}
