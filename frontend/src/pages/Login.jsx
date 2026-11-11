import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import AuthLayout from '../layouts/AuthLayout.jsx';
import { Input } from '../components/ui/FormControls.jsx';
import { PrimaryButton } from '../components/ui/Buttons.jsx';
import { Icon } from '../components/Icons.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

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
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badge="EVOQ ACCESS"
      badgeType="lime"
      title="Platform Sign In"
      subtitle="Access your competitive profile, tournaments, and team operations."
      quote="DOMINATE THE ARENA. VERIFY YOUR LEGACY."
      quoteAuthor="EVOQ PRO NETWORK"
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

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label htmlFor="password" className="evoq-label" style={{ margin: 0 }}>
              Password <span className="evoq-lime">*</span>
            </label>
            <Link
              to="/forgot-password"
              style={{ fontSize: '0.8rem', color: 'var(--evoq-lime)', textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••••••"
            autoComplete="current-password"
            required
            disabled={submitting}
            error={errors.password}
          />
        </div>

        <PrimaryButton
          type="submit"
          disabled={submitting}
          loading={submitting}
          fullWidth
          iconRight="arrow-right"
          size="lg"
          style={{ marginTop: '8px' }}
        >
          {submitting ? 'Signing in...' : 'Sign In'}
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
        <p style={{ fontSize: '0.9rem', color: 'var(--evoq-text-secondary)', margin: '0' }}>
          Don't have an account?{' '}
          <Link to="/gamer/register" style={{ color: 'var(--evoq-lime)', fontWeight: 700 }}>
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
