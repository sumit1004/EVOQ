import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/nebula.css';

export default function PublicPlayerProfile() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    evoqService
      .getPublicProfile(slug)
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message || 'Player not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="nebula-shell">
        <PublicNavbar />
        <div className="nebula-container nebula-empty-state">
          <div className="nebula-empty-icon">—</div>
          <p>Loading player portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="nebula-shell">
        <PublicNavbar />
        <div className="nebula-container nebula-empty-state">
          <div className="nebula-empty-icon">—</div>
          <h2>Player Profile Not Found</h2>
          <p style={{ color: 'var(--nebula-text-secondary)', marginTop: '0.5rem' }}>{error}</p>
          <Link to="/tournaments" className="nebula-btn nebula-btn-primary" style={{ marginTop: '1.5rem' }}>
            Browse Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const stats = profile.statistics?.[0] || {
    tournamentsPlayed: profile.careerRecords?.length || 0,
    tournamentsWon: profile.achievements?.filter((a) => a.type === 'CHAMPION' || a.type === 'WINNER').length || 0,
    matchesPlayed: profile.careerRecords?.length || 0,
    matchesWon: profile.careerRecords?.filter((c) => c.placement === 1).length || 0,
  };

  const achievements = profile.achievements || [];
  const careerRecords = profile.careerRecords || [];
  const identities = profile.gameIdentities || [];

  return (
    <div className="nebula-shell">
      <PublicNavbar />
      <main className="nebula-container">
        {/* Player Banner & Hero Card */}
        <div
          className="nebula-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            marginBottom: '2rem',
            border: '1px solid var(--nebula-border)',
          }}
        >
          {profile.bannerUrl ? (
            <img
              src={profile.bannerUrl}
              alt={profile.displayName || profile.inGameName}
              style={{ width: '100%', height: '240px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '180px',
                background: 'linear-gradient(135deg, #1b143d 0%, #0d1222 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '1.5rem',
              }}
            >
              <span className="nebula-badge nebula-badge-violet">VERIFIED PLAYER</span>
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
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.inGameName}
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
                  {profile.inGameName ? profile.inGameName.slice(0, 2).toUpperCase() : 'P'}
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>
                    {profile.displayName || profile.inGameName}
                  </h1>
                  <span className="nebula-badge nebula-badge-lime">VERIFIED ESPORTS ID</span>
                </div>
                <div style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                  <strong>@{profile.user?.username || profile.inGameName}</strong> {profile.country ? `• ${profile.country}` : ''}
                </div>
              </div>
            </div>
          </div>

          {profile.bio && (
            <div style={{ padding: '0 2rem 1.5rem 2rem', color: 'var(--nebula-text-secondary)', lineHeight: '1.6' }}>
              {profile.bio}
            </div>
          )}
        </div>

        {/* Metrics Row */}
        <div className="nebula-grid-metrics">
          <div className="nebula-metric">
            <span className="nebula-metric-label">Tournaments Played</span>
            <span className="nebula-metric-value">{stats.tournamentsPlayed}</span>
          </div>
          <div className="nebula-metric">
            <span className="nebula-metric-label">Trophies / First Place</span>
            <span className="nebula-metric-value" style={{ color: 'var(--nebula-lime)' }}>
              {stats.tournamentsWon}
            </span>
          </div>
          <div className="nebula-metric">
            <span className="nebula-metric-label">Verified Badges</span>
            <span className="nebula-metric-value" style={{ color: 'var(--nebula-cyan)' }}>
              {achievements.length}
            </span>
          </div>
          <div className="nebula-metric">
            <span className="nebula-metric-label">Connected Titles</span>
            <span className="nebula-metric-value">{identities.length}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="nebula-tabs">
          <button
            className={`nebula-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview &amp; Game IDs
          </button>
          <button
            className={`nebula-tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Verified Achievements ({achievements.length})
          </button>
          <button
            className={`nebula-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Career Timeline ({careerRecords.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="nebula-grid-2col">
            <div className="nebula-card">
              <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>
                 Connected Publisher Handles
              </h2>
              {identities.length === 0 ? (
                <p style={{ color: 'var(--nebula-text-secondary)' }}>No public game identities connected.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {identities.map((id) => (
                    <div
                      key={id.id}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--nebula-surface-elevated)',
                        borderRadius: 'var(--nebula-radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--nebula-cyan)', fontWeight: 700 }}>
                          {id.game?.name || 'Title'}
                        </span>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{id.inGameIdentifier || id.inGameName}</div>
                      </div>
                      <span className="nebula-badge nebula-badge-lime">VERIFIED</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="nebula-card">
              <h2 className="nebula-card-title" style={{ marginBottom: '1rem' }}>Player Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--nebula-text-muted)' }}>Player Slug:</span>
                  <code>/players/{profile.slug}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--nebula-text-muted)' }}>Location:</span>
                  <strong>{profile.country || 'Global'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--nebula-text-muted)' }}>Member Since:</span>
                  <strong>{new Date(profile.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="nebula-grid-cards">
            {achievements.length === 0 ? (
              <div className="nebula-card nebula-empty-state" style={{ gridColumn: '1 / -1' }}>
                <p>No verified achievements recorded.</p>
              </div>
            ) : (
              achievements.map((ach) => (
                <div key={ach.id} className="nebula-card" style={{ borderLeft: '4px solid var(--nebula-lime)' }}>
                  <span className="nebula-badge nebula-badge-lime" style={{ marginBottom: '0.5rem' }}>
                    {ach.type}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>{ach.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--nebula-text-muted)' }}>
                    Game: {ach.game?.name || 'Title'} • {new Date(ach.awardedAt || ach.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="nebula-card">
            {careerRecords.length === 0 ? (
              <div className="nebula-empty-state">
                <p>No career events recorded.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {careerRecords.map((cr) => (
                  <div
                    key={cr.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--nebula-surface-elevated)',
                      borderRadius: 'var(--nebula-radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong>{cr.tournament?.name || cr.tournament?.title || 'Tournament Event'}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--nebula-text-muted)' }}>
                        Game: {cr.game?.name || 'Title'} • {new Date(cr.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="nebula-badge nebula-badge-violet">
                      {cr.placement ? `#${cr.placement}` : 'COMPETITOR'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
