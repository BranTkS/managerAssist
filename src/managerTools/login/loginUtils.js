export const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

export const buildMongoUserFromGoogleProfile = (profile = {}) => ({
  googleId: profile.sub || profile.googleId || '',
  email: normalizeEmail(profile.email),
  name: profile.name || profile.given_name || 'Google User',
  photoUrl: profile.picture || '',
  authProvider: 'google',
  lastLoginAt: new Date().toISOString()
});
