import { useState, useEffect } from 'react';
import GamerNavbar from '../../components/GamerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function GamerStatistics() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError('');
      try {
        const prof = await evoqService.getMyProfile();
        setProfile(prof);
      } catch (err) {
        setError('Failed to load player statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const stats = profile?.statistics || [];

  return (
    <div className="nebula-shell">
      <GamerNavbar />
      <main className="nebula-container">
        <div style={{ marginBottom: '2rem' }}>
          <span className="nebula-badge nebula-badge-cyan" style={{ marginBottom: '0.4rem' }}>
            PERFORMANCE METRICS
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Career Statistics</h1>
          <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Aggregated win rates, match counts, and differentials computed directly from approved referee scores.
          </p>
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}

        {loading ? (
          <div className="nebula-empty-state">
            <div className="nebula-empty-icon">—</div>
            <p>Loading performance statistics...</p>
          </div>
        ) : stats.length === 0 ? (
          <div className="nebula-card nebula-empty-state">
            <div className="nebula-empty-icon"></div>
            <h3>No Official Match Statistics Yet</h3>
            <p style={{ color: 'var(--nebula-text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              Statistics are generated as matches conclude in tournaments. Play your first competitive match to begin compiling your stats.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {stats.map((st) => {
              const total = (st.matchesWon || 0) + (st.matchesLost || 0);
              const winRate = total > 0 ? Math.round((st.matchesWon / total) * 100) : 0;

              return (
                <div key={st.id} className="nebula-card">
                  <div className="nebula-card-header">
                    <h2 className="nebula-card-title">
                       {st.game?.name || 'Competitive Title'}
                    </h2>
                    <span className="nebula-badge nebula-badge-cyan">{winRate}% WIN RATE</span>
                  </div>

                  <div className="nebula-grid-metrics" style={{ margin: 0 }}>
                    <div className="nebula-metric">
                      <span className="nebula-metric-label">Matches Won</span>
                      <span className="nebula-metric-value" style={{ color: 'var(--nebula-lime)' }}>
                        {st.matchesWon || 0}
                      </span>
                    </div>
                    <div className="nebula-metric">
                      <span className="nebula-metric-label">Matches Lost</span>
                      <span className="nebula-metric-value" style={{ color: 'var(--nebula-coral)' }}>
                        {st.matchesLost || 0}
                      </span>
                    </div>
                    <div className="nebula-metric">
                      <span className="nebula-metric-label">Total Fixtures</span>
                      <span className="nebula-metric-value">
                        {total}
                      </span>
                    </div>
                    <div className="nebula-metric">
                      <span className="nebula-metric-label">Score / Differential</span>
                      <span className="nebula-metric-value" style={{ color: 'var(--nebula-violet)' }}>
                        {st.differential || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

