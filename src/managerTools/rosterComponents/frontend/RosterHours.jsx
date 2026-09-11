import React, { useCallback, useEffect, useRef, useState } from 'react';
import { backgroundColour, textColour, headerColour } from './constants';
import { getDefaultTotalsDates, getPreviousYearDateRange, getTotalsDateRange, getWeekDates } from './utils/dateUtils';
import { calculateEmployeeTotals, calculateGrandTotals } from './utils/rosterCalculations';
import { downloadWeekExcel, downloadMonthlyExcel, parseUploadedExcel } from './utils/excelUtils';
import {
  loadRosterFromLocalStorage,
  loadRosterFromMongo,
  saveRosterToLocalStorage,
  saveRosterToMongo
} from './services/rosterPersistence';

import RosterToolbar from './components/RosterToolbar';
import WeekTable from './components/WeekTable';
import MonthlyTable from './components/MonthlyTable';
import GrandTotals from './components/GrandTotals';
import TotalsFilter from './components/TotalsFilter';
import AdSlot from '../../../components/AdSlot';

const sanitizeDecimalInput = (value) => {
  const normalized = value.replace(/[^0-9.]/g, '');
  const [whole, ...decimalParts] = normalized.split('.');
  return decimalParts.length ? `${whole}.${decimalParts.join('').slice(0, 2)}` : whole;
};

function RosterHours({ user }) {
  const savedRoster = loadRosterFromLocalStorage();

  const defaultTabState = [
    {
      startDate: new Date(),
      rows: [
        {
          tableData: Array(7).fill().map(() => ({ start: '', end: '' })),
        }
      ]
    }
  ];

  // Tabs: each tab is a week section with its own rows and startDate
  const [tabs, setTabs] = useState(savedRoster?.tabs ?? defaultTabState);
  const [activeTab, setActiveTab] = useState(savedRoster?.activeTab ?? 0);

  // Shared employee names for each row
  const [employeeNames, setEmployeeNames] = useState(savedRoster?.employeeNames ?? ['']);
  const [employeeRates, setEmployeeRates] = useState(() => savedRoster?.employeeRates ?? (savedRoster?.employeeNames ?? ['']).map(() => ({ rateType: 'hourly', rate: 0 })));

  // Day type for each column (shared across all tabs)
  const [dayTypes, setDayTypes] = useState(savedRoster?.dayTypes ?? Array(7).fill('normal day'));
  const defaultTotalsDates = getDefaultTotalsDates();
  const [fromDate, setFromDate] = useState(defaultTotalsDates.fromDate);
  const [toDate, setToDate] = useState(defaultTotalsDates.toDate);
  const [previousYearSales, setPreviousYearSales] = useState('0');
  const [expectedGrowth, setExpectedGrowth] = useState('0');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const latestRosterStateRef = useRef({ activeTab, employeeNames, employeeRates, dayTypes, tabs });
  const hasUnsavedChangesRef = useRef(false);

  useEffect(() => {
    latestRosterStateRef.current = { activeTab, employeeNames, employeeRates, dayTypes, tabs };
    hasUnsavedChangesRef.current = true;
  }, [activeTab, employeeNames, employeeRates, dayTypes, tabs]);

  useEffect(() => {
    saveRosterToLocalStorage({ activeTab, employeeNames, employeeRates, dayTypes, tabs });
  }, [activeTab, employeeNames, employeeRates, dayTypes, tabs]);

  useEffect(() => {
    const loadRosterForUser = async () => {
      if (!user?.email) return;

      try {
        const remoteRoster = await loadRosterFromMongo(user);
        if (remoteRoster) {
          setTabs(remoteRoster.tabs);
          setActiveTab(remoteRoster.activeTab ?? 0);
          setEmployeeNames(remoteRoster.employeeNames ?? ['']);
          setEmployeeRates(remoteRoster.employeeRates ?? (remoteRoster.employeeNames ?? ['']).map(() => ({ rateType: 'hourly', rate: 0 })));
          setDayTypes(remoteRoster.dayTypes ?? Array(7).fill('normal day'));
          hasUnsavedChangesRef.current = false;
        }
      } catch (error) {
        console.warn('Unable to load roster from MongoDB:', error);
      }
    };

    loadRosterForUser();
  }, [user?.email]);

  const saveCurrentRosterToMongo = useCallback(async () => {
    const currentState = latestRosterStateRef.current;
    if (!currentState || !hasUnsavedChangesRef.current) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      await saveRosterToMongo(currentState, user);
      hasUnsavedChangesRef.current = false;
      setSaveMessage('Roster autosaved to MongoDB.');
    } catch (error) {
      setSaveMessage(error.message || 'Failed to autosave roster.');
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      saveCurrentRosterToMongo();
    }, 180000);

    return () => clearInterval(autosaveInterval);
  }, [saveCurrentRosterToMongo]);

  const isMonthlyTab = activeTab === tabs.length;
  const currentTab = isMonthlyTab ? null : tabs[activeTab];
  const week = currentTab ? getWeekDates(currentTab.startDate) : null;
  const totalsDateRange = getTotalsDateRange(fromDate, toDate);
  const previousYearDateRange = getPreviousYearDateRange(fromDate, toDate);

  // Move window backward or forward by days for the active tab
  const moveDays = (days) => {
    setTabs(tabs => {
      const newTabs = [...tabs];
      const newStart = new Date(newTabs[activeTab].startDate);
      newStart.setDate(newStart.getDate() + days);
      newTabs[activeTab].startDate = newStart;
      // Reset rows for new window, keep row count and employee names
      newTabs[activeTab].rows = newTabs[activeTab].rows.map(() => ({
        tableData: Array(7).fill().map(() => ({ start: '', end: '' })),
      }));
      return newTabs;
    });
  };

  // Add a new row to the active tab and employee names
  const addRow = () => {
    setTabs(tabs => {
      const newTabs = [...tabs];
      newTabs.forEach(tab => {
        tab.rows.push({
          tableData: Array(7).fill().map(() => ({ start: '', end: '' })),
        });
      });
      return newTabs;
    });
    setEmployeeNames(names => [...names, '']);
    setEmployeeRates(rates => [...rates, { rateType: 'hourly', rate: 0 }]);
  };

  // Delete a row by index in all tabs and employee names
  const deleteRow = (idx) => {
    if (employeeNames.length === 1) return;
    setTabs(tabs => tabs.map(tab => ({
      ...tab,
      rows: tab.rows.filter((_, i) => i !== idx)
    })));
    setEmployeeNames(names => names.filter((_, i) => i !== idx));
    setEmployeeRates(rates => rates.filter((_, i) => i !== idx));
  };

  const deleteWeek = () => {
    if (tabs.length <= 1 || isMonthlyTab) return;

    setTabs(currentTabs => currentTabs.filter((_, index) => index !== activeTab));
    setActiveTab(currentActiveTab => Math.min(currentActiveTab, tabs.length - 2));
  };

  // Add a new tab (week)
  const addTab = () => {
    setTabs(tabs => [
      ...tabs,
      {
        startDate: new Date(),
        rows: Array(employeeNames.length).fill().map(() => ({
          tableData: Array(7).fill().map(() => ({ start: '', end: '' })),
        })),
        dayTypes: Array(7).fill('normal day')
      }
    ]);
    setActiveTab(tabs.length); // Switch to new tab
  };

  const handleNameChange = (rowIdx, value) => {
    setEmployeeNames(names => {
      const newNames = [...names];
      newNames[rowIdx] = value;
      return newNames;
    });
  };

  const handleNoteChange = (colIdx, value) => {
    setTabs(tabs => {
      const newTabs = [...tabs];
      if (!newTabs[activeTab].notes) {
        newTabs[activeTab].notes = Array(7).fill('');
      }
      newTabs[activeTab].notes[colIdx] = value;
      return newTabs;
    });
  };

  const handleCellChange = (rowIdx, colIdx, field, value) => {
    setTabs(tabs => {
      const newTabs = [...tabs];
      const cell = newTabs[activeTab].rows[rowIdx].tableData[colIdx];
      cell[field] = value;
      if (value === 'leave day' || value === 'sick day') {
        cell[field === 'start' ? 'end' : 'start'] = '';
      }
      return newTabs;
    });
  };

  const grandTotals = calculateGrandTotals({ tabs, dayTypes, dateRange: totalsDateRange });
  const monthlyRows = calculateEmployeeTotals({ tabs, employeeNames, employeeRates, dayTypes, dateRange: totalsDateRange });
  const previousYearRows = calculateEmployeeTotals({ tabs, employeeNames, employeeRates, dayTypes, dateRange: previousYearDateRange });

  const handleDownloadExcel = () => {
    downloadWeekExcel({ currentTab, week, employeeNames, dayTypes, activeTab });
  };

  const handleUploadExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    parseUploadedExcel(file, ({ notes, employeeNames: newNames, rows: newRows }) => {
      setTabs(tabs => {
        const newTabs = [...tabs];
        newTabs[activeTab].notes = notes;
        newTabs[activeTab].rows = newRows;
        return newTabs;
      });
      setEmployeeNames(newNames);
    });
  };

  const handleDownloadMonthlyExcel = async () => {
    try {
      await downloadMonthlyExcel(monthlyRows);
    } catch (error) {
      setSaveMessage(error.message || 'Unable to download the payroll Excel template.');
    }
  };

  const totalsFilterControl = (
    <TotalsFilter
      fromDate={fromDate}
      toDate={toDate}
      onFromDateChange={setFromDate}
      onToDateChange={setToDate}
    />
  );
  const previousYearTotalPay = previousYearRows.reduce((sum, row) => sum + row.pay, 0);
  const handleRateChange = (rowIdx, field, value) => {
    setEmployeeRates(rates => rates.map((rate, index) => (
      index === rowIdx
        ? { ...rate, [field]: field === 'rate' ? sanitizeDecimalInput(value) : value }
        : rate
    )));
  };
  const handlePreviousYearSalesChange = (value) => setPreviousYearSales(sanitizeDecimalInput(value));
  const handleExpectedGrowthChange = (value) => setExpectedGrowth(sanitizeDecimalInput(value));
  useEffect(() => {
    setPreviousYearSales(previousYearTotalPay.toFixed(2));
  }, [fromDate, toDate]);
  const monthlyStats = {
    totalPay: monthlyRows.reduce((sum, row) => sum + row.pay, 0),
    costPerLabourHour: monthlyRows.reduce((sum, row) => sum + row.totalHours, 0)
      ? monthlyRows.reduce((sum, row) => sum + row.pay, 0) / monthlyRows.reduce((sum, row) => sum + row.totalHours, 0)
      : 0
  };
  const expectedRevenue = (Number(previousYearSales) || 0) * (1 + (Number(expectedGrowth) || 0) / 100);
  const currentMonthlyPay = monthlyStats.totalPay;
  const staffCount = employeeNames.length;
  const salesPerStaffMember = staffCount ? expectedRevenue / staffCount : 0;
  const efficientGrossPay = expectedRevenue * 0.15;
  const payEfficiencyDifference = currentMonthlyPay - efficientGrossPay;
  const payAsTargetPercentage = expectedRevenue ? (currentMonthlyPay / expectedRevenue) * 100 : 0;

  const handleSaveProgress = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      await saveRosterToMongo({
        activeTab,
        employeeNames,
        employeeRates,
        dayTypes,
        tabs
      }, user);
      hasUnsavedChangesRef.current = false;
      setSaveMessage('Roster saved to MongoDB successfully.');
    } catch (error) {
      setSaveMessage(error.message || 'Failed to save roster.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="roster-page-shell" style={{ background: backgroundColour, color: textColour }}>
      <div className="roster-page-main" style={{ width: '100%' }}>
        <h2 style={{ color: headerColour, margin: '0 0 18px', fontSize: '2rem' }}>Roster Hours Calendar</h2>

        <div className="roster-top-layout">
          <RosterToolbar
            tabs={tabs}
            activeTab={activeTab}
            isMonthlyTab={isMonthlyTab}
            onTabChange={setActiveTab}
            onAddTab={addTab}
            onMonthlyTab={() => setActiveTab(tabs.length)}
            onSave={handleSaveProgress}
            isSaving={isSaving}
            onDownload={handleDownloadExcel}
            onUpload={handleUploadExcel}
            onAddRow={addRow}
            onDeleteWeek={deleteWeek}
            onMoveDays={moveDays}
            week={week}
          />

          <AdSlot compact className="roster-ad-slot" title="Operations Growth" />
        </div>

        {saveMessage && (
          <div
            style={{
              margin: '8px 0 12px',
              color: saveMessage.includes('successfully') ? '#0a7d4a' : '#8b1e1e',
              fontWeight: '600'
            }}
          >
            {saveMessage}
          </div>
        )}

        {!isMonthlyTab && (
          <>
            <div style={{ marginTop: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                {totalsFilterControl}
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  Current Monthly Pay:
                  <output
                    aria-label="Current monthly pay"
                    style={{ minWidth: '90px', padding: '7px 10px', background: 'var(--color-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  >
                    {currentMonthlyPay.toFixed(2)}
                  </output>
                </label>
              </div>
            </div>
            <WeekTable
              week={week}
              currentTab={currentTab}
              employeeNames={employeeNames}
              dayTypes={dayTypes}
              setDayTypes={setDayTypes}
              onNoteChange={handleNoteChange}
              onNameChange={handleNameChange}
              onDeleteRow={deleteRow}
              onCellChange={handleCellChange}
              totalsDateRange={totalsDateRange}
            />
          </>
        )}

        {isMonthlyTab && (
          <MonthlyTable
            monthlyRows={monthlyRows}
            onDownloadMonthlyExcel={handleDownloadMonthlyExcel}
            totalsFilter={totalsFilterControl}
            onRateChange={handleRateChange}
            stats={monthlyStats}
            previousYearSales={previousYearSales}
            expectedGrowth={expectedGrowth}
            expectedRevenue={expectedRevenue}
            onPreviousYearSalesChange={handlePreviousYearSalesChange}
            onExpectedGrowthChange={handleExpectedGrowthChange}
            salesPerStaffMember={salesPerStaffMember}
            efficientGrossPay={efficientGrossPay}
            payEfficiencyDifference={payEfficiencyDifference}
            payAsTargetPercentage={payAsTargetPercentage}
          />
        )}

        <GrandTotals
          grandNormalHours={grandTotals.grandNormalHours}
          grandTotalHours={grandTotals.grandTotalHours}
          grandSundayHours={grandTotals.grandSundayHours}
          grandHolidayHours={grandTotals.grandHolidayHours}
          grandNightHours={grandTotals.grandNightHours}
        />
      </div>
    </div>
  );
}

export default RosterHours;
