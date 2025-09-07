import React from 'react';
import { hourOptions } from './helpers';

const RosterTable = ({
  week,
  dayTypes,
  currentTab,
  employeeNames,
  setEmployeeNames,
  setTabs,
  activeTab,
  accentColour,
  secondaryColour,
  textColour,
  primaryColour,
  calculateSundayHours,
  calculateHolidayHours,
  calculateTotalHours,
  calculateNightHours,
  deleteRow
}) => (
  <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', margin: '20px 0' }}>
    {/* ...thead and tbody code from your main file... */}
    {/* Use props for all logic and styling */}
  </table>
);

export default RosterTable;