import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/platform.css';

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
      <>
        <Navbar />
        <div className="platform-page">
          <div className="empty-state">Loading organizer profile...</div>
        </div>
      </>
    );
  }

  if (error || !organizer) {
    return (
      <>
        <Navbar />
        <div className="platform-page">
          <div className="empty-state">
            <h2>Organizer Not Found</h2>
            <p>{error || 'The requested organizer could not be found.'}</p>
            <Link to="/tournaments" className="evoq-btn evoq-btn-primary" style={{ marginTop: 'var(--space-md)' }}>
              Browse Tournaments
            </Link>
          </div>
        </div>
      </>
    );
  }

  const { metrics = {}, portfolio = [] } = organizer;

  return (
    <>
      <Navbar />
      <div className="platform-page">
        {/* Organizer Hero Header */}
        <div className="evoq-card" style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#fff',
              }}
            >
              {organizer.organizationName ? organizer.organizationName.slice(0, 2).toUpperCase() : 'OR'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
                  {organizer.organizationName || organizer.user?.username || 'Esports Organizer'}
                </h1>
                {organizer.isVerified && (
                  <span className="evoq-badge badge-primary">✔ Verified Organizer</span>
                )}
                {organizer.tier && (
                  <span className="evoq-badge badge-secondary">{organizer.tier} TIER</span>
                )}
              </div>
              <p style={{ color: 'var(--muted)', marginTop: 'var(--space-xs)' }}>
                Organizer Profile • {organizer.yearsOfExperience || 1}+ Years Operations Experience
              </p>
            </div>
          </div>

          {organizer.bio && (
            <p style={{ marginTop: 'var(--space-md)', color: 'var(--text)', lineHeight: '1.6' }}>
              {organizer.bio}
            </p>
          )}
        </div>

        {/* Credibility & Operations Metrics */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>
          Operations Credibility & History
        </h2>
        <div className="grid-cols-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <div className="evoq-card">
            <div className="metric-number">{metrics.completedTournaments || 0}</div>
            <div className="metric-label">Completed Tournaments</div>
          </div>
          <div className="evoq-card">
            <div className="metric-number">{metrics.completedMatches || 0}</div>
            <div className="metric-label">Completed Matches</div>
          </div>
          <div className="evoq-card">
            <div className="metric-number">{metrics.totalParticipants || 0}</div>
            <div className="metric-label">Players / Teams Hosted</div>
          </div>
          <div className="evoq-card">
            <div className="metric-number" style={{ color: 'var(--success)' }}>
              {metrics.completionRate !== undefined ? `${metrics.completionRate}%` : '100%'}
            </div>
            <div className="metric-label">Event Completion Rate</div>
          </div>
        </div>

        {/* Verified Portfolio Records */}
        <div className="evoq-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Verified Event Portfolio</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                Cryptographically verifiable event completion history derived directly from competitive match results.
              </p>
            </div>
          </div>

          {portfolio.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No completed tournament records in portfolio yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="evoq-table">
                <thead>
                  <tr>
                    <th>Tournament</th>
                    <th>Game</th>
                    <th>Participants</th>
                    <th>Matches Held</th>
                    <th>Completed Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.tournament?.title || item.tournamentTitle || 'Tournament'}</strong>
                      </td>
                      <td>{item.game?.name || item.gameName || '—'}</td>
                      <td>{item.participantCount}</td>
                      <td>{item.matchCount}</td>
                      <td>{new Date(item.completedAt || item.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className="evoq-badge badge-primary">✔ VERIFIED</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

