import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import AuthLayout from '../layouts/AuthLayout.jsx';
import { Input } from '../components/ui/FormControls.jsx';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons.jsx';
import { Icon } from '../components/Icons.jsx';

export default function VerifyEmail() {
  const { token: paramToken } = useParams();

  const [token, setToken] = useState(paramToken || '');
  const [resendEmail, setResendEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendNotice, setResendNotice] = useState('');
  const [resending, setResending] = useState(false);

  const executeVerification = useCallback(async (tokenToVerify) => {
    if (!tokenToVerify) return;
    try {
      setVerifying(true);
      setError('');
      await authService.verifyEmail(tokenToVerify);
      setVerified(true);
    } catch (err) {
      setError(
        err.message || 'Verification failed. Token may be expired or already utilized.'
      );
    } finally {
      setVerifying(false);
    }
  }, []);

  useEffect(() => {
    if (paramToken) {
      executeVerification(paramToken);
    }
  }, [paramToken, executeVerification]);

  const handleSubmit = (e) => {
    e.preventDefault();
    executeVerification(token);
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    try {
      setResending(true);
      setError('');
      await authService.resendVerification(resendEmail);
      setResendNotice('If an account is pending verification, a new confirmation token was dispatched.');
    } catch (err) {
      setError(err.message || 'Could not send verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      badge="PASSPORT ACTIVATION"
      badgeType="lime"
      title="Verify Account Email"
      subtitle="Confirm your identity to unlock sanctioned tournament rosters, bracket seedings, and match rooms."
      quote="IDENTITY VERIFICATION GUARANTEES FAIR COMPETITION."
      quoteAuthor="EVOQ ANTI-CHEAT PROTOCOL"
      heroImage="/images/two2.png"
    >
      {verifying && (
        <div style={{ textAlign: 'center', padding: '36px 0' }}>
          <span className="evoq-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
          <p style={{ color: 'var(--evoq-text-secondary)', marginTop: '16px', fontSize: '0.92rem' }}>
            Authenticating cryptographic token with EVOQ Network...
          </p>
        </div>
      )}

      {verified ? (
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
            Identity Verified
          </h3>
          <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '24px' }}>
            Your account is now officially activated. You have full access to tournament registrations, team creation, and verified competitive achievements.
          </p>

          <Link to="/gamer/login" className="evoq-btn evoq-btn-primary evoq-btn-lg" style={{ justifyContent: 'center' }}>
            <span>Sign In to EVOQ</span>
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      ) : (
        !verifying && (
          <div>
            {error && (
              <div className="evoq-alert evoq-alert-danger" role="alert">
                <Icon name="x" size={16} />
                <span>{error}</span>
              </div>
            )}

            {resendNotice && (
              <div className="evoq-alert evoq-alert-success" role="alert">
                <Icon name="check" size={16} />
                <span>{resendNotice}</span>
              </div>
            )}

            {!paramToken && (
              <form onSubmit={handleSubmit} noValidate style={{ marginBottom: '28px' }}>
                <Input
                  id="token"
                  name="token"
                  label="Verification Token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste verification token here"
                  required
                  icon="shield"
                  helperText="Found inside your confirmation email link."
                />

                <PrimaryButton
                  type="submit"
                  fullWidth
                  size="lg"
                  iconRight="arrow-right"
                  disabled={!token.trim()}
                >
                  Verify Passport
                </PrimaryButton>
              </form>
            )}

            <div
              style={{
                paddingTop: '20px',
                borderTop: '1px solid var(--evoq-border)',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--evoq-text-primary)' }}>
                Need a new verification link?
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--evoq-text-muted)', margin: '0 0 14px 0' }}>
                Enter your registered email address to dispatch a fresh activation token.
              </p>

              <form onSubmit={handleResend} noValidate>
                <Input
                  id="resendEmail"
                  name="resendEmail"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="player@example.com"
                  required
                  disabled={resending}
                />
                <SecondaryButton
                  type="submit"
                  fullWidth
                  disabled={resending || !resendEmail.trim()}
                  loading={resending}
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </SecondaryButton>
              </form>
            </div>
          </div>
        )
      )}
    </AuthLayout>
  );
}
