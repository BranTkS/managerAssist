import React from 'react';

function NoticeModal({ message, confirmLabel = 'Continue', onConfirm, onCancel }) {
  return (
    <div
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onCancel();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(43, 38, 37, 0.35)'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notice"
        style={{
          width: 'min(420px, 100%)',
          padding: '24px',
          borderRadius: '14px',
          background: '#ffffff',
          color: 'var(--color-text-primary)',
          boxShadow: 'var(--shadow-surface)'
        }}
      >
        <p style={{ margin: '0 0 22px', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onCancel} style={{ padding: '8px 14px' }}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} style={{ padding: '8px 14px' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoticeModal;
