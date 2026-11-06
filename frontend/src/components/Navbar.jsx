import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { evoqService } from '../services/evoq.service.js';
import '../styles/navbar.css';

export default function Navbar() {
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
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="evoq-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            EVOQ
          </Link>
          <nav className="desktop-nav">
            <Link to="/tournaments" className={`nav-link ${isActive('/tournaments') ? 'active' : ''}`}>
              Tournaments
            </Link>
            <Link to="/teams" className={`nav-link ${isActive('/teams') ? 'active' : ''}`}>
              Teams
            </Link>
            <Link to="/organizations" className={`nav-link ${isActive('/organizations') ? 'active' : ''}`}>
              Organizations
            </Link>
          </nav>
        </div>

        <div className="navbar-right">
          {user ? (
            <div className="auth-nav-cluster">
              <Link to="/dashboard/notifications" className="notif-btn" title="Notifications">
                🔔
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </Link>

              <div className="dropdown-wrapper">
                <Link to="/dashboard" className="nav-profile-pill">
                  <span className="gamer-dot"></span>
                  <span className="username-text">{user.username}</span>
                </Link>
              </div>

              <Link to="/dashboard/tournaments/new" className="btn-host-nav">
                + Host Event
              </Link>

              <button onClick={handleLogout} className="btn-signout" title="Sign Out">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="guest-nav-cluster">
              <Link to="/login" className="btn-login-nav">
                Sign In
              </Link>
              <Link to="/register" className="btn-register-nav">
                Join EVOQ
              </Link>
            </div>
          )}

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <Link to="/tournaments" onClick={() => setMobileMenuOpen(false)}>
            🏆 Tournaments
          </Link>
          <Link to="/teams" onClick={() => setMobileMenuOpen(false)}>
            🛡️ Teams
          </Link>
          <Link to="/organizations" onClick={() => setMobileMenuOpen(false)}>
            🏢 Organizations
          </Link>
          {user && (
            <>
              <div className="drawer-divider"></div>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                📊 Dashboard
              </Link>
              <Link to="/dashboard/profile" onClick={() => setMobileMenuOpen(false)}>
                👤 Gamer Profile
              </Link>
              <Link to="/dashboard/teams" onClick={() => setMobileMenuOpen(false)}>
                👥 My Teams
              </Link>
              <Link to="/dashboard/organizer" onClick={() => setMobileMenuOpen(false)}>
                ⚙️ Organizer Hub
              </Link>
              <Link to="/dashboard/tournaments/new" onClick={() => setMobileMenuOpen(false)}>
                ➕ Host Tournament
              </Link>
              <button onClick={handleLogout} className="drawer-logout">
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

