const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { RosterSaved, Stats } = require('./db');
const authRoutes = require('./authRoutes');

const app = express();
const port = process.env.PORT || 5001;

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

const getUserEmailFromRequest = (req) => {
  const payload = req.body || {};
  const query = req.query || {};
  const candidate = payload.userEmail || payload.user?.email || query.userEmail || query.email || '';
  return normalizeEmail(candidate);
};

const getShiftHours = (cell = {}) => {
  if (!cell.start || !cell.end) return 0;

  const [startHour, startMinute = 0] = String(cell.start).split(':').map(Number);
  const [endHour, endMinute = 0] = String(cell.end).split(':').map(Number);

  let diff = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  if (diff < 0) diff += 24 * 60;

  return diff / 60;
};

const calculateAverageHours = (payload = {}) => {
  const tabs = Array.isArray(payload.tabs) ? payload.tabs : [];
  let totalHours = 0;
  let rowCount = 0;

  tabs.forEach((tab) => {
    const rows = Array.isArray(tab.rows) ? tab.rows : [];
    rows.forEach((row) => {
      const tableData = Array.isArray(row.tableData) ? row.tableData : [];
      tableData.forEach((cell) => {
        totalHours += getShiftHours(cell);
        rowCount += 1;
      });
    });
  });

  return rowCount ? Number((totalHours / rowCount).toFixed(2)) : 0;
};

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(authRoutes);

app.get('/api/rosters', async (req, res) => {
  try {
    const rosters = await RosterSaved.find().sort({ updatedAt: -1 });
    res.json(rosters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rosters' });
  }
});

app.get('/api/rosters/user', async (req, res) => {
  try {
    const userEmail = getUserEmailFromRequest(req);
    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required.' });
    }

    const roster = await RosterSaved.findOne({ userEmail }).sort({ updatedAt: -1 });
    if (!roster) {
      return res.status(404).json({ error: 'No roster found for this user.' });
    }

    return res.json(roster);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch roster for user.' });
  }
});

app.get('/api/rosters/latest', async (req, res) => {
  try {
    const roster = await RosterSaved.findOne().sort({ updatedAt: -1 });
    if (!roster) {
      return res.status(404).json({ error: 'No roster found' });
    }
    return res.json(roster);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch latest roster' });
  }
});

app.post('/api/rosters/save', async (req, res) => {
  try {
    const payload = req.body || {};
    const userEmail = getUserEmailFromRequest(req) || normalizeEmail(payload.email || payload.user?.email || '');
    const userId = payload.userId || payload.user?._id || payload.user?.id || '';

    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required to save a roster.' });
    }

    const rosterData = {
      userEmail,
      userId,
      name: payload.name || 'default-roster',
      activeTab: payload.activeTab ?? 0,
      employeeNames: payload.employeeNames || [],
      dayTypes: payload.dayTypes || [],
      tabs: payload.tabs || [],
      updatedAt: new Date()
    };

    const roster = await RosterSaved.findOneAndUpdate(
      { userEmail, name: rosterData.name },
      { ...rosterData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const averageHours = calculateAverageHours(payload);
    const stats = await Stats.findOneAndUpdate(
      { userEmail },
      {
        $set: {
          userEmail,
          averageHours,
          totalHours: Number((averageHours * (rosterData.employeeNames.length || 1)).toFixed(2)),
          rosterCount: Array.isArray(rosterData.tabs) && rosterData.tabs.length ? rosterData.tabs.length : 1,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, roster, stats });
  } catch (error) {
    console.error('Failed to save roster:', error);
    return res.status(500).json({ error: 'Failed to save roster' });
  }
});

app.delete('/api/rosters/:id', async (req, res) => {
  try {
    const roster = await RosterSaved.findByIdAndDelete(req.params.id);
    if (!roster) {
      return res.status(404).json({ error: 'Roster not found.' });
    }
    return res.json({ success: true, deleted: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete roster.' });
  }
});

app.get('/api/stats/:userEmail', async (req, res) => {
  try {
    const userEmail = normalizeEmail(req.params.userEmail || '');
    const stats = await Stats.findOne({ userEmail });
    if (!stats) {
      return res.status(404).json({ error: 'No stats found.' });
    }
    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
