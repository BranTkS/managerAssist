import React from 'react';
import { accentColour } from '../constants';

function GrandTotals({ grandNormalHours, grandTotalHours, grandSundayHours, grandHolidayHours, grandNightHours }) {
  return (
    <div style={{ marginTop: '20px', fontWeight: 'bold', color: accentColour }}>
      <span>Grand Total Normal Hours: {grandNormalHours}</span>
      <span style={{ marginLeft: '30px' }}>Grand Sunday Hours: {grandSundayHours}</span>
      <span style={{ marginLeft: '30px' }}>Grand Holiday Hours: {grandHolidayHours}</span>
      <span style={{ marginLeft: '30px' }}>Grand Night Hours: {grandNightHours}</span>
      <span style={{ marginLeft: '30px' }}>Grand Total Hours: {grandTotalHours}</span>
    </div>
  );
}

export default GrandTotals;
