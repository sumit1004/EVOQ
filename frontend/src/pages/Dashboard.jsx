import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../hooks/useAuth.js';
import '../styles/platform.css';

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
    <>
      <Navbar />
      <div className="platform-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome back, {user?.username}</h1>
            <p className="page-subtitle">EVOQ Esports Operating System • Identity &amp; Operations Center</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
            <span className={`evoq-badge ${user?.emailVerified ? 'badge-success' : 'badge-warning'}`}>
              {user?.emailVerified ? '✔ Email Verified' : 'Verification Pending'}
            </span>
            <button
              onClick={handleLogout}
              className="evoq-btn evoq-btn-secondary"
              disabled={loggingOut}
            >
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        {message && <div className="evoq-card status-danger" style={{ marginBottom: 'var(--space-md)' }}>{message}</div>}

        {/* Quick Access Grid */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
          Quick Navigation
        </h2>
        <div className="grid-cards" style={{ marginBottom: 'var(--space-2xl)' }}>
          {/* Gamer Profile */}
          <Link to="/dashboard/profile" className="evoq-card clickable" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 'var(--space-xs)' }}>👤</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>Gamer Profile</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              Manage game identities (Riot ID, Steam, Epic), bio, and public player portfolio.
            </p>
          </Link>

          {/* Teams */}
          <Link to="/dashboard/teams" className="evoq-card clickable" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 'var(--space-xs)' }}>🛡️</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>Teams &amp; Rosters</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              Form competitive teams, manage rosters, send invitations, and view team history.
            </p>
          </Link>

          {/* Organizer Operations Hub */}
          <Link to="/dashboard/organizer" className="evoq-card clickable" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 'var(--space-xs)' }}>⚙️</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>Organizer Hub</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              Host tournaments, control room match operations, and view organizer credibility metrics.
            </p>
          </Link>

          {/* Tournaments Discovery */}
          <Link to="/tournaments" className="evoq-card clickable" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 'var(--space-xs)' }}>🏆</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>Compete in Tournaments</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              Discover active competitions, register solo or with your squad, and view live brackets.
            </p>
          </Link>

          {/* Organizations */}
          <Link to="/dashboard/organizations" className="evoq-card clickable" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 'var(--space-xs)' }}>🏢</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>Organizations</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              Create or manage esports organizations, staff roles, and public brand profiles.
            </p>
          </Link>

          {/* Notifications */}
          <Link to="/dashboard/notifications" className="evoq-card clickable" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 'var(--space-xs)' }}>🔔</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>Notifications</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              View match reminders, tournament announcements, and team invitations.
            </p>
          </Link>
        </div>

        {/* Identity & Session Security Card */}
        <div className="evoq-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--primary)' }}>
            Account &amp; Security Credentials
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
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
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>STATUS</span>
              <p style={{ color: 'var(--success)', fontWeight: 600 }}>{user?.status || 'ACTIVE'}</p>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-xl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Session Security</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                Secured via HttpOnly SameSite cookie and MySQL server-side database session.
              </p>
            </div>
            <button
              onClick={handleLogoutAll}
              className="evoq-btn evoq-btn-danger"
              disabled={loggingOut}
            >
              Revoke All Active Sessions
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
