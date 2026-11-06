import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GamerNavbar from '../../components/GamerNavbar.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export function GamerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGamerData() {
      setLoading(true);
      setError('');
      try {
        const [profData, myTeams, tourns] = await Promise.all([
          evoqService.getMyProfile().catch(() => null),
          evoqService.getMyTeams().catch(() => []),
          evoqService.getTournaments({ pageSize: 4 }).catch(() => ({ tournaments: [] })),
        ]);
        setProfile(profData);
        setTeams(myTeams || []);
        setTournaments(tourns?.tournaments || tourns?.data || []);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    loadGamerData();
  }, []);

  const achievements = profile?.achievements || [];
  const careerRecords = profile?.careerRecords || [];
  const stats = profile?.statistics || [];
  const identities = profile?.gameIdentities || [];

  return (
    <div className="nebula-shell">
      <GamerNavbar />
      <main className="nebula-container">
        {/* Gamer Hero Header */}
        <div
          className="nebula-card"
          style={{
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, var(--nebula-surface-primary) 0%, var(--nebula-surface-secondary) 100%)',
            borderLeft: '4px solid var(--nebula-violet)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={user?.username}
                  style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--nebula-violet)' }}
                />
              ) : (
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--nebula-violet)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 900,
                  }}
                >
                  {user?.username ? user.username.slice(0, 2).toUpperCase() : 'G'}
                </div>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>
                    {profile?.displayName || user?.username}
                  </h1>
                  <span className="nebula-badge nebula-badge-violet">COMPETITOR</span>
                  {user?.emailVerified && (
                    <span className="nebula-badge nebula-badge-lime">✔ VERIFIED</span>
                  )}
                </div>
                <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                  Gamer Tag: <strong>@{user?.username}</strong> {profile?.country ? `• 🌍 ${profile.country}` : ''}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/gamer/profile" className="nebula-btn nebula-btn-secondary nebula-btn-sm">
                View Player Card
              </Link>
              <Link to="/gamer/profile/edit" className="nebula-btn nebula-btn-primary nebula-btn-sm">
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Profile completeness progress */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--nebula-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--nebula-text-secondary)', fontWeight: 600 }}>Esports Profile Completeness</span>
              <span style={{ color: 'var(--nebula-violet)', fontWeight: 800 }}>{profile?.completeness || 20}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--nebula-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${profile?.completeness || 20}%`,
                  height: '100%',
                  backgroundColor: 'var(--nebula-violet)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}

        {/* Metrics Bar */}
        <div className="nebula-grid-metrics">
          <div className="nebula-metric">
            <span className="nebula-metric-label">My Teams</span>
            <span className="nebula-metric-value">{teams.length}</span>
            <span className="nebula-metric-subtext">Active competitive rosters</span>
          </div>
          <div className="nebula-metric">
            <span className="nebula-metric-label">Verified Trophies</span>
            <span className="nebula-metric-value" style={{ color: 'var(--nebula-lime)' }}>
              {achievements.length}
            </span>
            <span className="nebula-metric-subtext">Immutable match achievements</span>
          </div>
          <div className="nebula-metric">
            <span className="nebula-metric-label">Game Identities</span>
            <span className="nebula-metric-value" style={{ color: 'var(--nebula-cyan)' }}>
              {identities.length}
            </span>
            <span className="nebula-metric-subtext">Linked publisher accounts</span>
          </div>
          <div className="nebula-metric">
            <span className="nebula-metric-label">Career Entries</span>
            <span className="nebula-metric-value">
              {careerRecords.length}
            </span>
            <span className="nebula-metric-subtext">Official event outcomes</span>
          </div>
        </div>

        {/* 2-Column Content */}
        <div className="nebula-grid-2col">
          {/* Left Column: Tournaments & Achievements */}
          <div>
            {/* Featured Competitive Tournaments */}
            <div className="nebula-card" style={{ marginBottom: '1.5rem' }}>
              <div className="nebula-card-header">
                <h2 className="nebula-card-title">
                  <span>🏆</span> Active &amp; Upcoming Tournaments
                </h2>
                <Link to="/gamer/tournaments" style={{ fontSize: '0.85rem', color: 'var(--nebula-violet)', fontWeight: 700 }}>
                  Browse All →
                </Link>
              </div>

              {tournaments.length === 0 ? (
                <div className="nebula-empty-state">
                  <div className="nebula-empty-icon">🎮</div>
                  <p>No active tournaments open right now.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {tournaments.map((t) => (
                    <Link
                      key={t.id}
                      to={`/gamer/tournaments/${t.slug}`}
                      className="nebula-card-clickable"
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--nebula-surface-elevated)',
                        borderRadius: 'var(--nebula-radius-md)',
                        border: '1px solid var(--nebula-border)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem' }}>
                            <span className="nebula-badge nebula-badge-violet">{t.game?.name || 'Esports'}</span>
                            <span className="nebula-badge nebula-badge-neutral">{t.format?.replace(/_/g, ' ')}</span>
                          </div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{t.name || t.title}</h3>
                          <div style={{ fontSize: '0.8rem', color: 'var(--nebula-text-muted)' }}>
                            Max: {t.maxParticipants} {t.participationType}s
                          </div>
                        </div>
                        <span className="nebula-badge nebula-badge-lime">{t.status?.replace(/_/g, ' ')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Verified Achievements Showcase */}
            <div className="nebula-card">
              <div className="nebula-card-header">
                <h2 className="nebula-card-title">
                  <span>🎖️</span> Verified Achievement Cabinet
                </h2>
                <Link to="/gamer/achievements" style={{ fontSize: '0.85rem', color: 'var(--nebula-lime)', fontWeight: 700 }}>
                  View All ({achievements.length}) →
                </Link>
              </div>

              {achievements.length === 0 ? (
                <div className="nebula-empty-state" style={{ padding: '2rem 1rem' }}>
                  <p style={{ margin: 0 }}>Compete in approved tournaments to earn verified permanent achievements.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {achievements.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      style={{
                        backgroundColor: 'var(--nebula-surface-elevated)',
                        border: '1px solid rgba(163, 230, 53, 0.3)',
                        borderRadius: 'var(--nebula-radius-md)',
                        padding: '0.85rem',
                      }}
                    >
                      <span className="nebula-badge nebula-badge-lime" style={{ marginBottom: '0.4rem' }}>
                        {a.type || 'ACHIEVEMENT'}
                      </span>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--nebula-text-muted)', marginTop: '0.25rem' }}>
                        {a.game?.name || 'Tournament Trophy'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Teams & Game Accounts */}
          <div>
            {/* My Competitive Teams */}
            <div className="nebula-card" style={{ marginBottom: '1.5rem' }}>
              <div className="nebula-card-header">
                <h2 className="nebula-card-title">
                  <span>🛡️</span> My Teams
                </h2>
                <Link to="/gamer/teams" style={{ fontSize: '0.85rem', color: 'var(--nebula-violet)', fontWeight: 700 }}>
                  Manage →
                </Link>
              </div>

              {teams.length === 0 ? (
                <div className="nebula-empty-state" style={{ padding: '1.5rem' }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>You are not on an active team roster.</p>
                  <Link to="/gamer/teams" className="nebula-btn nebula-btn-secondary nebula-btn-sm">
                    Create or Join Team
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {teams.map((t) => {
                    const teamObj = t.team || t;
                    const role = t.role || 'MEMBER';
                    return (
                      <div
                        key={teamObj.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem',
                          backgroundColor: 'var(--nebula-surface-elevated)',
                          borderRadius: 'var(--nebula-radius-sm)',
                          border: '1px solid var(--nebula-border)',
                        }}
                      >
                        <div>
                          <strong>{teamObj.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--nebula-text-muted)' }}>
                            Tag: [{teamObj.tag || 'TEAM'}]
                          </div>
                        </div>
                        <span className="nebula-badge nebula-badge-violet">{role}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Game Identities */}
            <div className="nebula-card">
              <div className="nebula-card-header">
                <h2 className="nebula-card-title">
                  <span>🎮</span> Game Identities
                </h2>
                <Link to="/gamer/profile/edit" style={{ fontSize: '0.85rem', color: 'var(--nebula-cyan)', fontWeight: 700 }}>
                  + Connect
                </Link>
              </div>

              {identities.length === 0 ? (
                <div className="nebula-empty-state" style={{ padding: '1.5rem' }}>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 0.75rem 0' }}>
                    Connect Riot ID, Steam, or Epic Games to participate in title-specific brackets.
                  </p>
                  <Link to="/gamer/profile/edit" className="nebula-btn nebula-btn-cyan nebula-btn-sm">
                    Link Game Handle
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {identities.map((id) => (
                    <div
                      key={id.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--nebula-surface-elevated)',
                        borderRadius: 'var(--nebula-radius-sm)',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--nebula-cyan)', fontWeight: 700 }}>
                          {id.game?.name || 'Game'}
                        </span>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{id.inGameIdentifier || id.inGameName}</div>
                      </div>
                      {id.isVerified && (
                        <span className="nebula-badge nebula-badge-lime" style={{ fontSize: '0.65rem' }}>
                          VERIFIED
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GamerDashboard;

