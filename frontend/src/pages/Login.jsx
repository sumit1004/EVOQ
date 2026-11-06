import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import FormInput from '../components/FormInput.jsx';
import '../styles/auth.css';

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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            EVOQ
          </Link>
          <h2 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your competitive account</p>
        </div>

        {serverError && (
          <div className="auth-alert error" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <FormInput
            id="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="player@example.com"
            autoComplete="email"
            required
            disabled={submitting}
          />

          <FormInput
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••••••"
            autoComplete="current-password"
            required
            disabled={submitting}
          />

          <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
            <Link
              to="/forgot-password"
              style={{ fontSize: '0.825rem', color: 'var(--muted)' }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

