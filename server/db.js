require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://brantshumba_db_user:3wkMnoSujoxJBlXW@rosters.qtbjadm.mongodb.net/rostersAccounts?appName=rosters';

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 15000,
})
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => console.error('MongoDB connection error:', err));

const rosterSavedSchema = new mongoose.Schema({
  userEmail: { type: String, index: true, lowercase: true, trim: true, default: '' },
  userId: { type: String, default: '' },
  name: { type: String, default: 'default-roster' },
  activeTab: Number,
  employeeNames: [String],
  employeeRates: [{
    rateType: { type: String, default: 'hourly' },
    rate: { type: Number, default: 0 }
  }],
  dayTypes: [String],
  tabs: [{
    startDate: String,
    notes: [String],
    rows: [{
      tableData: [{
        start: String,
        end: String
      }]
    }]
  }],
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'rostersSaved' });

const RosterSaved = mongoose.model('RosterSaved', rosterSavedSchema);
const Roster = RosterSaved;

const userSchema = new mongoose.Schema({
  googleId: { type: String, index: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  authProvider: { type: String, default: 'google' },
  password: { type: String, default: '' },
  resetCode: { type: String, default: '' },
  resetCodeExpiresAt: { type: Date, default: null },
  lastLoginAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

const statsSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true, lowercase: true, trim: true },
  averageHours: { type: Number, default: 0 },
  totalHours: { type: Number, default: 0 },
  rosterCount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'Stats' });

const Stats = mongoose.model('Stats', statsSchema);

module.exports = { mongoose, Roster, RosterSaved, User, Stats };
