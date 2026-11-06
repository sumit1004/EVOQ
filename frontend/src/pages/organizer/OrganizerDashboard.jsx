import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganizerNavbar from '../../components/OrganizerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function OrganizerDashboard() {
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const [dashData, orgProf] = await Promise.all([
          evoqService.getOrganizerDashboard(),
          evoqService.getMyOrganizerProfile().catch(() => null),
        ]);
        setData(dashData);
        setProfile(orgProf);
      } catch (err) {
        setError('Failed to load organizer operations center.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const tournaments = data?.tournaments || [];
  const metrics = data?.metrics || {
    totalTournaments: tournaments.length,
    activeTournaments: tournaments.filter((t) => ['REGISTRATION_OPEN', 'ONGOING'].includes(t.status)).length,
    completedTournaments: tournaments.filter((t) => ['COMPLETED', 'CONCLUDED'].includes(t.status)).length,
    totalParticipants: tournaments.reduce((acc, t) => acc + (t._count?.registrations || 0), 0),
  };

  const upcomingMatches = data?.upcomingMatches || [];

  return (
    <div className="nebula-shell">
      <OrganizerNavbar />
      <main className="nebula-container">
        {/* Command Center Hero */}
        <div
          className="nebula-card"
          style={{
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, var(--nebula-surface-primary) 0%, #0d1e2e 100%)',
            borderLeft: '4px solid var(--nebula-cyan)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="nebula-badge nebula-badge-cyan">OPERATIONS COMMAND CENTER</span>
                <span className="nebula-badge nebula-badge-lime">LIVE ORCHESTRATION</span>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0.4rem 0' }}>
                Tournament Operations Hub
              </h1>
              <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.92rem', margin: 0 }}>
                Manage bracket fixtures, release encrypted match credentials, and approve authoritative match results.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/organizer/tournaments/create" className="nebula-btn nebula-btn-cyan">
                + Launch New Event
              </Link>
              <Link to="/organizer/organization" className="nebula-btn nebula-btn-secondary">
                Organization Profile
              </Link>
            </div>
          </div>
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}

        {/* Operations KPI Metrics */}
        <div className="nebula-grid-metrics">
          <div className="nebula-metric">
            <span className="nebula-metric-label">Managed Tournaments</span>
            <span className="nebula-metric-value">{metrics.totalTournaments || 0}</span>
            <span className="nebula-metric-subtext">Events hosted on EVOQ</span>
          </div>
          <div className="nebula-metric">
            <span className="nebula-metric-label">Active / In Progress</span>
            <span className="nebula-metric-value" style={{ color: 'var(--nebula-cyan)' }}>
              {metrics.activeTournaments || 0}
            </span>
            <span className="nebula-metric-subtext">Lobbies and brackets live</span>
          </div>
          <div className="nebula-metric">
            <span className="nebula-metric-label">Completed Events</span>
            <span className="nebula-metric-value" style={{ color: 'var(--nebula-lime)' }}>
              {metrics.completedTournaments || 0}
            </span>
            <span className="nebula-metric-subtext">Trophies awarded to players</span>
          </div>
          <div className="nebula-metric">
            <span className="nebula-metric-label">Total Competitors</span>
            <span className="nebula-metric-value" style={{ color: 'var(--nebula-violet)' }}>
              {metrics.totalParticipants || 0}
            </span>
            <span className="nebula-metric-subtext">Rosters approved</span>
          </div>
        </div>

        {/* 2-Column Operations View */}
        <div className="nebula-grid-2col">
          {/* Left Column: Active Events */}
          <div>
            <div className="nebula-card">
              <div className="nebula-card-header">
                <h2 className="nebula-card-title">
                  <span>🏆</span> Managed Tournaments &amp; Control Rooms
                </h2>
                <Link to="/organizer/tournaments" style={{ fontSize: '0.85rem', color: 'var(--nebula-cyan)', fontWeight: 700 }}>
                  View All ({tournaments.length}) →
                </Link>
              </div>

              {loading ? (
                <div className="nebula-empty-state" style={{ padding: '2rem' }}>
                  <p>Loading operations center...</p>
                </div>
              ) : tournaments.length === 0 ? (
                <div className="nebula-empty-state" style={{ padding: '2rem' }}>
                  <div className="nebula-empty-icon">🎮</div>
                  <h3>No Tournaments Created</h3>
                  <p style={{ color: 'var(--nebula-text-secondary)', marginBottom: '1rem' }}>
                    Launch your first competitive event with automated bracket generation and encrypted lobbies.
                  </p>
                  <Link to="/organizer/tournaments/create" className="nebula-btn nebula-btn-cyan">
                    Launch Tournament Wizard
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {tournaments.slice(0, 6).map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: '1rem 1.25rem',
                        backgroundColor: 'var(--nebula-surface-elevated)',
                        borderRadius: 'var(--nebula-radius-md)',
                        border: '1px solid var(--nebula-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem' }}>
                          <span className="nebula-badge nebula-badge-cyan">{t.game?.name || 'Esports'}</span>
                          <span className="nebula-badge nebula-badge-neutral">{t.format?.replace(/_/g, ' ')}</span>
                          <span
                            className={`nebula-badge ${
                              t.status === 'REGISTRATION_OPEN'
                                ? 'nebula-badge-lime'
                                : t.status === 'ONGOING'
                                ? 'nebula-badge-cyan'
                                : 'nebula-badge-neutral'
                            }`}
                          >
                            {t.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                          {t.name || t.title}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--nebula-text-muted)' }}>
                          Registrations: {t._count?.registrations || t.registrations?.length || 0} / {t.maxParticipants} {t.participationType}s
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/organizer/tournaments/${t.id}`}
                          className="nebula-btn nebula-btn-cyan nebula-btn-sm"
                        >
                          Control Room ⚙
                        </Link>
                        <Link
                          to={`/tournaments/${t.slug}`}
                          className="nebula-btn nebula-btn-ghost nebula-btn-sm"
                          target="_blank"
                        >
                          Public ↗
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Operations & Upcoming Matches */}
          <div>
            {/* Quick Actions */}
            <div className="nebula-card" style={{ marginBottom: '1.5rem' }}>
              <h2 className="nebula-card-title" style={{ marginBottom: '1rem' }}>
                <span>⚡</span> Quick Operations
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <Link to="/organizer/tournaments/create" className="nebula-btn nebula-btn-cyan" style={{ justifyContent: 'flex-start' }}>
                  <span>➕</span> Create New Tournament
                </Link>
                <Link to="/organizer/organization/members" className="nebula-btn nebula-btn-secondary" style={{ justifyContent: 'flex-start' }}>
                  <span>👥</span> Manage Staff &amp; Referee Roles
                </Link>
                <Link to="/organizer/events" className="nebula-btn nebula-btn-secondary" style={{ justifyContent: 'flex-start' }}>
                  <span>🏅</span> View Verified Event Portfolio
                </Link>
              </div>
            </div>

            {/* Public Portfolio Banner */}
            {profile?.slug && (
              <div className="nebula-card">
                <span className="nebula-badge nebula-badge-lime" style={{ marginBottom: '0.5rem' }}>
                  PUBLIC CREDIBILITY
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
                  Public Organizer URL
                </h3>
                <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                  Your public verified portfolio displays your completed events and operations credibility rating.
                </p>
                <Link
                  to={`/organizers/${profile.slug}`}
                  className="nebula-btn nebula-btn-secondary nebula-btn-sm"
                  target="_blank"
                >
                  View Public Portfolio ↗
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

