import React, { useEffect, useState } from 'react';
import './login.css';
import { buildMongoUserFromGoogleProfile, normalizeEmail } from './loginUtils';
import { getNetworkErrorMessage, readJsonResponse } from '../rosterComponents/frontend/services/apiResponse';
import NoticeModal from '../../components/NoticeModal';

function LoginPage({ onLoginSuccess, onSwitchToRegister, onContinueAsGuest }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showGuestNotice, setShowGuestNotice] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizeEmail(email),
          password
        })
      });

      const data = await readJsonResponse(response, 'Login failed because the server returned an invalid response.');

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      setSuccess('Login successful.');
      if (onLoginSuccess) onLoginSuccess(data.user || data);
    } catch (err) {
      setError(getNetworkErrorMessage(err, 'Could not log in.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';

    if (!window.google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              setLoading(true);
              try {
                const googleResponse = await fetch('/api/auth/google', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ credential: response.credential })
                });

                const data = await readJsonResponse(googleResponse, 'Google login failed because the server returned an invalid response.');

                if (!googleResponse.ok) {
                  throw new Error(data.message || 'Google authentication failed.');
                }

                setSuccess('Google login successful.');
                if (onLoginSuccess) onLoginSuccess(data.user);
              } catch (err) {
                setError(getNetworkErrorMessage(err, 'Google login failed.'));
              } finally {
                setLoading(false);
              }
            }
          });

          const googleButton = document.getElementById('google-signin-button');
          if (googleButton) {
            window.google.accounts.id.renderButton(googleButton, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'continue_with'
            });
          }
        }
      };
      document.body.appendChild(script);
      return () => script.remove();
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        setLoading(true);
        try {
          const googleResponse = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
          });

          const data = await readJsonResponse(googleResponse, 'Google login failed because the server returned an invalid response.');

          if (!googleResponse.ok) {
            throw new Error(data.message || 'Google authentication failed.');
          }

          setSuccess('Google login successful.');
          if (onLoginSuccess) onLoginSuccess(data.user);
        } catch (err) {
          setError(getNetworkErrorMessage(err, 'Google login failed.'));
        } finally {
          setLoading(false);
        }
      }
    });

    const googleButton = document.getElementById('google-signin-button');
    if (googleButton) {
      window.google.accounts.id.renderButton(googleButton, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with'
      });
    }
  }, [onLoginSuccess]);

  const handleGoogleLogin = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  const handleForgotPasswordRequest = async () => {
    setError('');
    setSuccess('');

    if (!resetEmail) {
      setError('Please enter your email to request a reset code.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizeEmail(resetEmail) })
      });

      const data = await readJsonResponse(response, 'Password reset request failed because the server returned an invalid response.');

      if (!response.ok) {
        throw new Error(data.message || 'Could not send reset code.');
      }

      setSuccess(`Reset code sent. Use code: ${data.resetCode}`);
      setEmail(resetEmail);
    } catch (err) {
      setError(getNetworkErrorMessage(err, 'Unable to request a reset code.'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!resetEmail || !resetCode || !newPassword) {
      setError('Please complete the reset form.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizeEmail(resetEmail),
          code: resetCode,
          newPassword
        })
      });

      const data = await readJsonResponse(response, 'Password reset failed because the server returned an invalid response.');

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed.');
      }

      setSuccess('Password reset successful. You can now log in.');
      setShowForgotPassword(false);
      setPassword('');
      setNewPassword('');
      setResetCode('');
    } catch (err) {
      setError(getNetworkErrorMessage(err, 'Password reset failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="login-eyebrow">Welcome back</span>
        <h1 className="login-title">Sign in</h1>
        <p className="login-subtitle">Access your roster, schedules, and team planning tools.</p>

        <button
          type="button"
          id="google-signin-button"
          onClick={handleGoogleLogin}
          className="login-button login-google-button"
          style={{ opacity: loading ? 0.7 : 1 }}
          disabled={loading}
        >
          <span aria-label="Google icon">G</span>
          Continue with Google
        </button>

        <div className="login-divider">
          <span className="login-divider-line" />
          <span>or</span>
          <span className="login-divider-line" />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="login-input"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="login-input"
          />

          <button
            type="button"
            className="login-link-button"
            onClick={() => {
              setShowForgotPassword((value) => !value);
              setError('');
              setSuccess('');
            }}
          >
            Forgot password?
          </button>

          <button
            type="submit"
            className="login-button login-primary-button"
            style={{ opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Log in'}
          </button>
        </form>

        {showForgotPassword && (
          <form onSubmit={handlePasswordReset} className="login-reset-form">
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Email address"
              className="login-input"
            />

            <button
              type="button"
              className="login-button login-secondary-button"
              onClick={handleForgotPasswordRequest}
              disabled={loading}
            >
              Send reset code
            </button>

            <input
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              placeholder="Reset code"
              className="login-input"
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="login-input"
            />

            <button
              type="submit"
              className="login-button login-primary-button"
              disabled={loading}
            >
              Reset password
            </button>
          </form>
        )}

        <button
          type="button"
          className="login-button login-link-button login-guest-button"
          onClick={() => {
            setShowGuestNotice(true);
          }}
          disabled={loading}
        >
          Continue as guest
        </button>

        {showGuestNotice && (
          <NoticeModal
            message="Heads up: as a guest you can't save progress to cloud, so save to Excel regularly."
            onCancel={() => setShowGuestNotice(false)}
            onConfirm={() => {
              setShowGuestNotice(false);
              if (onContinueAsGuest) onContinueAsGuest();
            }}
          />
        )}

        <button
          type="button"
          className="login-link-button login-register-link"
          onClick={() => {
            if (onSwitchToRegister) onSwitchToRegister();
          }}
          disabled={loading}
        >
          Not a member? Register
        </button>

        <div className={error ? 'login-error' : 'login-success'}>{error || success}</div>

      </div>
    </div>
  );
}

export default LoginPage;
