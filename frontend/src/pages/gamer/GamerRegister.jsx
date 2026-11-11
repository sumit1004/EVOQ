import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import { Input } from '../../components/ui/FormControls.jsx';
import { PrimaryButton } from '../../components/ui/Buttons.jsx';
import { Icon } from '../../components/Icons.jsx';

export default function GamerRegister() {
  const { registerGamer } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Gamer username is required';
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      newErrors.username = 'Gamer username must be between 3 and 30 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Alphanumeric, underscores, and hyphens only';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Must contain an uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Must contain a lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Must contain a number';
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = 'Must contain a special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      const res = await registerGamer({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });
      setSuccessData(res);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Registration failed. Please check your credentials.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <AuthLayout
        badge="REGISTRATION CONFIRMED"
        badgeType="lime"
        title="Check Your Inbox"
        subtitle="We sent a verification link to confirm your competitive passport."
        quote="YOUR COMPETITIVE JOURNEY BEGINS HERE."
        quoteAuthor="EVOQ SYSTEM IDENTITY"
        heroImage="/images/two2.png"
      >
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
            Account Created
          </h3>
          <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '24px' }}>
            A confirmation email was dispatched to{' '}
            <strong style={{ color: 'var(--evoq-text-primary)' }}>{formData.email}</strong>.
            Please verify your email address to unlock official match operations.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/gamer/login" className="evoq-btn evoq-btn-primary evoq-btn-lg" style={{ justifyContent: 'center' }}>
              <span>Proceed to Sign In</span>
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      badge="GAMER PASSPORT"
      badgeType="lime"
      title="Create Gamer Account"
      subtitle="Register your unique handle to enter tournaments, join teams, and build verified stats."
      quote="DOMINATE THE ARENA. VERIFY YOUR LEGACY."
      quoteAuthor="EVOQ PRO COMPETITIVE NETWORK"
      heroImage="/images/two2.png"
    >
      {serverError && (
        <div className="evoq-alert evoq-alert-danger" role="alert">
          <Icon name="x" size={16} />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="player@example.com"
          autoComplete="email"
          required
          disabled={submitting}
          error={errors.email}
          icon="user"
        />

        <Input
          label="Gamer Username"
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="e.g. ShadowStrike_99"
          autoComplete="username"
          required
          disabled={submitting}
          error={errors.username}
          helperText="Unique identifier shown across tournaments and teams (3-30 chars)."
        />

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Min 12 chars, upper, lower, number, special"
          autoComplete="new-password"
          required
          disabled={submitting}
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
          disabled={submitting}
          error={errors.confirmPassword}
        />

        <PrimaryButton
          type="submit"
          disabled={submitting}
          loading={submitting}
          fullWidth
          iconRight="arrow-right"
          size="lg"
          style={{ marginTop: '8px' }}
        >
          {submitting ? 'Creating Passport...' : 'Create Gamer Account'}
        </PrimaryButton>
      </form>

      <div
        style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--evoq-border)',
        }}
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--evoq-text-secondary)', margin: '0 0 10px 0' }}>
          Already registered?{' '}
          <Link to="/gamer/login" style={{ color: 'var(--evoq-lime)', fontWeight: 700 }}>
            Sign In to Gamer Arena
          </Link>
        </p>
        <div style={{ fontSize: '0.82rem', color: 'var(--evoq-text-muted)' }}>
          Looking to host tournaments?{' '}
          <Link to="/organizer/register" style={{ color: 'var(--evoq-text-primary)', fontWeight: 600 }}>
            Register as Organizer ↗
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
