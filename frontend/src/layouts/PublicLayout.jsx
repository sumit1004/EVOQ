import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';

export default function PublicLayout({ children }) {
  return (
    <div className="evoq-shell">
      <PublicNavbar />
      <main className="evoq-public-main" style={{ flex: 1 }}>
        {children}
      </main>

      <footer className="evoq-public-footer">
        <div className="evoq-footer-inner">
          <div className="evoq-footer-brand-col">
            <Link to="/" className="evoq-logo-link">
              <span className="evoq-logo-text">EVOQ</span>
              <span className="evoq-logo-dot" />
            </Link>
            <p className="evoq-footer-tagline">
              The professional network and operating system for competitive esports.
            </p>
            <div className="evoq-footer-copy">
              &copy; {new Date().getFullYear()} EVOQ Esports Inc. All rights reserved.
            </div>
          </div>

          <div className="evoq-footer-links-grid">
            <div className="evoq-footer-col">
              <span className="evoq-footer-col-title">COMPETITIONS</span>
              <Link to="/tournaments" className="evoq-footer-link">Tournaments</Link>
              <Link to="/gamer/dashboard" className="evoq-footer-link">Gamer Arena</Link>
              <Link to="/organizer/dashboard" className="evoq-footer-link">Host Event</Link>
            </div>

            <div className="evoq-footer-col">
              <span className="evoq-footer-col-title">ECOSYSTEM</span>
              <Link to="/#about" className="evoq-footer-link">About Platform</Link>
              <Link to="/#features" className="evoq-footer-link">Technology</Link>
              <Link to="/#games" className="evoq-footer-link">Supported Games</Link>
              <Link to="/#contact" className="evoq-footer-link">Contact Staff</Link>
            </div>

            <div className="evoq-footer-col">
              <span className="evoq-footer-col-title">ACCOUNTS</span>
              <Link to="/gamer/login" className="evoq-footer-link">Gamer Sign In</Link>
              <Link to="/gamer/register" className="evoq-footer-link">Gamer Register</Link>
              <Link to="/organizer/login" className="evoq-footer-link">Organizer Sign In</Link>
              <Link to="/organizer/register" className="evoq-footer-link">Organizer Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

