import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import AuthLayout from '../layouts/AuthLayout.jsx';
import { Input } from '../components/ui/FormControls.jsx';
import { PrimaryButton } from '../components/ui/Buttons.jsx';
import { Icon } from '../components/Icons.jsx';

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
      setError(err.message || 'Unable to process recovery request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="SECURITY RECOVERY"
      badgeType="lime"
      title="Reset Your Password"
      subtitle="Enter your verified account email to receive cryptographic password reset credentials."
      quote="ACCOUNT SECURITY IS THE CORNERSTONE OF FAIR PLAY."
      quoteAuthor="EVOQ SECURITY INTEGRITY"
      heroImage="/images/two2.png"
    >
      {submitted ? (
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
            Recovery Dispatched
          </h3>
          <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '24px' }}>
            If an account matches <strong style={{ color: 'var(--evoq-text-primary)' }}>{email}</strong>, we have sent a secure recovery link. Follow the instructions to choose a new password.
          </p>

          <Link to="/gamer/login" className="evoq-btn evoq-btn-primary evoq-btn-lg" style={{ justifyContent: 'center' }}>
            <span>Return to Sign In</span>
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

          <Input
            id="email"
            name="email"
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
            icon="user"
            helperText="Enter the email address registered with your EVOQ gamer or organizer account."
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
            {loading ? 'Dispatching...' : 'Send Password Reset Link'}
          </PrimaryButton>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/gamer/login" className="evoq-link-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <Icon name="arrow-left" size={14} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
