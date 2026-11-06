import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../hooks/useAuth.js';
import '../styles/platform.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="platform-page" style={{ textAlign: 'center', paddingTop: 'var(--space-2xl)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', marginBottom: 'var(--space-md)' }}>
            <span className="evoq-badge badge-primary" style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
              ⚡ The Operating System &amp; Professional Network for Esports
            </span>
          </div>

          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 'var(--space-md)' }}>
            Play. Compete. Achieve. <span style={{ color: 'var(--primary)' }}>Get Recognized.</span>
          </h1>

          <p style={{ fontSize: '1.25rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 'var(--space-xl)' }}>
            EVOQ transforms every competitive match into permanent, cryptographically verified career credentials.
            Build your gamer identity, form teams, and compete in premier tournaments.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tournaments" className="evoq-btn evoq-btn-primary" style={{ padding: '12px 28px', fontSize: '1.1rem' }}>
              Explore Tournaments
            </Link>
            {user ? (
              <Link to="/dashboard" className="evoq-btn evoq-btn-secondary" style={{ padding: '12px 28px', fontSize: '1.1rem' }}>
                Open Dashboard ({user.username})
              </Link>
            ) : (
              <Link to="/register" className="evoq-btn evoq-btn-secondary" style={{ padding: '12px 28px', fontSize: '1.1rem' }}>
                Create Free Account
              </Link>
            )}
          </div>
        </div>

        {/* 4 Pillars Section */}
        <div style={{ marginTop: 'var(--space-2xl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 'var(--space-xl)' }}>
            Four Connected Esports Ecosystem Layers
          </h2>

          <div className="grid-cards" style={{ textAlign: 'left' }}>
            <div className="evoq-card">
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>🎮</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
                Tournament Operations Platform
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Automated single-elimination, round-robin, and battle-royale bracket generation, AES-256-GCM lobby credential security, and authoritative result workflows.
              </p>
            </div>

            <div className="evoq-card">
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>🏅</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
                Gamer Professional Network
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Tournament results automatically convert to verified achievements, career timelines, win rates, and game-specific identities across Riot, Steam, and Epic Games.
              </p>
            </div>

            <div className="evoq-card">
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>🏢</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
                Organizer Professional Network
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Esports organizations and tournament directors earn verified operations credentials, credibility scores, and immutable event portfolios.
              </p>
            </div>

            <div className="evoq-card">
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>🛡️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
                Shared Data &amp; Trust Layer
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Idempotent proof tracking, immutable audit logs, MySQL session security, and anti-spoofing verification ensure complete trust across the competitive landscape.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
