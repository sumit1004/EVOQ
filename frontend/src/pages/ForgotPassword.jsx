import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import FormInput from '../components/FormInput.jsx';
import '../styles/auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to process request');
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
          <h2 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>Reset Password</h2>
          <p className="auth-subtitle">Enter your email to receive recovery instructions</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div className="auth-alert success" role="alert">
              If an account with that email exists, we have dispatched a password reset link.
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Please check your inbox and follow the link to complete your password update.
            </p>
            <Link to="/login" className="btn-primary">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {error && (
              <div className="auth-alert error" role="alert">
                {error}
              </div>
            )}

            <FormInput
              id="email"
              label="Account Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="player@example.com"
              required
              disabled={loading}
            />

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
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

