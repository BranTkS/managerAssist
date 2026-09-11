import { readJsonResponse } from './apiResponse';

const ROSTER_STORAGE_KEY = 'managerassist.roster.state';

export const serializeRosterState = (state) => ({
  name: 'default-roster',
  activeTab: state.activeTab ?? 0,
  employeeNames: state.employeeNames ?? [],
  employeeRates: state.employeeRates ?? [],
  dayTypes: state.dayTypes ?? [],
  tabs: (state.tabs ?? []).map((tab) => ({
    startDate: tab.startDate instanceof Date ? tab.startDate.toISOString() : tab.startDate,
    notes: tab.notes ?? Array(7).fill(''),
    rows: (tab.rows ?? []).map((row) => ({
      tableData: (row.tableData ?? Array(7).fill({ start: '', end: '' })).map((cell) => ({
        start: cell?.start ?? '',
        end: cell?.end ?? ''
      }))
    }))
  }))
});

export const saveRosterToLocalStorage = (state) => {
  try {
    const payload = serializeRosterState(state);
    localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(payload));
    return payload;
  } catch (error) {
    console.warn('Failed to save roster to local storage:', error);
    return null;
  }
};

export const loadRosterFromLocalStorage = () => {
  try {
    const raw = localStorage.getItem(ROSTER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tabs)) return null;

    return {
      activeTab: parsed.activeTab ?? 0,
      employeeNames: Array.isArray(parsed.employeeNames) ? parsed.employeeNames : [''],
      employeeRates: Array.isArray(parsed.employeeRates) ? parsed.employeeRates : [],
      dayTypes: Array.isArray(parsed.dayTypes) ? parsed.dayTypes : Array(7).fill('normal day'),
      tabs: parsed.tabs.map((tab) => ({
        startDate: tab.startDate ? new Date(tab.startDate) : new Date(),
        notes: Array.isArray(tab.notes) ? tab.notes : Array(7).fill(''),
        rows: (tab.rows ?? []).map((row) => ({
          tableData: (row.tableData ?? Array(7).fill({ start: '', end: '' })).map((cell) => ({
            start: cell?.start ?? '',
            end: cell?.end ?? ''
          }))
        }))
      }))
    };
  } catch (error) {
    console.warn('Failed to load roster from local storage:', error);
    return null;
  }
};

export const loadRosterFromMongo = async (user) => {
  if (!user?.email) return null;

  const userEmail = String(user.email).trim().toLowerCase();
  const response = await fetch(`/api/rosters/user?userEmail=${encodeURIComponent(userEmail)}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorData = await readJsonResponse(response, 'Unable to load roster from the server.')
      .catch(error => ({ message: error.message }));
    throw new Error(errorData.error || errorData.message || 'Unable to load roster');
  }

  const roster = await readJsonResponse(response, 'Unable to read the roster response.');
  if (!roster || !Array.isArray(roster.tabs)) {
    return null;
  }

  return {
    activeTab: roster.activeTab ?? 0,
    employeeNames: Array.isArray(roster.employeeNames) ? roster.employeeNames : [''],
    employeeRates: Array.isArray(roster.employeeRates) ? roster.employeeRates : [],
    dayTypes: Array.isArray(roster.dayTypes) ? roster.dayTypes : Array(7).fill('normal day'),
    tabs: roster.tabs.map((tab) => ({
      startDate: tab.startDate ? new Date(tab.startDate) : new Date(),
      notes: Array.isArray(tab.notes) ? tab.notes : Array(7).fill(''),
      rows: (tab.rows ?? []).map((row) => ({
        tableData: (row.tableData ?? Array(7).fill({ start: '', end: '' })).map((cell) => ({
          start: cell?.start ?? '',
          end: cell?.end ?? ''
        }))
      }))
    }))
  };
};

export const saveRosterToMongo = async (state, user) => {
  const payload = serializeRosterState(state);

  if (user?.email) {
    payload.userEmail = String(user.email).trim().toLowerCase();
  }
  if (user?._id || user?.id) {
    payload.userId = user._id || user.id;
  }

  const response = await fetch('/api/rosters/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await readJsonResponse(response, 'Unable to save roster to the server.')
      .catch(error => ({ message: error.message }));
    throw new Error(errorData.error || errorData.message || 'Unable to save roster');
  }

  return readJsonResponse(response, 'Unable to read the save response.');
};
