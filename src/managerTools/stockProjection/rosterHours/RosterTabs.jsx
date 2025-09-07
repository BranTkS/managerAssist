import React from 'react';

const RosterTabs = ({ tabs, activeTab, setActiveTab, addTab, isMonthlyTab, accentColour, textColour }) => (
  <div>
    {tabs.map((tab, idx) => (
      <button
        key={idx}
        onClick={() => setActiveTab(idx)}
        style={{
          fontWeight: activeTab === idx ? 'bold' : 'normal',
          marginRight: '5px',
          background: accentColour,
          color: textColour,
          border: `1px solid ${accentColour}`,
          padding: '6px 12px',
          borderRadius: '4px'
        }}
      >
        Week {idx + 1}
      </button>
    ))}
    <button
      onClick={() => setActiveTab(tabs.length)}
      style={{
        fontWeight: isMonthlyTab ? 'bold' : 'normal',
        marginRight: '5px',
        background: accentColour,
        color: textColour,
        border: `1px solid ${accentColour}`,
        padding: '6px 12px',
        borderRadius: '4px' 
      }}
    >
      Monthly Total
    </button>
    <button
      onClick={addTab}
      style={{
        marginLeft: '10px',
        background: accentColour,
        color: textColour,
        border: `1px solid ${accentColour}`,
        padding: '6px 12px',
        borderRadius: '4px'
      }}
    >
      Add Week
    </button>
  </div>
);

export default RosterTabs;