import {
  serializeRosterState,
  saveRosterToLocalStorage,
  loadRosterFromLocalStorage
} from './rosterPersistence';

describe('serializeRosterState', () => {
  it('keeps the current roster data, names and hours in a Mongo-friendly payload', () => {
    const rosterState = {
      activeTab: 1,
      employeeNames: ['Alice', 'Bob'],
      dayTypes: ['normal day', 'holiday'],
      tabs: [
        {
          startDate: new Date('2026-09-09T00:00:00.000Z'),
          notes: ['note 1', 'note 2', 'note 3', 'note 4', 'note 5', 'note 6', 'note 7'],
          rows: [
            {
              tableData: [
                { start: '08:00', end: '16:00' },
                { start: '09:00', end: '17:00' },
                { start: '', end: '' },
                { start: '', end: '' },
                { start: '', end: '' },
                { start: '', end: '' },
                { start: '', end: '' }
              ]
            }
          ]
        }
      ]
    };

    const payload = serializeRosterState(rosterState);

    expect(payload.employeeNames).toEqual(['Alice', 'Bob']);
    expect(payload.dayTypes).toEqual(['normal day', 'holiday']);
    expect(payload.tabs[0].startDate).toBe('2026-09-09T00:00:00.000Z');
    expect(payload.tabs[0].rows[0].tableData[0].start).toBe('08:00');
    expect(payload.tabs[0].rows[0].tableData[0].end).toBe('16:00');
  });
});

describe('local roster persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves the roster to local storage and restores it on refresh', () => {
    const rosterState = {
      activeTab: 2,
      employeeNames: ['Sam', 'Lee'],
      dayTypes: ['normal day', 'holiday'],
      tabs: [
        {
          startDate: new Date('2026-09-09T00:00:00.000Z'),
          notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
          rows: [
            {
              tableData: [
                { start: '08:00', end: '16:00' },
                { start: '09:00', end: '17:00' },
                { start: '', end: '' },
                { start: '', end: '' },
                { start: '', end: '' },
                { start: '', end: '' },
                { start: '', end: '' }
              ]
            }
          ]
        }
      ]
    };

    saveRosterToLocalStorage(rosterState);
    const restored = loadRosterFromLocalStorage();

    expect(restored.activeTab).toBe(2);
    expect(restored.employeeNames).toEqual(['Sam', 'Lee']);
    expect(restored.tabs[0].startDate).toBeInstanceOf(Date);
    expect(restored.tabs[0].startDate.toISOString()).toBe('2026-09-09T00:00:00.000Z');
    expect(restored.tabs[0].rows[0].tableData[0].start).toBe('08:00');
  });
});
