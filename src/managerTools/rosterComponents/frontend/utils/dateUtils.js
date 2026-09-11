// Helper to get 7 days from a start date
export function getWeekDates(startDate) {
  const days = [];
  const weekStart = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days.push({ day: dayName, date: dateStr, dateValue: d });
  }
  return days;
}

export function getDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultTotalsDates(now = new Date()) {
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    fromDate: getDateInputValue(firstDay),
    toDate: getDateInputValue(lastDay)
  };
}

export function getTotalsDateRange(fromDate, toDate) {
  if (!fromDate || !toDate) return null;
  if (fromDate > toDate) {
    return { start: new Date(1), end: new Date(0) };
  }

  const [fromYear, fromMonth, fromDay] = fromDate.split('-').map(Number);
  const [toYear, toMonth, toDay] = toDate.split('-').map(Number);
  return {
    start: new Date(fromYear, fromMonth - 1, fromDay),
    end: new Date(toYear, toMonth - 1, toDay, 23, 59, 59, 999)
  };
}

export function getPreviousYearDateRange(fromDate, toDate) {
  if (!fromDate || !toDate) return null;
  const [fromYear, fromMonth, fromDay] = fromDate.split('-').map(Number);
  const [toYear, toMonth, toDay] = toDate.split('-').map(Number);
  return {
    start: new Date(fromYear - 1, fromMonth - 1, fromDay),
    end: new Date(toYear - 1, toMonth - 1, toDay, 23, 59, 59, 999)
  };
}

export function isDateInRange(date, range) {
  return !range || (date >= range.start && date <= range.end);
}

export function filterWeekByDateRange(tableData, week, dayTypes, range) {
  const indexes = week
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => isDateInRange(day.dateValue, range));

  return {
    tableData: indexes.map(({ index }) => tableData[index]),
    week: indexes.map(({ day }) => day),
    dayTypes: indexes.map(({ index }) => dayTypes[index])
  };
}
