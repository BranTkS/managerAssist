import React from 'react';
import ActionButton from './ActionButton';
import { accentColour, textColour } from '../constants';

function TabsBar({
  tabs,
  activeTab,
  setActiveTab,
  isMonthlyTab,
  onAddTab,
  onAddRow,
  onDownloadExcel,
  onUploadExcel,
  onSaveProgress,
  isSaving
}) {
  return (
    <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', padding: '14px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '18px', boxShadow: 'var(--shadow-surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        {tabs.map((tab, idx) => (
          <ActionButton
            key={idx}
            onClick={() => setActiveTab(idx)}
            bold={activeTab === idx}
            style={{ marginRight: '0px' }}
          >
            Week {idx + 1}
          </ActionButton>
        ))}
        <ActionButton
          onClick={() => setActiveTab(tabs.length)}
          bold={isMonthlyTab}
        >
          Monthly Total
        </ActionButton>
        <ActionButton onClick={onAddTab} style={{ marginLeft: '6px' }}>
          Add Week
        </ActionButton>
      </div>
      {!isMonthlyTab && (
        <>
          <ActionButton onClick={onAddRow}>
            Add Row
          </ActionButton>
          <ActionButton onClick={onDownloadExcel}>
            Download Excel
          </ActionButton>
          <ActionButton onClick={onSaveProgress} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Progress'}
          </ActionButton>
          <label>
            <input
              type="file"
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              onChange={onUploadExcel}
            />
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7px 14px',
                background: accentColour,
                border: '1px solid rgba(19,61,82,0.08)',
                cursor: 'pointer',
                borderRadius: '10px',
                color: '#ffffff',
                fontWeight: 600,
                boxShadow: 'var(--shadow-surface)'
              }}
            >
              Upload Excel
            </span>
          </label>
        </>
      )}
    </div>
  );
}

export default TabsBar;
