import React from 'react';
import ActionButton from './ActionButton';
import { backgroundColour, textColour, primaryColour, accentColour, secondaryColour } from '../constants';

const hourCellStyle = {
  fontWeight: 'bold',
  color: textColour,
  padding: '2px 6px',
  width: '36px'
};

function MonthlyTable({ monthlyRows, onDownloadMonthlyExcel, totalsFilter, onRateChange, stats, previousYearSales, expectedGrowth, expectedRevenue, onPreviousYearSalesChange, onExpectedGrowthChange, salesPerStaffMember, efficientGrossPay, payEfficiencyDifference, payAsTargetPercentage }) {
  return (
    <>
      <div style={{ marginBottom: '10px' }}>
        {totalsFilter}
        <ActionButton onClick={onDownloadMonthlyExcel}>
          Download Monthly Excel
        </ActionButton>
      </div>
      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: 'collapse', margin: '20px 0', background: backgroundColour, color: textColour }}
      >
        <thead>
          <tr>
            <th>Employee</th>
            <th style={{ padding: '2px 6px', width: '36px' }}>Total Normal Hours</th>
            <th style={{ padding: '2px 6px', width: '36px' }}>Sunday Hours</th>
            <th style={{ padding: '2px 6px', width: '36px' }}>Holiday Hours</th>
            <th style={{ padding: '2px 6px', width: '36px' }}>Leave Days</th>
            <th style={{ padding: '2px 6px', width: '36px' }}>Sick Days</th>
            <th style={{ padding: '2px 6px', width: '36px' }}>Night Hours</th>
            <th style={{ padding: '2px 6px', width: '36px' }}>Total Hours</th>
            <th>Rate Type</th>
            <th>Rate</th>
            <th>Pay</th>
          </tr>
        </thead>
        <tbody>
          {monthlyRows.map((row, idx) => (
            <tr key={idx}>
              <td>{row.employee}</td>
              <td style={{ ...hourCellStyle, background: primaryColour }}>{row.totalNormalHours}</td>
              <td style={{ ...hourCellStyle, background: accentColour }}>{row.sundayHours}</td>
              <td style={{ ...hourCellStyle, background: secondaryColour }}>{row.holidayHours}</td>
              <td style={{ ...hourCellStyle, background: 'var(--color-leave)' }}>{row.leaveDays}</td>
              <td style={{ ...hourCellStyle, background: 'var(--color-sick)' }}>{row.sickDays}</td>
              <td style={{ ...hourCellStyle, background: backgroundColour }}>{row.nightHours}</td>
              <td style={{ ...hourCellStyle, background: 'var(--color-highlight)' }}>{row.totalHours}</td>
              <td>
                <select value={row.rateType} onChange={event => onRateChange(idx, 'rateType', event.target.value)}>
                  <option value="hourly">Hourly rate</option>
                  <option value="monthly">Monthly rate</option>
                </select>
              </td>
              <td>
                <input
                  type="text"
                  inputMode="decimal"
                  value={row.rate}
                  onChange={event => onRateChange(idx, 'rate', event.target.value)}
                  style={{ width: '80px' }}
                />
              </td>
              <td style={{ ...hourCellStyle, background: 'var(--color-highlight)' }}>{row.pay.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', marginTop: '24px' }}>
        <div style={{ width: '24px' }} aria-hidden="true" />
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', background: backgroundColour, color: textColour }}>
          <caption style={{ fontWeight: 'bold', padding: '8px' }}>Stats</caption>
          <thead>
            <tr>
              <th>Previous Year Sales</th>
              <th>Expected Growth %</th>
              <th>Expected Revenue</th>
              <th>Total Pay</th>
              <th>Cost Per Labour Hour</th>
              <th>Sales Per Staff Member</th>
              <th>Efficient Gross Pay Total</th>
              <th>Pay Efficiency Difference</th>
              <th>Pay As Target %</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input
                  type="text"
                  inputMode="decimal"
                  value={previousYearSales}
                  onChange={event => onPreviousYearSalesChange(event.target.value)}
                  aria-label="Previous year sales"
                  style={{ width: '100px' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  inputMode="decimal"
                  value={expectedGrowth}
                  onChange={event => onExpectedGrowthChange(event.target.value)}
                  aria-label="Expected growth percentage"
                  style={{ width: '75px' }}
                />
              </td>
              <td>{expectedRevenue.toFixed(2)}</td>
              <td>{stats.totalPay.toFixed(2)}</td>
              <td>{stats.costPerLabourHour.toFixed(2)}</td>
              <td>{salesPerStaffMember.toFixed(2)}</td>
              <td>{efficientGrossPay.toFixed(2)}</td>
              <td>{payEfficiencyDifference.toFixed(2)}</td>
              <td>{payAsTargetPercentage.toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default MonthlyTable;
