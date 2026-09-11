import React from 'react';
import { accentColour } from '../constants';

// Shared styled button used throughout the roster UI
function ActionButton({ onClick, disabled, bold, style, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontWeight: bold ? 'bold' : 'normal',
        background: accentColour,
        color: 'var(--color-surface)',
        border: `1px solid ${accentColour}`,
        padding: '6px 12px',
        borderRadius: '4px',
        ...style
      }}
    >
      {children}
    </button>
  );
}

export default ActionButton;
