import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/nebula.css';

export default function Home() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await evoqService.getTournaments({ pageSize: 3 });
        setTournaments(res?.tournaments || res?.data || []);
      } catch (err) {
        console.error('Failed to load featured tournaments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="nebula-shell">
      <PublicNavbar />

      {/* Cinematic Esports Hero */}
      <section
        style={{
          position: 'relative',
          padding: '6rem 1.5rem 5rem 1.5rem',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at 50% 20%, rgba(139, 92, 246, 0.22) 0%, rgba(11, 16, 32, 0) 70%)',
          overflow: 'hidden',
          borderBottom: '1px solid var(--nebula-border)',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="nebula-badge nebula-badge-violet" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
              ⚡ THE OPERATING SYSTEM &amp; PROFESSIONAL NETWORK FOR ESPORTS
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.75rem, 6vw, 4.75rem)',
              fontWeight: 950,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              margin: '0 0 1.5rem 0',
            }}
          >
            Play. Compete. Achieve.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--nebula-violet) 0%, var(--nebula-cyan) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Get Recognized.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              color: 'var(--nebula-text-secondary)',
              lineHeight: 1.6,
              maxWidth: '720px',
              margin: '0 auto 2.5rem auto',
            }}
          >
            EVOQ transforms every competitive tournament result into permanent, cryptographically verified career credentials for gamers and verified portfolios for organizers.
          </p>

          {/* Dual Entry Portals Hero Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              maxWidth: '820px',
              margin: '0 auto',
              textAlign: 'left',
            }}
          >
            {/* Gamer Portal Card */}
            <div
              className="nebula-card nebula-card-clickable"
              style={{
                borderTop: '4px solid var(--nebula-violet)',
                background: 'linear-gradient(180deg, var(--nebula-surface-primary) 0%, var(--nebula-surface-elevated) 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <span className="nebula-badge nebula-badge-violet">FOR COMPETITORS</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.5rem 0' }}>
                Gamer Portal 🎮
              </h2>
              <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                Build your verified esports player card, form competitive squads, link Riot/Steam handles, and claim immutable trophy achievements.
              </p>
              <Link to="/gamer/login" className="nebula-btn nebula-btn-primary" style={{ width: '100%' }}>
                Enter Gamer Portal →
              </Link>
            </div>

            {/* Organizer Portal Card */}
            <div
              className="nebula-card nebula-card-clickable"
              style={{
                borderTop: '4px solid var(--nebula-cyan)',
                background: 'linear-gradient(180deg, var(--nebula-surface-primary) 0%, var(--nebula-surface-elevated) 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <span className="nebula-badge nebula-badge-cyan">FOR ORGANIZERS &amp; CLUBS</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.5rem 0' }}>
                Organizer Portal ⚡
              </h2>
              <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                Orchestrate tournaments, generate automated brackets, release encrypted room lobby passwords, and build a verified organization portfolio.
              </p>
              <Link to="/organizer/login" className="nebula-btn nebula-btn-cyan" style={{ width: '100%' }}>
                Enter Operations Hub →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tournaments Section (Live API) */}
      <section className="nebula-container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="nebula-badge nebula-badge-lime" style={{ marginBottom: '0.5rem' }}>
              LIVE ESPORTS ACTION
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0 }}>Featured Tournaments</h2>
            <p style={{ color: 'var(--nebula-text-secondary)', margin: '0.25rem 0 0 0' }}>
              Compete in official tournaments hosted on EVOQ.
            </p>
          </div>
          <Link to="/tournaments" className="nebula-btn nebula-btn-secondary">
            View All Tournaments →
          </Link>
        </div>

        {loading ? (
          <div className="nebula-empty-state">
            <div className="nebula-empty-icon">⏳</div>
            <p>Loading active tournaments...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="nebula-card nebula-empty-state">
            <p>No featured events currently available.</p>
          </div>
        ) : (
          <div className="nebula-grid-cards">
            {tournaments.map((t) => (
              <div key={t.id} className="nebula-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.65rem' }}>
                  <span className="nebula-badge nebula-badge-violet">{t.game?.name || 'Esports'}</span>
                  <span className="nebula-badge nebula-badge-neutral">{t.format?.replace(/_/g, ' ')}</span>
                  <span className="nebula-badge nebula-badge-lime">{t.status?.replace(/_/g, ' ')}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>{t.name || t.title}</h3>

                <p style={{ color: 'var(--nebula-text-muted)', fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
                  Organized by <strong style={{ color: 'var(--nebula-text-primary)' }}>{t.organization?.name || t.organizerUser?.username || 'Verified Organizer'}</strong>
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: 'var(--nebula-text-secondary)',
                    borderTop: '1px solid var(--nebula-border)',
                    paddingTop: '0.75rem',
                    marginTop: 'auto',
                    marginBottom: '1rem',
                  }}
                >
                  <span>👥 Capacity: {t.maxParticipants} {t.participationType}s</span>
                  {t.prizePool && <span style={{ color: 'var(--nebula-lime)', fontWeight: 700 }}>🏆 {t.prizePool} {t.prizeCurrency || 'USD'}</span>}
                </div>

                <Link to={`/tournaments/${t.slug}`} className="nebula-btn nebula-btn-primary" style={{ width: '100%' }}>
                  View Tournament Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How EVOQ Works — Core Product Advantage */}
      <section
        style={{
          backgroundColor: 'var(--nebula-surface-primary)',
          borderTop: '1px solid var(--nebula-border)',
          borderBottom: '1px solid var(--nebula-border)',
          padding: '4.5rem 1.5rem',
        }}
      >
        <div className="nebula-container" style={{ padding: 0 }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
            <span className="nebula-badge nebula-badge-cyan" style={{ marginBottom: '0.5rem' }}>
              HOW EVOQ CONNECTS ESPORTS
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 950, letterSpacing: '-0.02em', margin: '0.25rem 0 1rem 0' }}>
              Tournament Data Becomes Professional Identity Data
            </h2>
            <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
              In ordinary platforms, tournament results disappear into spreadsheets and Discord channels. On EVOQ, approved match outcomes instantly build player careers and organizer reputations.
            </p>
          </div>

          <div className="nebula-grid-cards">
            <div className="nebula-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚔️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                1. Automated Match Engine
              </h3>
              <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Organizers deploy Single Elimination, Double Elimination, Round Robin, and Battle Royale formats with AES-256-GCM encrypted lobby password protection.
              </p>
            </div>

            <div className="nebula-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚖️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                2. Referee Result Authorization
              </h3>
              <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Results are submitted with revision history and approved authoritatively by assigned tournament referees, advancing winners in the bracket.
              </p>
            </div>

            <div className="nebula-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎖️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                3. Immutable Achievement Propagation
              </h3>
              <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Final placements automatically generate verified achievements, update player win rates, append career event timelines, and populate the organizer's portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--nebula-surface-primary)', padding: '3rem 1.5rem', borderTop: '1px solid var(--nebula-border)' }}>
        <div className="nebula-container" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--nebula-text-primary)' }}>EVOQ</div>
            <p style={{ color: 'var(--nebula-text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              The Professional Network &amp; Operating System for Esports. Play. Compete. Achieve. Get Recognized.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
            <Link to="/tournaments" style={{ color: 'var(--nebula-text-secondary)' }}>Tournaments</Link>
            <Link to="/gamer/login" style={{ color: 'var(--nebula-violet)', fontWeight: 700 }}>Gamer Portal</Link>
            <Link to="/organizer/login" style={{ color: 'var(--nebula-cyan)', fontWeight: 700 }}>Organizer Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
