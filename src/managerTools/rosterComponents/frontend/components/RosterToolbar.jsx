import React, { useRef, useState } from 'react';
import ActionButton from './ActionButton';
import NoticeModal from '../../../../components/NoticeModal';

function RosterToolbar({
  tabs,
  activeTab,
  isMonthlyTab,
  onTabChange,
  onAddTab,
  onMonthlyTab,
  onSave,
  isSaving,
  onDownload,
  onUpload,
  onAddRow,
  onDeleteWeek,
  onMoveDays,
  week
}) {
  const fileInputRef = useRef(null);
  const [showUploadNotice, setShowUploadNotice] = useState(false);

  return (
    <div className="roster-controls-column">
      <div className="roster-action-row" style={{ marginBottom: '12px' }}>
        <ActionButton onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Progress'}
        </ActionButton>
        <ActionButton onClick={onDownload}>
          Download Excel
        </ActionButton>
        <label>
          <input ref={fileInputRef} type="file" accept=".xlsx, .xls" style={{ display: 'none' }} onChange={onUpload} />
          <span
            role="button"
            tabIndex={0}
            onClick={event => {
              event.preventDefault();
              setShowUploadNotice(true);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setShowUploadNotice(true);
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '7px 14px',
              background: 'var(--color-primary-hover)',
              border: '1px solid var(--color-primary)',
              cursor: 'pointer',
              borderRadius: '10px',
              color: 'var(--color-surface)',
              fontWeight: 600,
              boxShadow: 'var(--shadow-surface)'
            }}
          >
            Upload Excel
          </span>
        </label>
      </div>

      {showUploadNotice && (
        <NoticeModal
          message="Heads up: uploading an excel will overwrite where dates overlap"
          onCancel={() => setShowUploadNotice(false)}
          onConfirm={() => {
            setShowUploadNotice(false);
            fileInputRef.current?.click();
          }}
        />
      )}

      <div className="roster-action-row" style={{ marginBottom: '12px', alignItems: 'flex-end' }}>
        <ActionButton onClick={onAddRow}>Add employee</ActionButton>
        <ActionButton onClick={onAddTab}>Add Week</ActionButton>
        <div
          role="tablist"
          aria-label="Roster views"
          style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', marginLeft: '6px' }}
        >
          {tabs.map((tab, idx) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(idx)}
                style={{
                  padding: '9px 16px 8px',
                  background: isActive ? 'var(--color-surface)' : 'var(--color-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderBottom: isActive ? '2px solid var(--color-surface)' : '1px solid var(--color-border)',
                  borderRadius: '9px 9px 0 0',
                  marginBottom: isActive ? '-1px' : '0',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 600
                }}
              >
                Week {idx + 1}
              </button>
            );
          })}
          <button
            type="button"
            role="tab"
            aria-selected={isMonthlyTab}
            onClick={onMonthlyTab}
            style={{
              padding: '9px 16px 8px',
              background: isMonthlyTab ? 'var(--color-surface)' : 'var(--color-secondary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderBottom: isMonthlyTab ? '2px solid var(--color-surface)' : '1px solid var(--color-border)',
              borderRadius: '9px 9px 0 0',
              marginBottom: isMonthlyTab ? '-1px' : '0',
              cursor: 'pointer',
              fontWeight: isMonthlyTab ? 700 : 600
            }}
          >
            Monthly Total
          </button>
        </div>
      </div>

      {!isMonthlyTab && (
        <div className="roster-action-row roster-nav-row" style={{ marginBottom: '0' }}>
        <div style={{ width: '12px' }} />
        <ActionButton onClick={() => onMoveDays(-7)}>&lt;&lt; Previous 7 Days</ActionButton>
        <ActionButton onClick={() => onMoveDays(-1)}>&lt; Previous Day</ActionButton>
        <span style={{ margin: '0 8px', fontWeight: 600 }}>{week[0].date} - {week[6].date}</span>
        <ActionButton onClick={() => onMoveDays(1)}>Next Day &gt;</ActionButton>
        <ActionButton onClick={() => onMoveDays(7)}>Next 7 Days &gt;&gt;</ActionButton>
        <ActionButton onClick={onDeleteWeek} disabled={tabs.length <= 1}>Delete Week</ActionButton>
        </div>
      )}
    </div>
  );
}

export default RosterToolbar;