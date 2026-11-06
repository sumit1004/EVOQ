import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GamerNavbar from '../../components/GamerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function GamerTournaments() {
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
    async function loadGames() {
      try {
        const gamesList = await evoqService.getGames();
        setGames(gamesList || []);
      } catch (err) {
        console.error('Failed to load games:', err);
      }
    }
    loadGames();
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
        setTournaments(res.tournaments || res.data || []);
      } catch (err) {
        setError('Failed to load competitive tournaments.');
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, [search, selectedGame, selectedStatus, selectedFormat]);

  return (
    <div className="nebula-shell">
      <GamerNavbar />
      <main className="nebula-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="nebula-badge nebula-badge-violet" style={{ marginBottom: '0.4rem' }}>
              ESPORTS ARENA
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Tournament Discovery</h1>
            <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Compete in verified tournaments. Match outcomes automatically build your gamer career history and achievements.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="nebula-card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="nebula-label">Search Event</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title..."
                className="nebula-input"
              />
            </div>

            <div>
              <label className="nebula-label">Game Title</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="nebula-select"
              >
                <option value="">All Esports Titles</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="nebula-label">Registration Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="nebula-select"
              >
                <option value="">All Statuses</option>
                <option value="REGISTRATION_OPEN">Registration Open</option>
                <option value="ONGOING">Live / Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="nebula-label">Bracket Format</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="nebula-select"
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

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}

        {loading ? (
          <div className="nebula-empty-state">
            <div className="nebula-empty-icon">⏳</div>
            <p>Loading tournaments...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="nebula-card nebula-empty-state">
            <div className="nebula-empty-icon">🎮</div>
            <h3>No Tournaments Found</h3>
            <p style={{ color: 'var(--nebula-text-secondary)' }}>Try adjusting your search criteria or game filters.</p>
          </div>
        ) : (
          <div className="nebula-grid-cards">
            {tournaments.map((t) => (
              <div key={t.id} className="nebula-card" style={{ display: 'flex', flexDirection: 'column' }}>
                {t.bannerUrl ? (
                  <img
                    src={t.bannerUrl}
                    alt={t.name || t.title}
                    style={{
                      height: '140px',
                      width: 'calc(100% + 3rem)',
                      margin: '-1.5rem -1.5rem 1rem -1.5rem',
                      objectFit: 'cover',
                      borderBottom: '1px solid var(--nebula-border)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '110px',
                      width: 'calc(100% + 3rem)',
                      margin: '-1.5rem -1.5rem 1rem -1.5rem',
                      background: 'linear-gradient(135deg, #18192a 0%, #11121d 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--nebula-violet)',
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      borderBottom: '1px solid var(--nebula-border)',
                    }}
                  >
                    {t.game?.name || 'EVOQ'}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span className="nebula-badge nebula-badge-violet">{t.game?.name || 'Game'}</span>
                  <span className="nebula-badge nebula-badge-neutral">{t.format?.replace(/_/g, ' ')}</span>
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
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                  {t.name || t.title}
                </h2>

                <p style={{ color: 'var(--nebula-text-muted)', fontSize: '0.82rem', margin: '0 0 1rem 0' }}>
                  Organized by{' '}
                  <strong style={{ color: 'var(--nebula-text-primary)' }}>
                    {t.organization?.name || t.organizerUser?.username || 'Verified Organizer'}
                  </strong>
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    color: 'var(--nebula-text-secondary)',
                    borderTop: '1px solid var(--nebula-border)',
                    paddingTop: '0.75rem',
                    marginTop: 'auto',
                    marginBottom: '1rem',
                  }}
                >
                  <span>
                    👥 {t._count?.registrations || t.registrations?.length || 0} / {t.maxParticipants} {t.participationType}s
                  </span>
                  {t.prizePool && (
                    <span style={{ color: 'var(--nebula-lime)', fontWeight: 700 }}>
                      🏆 {t.prizePool} {t.prizeCurrency || 'USD'}
                    </span>
                  )}
                </div>

                <Link
                  to={`/gamer/tournaments/${t.slug}`}
                  className="nebula-btn nebula-btn-primary"
                  style={{ width: '100%' }}
                >
                  View Tournament →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

