import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, getDashboardPath } from '../features/auth/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function PublicNavbar() {
  let user = null;
  let loading = false;
  let dashboardPath = '/gamer/dashboard';

  try {
    const auth = useAuth();
    user = auth?.user;
    loading = auth?.loading;
    dashboardPath = auth?.dashboardPath || getDashboardPath(user);
  } catch (e) {
    user = null;
    loading = false;
  }
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: 'About', href: '/#about' },
    { label: 'Features', href: '/#features' },
    { label: 'Games', href: '/#games' },
    { label: 'Tournaments', href: '/tournaments' },
    { label: 'Contact', href: '/#contact' },
  ];

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLinkClick = (e, href) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      if (location.pathname === '/') {
        e.preventDefault();
        const hash = href.replace('/', '');
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <header className="evoq-nav-outer" role="banner" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="evoq-nav-wrapper">
        <div className="evoq-nav-surface" aria-hidden="true" style={{ transform: 'none', opacity: 1 }} />

        <div className="evoq-nav-content" style={{ opacity: 1 }}>
          {/* LEFT: EVOQ Wordmark */}
          <div className="evoq-nav-left">
            <Link to="/" className="evoq-logo-link" aria-label="EVOQ Esports">
              <span className="evoq-logo-text">EVOQ</span>
              <span className="evoq-logo-dot" />
            </Link>
          </div>

          {/* CENTER: Navigation Links */}
          <nav className="evoq-nav-center" aria-label="Main Navigation">
            {links.map((link) => {
              const isActive =
                link.href === location.pathname ||
                (link.href === '/tournaments' && location.pathname.startsWith('/tournaments'));

              return (
                <span key={link.label} className="evoq-nav-item">
                  <Link
                    to={link.href}
                    className={`evoq-nav-link ${isActive ? 'active' : ''}`}
                    onClick={(e) => handleLinkClick(e, link.href)}
                  >
                    {link.label}
                  </Link>
                </span>
              );
            })}
          </nav>

          {/* RIGHT: User State or Login CTA */}
          <div className="evoq-nav-right">
            {loading ? (
              <div
                className="evoq-btn-login"
                style={{
                  opacity: 0.6,
                  cursor: 'default',
                  pointerEvents: 'none',
                  minWidth: '88px',
                  justifyContent: 'center',
                }}
                aria-hidden="true"
              >
                <span style={{ display: 'inline-block', width: '40px', height: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '3px' }} />
              </div>
            ) : user ? (
              <Link to={dashboardPath} className="evoq-btn-login">
                <span>Dashboard</span>
                <svg
                  className="evoq-btn-arrow"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </Link>
            ) : (
              <Link to="/gamer/login" className="evoq-btn-login">
                <span>Login</span>
                <svg
                  className="evoq-btn-arrow"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </Link>
            )}

            <button
              className="evoq-mobile-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle Navigation Menu"
            >
              <div className={`evoq-burger-icon ${mobileMenuOpen ? 'is-open' : ''}`}>
                <span className="evoq-burger-line" />
                <span className="evoq-burger-line" />
              </div>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <>
            <div
              className="evoq-mobile-backdrop"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="evoq-mobile-menu" role="dialog" aria-label="Mobile Navigation">
              {links.map((link, idx) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="evoq-mobile-link"
                  onClick={(e) => handleLinkClick(e, link.href)}
                >
                  <span>{link.label}</span>
                  <span style={{ color: '#C9FF52', fontSize: '11px', fontFamily: 'Space Mono, monospace' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </Link>
              ))}

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {loading ? null : user ? (
                  <Link
                    to={dashboardPath}
                    className="evoq-btn-login"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Dashboard</span>
                    <svg
                      className="evoq-btn-arrow"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                ) : (
                  <Link
                    to="/gamer/login"
                    className="evoq-btn-login"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Login</span>
                    <svg
                      className="evoq-btn-arrow"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
