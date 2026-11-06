import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/nebula.css';

export default function PublicTeamProfile() {
  const { slug } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    evoqService
      .getTeamBySlug(slug)
      .then((data) => setTeam(data))
      .catch((err) => setError(err.message || 'Team not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="nebula-shell">
        <PublicNavbar />
        <div className="nebula-container nebula-empty-state">
          <div className="nebula-empty-icon">⏳</div>
          <p>Loading team profile...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="nebula-shell">
        <PublicNavbar />
        <div className="nebula-container nebula-empty-state">
          <div className="nebula-empty-icon">⚠️</div>
          <h2>Team Not Found</h2>
          <p style={{ color: 'var(--nebula-text-secondary)', marginTop: '0.5rem' }}>{error}</p>
          <Link to="/tournaments" className="nebula-btn nebula-btn-primary" style={{ marginTop: '1.5rem' }}>
            Browse Tournaments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="nebula-shell">
      <PublicNavbar />
      <main className="nebula-container">
        {/* Team Hero */}
        <div
          className="nebula-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            marginBottom: '2rem',
            border: '1px solid var(--nebula-border)',
          }}
        >
          <div
            style={{
              height: '180px',
              background: 'linear-gradient(135deg, #1f143d 0%, #0d1222 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '1.5rem',
            }}
          >
            <span className="nebula-badge nebula-badge-violet">COMPETITIVE SQUAD</span>
          </div>

          <div
            style={{
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: 'var(--nebula-radius-lg)',
                  border: '3px solid var(--nebula-surface-primary)',
                  marginTop: '-42px',
                  backgroundColor: 'var(--nebula-violet)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: '#fff',
                }}
              >
                {team.tag || team.name?.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>{team.name}</h1>
                  <span className="nebula-badge nebula-badge-neutral">[{team.tag || 'TEAM'}]</span>
                </div>
                <div style={{ color: 'var(--nebula-cyan)', fontSize: '0.9rem', marginTop: '0.2rem', fontWeight: 700 }}>
                  {team.game?.name || 'Esports'}
                </div>
              </div>
            </div>
          </div>

          {team.bio && (
            <div style={{ padding: '0 2rem 1.5rem 2rem', color: 'var(--nebula-text-secondary)', lineHeight: '1.6' }}>
              {team.bio}
            </div>
          )}
        </div>

        {/* Content Columns */}
        <div className="nebula-grid-2col">
          {/* Active Roster */}
          <div className="nebula-card">
            <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>
              <span>👥</span> Active Roster Members
            </h2>

            <div className="nebula-table-wrapper">
              <table className="nebula-table">
                <thead>
                  <tr>
                    <th>Gamer</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {team.memberships?.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.gamerProfile?.displayName || m.user?.username || 'Player'}</strong>
                        {m.gamerProfile?.inGameName && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--nebula-text-muted)' }}>
                            IGN: {m.gamerProfile.inGameName}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`nebula-badge ${m.role === 'CAPTAIN' ? 'nebula-badge-violet' : 'nebula-badge-lime'}`}>
                          {m.role}
                        </span>
                      </td>
                      <td>{new Date(m.joinedAt || m.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tournament Participation */}
          <div className="nebula-card">
            <h2 className="nebula-card-title" style={{ marginBottom: '1rem' }}>
              <span>🏆</span> Event Participation
            </h2>
            {team.registrations && team.registrations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {team.registrations.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--nebula-surface-elevated)',
                      borderRadius: 'var(--nebula-radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong>{r.tournament?.name || r.tournament?.title || 'Tournament'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--nebula-text-muted)' }}>
                        Status: {r.status}
                      </div>
                    </div>
                    <span className="nebula-badge nebula-badge-lime">{r.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--nebula-text-secondary)' }}>No tournament participation recorded yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
