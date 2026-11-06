import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import FormInput from '../components/FormInput.jsx';
import '../styles/auth.css';

export default function VerifyEmail() {
  const { token: paramToken } = useParams();

  const [token, setToken] = useState(paramToken || '');
  const [resendEmail, setResendEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendNotice, setResendNotice] = useState('');

  const executeVerification = useCallback(async (tokenToVerify) => {
    if (!tokenToVerify) return;
    try {
      setVerifying(true);
      setError('');
      await authService.verifyEmail(tokenToVerify);
      setVerified(true);
    } catch (err) {
      setError(err.message || 'Verification failed. Token may be expired or already used.');
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
      await authService.resendVerification(resendEmail);
      setResendNotice('If your account is pending verification, a new link has been dispatched.');
    } catch (err) {
      setError(err.message || 'Could not send verification email.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            EVOQ
          </Link>
          <h2 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>Email Verification</h2>
          <p className="auth-subtitle">Confirm your competitive identity</p>
        </div>

        {verifying && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
            <p style={{ color: 'var(--muted)' }}>Verifying token...</p>
          </div>
        )}

        {verified ? (
          <div style={{ textAlign: 'center' }}>
            <div className="auth-alert success" role="alert">
              Your email has been successfully verified!
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your account is fully activated. You can now access all competitive features.
            </p>
            <Link to="/login" className="btn-primary">
              Sign In to EVOQ
            </Link>
          </div>
        ) : (
          !verifying && (
            <div>
              {error && (
                <div className="auth-alert error" role="alert">
                  {error}
                </div>
              )}

              {resendNotice && (
                <div className="auth-alert success" role="alert">
                  {resendNotice}
                </div>
              )}

              {!paramToken && (
                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                  <FormInput
                    id="token"
                    label="Verification Token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your verification token"
                    required
                  />

                  <button type="submit" className="btn-primary">
                    Verify Account
                  </button>
                </form>
              )}

              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                  Need a new verification link?
                </p>
                <form onSubmit={handleResend} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Your account email"
                    className="form-input"
                    style={{ flex: 1 }}
                    required
                  />
                  <button type="submit" className="btn-secondary">
                    Resend
                  </button>
                </form>
              </div>

              <div className="auth-footer">
                <Link to="/login">Return to Sign In</Link>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

