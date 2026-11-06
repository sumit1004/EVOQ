import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import FormInput from '../components/FormInput.jsx';
import '../styles/auth.css';

export default function ResetPassword() {
  const { token: paramToken } = useParams();

  const [token, setToken] = useState(paramToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Reset token is required');
      return;
    }

    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Password reset failed. The token may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            EVOQ
          </Link>
          <h2 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>Set New Password</h2>
          <p className="auth-subtitle">Create a secure new password for your account</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div className="auth-alert success" role="alert">
              Your password has been successfully reset!
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              All existing sessions have been terminated. Please log in with your new password.
            </p>
            <Link to="/login" className="btn-primary">
              Log In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {error && (
              <div className="auth-alert error" role="alert">
                {error}
              </div>
            )}

            {!paramToken && (
              <FormInput
                id="token"
                label="Reset Token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token from email"
                required
                disabled={loading}
              />
            )}

            <FormInput
              id="newPassword"
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              disabled={loading}
            />

            <FormInput
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              disabled={loading}
            />

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating password...' : 'Update Password'}
            </button>

            <div className="auth-footer">
              <Link to="/login">Back to Sign In</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

