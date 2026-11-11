import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import { Input } from '../../components/ui/FormControls.jsx';
import { PrimaryButton } from '../../components/ui/Buttons.jsx';
import { Icon } from '../../components/Icons.jsx';

export default function OrganizerRegister() {
  const { registerOrganizer } = useAuth();

  const [formData, setFormData] = useState({
    organizationName: '',
    username: '',
    email: '',
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

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization / Club name is required';
    } else if (formData.organizationName.trim().length < 2) {
      newErrors.organizationName = 'Organization name must be at least 2 characters';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Organizer identifier is required';
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      newErrors.username = 'Identifier must be between 3 and 30 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Alphanumeric, underscores, and hyphens only';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Official organization email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 12) {
      newErrors.password = 'Must be at least 12 characters';
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
      const res = await registerOrganizer({
        organizationName: formData.organizationName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      setSuccessData(res);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Organizer registration failed. Please verify submitted details.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <AuthLayout
        badge="ORGANIZATION REGISTERED"
        badgeType="cyan"
        title="Verify Staff Credentials"
        subtitle="A verification link was dispatched to your organization email."
        quote="EMPOWERING ESPORTS COMMUNITIES AT SCALE."
        quoteAuthor="EVOQ OPERATIONS NETWORK"
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
            Organization Enrolled
          </h3>
          <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '24px' }}>
            We sent a confirmation link to{' '}
            <strong style={{ color: 'var(--evoq-text-primary)' }}>{formData.email}</strong>.
            Confirm your address to start hosting official esports tournaments and brackets.
          </p>

          <Link to="/organizer/login" className="evoq-btn evoq-btn-primary evoq-btn-lg" style={{ justifyContent: 'center' }}>
            <span>Sign In to Operations Hub</span>
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      badge="ORGANIZER NETWORK"
      badgeType="cyan"
      title="Register Organization"
      subtitle="Create an official organizer account to host events, run brackets, and approve verified results."
      quote="PROFESSIONAL BRACKETS. REPUTABLE COMPETITIONS."
      quoteAuthor="EVOQ TOURNAMENT OPERATIONS"
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
          label="Organization / Club Name"
          id="organizationName"
          name="organizationName"
          type="text"
          value={formData.organizationName}
          onChange={handleChange}
          placeholder="e.g. Apex Esports League"
          required
          disabled={submitting}
          error={errors.organizationName}
          helperText="Public entity name displayed on official tournament badges."
        />

        <Input
          label="Director / Staff Identifier"
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="e.g. director_john"
          autoComplete="username"
          required
          disabled={submitting}
          error={errors.username}
        />

        <Input
          label="Official Email Address"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="director@organization.gg"
          autoComplete="email"
          required
          disabled={submitting}
          error={errors.email}
          icon="shield"
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
          {submitting ? 'Registering Organization...' : 'Enlist as Tournament Organizer'}
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
          Already an organizer?{' '}
          <Link to="/organizer/login" style={{ color: 'var(--evoq-lime)', fontWeight: 700 }}>
            Sign In to Operations Hub
          </Link>
        </p>
        <div style={{ fontSize: '0.82rem', color: 'var(--evoq-text-muted)' }}>
          Player looking to compete?{' '}
          <Link to="/gamer/register" style={{ color: 'var(--evoq-text-primary)', fontWeight: 600 }}>
            Create Gamer Account ↗
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
