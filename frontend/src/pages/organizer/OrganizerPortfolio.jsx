import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganizerNavbar from '../../components/OrganizerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function OrganizerPortfolio() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPortfolio() {
      setLoading(true);
      setError('');
      try {
        const prof = await evoqService.getMyOrganizerProfile();
        setProfile(prof);
      } catch (err) {
        setError('Failed to load organizer portfolio.');
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  const portfolio = profile?.portfolioRecords || [];

  return (
    <div className="nebula-shell">
      <OrganizerNavbar />
      <main className="nebula-container">
        <div style={{ marginBottom: '2rem' }}>
          <span className="nebula-badge nebula-badge-cyan" style={{ marginBottom: '0.4rem' }}>
            OPERATIONS CREDIBILITY
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Verified Event Portfolio</h1>
          <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Permanent operational record of concluded tournaments, verified competitor counts, and completed fixtures.
          </p>
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}

        {loading ? (
          <div className="nebula-empty-state">
            <div className="nebula-empty-icon">—</div>
            <p>Loading verified event records...</p>
          </div>
        ) : portfolio.length === 0 ? (
          <div className="nebula-card nebula-empty-state">
            <div className="nebula-empty-icon">—</div>
            <h3>No Concluded Tournaments in Portfolio Yet</h3>
            <p style={{ color: 'var(--nebula-text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
              When you conclude a live tournament and finalize bracket results, the event is permanently verified into your organizer credentials.
            </p>
            <Link to="/organizer/tournaments" className="nebula-btn nebula-btn-cyan">
              View Tournaments
            </Link>
          </div>
        ) : (
          <div className="nebula-table-wrapper">
            <table className="nebula-table">
              <thead>
                <tr>
                  <th>Tournament Event</th>
                  <th>Game</th>
                  <th>Competitors Hosted</th>
                  <th>Completed Matches</th>
                  <th>Concluded Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.tournament?.name || item.tournament?.title || item.tournamentTitle || 'Tournament'}</strong>
                    </td>
                    <td><span className="nebula-badge nebula-badge-violet">{item.gameName || 'Esports'}</span></td>
                    <td>{item.participantCount}</td>
                    <td>{item.matchCount}</td>
                    <td>{new Date(item.completedAt || item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className="nebula-badge nebula-badge-lime">VERIFIED EVENT</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

