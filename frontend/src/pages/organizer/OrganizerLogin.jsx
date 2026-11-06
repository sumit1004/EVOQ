import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import PublicNavbar from '../../components/PublicNavbar.jsx';
import '../../styles/nebula.css';

export default function OrganizerLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/organizer/dashboard';

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
      newErrors.email = 'Staff email address is required';
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
      setServerError(err.message || 'Authentication failed. Please verify staff credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nebula-shell">
      <PublicNavbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div className="nebula-card" style={{ maxWidth: '440px', width: '100%', borderTop: '4px solid var(--nebula-cyan)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span className="nebula-badge nebula-badge-cyan" style={{ marginBottom: '0.75rem' }}>
              ⚡ OPERATIONS &amp; TOURNAMENT HUB
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0.25rem 0' }}>
              Organizer Sign In
            </h1>
            <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem' }}>
              Access tournament operations, bracket orchestration, match credentials, and referee scoring.
            </p>
          </div>

          {serverError && (
            <div className="nebula-alert nebula-alert-danger" role="alert">
              ⚠️ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="nebula-form-group">
              <label className="nebula-label" htmlFor="email">Director / Staff Email</label>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="nebula-label" htmlFor="password">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--nebula-cyan)' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                disabled={submitting}
                className="nebula-input"
              />
              {errors.password && <span style={{ color: 'var(--nebula-coral)', fontSize: '0.8rem' }}>{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="nebula-btn nebula-btn-cyan"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={submitting}
            >
              {submitting ? 'Entering Command Room...' : 'Enter Operations Room →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--nebula-border)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--nebula-text-secondary)' }}>
              New esports organizer?{' '}
              <Link to="/organizer/register" style={{ color: 'var(--nebula-cyan)', fontWeight: 700 }}>
                Onboard Organization
              </Link>
            </p>
            <div style={{ marginTop: '0.75rem' }}>
              <Link to="/gamer/login" style={{ fontSize: '0.82rem', color: 'var(--nebula-violet)' }}>
                Looking to play? Switch to Gamer Portal ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

