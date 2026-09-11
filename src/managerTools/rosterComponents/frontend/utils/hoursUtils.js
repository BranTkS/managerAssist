export function isTimeValue(value) {
  return /^\d{2}:\d{2}$/.test(String(value || ''));
}

// Helper to calculate total hours for the row
export function calculateTotalHours(tableData) {
  let total = 0;
  let daysWithBoth = 0;
  tableData.forEach(cell => {
    if (isTimeValue(cell.start) && isTimeValue(cell.end)) {
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
export function calculateSundayHours(tableData, week) {
  let total = 0;
  week.forEach((w, idx) => {
    // Sunday is 'Sun'
    if (w.day === 'Sun') {
      const cell = tableData[idx];
      if (isTimeValue(cell.start) && isTimeValue(cell.end)) {
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
export function calculateHolidayHours(tableData, dayTypes) {
  let total = 0;
  tableData.forEach((cell, idx) => {
    if (dayTypes[idx] === 'holiday' && isTimeValue(cell.start) && isTimeValue(cell.end)) {
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
export function calculateNightHours(tableData) {
  let total = 0;
  tableData.forEach(cell => {
    if (isTimeValue(cell.start) && isTimeValue(cell.end)) {
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
