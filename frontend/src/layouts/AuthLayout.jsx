import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons.jsx';

export default function AuthLayout({
  children,
  badge = 'GAMER AUTH',
  badgeType = 'lime',
  title = 'Access Your Competitive Profile',
  subtitle = 'Log in to track tournaments, manage team rosters, and compete.',
  quote = 'DOMINATE THE ARENA. VERIFY YOUR LEGACY.',
  quoteAuthor = 'EVOQ PRO NETWORK',
  heroImage = '/images/two2.png',
}) {
  return (
    <div className="evoq-auth-page-root">
      <div className="evoq-auth-split-grid">
        {/* Left Column: Visual Brand Experience (Desktop Only) */}
        <aside className="evoq-auth-brand-col" aria-hidden="true">
          <div className="evoq-auth-brand-bg-pattern" />
          <div className="evoq-auth-glow-spot" />

          {/* Top Brand Tag */}
          <div className="evoq-auth-brand-top">
            <Link to="/" className="evoq-logo-link" tabIndex="-1">
              <span className="evoq-logo-text">EVOQ</span>
              <span className="evoq-logo-dot" />
            </Link>
            <span className={`evoq-badge-${badgeType}`}>{badge}</span>
          </div>

          {/* Visual Center Hologram Character */}
          <div className="evoq-auth-visual-wrap">
            <img
              src={heroImage}
              alt="EVOQ Esports Character"
              className="evoq-auth-hero-img"
            />
            <div className="evoq-auth-char-fade" />
          </div>

          {/* Bottom Esports Manifesto */}
          <div className="evoq-auth-brand-footer">
            <div className="evoq-auth-quote-mark">“</div>
            <p className="evoq-auth-quote-text">{quote}</p>
            <div className="evoq-auth-quote-author">// {quoteAuthor}</div>

            <div className="evoq-auth-feature-tags">
              <span className="evoq-auth-tag">
                <Icon name="check" size={13} color="#C9FF52" /> Verified Passport
              </span>
              <span className="evoq-auth-tag">
                <Icon name="shield" size={13} color="#C9FF52" /> Anti-Cheat Roster
              </span>
              <span className="evoq-auth-tag">
                <Icon name="trophy" size={13} color="#C9FF52" /> Instant Brackets
              </span>
            </div>
          </div>
        </aside>

        {/* Right Column: Interactive Form Experience */}
        <main className="evoq-auth-form-col">
          <div className="evoq-auth-form-inner">
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="evoq-auth-mobile-header">
              <Link to="/" className="evoq-logo-link">
                <span className="evoq-logo-text">EVOQ</span>
                <span className="evoq-logo-dot" />
              </Link>
              <span className={`evoq-badge-${badgeType}`}>{badge}</span>
            </div>

            {/* Form Headline */}
            <div className="evoq-auth-header-block">
              <h1 className="evoq-auth-title">{title}</h1>
              {subtitle && <p className="evoq-auth-subtitle">{subtitle}</p>}
            </div>

            {/* Auth Card Container */}
            <div className="evoq-auth-card">
              {children}
            </div>

            {/* Back to Home Link */}
            <div className="evoq-auth-back-link">
              <Link to="/" className="evoq-link-muted">
                <Icon name="arrow-left" size={14} />
                <span>Return to EVOQ Home</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

