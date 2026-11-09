import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganizerNavbar from '../../components/OrganizerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function OrganizerTournamentsList() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadTournaments();
  }, []);

  async function loadTournaments() {
    setLoading(true);
    setError('');
    try {
      const data = await evoqService.getOrganizerDashboard();
      setTournaments(data?.tournaments || []);
    } catch (err) {
      setError('Failed to load tournaments.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = statusFilter
    ? tournaments.filter((t) => t.status === statusFilter)
    : tournaments;

  return (
    <div className="nebula-shell">
      <OrganizerNavbar />
      <main className="nebula-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="nebula-badge nebula-badge-cyan" style={{ marginBottom: '0.4rem' }}>
              OPERATIONS CATALOG
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Tournament Roster &amp; Events</h1>
            <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Manage competition brackets, review participant rosters, and enter official results.
            </p>
          </div>
          <Link to="/organizer/tournaments/create" className="nebula-btn nebula-btn-cyan">
            + Launch New Tournament
          </Link>
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}

        {/* Status filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStatusFilter('')}
            className={`nebula-btn nebula-btn-sm ${!statusFilter ? 'nebula-btn-cyan' : 'nebula-btn-ghost'}`}
          >
            All Events ({tournaments.length})
          </button>
          <button
            onClick={() => setStatusFilter('REGISTRATION_OPEN')}
            className={`nebula-btn nebula-btn-sm ${statusFilter === 'REGISTRATION_OPEN' ? 'nebula-btn-cyan' : 'nebula-btn-ghost'}`}
          >
            Registration Open
          </button>
          <button
            onClick={() => setStatusFilter('ONGOING')}
            className={`nebula-btn nebula-btn-sm ${statusFilter === 'ONGOING' ? 'nebula-btn-cyan' : 'nebula-btn-ghost'}`}
          >
            Live / Ongoing
          </button>
          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`nebula-btn nebula-btn-sm ${statusFilter === 'DRAFT' ? 'nebula-btn-cyan' : 'nebula-btn-ghost'}`}
          >
            Drafts
          </button>
          <button
            onClick={() => setStatusFilter('CONCLUDED')}
            className={`nebula-btn nebula-btn-sm ${statusFilter === 'CONCLUDED' ? 'nebula-btn-cyan' : 'nebula-btn-ghost'}`}
          >
            Concluded
          </button>
        </div>

        {loading ? (
          <div className="nebula-empty-state">
            <div className="nebula-empty-icon">—</div>
            <p>Loading tournament list...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="nebula-card nebula-empty-state">
            <div className="nebula-empty-icon">—</div>
            <h3>No Tournaments Matching Filter</h3>
            <p style={{ color: 'var(--nebula-text-secondary)', marginBottom: '1rem' }}>
              Create an event or clear status filter.
            </p>
            <Link to="/organizer/tournaments/create" className="nebula-btn nebula-btn-cyan">
              Create Event
            </Link>
          </div>
        ) : (
          <div className="nebula-table-wrapper">
            <table className="nebula-table">
              <thead>
                <tr>
                  <th>Tournament Title</th>
                  <th>Game</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Registrations</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name || t.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--nebula-text-muted)' }}>
                        /tournaments/{t.slug}
                      </div>
                    </td>
                    <td><span className="nebula-badge nebula-badge-violet">{t.game?.name || 'Esports'}</span></td>
                    <td>{t.format?.replace(/_/g, ' ')}</td>
                    <td>
                      <span
                        className={`nebula-badge ${
                          t.status === 'REGISTRATION_OPEN'
                            ? 'nebula-badge-lime'
                            : t.status === 'ONGOING'
                            ? 'nebula-badge-cyan'
                            : 'nebula-badge-neutral'
                        }`}
                      >
                        {t.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {t._count?.registrations || t.registrations?.length || 0} / {t.maxParticipants} {t.participationType}s
                    </td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link
                          to={`/organizer/tournaments/${t.id}`}
                          className="nebula-btn nebula-btn-cyan nebula-btn-sm"
                        >
                          Control Room 
                        </Link>
                        <Link
                          to={`/tournaments/${t.slug}`}
                          className="nebula-btn nebula-btn-ghost nebula-btn-sm"
                          target="_blank"
                        >
                          Public ↗
                        </Link>
                      </div>
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

