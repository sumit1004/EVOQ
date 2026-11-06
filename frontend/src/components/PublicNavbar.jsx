import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import ThemeToggle from './ThemeToggle.jsx';

export default function PublicNavbar() {
  const { user } = useAuth();

  return (
    <header className="nebula-nav">
      <div className="nebula-nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" className="nebula-logo-brand">
            EVOQ
          </Link>

          <nav className="nebula-nav-links">
            <Link to="/tournaments" className="nebula-nav-item">
              Tournaments
            </Link>
            <Link to="/teams" className="nebula-nav-item">
              Teams
            </Link>
            <Link to="/organizations" className="nebula-nav-item">
              Organizations
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ThemeToggle />

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/gamer/dashboard" className="nebula-btn nebula-btn-primary nebula-btn-sm">
                🎮 Gamer Dashboard
              </Link>
              <Link to="/organizer/dashboard" className="nebula-btn nebula-btn-cyan nebula-btn-sm">
                ⚡ Organizer Hub
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/gamer/login" className="nebula-btn nebula-btn-secondary nebula-btn-sm">
                Gamer Sign In
              </Link>
              <Link to="/organizer/login" className="nebula-btn nebula-btn-cyan nebula-btn-sm">
                Organizer Portal ⚡
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

