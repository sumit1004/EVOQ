import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GamerNavbar from '../../components/GamerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function GamerAchievements() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAchievements() {
      setLoading(true);
      setError('');
      try {
        const prof = await evoqService.getMyProfile();
        setProfile(prof);
      } catch (err) {
        setError('Failed to load achievements.');
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  const achievements = profile?.achievements || [];

  return (
    <div className="nebula-shell">
      <GamerNavbar />
      <main className="nebula-container">
        <div style={{ marginBottom: '2rem' }}>
          <span className="nebula-badge nebula-badge-lime" style={{ marginBottom: '0.4rem' }}>
            VERIFIED PROOF &amp; RECOGNITION
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Gamer Achievements &amp; Trophies</h1>
          <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Every tournament result approved by referees produces an immutable, cryptographically verifiable achievement on your record.
          </p>
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}

        {loading ? (
          <div className="nebula-empty-state">
            <div className="nebula-empty-icon">⏳</div>
            <p>Loading trophy cabinet...</p>
          </div>
        ) : achievements.length === 0 ? (
          <div className="nebula-card nebula-empty-state">
            <div className="nebula-empty-icon">🏆</div>
            <h3>No Verified Achievements Yet</h3>
            <p style={{ color: 'var(--nebula-text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              Compete in EVOQ verified tournaments. Podium finishes and championship runs generate permanent credentials on your public player profile.
            </p>
            <Link to="/gamer/tournaments" className="nebula-btn nebula-btn-primary">
              Find Tournaments to Compete
            </Link>
          </div>
        ) : (
          <div className="nebula-grid-cards">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="nebula-card"
                style={{
                  borderTop: '4px solid var(--nebula-lime)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="nebula-badge nebula-badge-lime">{ach.type || 'ACHIEVEMENT'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--nebula-text-muted)' }}>
                      {new Date(ach.awardedAt || ach.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 0.4rem 0' }}>{ach.title}</h3>

                  <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.88rem', margin: '0 0 1rem 0' }}>
                    Game Title: <strong style={{ color: 'var(--nebula-cyan)' }}>{ach.game?.name || 'Competitive Title'}</strong>
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--nebula-surface-elevated)',
                    padding: '0.75rem',
                    borderRadius: 'var(--nebula-radius-sm)',
                    fontSize: '0.75rem',
                    color: 'var(--nebula-text-muted)',
                    border: '1px solid var(--nebula-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span>PROOF STATUS:</span>
                    <strong style={{ color: 'var(--nebula-lime)' }}>VERIFIED &amp; IMMUTABLE</strong>
                  </div>
                  <div>HASH ID: <code>{ach.id.slice(0, 18)}...</code></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

