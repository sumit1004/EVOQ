import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/platform.css';

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
      <div>
        <Navbar />
        <div className="platform-page">Loading player portfolio...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div>
        <Navbar />
        <div className="platform-page" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Player Profile Not Found</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{error}</p>
          <Link to="/tournaments" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem', width: 'auto' }}>
            Browse Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const stats = profile.statistics?.[0] || {
    tournamentsPlayed: profile.careerRecords?.length || 0,
    tournamentsWon: profile.achievements?.filter((a) => a.type === 'WINNER').length || 0,
    podiumFinishes: profile.achievements?.filter((a) => ['WINNER', 'RUNNER_UP', 'TOP_4'].includes(a.type)).length || 0,
    matchesPlayed: profile.careerRecords?.reduce((acc, c) => acc + (c.matchesPlayed || 0), 0) || 0,
    matchesWon: profile.careerRecords?.reduce((acc, c) => acc + (c.matchesWon || 0), 0) || 0,
  };

  const winRate = stats.matchesPlayed > 0 ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) : 0;

  return (
    <div>
      <Navbar />
      <div className="platform-page">
        {/* Profile Hero */}
        <div className="profile-hero">
          <div
            className="hero-cover"
            style={{
              backgroundImage: profile.coverUrl ? `url(${profile.coverUrl})` : undefined,
            }}
          ></div>
          <div className="hero-body">
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <img
                src={
                  profile.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=1A2030&color=7C5CFC&size=200`
                }
                alt={profile.displayName}
                className="hero-avatar"
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{profile.displayName}</h1>
                  <span className="badge badge-verified">VERIFIED PRO</span>
                </div>
                <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1.1rem' }}>
                  @{profile.inGameName || profile.user?.username}
                </p>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {profile.country && <span>📍 {profile.country}</span>}
                  <span>🎮 {profile.gamerType}</span>
                  <span>🏆 {profile.achievements?.length || 0} Verified Achievements</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {profile.socialLinks && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {profile.socialLinks.twitter && (
                  <span className="pill-btn">𝕏 {profile.socialLinks.twitter}</span>
                )}
                {profile.socialLinks.discord && (
                  <span className="pill-btn">💬 {profile.socialLinks.discord}</span>
                )}
                {profile.socialLinks.twitch && (
                  <span className="pill-btn">📺 {profile.socialLinks.twitch}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="evoq-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview &amp; Stats
          </button>
          <button
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Verified Achievements ({profile.achievements?.length || 0})
          </button>
          <button
            className={`tab-btn ${activeTab === 'career' ? 'active' : ''}`}
            onClick={() => setActiveTab('career')}
          >
            Career History ({profile.careerRecords?.length || 0})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div>
            {/* Stat Cards */}
            <div className="grid-cards" style={{ marginBottom: 'var(--space-xl)' }}>
              <div className="stat-card">
                <span className="stat-label">Tournaments Played</span>
                <p className="stat-value">{stats.tournamentsPlayed}</p>
              </div>
              <div className="stat-card">
                <span className="stat-label">Championships Won</span>
                <p className="stat-value" style={{ color: 'var(--primary)' }}>
                  {stats.tournamentsWon}
                </p>
              </div>
              <div className="stat-card">
                <span className="stat-label">Podium Finishes</span>
                <p className="stat-value" style={{ color: 'var(--success)' }}>
                  {stats.podiumFinishes}
                </p>
              </div>
              <div className="stat-card">
                <span className="stat-label">Match Win Rate</span>
                <p className="stat-value">{winRate}%</p>
              </div>
            </div>

            <div className="grid-cols-2">
              {/* Bio & Details */}
              <div className="evoq-card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Biography</h3>
                <p style={{ color: 'var(--muted)', lineHeight: '1.7' }}>
                  {profile.bio || 'This competitive gamer has not provided a biography yet.'}
                </p>
              </div>

              {/* Game Identities */}
              <div className="evoq-card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Active Competitive Titles</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {profile.gameIdentities?.map((gi) => (
                    <div
                      key={gi.id}
                      style={{
                        backgroundColor: 'var(--surface-raised)',
                        border: '1px solid var(--border)',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{gi.game?.name}</div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          IGN: <strong style={{ color: 'var(--text)' }}>{gi.inGameName}</strong>
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {gi.serverRegion && <span className="pill-btn">{gi.serverRegion}</span>}
                        {gi.competitiveRole && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                            {gi.competitiveRole}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Verified Achievements */}
        {activeTab === 'achievements' && (
          <div>
            {profile.achievements?.length === 0 ? (
              <div className="evoq-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--muted)' }}>No verified achievements awarded yet.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                  Achievements are automatically awarded upon approved tournament completions.
                </p>
              </div>
            ) : (
              <div className="grid-cols-2">
                {profile.achievements?.map((ach) => (
                  <div key={ach.id} className="achievement-badge">
                    <div
                      className={`achievement-icon ${
                        ach.type === 'WINNER' ? 'winner' : ach.type === 'RUNNER_UP' ? 'runner_up' : ''
                      }`}
                    >
                      {ach.type === 'WINNER' ? '🥇' : ach.type === 'RUNNER_UP' ? '🥈' : '🏆'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{ach.title}</h4>
                        <span className="badge badge-verified">EVOQ VERIFIED</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px' }}>
                        {ach.game?.name} • Awarded on {new Date(ach.awardedAt).toLocaleDateString()}
                      </p>
                      {ach.tournament && (
                        <Link
                          to={`/tournaments/${ach.tournament.slug}`}
                          style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '4px', display: 'inline-block' }}
                        >
                          View Tournament Record →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Career History */}
        {activeTab === 'career' && (
          <div className="evoq-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Tournament Career History</h3>
            {profile.careerRecords?.length === 0 ? (
              <p style={{ color: 'var(--muted)', padding: '1rem 0' }}>No historical tournament records.</p>
            ) : (
              <table className="evoq-table">
                <thead>
                  <tr>
                    <th>Tournament</th>
                    <th>Game</th>
                    <th>Team Represented</th>
                    <th>Placement</th>
                    <th>Match Record</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.careerRecords?.map((cr) => (
                    <tr key={cr.id}>
                      <td>
                        <Link to={`/tournaments/${cr.tournament.slug}`} style={{ fontWeight: 600 }}>
                          {cr.tournament.name}
                        </Link>
                      </td>
                      <td>{cr.game?.name}</td>
                      <td>{cr.teamName || 'Solo Competitor'}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: cr.finalPlacement === 1 ? 'var(--primary)' : 'inherit' }}>
                          {cr.finalPlacement ? `#${cr.finalPlacement}` : 'Competed'}
                        </span>
                      </td>
                      <td>
                        {cr.matchesWon}W - {cr.matchesPlayed - cr.matchesWon}L
                      </td>
                      <td>
                        <span className="badge badge-verified">VERIFIED</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

