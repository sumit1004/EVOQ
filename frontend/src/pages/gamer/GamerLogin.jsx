import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import PublicNavbar from '../../components/PublicNavbar.jsx';
import '../../styles/nebula.css';

export default function GamerLogin() {
  const { loginGamer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/gamer/dashboard';

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
      await loginGamer(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Login failed. Please verify your credentials.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nebula-shell">
      <PublicNavbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div className="nebula-card" style={{ maxWidth: '440px', width: '100%', borderTop: '4px solid var(--nebula-violet)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span className="nebula-badge nebula-badge-violet" style={{ marginBottom: '0.75rem' }}>
              GAMER PORTAL
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0.25rem 0' }}>
              Gamer Sign In
            </h1>
            <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem' }}>
              Compete in tournaments, build your verified esports profile, and earn badges.
            </p>
          </div>

          {serverError && (
            <div className="nebula-alert nebula-alert-danger" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="nebula-form-group">
              <label className="nebula-label" htmlFor="email">Email Address</label>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="nebula-label" htmlFor="password">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--nebula-violet)' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
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

            <button
              type="submit"
              className="nebula-btn nebula-btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={submitting}
            >
              {submitting ? 'Entering Arena...' : 'Sign In to Gamer Arena →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--nebula-border)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--nebula-text-secondary)', margin: '0 0 0.5rem 0' }}>
              New to competitive play?{' '}
              <Link to="/gamer/register" style={{ color: 'var(--nebula-violet)', fontWeight: 700 }}>
                Create Gamer Account
              </Link>
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--nebula-text-muted)' }}>
              Tournament Organizer?{' '}
              <Link to="/organizer/login" style={{ color: 'var(--nebula-cyan)', fontWeight: 600 }}>
                Organizer Login ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

