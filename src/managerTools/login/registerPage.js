import React, { useEffect, useState } from 'react';
import './login.css';
import { buildMongoUserFromGoogleProfile, normalizeEmail } from './loginUtils';
import { getNetworkErrorMessage, readJsonResponse } from '../rosterComponents/frontend/services/apiResponse';
import NoticeModal from '../../components/NoticeModal';

function RegisterPage({ onRegisterSuccess, onSwitchToLogin, onContinueAsGuest }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGuestNotice, setShowGuestNotice] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Please complete all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: normalizeEmail(email),
          password
        })
      });

      const data = await readJsonResponse(response, 'Registration failed because the server returned an invalid response.');

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setSuccess('Registration successful.');
      if (onRegisterSuccess) onRegisterSuccess(data.user || data);
    } catch (err) {
      setError(getNetworkErrorMessage(err, 'Unable to register user.'));
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

                const data = await readJsonResponse(googleResponse, 'Google registration failed because the server returned an invalid response.');

                if (!googleResponse.ok) {
                  throw new Error(data.message || 'Google registration failed.');
                }

                setSuccess('Google registration successful.');
                if (onRegisterSuccess) onRegisterSuccess(data.user);
              } catch (err) {
                setError(getNetworkErrorMessage(err, 'Google registration failed.'));
              } finally {
                setLoading(false);
              }
            }
          });

          const googleButton = document.getElementById('google-register-button');
          if (googleButton) {
            window.google.accounts.id.renderButton(googleButton, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signup_with'
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

          const data = await readJsonResponse(googleResponse, 'Google registration failed because the server returned an invalid response.');

          if (!googleResponse.ok) {
            throw new Error(data.message || 'Google registration failed.');
          }

          setSuccess('Google registration successful.');
          if (onRegisterSuccess) onRegisterSuccess(data.user);
        } catch (err) {
          setError(getNetworkErrorMessage(err, 'Google registration failed.'));
        } finally {
          setLoading(false);
        }
      }
    });

    const googleButton = document.getElementById('google-register-button');
    if (googleButton) {
      window.google.accounts.id.renderButton(googleButton, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signup_with'
      });
    }
  }, [onRegisterSuccess]);

  const handleGoogleRegister = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="login-eyebrow">Create account</span>
        <h1 className="login-title">Register</h1>
        <p className="login-subtitle">Set up your workspace access and start managing your team.</p>

        <button
          type="button"
          id="google-register-button"
          onClick={handleGoogleRegister}
          className="login-button login-google-button"
          style={{ opacity: loading ? 0.7 : 1 }}
          disabled={loading}
        >
          <span aria-label="Google icon">G</span>
          Register with Gmail
        </button>

        <div className="login-divider">
          <span className="login-divider-line" />
          <span>or</span>
          <span className="login-divider-line" />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="login-input"
          />

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
            type="submit"
            className="login-button login-primary-button"
            style={{ opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

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
            if (onSwitchToLogin) onSwitchToLogin();
          }}
          disabled={loading}
        >
          Already a member? Login
        </button>

        <div className={error ? 'login-error' : 'login-success'}>{error || success}</div>

        <div className="login-footer">Already have an account? Use the login button in the header.</div>
      </div>
    </div>
  );
}

export default RegisterPage;
