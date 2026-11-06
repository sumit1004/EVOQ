import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import FormInput from '../components/FormInput.jsx';
import '../styles/auth.css';

export default function Register() {
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
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      newErrors.username = 'Username must be between 3 and 30 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username =
        'Username can only contain alphanumeric characters, hyphens, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 12) {
        newErrors.password = 'Password must be at least 12 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain an uppercase letter';
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must contain a lowercase letter';
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain a number';
      } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain a special character';
      }
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
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-header">
            <span className="auth-logo">EVOQ</span>
            <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem', color: 'var(--success)' }}>
              Account Created!
            </h2>
          </div>
          <p style={{ color: 'var(--text)', marginBottom: '1rem' }}>
            We've sent a verification link to <strong>{formData.email}</strong>.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Please check your inbox to activate your account.
          </p>
          <Link to="/login" className="btn-primary">
            Proceed to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            EVOQ
          </Link>
          <h2 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>Create Account</h2>
          <p className="auth-subtitle">Join the professional network for esports</p>
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
            id="username"
            label="Gamer Username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            placeholder="ApexSniper"
            autoComplete="username"
            required
            disabled={submitting}
          />

          <FormInput
            id="password"
            label="Password (min. 12 characters, Aa1!)"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••••••"
            autoComplete="new-password"
            required
            disabled={submitting}
          />

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

