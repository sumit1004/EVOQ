import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GamerNavbar from '../../components/GamerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function GamerMatches() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      setError('');
      try {
        const prof = await evoqService.getMyProfile();
        setProfile(prof);
      } catch (err) {
        setError('Failed to load match history.');
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  const careerRecords = profile?.careerRecords || [];

  return (
    <div className="nebula-shell">
      <GamerNavbar />
      <main className="nebula-container">
        <div style={{ marginBottom: '2rem' }}>
          <span className="nebula-badge nebula-badge-violet" style={{ marginBottom: '0.4rem' }}>
            FIXTURES &amp; OUTCOMES
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Competitive Matches</h1>
          <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Track your official tournament matches, scheduled lobbies, and verified results.
          </p>
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}

        {loading ? (
          <div className="nebula-empty-state">
            <div className="nebula-empty-icon">⏳</div>
            <p>Loading matches...</p>
          </div>
        ) : careerRecords.length === 0 ? (
          <div className="nebula-card nebula-empty-state">
            <div className="nebula-empty-icon">⚔️</div>
            <h3>No Competitive Matches Recorded</h3>
            <p style={{ color: 'var(--nebula-text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              Register for an open tournament to play competitive fixtures. Match outcomes appear here automatically.
            </p>
            <Link to="/gamer/tournaments" className="nebula-btn nebula-btn-primary">
              Explore Active Tournaments
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {careerRecords.map((item) => (
              <div key={item.id} className="nebula-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="nebula-badge nebula-badge-violet">{item.game?.name || 'Esports'}</span>
                    <span className="nebula-badge nebula-badge-neutral">{item.placement ? `Rank #${item.placement}` : 'COMPETITOR'}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                    {item.tournament?.name || item.tournament?.title || 'Competitive Match'}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--nebula-text-muted)' }}>
                    Recorded on {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span className="nebula-badge nebula-badge-lime">✔ RECORDED</span>
                  {item.tournament?.slug && (
                    <Link to={`/gamer/tournaments/${item.tournament.slug}`} className="nebula-btn nebula-btn-secondary nebula-btn-sm">
                      Tournament View
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

