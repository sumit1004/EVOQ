import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { evoqService } from '../services/evoq.service.js';
import { Icon } from './Icons.jsx';

export default function OrganizerNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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

  const opsLinks = [
    { label: 'Operations Hub', path: '/organizer/dashboard', icon: 'grid' },
    { label: 'Tournaments', path: '/organizer/tournaments', icon: 'tournament' },
    { label: '+ Create Event', path: '/organizer/tournaments/create', icon: 'plus', isHighlight: true },
    { label: 'Organization', path: '/organizer/organization', icon: 'organization' },
    { label: 'Staff & Roles', path: '/organizer/organization/members', icon: 'teams' },
    { label: 'Portfolio', path: '/organizer/events', icon: 'trophy' },
  ];

  return (
    <header className="evoq-topbar evoq-topbar-ops" role="banner">
      <div className="evoq-topbar-inner">
        {/* Brand & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/organizer/dashboard" className="evoq-brand-badge-link" aria-label="EVOQ Organizer Portal">
            <span className="evoq-brand-text">EVOQ</span>
            <span className="evoq-badge-cyan">OPS</span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="evoq-topbar-nav" aria-label="Operations Navigation">
            {opsLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`evoq-topbar-link ${isActive(item.path) ? 'active' : ''} ${item.isHighlight ? 'evoq-topbar-link-accent' : ''}`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Actions: Notifications & User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Notifications Icon Button */}
          <Link
            to="/organizer/notifications"
            className="evoq-icon-btn"
            title="Operations Alerts"
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          >
            <Icon name="bell" size={18} color={unreadCount > 0 ? '#22D3EE' : '#A5AA9C'} />
            {unreadCount > 0 && (
              <span className="evoq-badge-counter evoq-badge-counter-cyan">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Profile Pill */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="evoq-user-pill evoq-user-pill-ops"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <div className="evoq-user-avatar evoq-user-avatar-ops">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="evoq-avatar-img" />
                  ) : (
                    <span>{(user.username || 'O')[0].toUpperCase()}</span>
                  )}
                </div>
                <span className="evoq-user-name">{user.username}</span>
                <Icon name="chevron-down" size={14} color="#8A9284" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                    onClick={() => setUserDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="evoq-dropdown-panel" role="menu">
                    <div className="evoq-dropdown-header">
                      <div className="evoq-dropdown-user-title">{user.username}</div>
                      <div className="evoq-dropdown-user-sub">{user.organizationName || user.email}</div>
                    </div>
                    <div className="evoq-dropdown-divider" />
                    <Link
                      to="/organizer/organization"
                      className="evoq-dropdown-item"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Icon name="organization" size={16} />
                      <span>Organization Info</span>
                    </Link>
                    <Link
                      to="/organizer/settings"
                      className="evoq-dropdown-item"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Icon name="settings" size={16} />
                      <span>Organizer Settings</span>
                    </Link>
                    <div className="evoq-dropdown-divider" />
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="evoq-dropdown-item evoq-dropdown-danger"
                      role="menuitem"
                    >
                      <Icon name="logout" size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/organizer/login" className="evoq-btn-cyan evoq-btn-sm">
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="evoq-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Operations Menu"
            aria-expanded={mobileMenuOpen}
          >
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Operations Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="evoq-mobile-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="evoq-mobile-drawer-sheet" role="dialog" aria-label="Operations Navigation Drawer">
            <div className="evoq-mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="evoq-brand-text">EVOQ</span>
                <span className="evoq-badge-cyan">OPS</span>
              </div>
              <button
                type="button"
                className="evoq-icon-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Menu"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <nav className="evoq-mobile-drawer-links">
              {opsLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`evoq-mobile-drawer-link ${isActive(link.path) ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name={link.icon} size={18} />
                  <span>{link.label}</span>
                </Link>
              ))}
              <div className="evoq-dropdown-divider" style={{ margin: '12px 0' }} />
              <Link
                to="/organizer/settings"
                className="evoq-mobile-drawer-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name="settings" size={18} />
                <span>Settings</span>
              </Link>
              <Link
                to="/"
                className="evoq-mobile-drawer-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name="home" size={18} />
                <span>Public Site</span>
              </Link>
            </nav>

            {user && (
              <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="evoq-btn-danger"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Icon name="logout" size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
