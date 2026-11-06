import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import PublicNavbar from '../../components/PublicNavbar.jsx';
import '../../styles/nebula.css';

export default function GamerRegister() {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
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
      newErrors.username = 'Gamer username must be 3-30 characters';
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
      const res = await register(
        formData.email,
        formData.username,
        formData.password
      );
      setSuccessData(res);
    } catch (err) {
      setServerError(err.message || 'Registration failed');
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
              ✔ ACCOUNT CREATED
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.5rem' }}>
              Welcome, {formData.username}!
            </h2>
            <p style={{ color: 'var(--nebula-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              We've dispatched a verification link to <strong>{formData.email}</strong>. Activate your account to start competing.
            </p>
            <Link to="/gamer/login" className="nebula-btn nebula-btn-primary" style={{ width: '100%' }}>
              Proceed to Gamer Sign In →
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
        <div className="nebula-card" style={{ maxWidth: '460px', width: '100%', borderTop: '4px solid var(--nebula-violet)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span className="nebula-badge nebula-badge-violet" style={{ marginBottom: '0.75rem' }}>
              🎮 GAMER PORTAL
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0.25rem 0' }}>
              Create Gamer Identity
            </h1>
            <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem' }}>
              Join the esports network where your match results build verified career credentials.
            </p>
          </div>

          {serverError && (
            <div className="nebula-alert nebula-alert-danger" role="alert">
              ⚠️ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="nebula-form-group">
              <label className="nebula-label" htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="player@example.com"
                autoComplete="email"
                required
                disabled={submitting}
                className="nebula-input"
              />
              {errors.email && <span style={{ color: 'var(--nebula-coral)', fontSize: '0.8rem' }}>{errors.email}</span>}
            </div>

            <div className="nebula-form-group">
              <label className="nebula-label" htmlFor="username">Gamer Username / Tag *</label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="ApexSniper"
                autoComplete="username"
                required
                disabled={submitting}
                className="nebula-input"
              />
              {errors.username && <span style={{ color: 'var(--nebula-coral)', fontSize: '0.8rem' }}>{errors.username}</span>}
            </div>

            <div className="nebula-form-group">
              <label className="nebula-label" htmlFor="password">Password (min. 12 chars, Aa1!) *</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                autoComplete="new-password"
                required
                disabled={submitting}
                className="nebula-input"
              />
              {errors.password && <span style={{ color: 'var(--nebula-coral)', fontSize: '0.8rem' }}>{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="nebula-btn nebula-btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={submitting}
            >
              {submitting ? 'Creating Profile...' : 'Claim Gamer Tag & Register →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--nebula-border)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--nebula-text-secondary)' }}>
              Already registered?{' '}
              <Link to="/gamer/login" style={{ color: 'var(--nebula-violet)', fontWeight: 700 }}>
                Sign In
              </Link>
            </p>
            <div style={{ marginTop: '0.75rem' }}>
              <Link to="/organizer/register" style={{ fontSize: '0.82rem', color: 'var(--nebula-cyan)' }}>
                Represent an Organization? Create Organizer Account ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

