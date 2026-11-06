import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/platform.css';

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
      <div>
        <Navbar />
        <div className="platform-page">Loading team profile...</div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div>
        <Navbar />
        <div className="platform-page" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Team Profile Not Found</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{error}</p>
          <Link to="/teams" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem', width: 'auto' }}>
            Browse Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="platform-page">
        {/* Team Banner & Hero */}
        <div className="profile-hero">
          <div
            className="hero-cover"
            style={{
              backgroundImage: team.coverUrl ? `url(${team.coverUrl})` : undefined,
            }}
          ></div>
          <div className="hero-body">
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <img
                src={
                  team.logoUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=7C5CFC&color=fff&size=200`
                }
                alt={team.name}
                className="hero-avatar"
              />
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{team.name}</h1>
                <p style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  {team.primaryGame?.name || 'Esports Team'} • {team.memberships?.length || 0} Members
                </p>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {team.country && <span>📍 {team.country}</span>}
                  <span>Owner: @{team.owner?.username}</span>
                  {team.captain && <span>Captain: @{team.captain.username}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-cols-2">
          {/* Active Roster */}
          <div className="evoq-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Active Roster</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {team.memberships?.map((m) => {
                const profile = m.user?.gamerProfile;
                return (
                  <div
                    key={m.id}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={
                          profile?.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user.username)}&background=1A2030&color=7C5CFC`
                        }
                        alt={m.user.username}
                        style={{ width: '38px', height: '38px', borderRadius: '50%' }}
                      />
                      <div>
                        {profile?.slug ? (
                          <Link to={`/players/${profile.slug}`} style={{ fontWeight: 700, color: 'var(--text)' }}>
                            {profile.displayName || m.user.username}
                          </Link>
                        ) : (
                          <span style={{ fontWeight: 700 }}>{m.user.username}</span>
                        )}
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                          IGN: {profile?.inGameName || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-verified">{m.role}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Info & Achievements */}
          <div>
            <div className="evoq-card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>About Team</h2>
              <p style={{ color: 'var(--muted)', lineHeight: '1.7' }}>
                {team.description || 'No detailed description available for this team.'}
              </p>
            </div>

            <div className="evoq-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Team Achievements</h2>
              {team.achievements?.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No tournament achievements recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {team.achievements?.map((ach) => (
                    <div key={ach.id} className="achievement-badge" style={{ padding: '0.75rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>🏆</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ach.title}</div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{ach.game?.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

