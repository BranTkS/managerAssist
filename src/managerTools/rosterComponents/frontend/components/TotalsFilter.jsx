import React from 'react';
import { backgroundColour, textColour } from '../constants';

function TotalsFilter({ fromDate, toDate, onFromDateChange, onToDateChange }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontWeight: 600 }}>
      <span>Totals from</span>
      <input
        type="date"
        value={fromDate}
        onChange={event => onFromDateChange(event.target.value)}
        aria-label="Totals from date"
        style={{ background: backgroundColour, color: textColour, border: '1px solid rgba(19,61,82,0.18)', borderRadius: '8px', padding: '7px 10px' }}
      />
      <span>till</span>
      <input
        type="date"
        value={toDate}
        min={fromDate}
        onChange={event => onToDateChange(event.target.value)}
        aria-label="Totals till date"
        style={{ background: backgroundColour, color: textColour, border: '1px solid rgba(19,61,82,0.18)', borderRadius: '8px', padding: '7px 10px' }}
      />
    </div>
  );
}

export default TotalsFilter;