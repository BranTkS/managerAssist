import { buildMongoUserFromGoogleProfile, normalizeEmail } from './loginUtils';

describe('login utilities', () => {
  it('normalizes email addresses for Mongo user records', () => {
    expect(normalizeEmail('  ALICE@example.com  ')).toBe('alice@example.com');
  });

  it('creates a Mongo-ready user payload from a Google profile', () => {
    const user = buildMongoUserFromGoogleProfile({
      sub: 'google-123',
      email: 'Alice@example.com',
      name: 'Alice Smith',
      picture: 'https://example.com/avatar.jpg'
    });

    expect(user.email).toBe('alice@example.com');
    expect(user.googleId).toBe('google-123');
    expect(user.authProvider).toBe('google');
    expect(user.name).toBe('Alice Smith');
    expect(user.photoUrl).toBe('https://example.com/avatar.jpg');
  });
});
