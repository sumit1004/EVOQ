import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import AuthLayout from '../layouts/AuthLayout.jsx';
import { Input } from '../components/ui/FormControls.jsx';
import { PrimaryButton } from '../components/ui/Buttons.jsx';
import { Icon } from '../components/Icons.jsx';

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
      setError(
        err.message ||
        'Password reset failed. The token may be expired or already used.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="PASSWORD RESET"
      badgeType="lime"
      title="Create New Password"
      subtitle="Enter a new secure password meeting EVOQ security policy."
      quote="RESTORE ACCESS. RE-ENTER THE COMPETITION."
      quoteAuthor="EVOQ PRO NETWORK"
      heroImage="/images/two2.png"
    >
      {success ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--evoq-lime-subtle)',
              border: '1px solid var(--evoq-border-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: 'var(--evoq-lime)',
            }}
          >
            <Icon name="check" size={32} />
          </div>

          <h3 className="evoq-section-title" style={{ marginBottom: '10px' }}>
            Password Updated
          </h3>
          <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '24px' }}>
            Your credentials have been securely updated and previous sessions invalidated. You can now sign in with your new credentials.
          </p>

          <Link to="/gamer/login" className="evoq-btn evoq-btn-primary evoq-btn-lg" style={{ justifyContent: 'center' }}>
            <span>Sign In Now</span>
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="evoq-alert evoq-alert-danger" role="alert">
              <Icon name="x" size={16} />
              <span>{error}</span>
            </div>
          )}

          {!paramToken && (
            <Input
              id="token"
              name="token"
              label="Reset Security Token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste security token from email"
              required
              disabled={loading}
              helperText="The alphanumeric token included in your reset email."
            />
          )}

          <Input
            id="newPassword"
            name="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 12 chars, upper, lower, number, special"
            required
            disabled={loading}
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
            disabled={loading}
          />

          <PrimaryButton
            type="submit"
            disabled={loading}
            loading={loading}
            fullWidth
            iconRight="arrow-right"
            size="lg"
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Updating Credentials...' : 'Set New Password'}
          </PrimaryButton>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/gamer/login" className="evoq-link-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <Icon name="arrow-left" size={14} />
              <span>Cancel and Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
