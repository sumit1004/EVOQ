import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GamerNavbar from '../../components/GamerNavbar.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function GamerProfileView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError('');
      try {
        const [profData, myTeams] = await Promise.all([
          evoqService.getMyProfile(),
          evoqService.getMyTeams().catch(() => []),
        ]);
        setProfile(profData);
        setTeams(myTeams || []);
      } catch (err) {
        setError('Failed to load gamer profile.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const achievements = profile?.achievements || [];
  const careerRecords = profile?.careerRecords || [];
  const statistics = profile?.statistics || [];
  const identities = profile?.gameIdentities || [];

  return (
    <div className="nebula-shell">
      <GamerNavbar />
      <main className="nebula-container">
        {loading ? (
          <div className="nebula-empty-state">
            <div className="nebula-empty-icon">—</div>
            <p>Loading player card...</p>
          </div>
        ) : error ? (
          <div className="nebula-alert nebula-alert-danger">{error}</div>
        ) : (
          <div>
            {/* Player Card Hero */}
            <div
              className="nebula-card"
              style={{
                padding: 0,
                overflow: 'hidden',
                marginBottom: '2rem',
                border: '1px solid var(--nebula-border)',
              }}
            >
              {profile?.bannerUrl ? (
                <img
                  src={profile.bannerUrl}
                  alt={user?.username}
                  style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '180px',
                    background: 'linear-gradient(135deg, #1f143d 0%, #0d1222 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '1.5rem',
                  }}
                >
                  <span className="nebula-badge nebula-badge-violet" style={{ fontSize: '0.85rem' }}>
                    OFFICIAL ESPORTS IDENTITY
                  </span>
                </div>
              )}

              <div
                style={{
                  padding: '1.5rem 2rem 2rem 2rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={user?.username}
                      style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: 'var(--nebula-radius-lg)',
                        border: '3px solid var(--nebula-surface-primary)',
                        marginTop: '-48px',
                        backgroundColor: 'var(--nebula-surface-elevated)',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: 'var(--nebula-radius-lg)',
                        border: '3px solid var(--nebula-surface-primary)',
                        marginTop: '-48px',
                        backgroundColor: 'var(--nebula-violet)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        color: '#fff',
                      }}
                    >
                      {user?.username ? user.username.slice(0, 2).toUpperCase() : 'G'}
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>
                        {profile?.displayName || user?.username}
                      </h1>
                      <span className="nebula-badge nebula-badge-violet">PLAYER</span>
                      {user?.emailVerified && (
                        <span className="nebula-badge nebula-badge-lime">VERIFIED ID</span>
                      )}
                    </div>
                    <div style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                      <strong>@{user?.username}</strong> {profile?.country ? `• ${profile.country}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {profile?.slug && (
                    <Link
                      to={`/players/${profile.slug}`}
                      className="nebula-btn nebula-btn-secondary"
                      target="_blank"
                    >
                      Public Profile ↗
                    </Link>
                  )}
                  <Link to="/gamer/profile/edit" className="nebula-btn nebula-btn-primary">
                    Edit Player Card
                  </Link>
                </div>
              </div>

              {profile?.bio && (
                <div style={{ padding: '0 2rem 1.5rem 2rem', color: 'var(--nebula-text-secondary)', lineHeight: '1.6' }}>
                  {profile.bio}
                </div>
              )}
            </div>

            {/* Content 2-Column Grid */}
            <div className="nebula-grid-2col">
              {/* Left Column: Trophies & Match Career */}
              <div>
                {/* Verified Achievements */}
                <div className="nebula-card" style={{ marginBottom: '1.5rem' }}>
                  <div className="nebula-card-header">
                    <h2 className="nebula-card-title">
                       Verified Achievements &amp; Trophies
                    </h2>
                    <span className="nebula-badge nebula-badge-lime">{achievements.length} Verified</span>
                  </div>

                  {achievements.length === 0 ? (
                    <div className="nebula-empty-state" style={{ padding: '2rem' }}>
                      <p>No verified achievements yet. Top placements in tournaments will appear here automatically.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {achievements.map((a) => (
                        <div
                          key={a.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: 'var(--nebula-surface-elevated)',
                            borderRadius: 'var(--nebula-radius-md)',
                            borderLeft: '4px solid var(--nebula-lime)',
                          }}
                        >
                          <div>
                            <span className="nebula-badge nebula-badge-lime" style={{ marginBottom: '0.3rem' }}>
                              {a.type}
                            </span>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{a.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--nebula-text-muted)', marginTop: '0.2rem' }}>
                              Game: {a.game?.name || 'Esports'} • Awarded: {new Date(a.awardedAt || a.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className="nebula-badge nebula-badge-neutral">CRYPTO PROOF</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Career Timeline */}
                <div className="nebula-card">
                  <div className="nebula-card-header">
                    <h2 className="nebula-card-title">
                       Career Timeline &amp; Events
                    </h2>
                  </div>

                  {careerRecords.length === 0 ? (
                    <div className="nebula-empty-state" style={{ padding: '2rem' }}>
                      <p>No tournament participation history recorded yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {careerRecords.map((rec) => (
                        <div
                          key={rec.id}
                          style={{
                            padding: '1rem',
                            backgroundColor: 'var(--nebula-surface-elevated)',
                            borderRadius: 'var(--nebula-radius-md)',
                            border: '1px solid var(--nebula-border)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '1rem' }}>{rec.tournament?.name || rec.tournament?.title || 'Tournament'}</strong>
                            <span className="nebula-badge nebula-badge-violet">{rec.placement ? `#${rec.placement}` : 'COMPETITOR'}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--nebula-text-muted)', marginTop: '0.35rem' }}>
                            Game: {rec.game?.name || 'Title'} • {new Date(rec.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Game Identities & Teams */}
              <div>
                {/* Connected Game Identities */}
                <div className="nebula-card" style={{ marginBottom: '1.5rem' }}>
                  <div className="nebula-card-header">
                    <h2 className="nebula-card-title">
                       Connected Game IDs
                    </h2>
                    <Link to="/gamer/profile/edit" style={{ fontSize: '0.85rem', color: 'var(--nebula-cyan)', fontWeight: 700 }}>
                      Manage
                    </Link>
                  </div>

                  {identities.length === 0 ? (
                    <div className="nebula-empty-state" style={{ padding: '1.5rem' }}>
                      <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>Link your Riot ID, Steam ID, or Epic account.</p>
                      <Link to="/gamer/profile/edit" className="nebula-btn nebula-btn-cyan nebula-btn-sm">
                        + Add Game ID
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {identities.map((id) => (
                        <div
                          key={id.id}
                          style={{
                            padding: '0.85rem',
                            backgroundColor: 'var(--nebula-surface-elevated)',
                            borderRadius: 'var(--nebula-radius-md)',
                            border: '1px solid var(--nebula-border)',
                          }}
                        >
                          <div style={{ fontSize: '0.8rem', color: 'var(--nebula-cyan)', fontWeight: 700 }}>
                            {id.game?.name || 'Game Title'}
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', margin: '0.2rem 0' }}>
                            {id.inGameIdentifier || id.inGameName}
                          </div>
                          {id.region && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--nebula-text-muted)' }}>
                              Region: {id.region}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Teams */}
                <div className="nebula-card">
                  <div className="nebula-card-header">
                    <h2 className="nebula-card-title">
                       Active Team Rosters
                    </h2>
                    <Link to="/gamer/teams" style={{ fontSize: '0.85rem', color: 'var(--nebula-violet)', fontWeight: 700 }}>
                      All Teams →
                    </Link>
                  </div>

                  {teams.length === 0 ? (
                    <div className="nebula-empty-state" style={{ padding: '1.5rem' }}>
                      <p style={{ fontSize: '0.85rem' }}>Not assigned to an active team.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {teams.map((t) => {
                        const teamObj = t.team || t;
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
                            }}
                          >
                            <div>
                              <strong>{teamObj.name}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--nebula-text-muted)' }}>
                                [{teamObj.tag || 'TEAM'}]
                              </div>
                            </div>
                            <span className="nebula-badge nebula-badge-violet">{t.role || 'PLAYER'}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

