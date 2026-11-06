import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import '../styles/auth.css';

export default function Dashboard() {
  const { user, logout, logoutAll } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (err) {
      setMessage('Failed to log out.');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      setLoggingOut(true);
      await logoutAll();
      navigate('/login');
    } catch (err) {
      setMessage('Failed to revoke all sessions.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="navbar">
        <Link to="/" className="nav-logo">
          EVOQ
        </Link>
        <div className="nav-actions">
          <span className="user-badge">
            👤 {user?.username} (<em>{user?.email}</em>)
          </span>
          <button
            onClick={handleLogout}
            className="btn-secondary"
            disabled={loggingOut}
          >
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Platform Dashboard</h1>
            <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
              Phase 1 Platform Foundation — Session Authenticated
            </p>
          </div>
          <span
            className={`badge ${
              user?.emailVerified ? 'badge-verified' : 'badge-unverified'
            }`}
          >
            {user?.emailVerified ? 'Verified Account' : 'Verification Pending'}
          </span>
        </div>

        {message && (
          <div className="auth-alert error" style={{ marginTop: '1rem' }}>
            {message}
          </div>
        )}

        <div className="dashboard-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            Authenticated Identity Details
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>USER ID (UUID v4)</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                {user?.userId || user?.id}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>GAMER TAG</span>
              <p style={{ fontWeight: 600 }}>{user?.username}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>EMAIL</span>
              <p>{user?.email}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>ACCOUNT STATUS</span>
              <p style={{ color: 'var(--success)', fontWeight: 600 }}>{user?.status || 'ACTIVE'}</p>
            </div>
          </div>

          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Active Session Security</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Your session is backed by MySQL and secured via HttpOnly, SameSite cookies with CSRF validation.
            </p>
            <button
              onClick={handleLogoutAll}
              className="btn-secondary"
              style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
              disabled={loggingOut}
            >
              Revoke All Active Sessions
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

