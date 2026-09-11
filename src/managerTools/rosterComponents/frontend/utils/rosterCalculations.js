import { filterWeekByDateRange, getWeekDates } from './dateUtils';
import {
  calculateHolidayHours,
  calculateNightHours,
  calculateSundayHours,
  calculateTotalHours
} from './hoursUtils';

function countDayStatuses(tableData) {
  return tableData.reduce((counts, cell) => {
    if (cell.start === 'leave day' || cell.end === 'leave day') counts.leaveDays += 1;
    if (cell.start === 'sick day' || cell.end === 'sick day') counts.sickDays += 1;
    return counts;
  }, { leaveDays: 0, sickDays: 0 });
}

export function calculateGrandTotals({ tabs, dayTypes, dateRange }) {
  return tabs.reduce((totals, tab) => {
    const tabWeek = getWeekDates(tab.startDate);

    tab.rows.forEach(row => {
      const filteredWeek = filterWeekByDateRange(row.tableData, tabWeek, dayTypes, dateRange);
      const sundayHours = calculateSundayHours(filteredWeek.tableData, filteredWeek.week);
      const holidayHours = calculateHolidayHours(filteredWeek.tableData, filteredWeek.dayTypes);
      const totalNormalHours = calculateTotalHours(filteredWeek.tableData) - sundayHours - holidayHours;

      totals.grandNormalHours += totalNormalHours;
      totals.grandTotalHours += totalNormalHours + sundayHours + holidayHours;
      totals.grandSundayHours += sundayHours;
      totals.grandHolidayHours += holidayHours;
      totals.grandNightHours += calculateNightHours(filteredWeek.tableData);
    });

    return totals;
  }, {
    grandTotalHours: 0,
    grandNormalHours: 0,
    grandSundayHours: 0,
    grandHolidayHours: 0,
    grandNightHours: 0
  });
}

export function calculateEmployeeTotals({ tabs, employeeNames, employeeRates, dayTypes, dateRange }) {
  return employeeNames.map((employeeName, rowIdx) => {
    let totalNormalHours = 0;
    let sundayHours = 0;
    let holidayHours = 0;
    let nightHours = 0;
    let leaveDays = 0;
    let sickDays = 0;

    tabs.forEach(tab => {
      const row = tab.rows[rowIdx];
      if (!row) return;

      const filteredWeek = filterWeekByDateRange(
        row.tableData,
        getWeekDates(tab.startDate),
        dayTypes,
        dateRange
      );
      const filteredSundayHours = calculateSundayHours(filteredWeek.tableData, filteredWeek.week);
      const filteredHolidayHours = calculateHolidayHours(filteredWeek.tableData, filteredWeek.dayTypes);

      sundayHours += filteredSundayHours;
      holidayHours += filteredHolidayHours;
      totalNormalHours += calculateTotalHours(filteredWeek.tableData) - filteredSundayHours - filteredHolidayHours;
      nightHours += calculateNightHours(filteredWeek.tableData);
      const statusCounts = countDayStatuses(filteredWeek.tableData);
      leaveDays += statusCounts.leaveDays;
      sickDays += statusCounts.sickDays;
    });

    const totalHours = totalNormalHours + sundayHours + holidayHours;
    const rateDetails = employeeRates[rowIdx] || { rateType: 'hourly', rate: 0 };
    const rateValue = Number(rateDetails.rate) || 0;
    const pay = rateDetails.rateType === 'monthly'
      ? (totalHours > 0 ? rateValue : 0)
      : (rateValue * totalNormalHours) + (rateValue * sundayHours * 1.5) + (rateValue * holidayHours * 1.5);

    return {
      employee: employeeName,
      totalNormalHours,
      totalHours,
      sundayHours,
      holidayHours,
      leaveDays,
      sickDays,
      nightHours,
      rateType: rateDetails.rateType,
      rate: rateDetails.rate ?? '',
      pay
    };
  });
}