export function getWeekDates(startDate) { /* ... */ }
export const hourOptions = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
export function calculateTotalHours(tableData) { /* ... */ }
export function calculateSundayHours(tableData, week) { /* ... */ }
export function calculateHolidayHours(tableData, dayTypes) { /* ... */ }
export function calculateNightHours(tableData) { /* ... */ }