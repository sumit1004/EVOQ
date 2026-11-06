import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { evoqService } from '../services/evoq.service.js';
import ThemeToggle from './ThemeToggle.jsx';

export default function GamerNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      evoqService
        .getNotifications()
        .then((res) => {
          if (res?.unreadCount !== undefined) {
            setUnreadCount(res.unreadCount);
          } else if (Array.isArray(res)) {
            setUnreadCount(res.filter((n) => !n.isRead).length);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/gamer/login');
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="nebula-nav">
      <div className="nebula-nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <Link to="/gamer/dashboard" className="nebula-logo-brand">
            EVOQ <span className="nebula-badge nebula-badge-violet">GAMER</span>
          </Link>

          <nav className="nebula-nav-links">
            <Link
              to="/gamer/dashboard"
              className={`nebula-nav-item ${location.pathname === '/gamer/dashboard' ? 'active' : ''}`}
            >
              Overview
            </Link>
            <Link
              to="/gamer/tournaments"
              className={`nebula-nav-item ${isActive('/gamer/tournaments') ? 'active' : ''}`}
            >
              Tournaments
            </Link>
            <Link
              to="/gamer/teams"
              className={`nebula-nav-item ${isActive('/gamer/teams') ? 'active' : ''}`}
            >
              Teams
            </Link>
            <Link
              to="/gamer/matches"
              className={`nebula-nav-item ${isActive('/gamer/matches') ? 'active' : ''}`}
            >
              Matches
            </Link>
            <Link
              to="/gamer/achievements"
              className={`nebula-nav-item ${isActive('/gamer/achievements') ? 'active' : ''}`}
            >
              Achievements
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Notifications */}
          <Link
            to="/gamer/notifications"
            className="nebula-btn nebula-btn-ghost nebula-btn-sm"
            style={{ position: 'relative', padding: '0.45rem 0.65rem' }}
            title="Gamer Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--nebula-coral)',
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  padding: '2px 5px',
                  lineHeight: '1',
                }}
              >
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Gamer Profile Menu */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/gamer/profile"
                className="nebula-btn nebula-btn-secondary nebula-btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--nebula-lime)' }}></span>
                <strong>{user.username}</strong>
              </Link>
              <button
                onClick={handleLogout}
                className="nebula-btn nebula-btn-ghost nebula-btn-sm"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/gamer/login" className="nebula-btn nebula-btn-primary nebula-btn-sm">
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="nebula-btn nebula-btn-ghost nebula-btn-sm"
            style={{ display: 'none' }}
            id="gamer-mobile-toggle"
            aria-label="Toggle navigation"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div style={{ backgroundColor: 'var(--nebula-surface-elevated)', borderBottom: '1px solid var(--nebula-border)', padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/gamer/dashboard" className="nebula-nav-item" onClick={() => setMobileMenuOpen(false)}>
              Overview
            </Link>
            <Link to="/gamer/tournaments" className="nebula-nav-item" onClick={() => setMobileMenuOpen(false)}>
              Tournaments
            </Link>
            <Link to="/gamer/teams" className="nebula-nav-item" onClick={() => setMobileMenuOpen(false)}>
              Teams
            </Link>
            <Link to="/gamer/matches" className="nebula-nav-item" onClick={() => setMobileMenuOpen(false)}>
              Matches
            </Link>
            <Link to="/gamer/achievements" className="nebula-nav-item" onClick={() => setMobileMenuOpen(false)}>
              Achievements
            </Link>
            <Link to="/gamer/profile" className="nebula-nav-item" onClick={() => setMobileMenuOpen(false)}>
              My Profile
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

