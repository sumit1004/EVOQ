import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import PublicNavbar from '../../components/PublicNavbar.jsx';
import '../../styles/nebula.css';

export default function OrganizerRegister() {
  const { registerOrganizer } = useAuth();

  const [formData, setFormData] = useState({
    organizationName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
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
      const msg = err.response?.data?.error?.message || err.message || 'Organizer registration failed';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="nebula-shell">
        <PublicNavbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div className="nebula-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
            <span className="nebula-badge nebula-badge-lime" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              ONBOARDING INITIATED
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.5rem' }}>
              Welcome, Director {formData.username}!
            </h2>
            <p style={{ color: 'var(--nebula-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              A verification link was dispatched to <strong>{formData.email}</strong>. Once confirmed, you can launch tournaments and build your organization.
            </p>
            <Link to="/organizer/login" className="nebula-btn nebula-btn-cyan" style={{ width: '100%' }}>
              Proceed to Organizer Sign In →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nebula-shell">
      <PublicNavbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div className="nebula-card" style={{ maxWidth: '460px', width: '100%', borderTop: '4px solid var(--nebula-cyan)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span className="nebula-badge nebula-badge-cyan" style={{ marginBottom: '0.75rem' }}>
              OPERATIONS &amp; TOURNAMENT HUB
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0.25rem 0' }}>
              Organizer Onboarding
            </h1>
            <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem' }}>
              Host competitive events, orchestrate automated brackets, and earn verified organization credibility.
            </p>
          </div>

          {serverError && (
            <div className="nebula-alert nebula-alert-danger" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="nebula-form-group">
              <label className="nebula-label" htmlFor="organizationName">Esports Organization / Club Name *</label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Cloud9, Team Liquid, VCT Circuit"
                required
                disabled={submitting}
                className="nebula-input"
              />
              {errors.organizationName && <span style={{ color: 'var(--nebula-coral)', fontSize: '0.8rem' }}>{errors.organizationName}</span>}
            </div>

            <div className="nebula-form-group">
              <label className="nebula-label" htmlFor="email">Official Organization Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="director@organization.gg"
                autoComplete="email"
                required
                disabled={submitting}
                className="nebula-input"
              />
              {errors.email && <span style={{ color: 'var(--nebula-coral)', fontSize: '0.8rem' }}>{errors.email}</span>}
            </div>

            <div className="nebula-form-group">
              <label className="nebula-label" htmlFor="username">Organizer / Brand Handle *</label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="ApexLeagueDirector"
                autoComplete="username"
                required
                disabled={submitting}
                className="nebula-input"
              />
              {errors.username && <span style={{ color: 'var(--nebula-coral)', fontSize: '0.8rem' }}>{errors.username}</span>}
            </div>

            <div className="nebula-form-group">
              <label className="nebula-label" htmlFor="password">Password (min. 12 chars, Aa1!) *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  required
                  disabled={submitting}
                  className="nebula-input"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--nebula-text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <span style={{ color: 'var(--nebula-coral)', fontSize: '0.8rem' }}>{errors.password}</span>}
            </div>

            <div className="nebula-form-group">
              <label className="nebula-label" htmlFor="confirmPassword">Confirm Password *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
                autoComplete="new-password"
                required
                disabled={submitting}
                className="nebula-input"
              />
              {errors.confirmPassword && <span style={{ color: 'var(--nebula-coral)', fontSize: '0.8rem' }}>{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              className="nebula-btn nebula-btn-cyan"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={submitting}
            >
              {submitting ? 'Registering Organization...' : 'Register Organizer Account →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--nebula-border)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--nebula-text-secondary)', margin: '0 0 0.5rem 0' }}>
              Already registered?{' '}
              <Link to="/organizer/login" style={{ color: 'var(--nebula-cyan)', fontWeight: 700 }}>
                Sign In
              </Link>
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--nebula-text-muted)' }}>
              Are you a competitive gamer?{' '}
              <Link to="/gamer/register" style={{ color: 'var(--nebula-violet)', fontWeight: 600 }}>
                Create Gamer Account ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

