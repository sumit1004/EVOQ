import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/nebula.css';

export default function PublicOrganizerProfile() {
  const { slug } = useParams();
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrganizer() {
      setLoading(true);
      setError('');
      try {
        const data = await evoqService.getPublicOrganizer(slug);
        setOrganizer(data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Organizer profile not found.');
      } finally {
        setLoading(false);
      }
    }
    loadOrganizer();
  }, [slug]);

  if (loading) {
    return (
      <div className="nebula-shell">
        <PublicNavbar />
        <div className="nebula-container nebula-empty-state">
          <div className="nebula-empty-icon">—</div>
          <p>Loading organizer credibility profile...</p>
        </div>
      </div>
    );
  }

  if (error || !organizer) {
    return (
      <div className="nebula-shell">
        <PublicNavbar />
        <div className="nebula-container nebula-empty-state">
          <div className="nebula-empty-icon">—</div>
          <h2>Organizer Not Found</h2>
          <p style={{ color: 'var(--nebula-text-secondary)', marginTop: '0.5rem' }}>{error}</p>
          <Link to="/tournaments" className="nebula-btn nebula-btn-cyan" style={{ marginTop: '1.5rem' }}>
            Browse Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const { credibility = organizer.metrics || {}, portfolioRecords = organizer.portfolio || [] } = organizer;

  return (
    <div className="nebula-shell">
      <PublicNavbar />
      <main className="nebula-container">
        {/* Organizer Hero */}
        <div className="nebula-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--nebula-cyan)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--nebula-radius-lg)',
                backgroundColor: 'var(--nebula-cyan)',
                color: '#0B1020',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 900,
              }}
            >
              {organizer.organizationName ? organizer.organizationName.slice(0, 2).toUpperCase() : 'OR'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>
                  {organizer.organizationName || organizer.user?.username || 'Verified Esports Organizer'}
                </h1>
                <span className="nebula-badge nebula-badge-cyan">VERIFIED DIRECTOR</span>
              </div>
              <p style={{ color: 'var(--nebula-text-secondary)', margin: '0.25rem 0 0 0' }}>
                Official Organizer Profile • Member since {new Date(organizer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {organizer.bio && (
            <p style={{ marginTop: '1.25rem', color: 'var(--nebula-text-secondary)', lineHeight: '1.6', margin: '1.25rem 0 0 0' }}>
              {organizer.bio}
            </p>
          )}
        </div>

        {/* Operational Credibility Metrics */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '1rem' }}>
          Operations Credibility &amp; History
        </h2>
        <div className="nebula-grid-metrics">
          <div className="nebula-metric">
            <span className="nebula-metric-label">Completed Tournaments</span>
            <span className="nebula-metric-value" style={{ color: 'var(--nebula-cyan)' }}>
              {credibility.completedTournaments || 0}
            </span>
          </div>
          <div className="nebula-metric">
            <span className="nebula-metric-label">Completed Matches</span>
            <span className="nebula-metric-value">
              {credibility.completedMatches || 0}
            </span>
          </div>
          <div className="nebula-metric">
            <span className="nebula-metric-label">Competitors Hosted</span>
            <span className="nebula-metric-value" style={{ color: 'var(--nebula-violet)' }}>
              {credibility.approvedParticipants || 0}
            </span>
          </div>
          <div className="nebula-metric">
            <span className="nebula-metric-label">Verification Tier</span>
            <span className="nebula-metric-value" style={{ color: 'var(--nebula-lime)', fontSize: '1.4rem' }}>
              {organizer.verificationStatus || 'VERIFIED'}
            </span>
          </div>
        </div>

        {/* Verified Event Portfolio */}
        <div className="nebula-card">
          <div className="nebula-card-header">
            <div>
              <h2 className="nebula-card-title">Verified Event Portfolio</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--nebula-text-muted)' }}>
                Immutable event completion history derived directly from verified match results.
              </div>
            </div>
          </div>

          {portfolioRecords.length === 0 ? (
            <div className="nebula-empty-state">
              <p>No concluded tournament records in portfolio yet.</p>
            </div>
          ) : (
            <div className="nebula-table-wrapper">
              <table className="nebula-table">
                <thead>
                  <tr>
                    <th>Tournament Event</th>
                    <th>Game Title</th>
                    <th>Competitors</th>
                    <th>Matches</th>
                    <th>Completed Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioRecords.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.tournament?.name || item.tournamentTitle || 'Tournament'}</strong>
                      </td>
                      <td><span className="nebula-badge nebula-badge-violet">{item.gameName || 'Esports'}</span></td>
                      <td>{item.participantCount}</td>
                      <td>{item.matchCount}</td>
                      <td>{new Date(item.completedAt || item.createdAt).toLocaleDateString()}</td>
                      <td><span className="nebula-badge nebula-badge-lime">VERIFIED</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
