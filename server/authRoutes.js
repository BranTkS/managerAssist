const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { User } = require('./db');

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();
const generateResetCode = () => String(Math.floor(100000 + Math.random() * 900000));

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const buildMongoUserFromGoogleProfile = (profile = {}) => ({
  googleId: profile.sub || profile.googleId || '',
  email: normalizeEmail(profile.email),
  name: profile.name || profile.given_name || 'Google User',
  photoUrl: profile.picture || '',
  authProvider: 'google',
  lastLoginAt: new Date()
});

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  photoUrl: user.photoUrl,
  authProvider: user.authProvider
});

router.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with that email already exists.' });
    }

    const user = await User.create({
      email: normalizedEmail,
      name,
      authProvider: 'email',
      password,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return res.status(201).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Unable to register user.' });
  }
});

router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    if (password && user.password && user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    user.lastLoginAt = new Date();
    user.updatedAt = new Date();
    await user.save();

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to sign in.' });
  }
});

router.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found for this email.' });
    }

    const resetCode = generateResetCode();
    user.resetCode = resetCode;
    user.resetCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.updatedAt = new Date();
    await user.save();

    return res.json({
      success: true,
      message: 'Reset code generated. Use it to set a new password.',
      resetCode
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Unable to process password reset.' });
  }
});

router.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body || {};

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, reset code, and a new password are required.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isExpired = !user.resetCodeExpiresAt || new Date(user.resetCodeExpiresAt) < new Date();
    if (isExpired || user.resetCode !== String(code)) {
      return res.status(400).json({ message: 'Invalid or expired reset code.' });
    }

    user.password = newPassword;
    user.resetCode = '';
    user.resetCodeExpiresAt = null;
    user.updatedAt = new Date();
    await user.save();

    return res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Unable to reset password.' });
  }
});

router.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, profile } = req.body || {};

    let payload = profile;

    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Google profile is required.' });
    }

    const userData = buildMongoUserFromGoogleProfile(payload);

    const user = await User.findOneAndUpdate(
      { email: userData.email },
      {
        $set: {
          ...userData,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ message: 'Unable to authenticate with Google.' });
  }
});

module.exports = router;
