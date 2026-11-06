import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/platform.css';

export default function TournamentsList() {
  const [tournaments, setTournaments] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');

  useEffect(() => {
    async function loadInitialData() {
      try {
        const gamesData = await evoqService.getGames();
        setGames(gamesData || []);
      } catch (err) {
        console.error('Failed to load games:', err);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedGame) params.gameId = selectedGame;
        if (selectedStatus) params.status = selectedStatus;
        if (selectedFormat) params.format = selectedFormat;

        const res = await evoqService.getTournaments(params);
        setTournaments(res.data || []);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load tournaments.');
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, [search, selectedGame, selectedStatus, selectedFormat]);

  return (
    <>
      <Navbar />
      <div className="platform-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Competitive Tournaments</h1>
            <p className="page-subtitle">
              Compete in verified tournaments. Your match outcomes automatically generate professional career records and achievements.
            </p>
          </div>
          <Link to="/dashboard/tournaments/new" className="evoq-btn evoq-btn-primary">
            + Host a Tournament
          </Link>
        </div>

        {/* Filter controls */}
        <div className="evoq-card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Search Tournament</label>
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="evoq-input"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Game Title</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="evoq-input"
              >
                <option value="">All Games</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="evoq-input"
              >
                <option value="">All Statuses</option>
                <option value="REGISTRATION_OPEN">Registration Open</option>
                <option value="REGISTRATION_CLOSED">Registration Closed</option>
                <option value="ONGOING">Ongoing</option>
                <option value="CONCLUDED">Concluded</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Format</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="evoq-input"
              >
                <option value="">All Formats</option>
                <option value="SINGLE_ELIMINATION">Single Elimination</option>
                <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                <option value="ROUND_ROBIN">Round Robin</option>
                <option value="BATTLE_ROYALE">Battle Royale</option>
              </select>
            </div>
          </div>
        </div>

        {error && <div className="evoq-card status-danger" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

        {loading ? (
          <div className="empty-state">Loading tournaments...</div>
        ) : tournaments.length === 0 ? (
          <div className="empty-state">
            <h3>No tournaments found</h3>
            <p>Try adjusting your search criteria or game filters.</p>
          </div>
        ) : (
          <div className="grid-cards">
            {tournaments.map((t) => (
              <div key={t.id} className="evoq-card">
                {t.bannerUrl ? (
                  <img src={t.bannerUrl} alt={t.title} className="card-banner" />
                ) : (
                  <div
                    style={{
                      height: '140px',
                      background: 'linear-gradient(135deg, #18192a 0%, #11121d 100%)',
                      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                      margin: 'calc(-1 * var(--space-lg)) calc(-1 * var(--space-lg)) var(--space-md) calc(-1 * var(--space-lg))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      fontSize: '1.8rem',
                      fontWeight: '800',
                    }}
                  >
                    {t.game?.name || 'EVOQ'}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', marginBottom: 'var(--space-xs)' }}>
                  <span className="evoq-badge badge-primary">{t.game?.name || 'Game'}</span>
                  <span className="evoq-badge badge-secondary">{t.format?.replace(/_/g, ' ')}</span>
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
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: 'var(--space-xs)' }}>{t.title}</h3>

                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
                  Organized by{' '}
                  <strong style={{ color: 'var(--text)' }}>
                    {t.organization?.name || t.organizer?.organizationName || 'Verified Organizer'}
                  </strong>
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: 'var(--muted)',
                    borderTop: '1px solid var(--border)',
                    paddingTop: 'var(--space-sm)',
                    marginBottom: 'var(--space-md)',
                  }}
                >
                  <span>
                    👥 {t._count?.registrations || t.registrations?.length || 0} / {t.maxParticipants} {t.participationType === 'TEAM' ? 'Teams' : 'Players'}
                  </span>
                  {t.prizePool && (
                    <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                      🏆 {t.prizePool} {t.currency || 'USD'}
                    </span>
                  )}
                </div>

                <Link to={`/tournaments/${t.slug}`} className="evoq-btn evoq-btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                  View Tournament Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

