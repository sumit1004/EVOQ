import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { evoqService } from '../services/evoq.service.js';
import ThemeToggle from './ThemeToggle.jsx';

export default function OrganizerNavbar() {
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
      navigate('/organizer/login');
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="nebula-nav" style={{ borderBottomColor: 'rgba(34, 211, 238, 0.3)' }}>
      <div className="nebula-nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <Link to="/organizer/dashboard" className="nebula-logo-brand">
            EVOQ <span className="nebula-badge nebula-badge-cyan">OPS</span>
          </Link>

          <nav className="nebula-nav-links">
            <Link
              to="/organizer/dashboard"
              className={`nebula-nav-item nebula-nav-item-ops ${location.pathname === '/organizer/dashboard' ? 'active' : ''}`}
            >
              Operations Hub
            </Link>
            <Link
              to="/organizer/tournaments"
              className={`nebula-nav-item nebula-nav-item-ops ${isActive('/organizer/tournaments') && location.pathname !== '/organizer/tournaments/create' ? 'active' : ''}`}
            >
              Tournaments
            </Link>
            <Link
              to="/organizer/tournaments/create"
              className={`nebula-nav-item nebula-nav-item-ops ${location.pathname === '/organizer/tournaments/create' ? 'active' : ''}`}
            >
              + Create Event
            </Link>
            <Link
              to="/organizer/organization"
              className={`nebula-nav-item nebula-nav-item-ops ${location.pathname === '/organizer/organization' ? 'active' : ''}`}
            >
              Organization
            </Link>
            <Link
              to="/organizer/organization/members"
              className={`nebula-nav-item nebula-nav-item-ops ${location.pathname === '/organizer/organization/members' ? 'active' : ''}`}
            >
              Staff &amp; Roles
            </Link>
            <Link
              to="/organizer/events"
              className={`nebula-nav-item nebula-nav-item-ops ${isActive('/organizer/events') ? 'active' : ''}`}
            >
              Portfolio
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Notifications */}
          <Link
            to="/organizer/notifications"
            className="nebula-btn nebula-btn-ghost nebula-btn-sm"
            style={{ position: 'relative', padding: '0.45rem 0.65rem' }}
            title="Operations Alerts"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
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

          {/* Organizer Ops Badge & Logout */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                className="nebula-badge nebula-badge-cyan"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                DIRECTOR: {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="nebula-btn nebula-btn-ghost nebula-btn-sm"
                title="Sign Out of Operations"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/organizer/login" className="nebula-btn nebula-btn-cyan nebula-btn-sm">
              Staff Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="nebula-btn nebula-btn-ghost nebula-btn-sm"
            style={{ display: 'none' }}
            id="organizer-mobile-toggle"
            aria-label="Toggle navigation"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div style={{ backgroundColor: 'var(--nebula-surface-elevated)', borderBottom: '1px solid var(--nebula-border)', padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/organizer/dashboard" className="nebula-nav-item" onClick={() => setMobileMenuOpen(false)}>
              Operations Hub
            </Link>
            <Link to="/organizer/tournaments" className="nebula-nav-item" onClick={() => setMobileMenuOpen(false)}>
              Tournaments
            </Link>
            <Link to="/organizer/tournaments/create" className="nebula-nav-item" onClick={() => setMobileMenuOpen(false)}>
              + Create Event
            </Link>
            <Link to="/organizer/organization" className="nebula-nav-item" onClick={() => setMobileMenuOpen(false)}>
              Organization
            </Link>
            <Link to="/organizer/organization/members" className="nebula-nav-item" onClick={() => setMobileMenuOpen(false)}>
              Staff &amp; Roles
            </Link>
            <Link to="/organizer/events" className="nebula-nav-item" onClick={() => setMobileMenuOpen(false)}>
              Verified Portfolio
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

