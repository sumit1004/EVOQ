import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/platform.css';

export default function OrganizerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const res = await evoqService.getOrganizerDashboard();
        setData(res);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load organizer dashboard.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="platform-page">
          <div className="empty-state">Loading organizer operations center...</div>
        </div>
      </>
    );
  }

  const profile = data?.profile || {};
  const tournaments = data?.tournaments || [];
  const metrics = data?.metrics || {
    totalTournaments: tournaments.length,
    activeTournaments: tournaments.filter((t) => ['REGISTRATION_OPEN', 'ONGOING'].includes(t.status)).length,
    completedTournaments: tournaments.filter((t) => t.status === 'CONCLUDED').length,
    totalParticipants: tournaments.reduce((acc, t) => acc + (t._count?.registrations || 0), 0),
  };

  return (
    <>
      <Navbar />
      <div className="platform-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Organizer Operations Hub</h1>
            <p className="page-subtitle">
              Oversee competitive operations, launch tournaments, and build your verified organizer reputation.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <Link to="/dashboard/tournaments/new" className="evoq-btn evoq-btn-primary">
              + Create Tournament
            </Link>
            <Link to="/dashboard/organizations" className="evoq-btn evoq-btn-secondary">
              Organizations
            </Link>
          </div>
        </div>

        {error && <div className="evoq-card status-danger" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

        {/* Organizer Metrics Row */}
        <div className="grid-cols-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <div className="evoq-card">
            <div className="metric-number">{metrics.totalTournaments || 0}</div>
            <div className="metric-label">Total Tournaments</div>
          </div>
          <div className="evoq-card">
            <div className="metric-number" style={{ color: 'var(--primary)' }}>
              {metrics.activeTournaments || 0}
            </div>
            <div className="metric-label">Active / Registration Open</div>
          </div>
          <div className="evoq-card">
            <div className="metric-number" style={{ color: 'var(--success)' }}>
              {metrics.completedTournaments || 0}
            </div>
            <div className="metric-label">Completed Tournaments</div>
          </div>
          <div className="evoq-card">
            <div className="metric-number">{metrics.totalParticipants || 0}</div>
            <div className="metric-label">Total Competitors Hosted</div>
          </div>
        </div>

        {/* Public Organizer Profile Banner */}
        {profile?.slug && (
          <div className="evoq-card" style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                Public Portfolio URL: /organizers/{profile.slug}
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                Your public verified portfolio displays your completed tournaments and operations credibility metrics.
              </p>
            </div>
            <Link to={`/organizers/${profile.slug}`} className="evoq-btn evoq-btn-secondary" target="_blank">
              View Public Portfolio ↗
            </Link>
          </div>
        )}

        {/* Tournaments Management List */}
        <div className="evoq-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Your Managed Tournaments</h2>
            <Link to="/dashboard/tournaments/new" className="evoq-btn evoq-btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              + New Tournament
            </Link>
          </div>

          {tournaments.length === 0 ? (
            <div className="empty-state">
              <p>You have not created any tournaments yet.</p>
              <Link to="/dashboard/tournaments/new" className="evoq-btn evoq-btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                Launch Your First Tournament
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="evoq-table">
                <thead>
                  <tr>
                    <th>Tournament</th>
                    <th>Game</th>
                    <th>Format</th>
                    <th>Status</th>
                    <th>Registrations</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <strong>{t.title}</strong>
                        {t.organization && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            Org: {t.organization.name}
                          </div>
                        )}
                      </td>
                      <td>{t.game?.name || 'Esports'}</td>
                      <td>{t.format?.replace(/_/g, ' ')}</td>
                      <td>
                        <span
                          className={`evoq-badge ${
                            t.status === 'REGISTRATION_OPEN'
                              ? 'badge-success'
                              : t.status === 'ONGOING'
                              ? 'badge-warning'
                              : t.status === 'CONCLUDED'
                              ? 'badge-secondary'
                              : 'badge-muted'
                          }`}
                        >
                          {t.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        {t._count?.registrations || t.registrations?.length || 0} / {t.maxParticipants}
                      </td>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                          <Link
                            to={`/dashboard/tournaments/${t.id}/manage`}
                            className="evoq-btn evoq-btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          >
                            Manage
                          </Link>
                          <Link
                            to={`/tournaments/${t.slug}`}
                            className="evoq-btn evoq-btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            target="_blank"
                          >
                            Public
                          </Link>
                        </div>
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

