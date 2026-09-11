import React from 'react';
import ActionButton from './ActionButton';

function WeekNavigation({ week, onMoveDays }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <ActionButton onClick={() => onMoveDays(-7)} style={{ marginLeft: '5px' }}>
        &lt;&lt; Previous 7 Days
      </ActionButton>
      <ActionButton onClick={() => onMoveDays(-1)}>
        &lt; Previous Day
      </ActionButton>
      <span style={{ margin: '0 15px' }}>
        {week[0].date} - {week[6].date}
      </span>
      <ActionButton onClick={() => onMoveDays(1)}>
        Next Day &gt;
      </ActionButton>
      <ActionButton onClick={() => onMoveDays(7)} style={{ marginLeft: '5px' }}>
        Next 7 Days &gt;&gt;
      </ActionButton>
    </div>
  );
}

export default WeekNavigation;
