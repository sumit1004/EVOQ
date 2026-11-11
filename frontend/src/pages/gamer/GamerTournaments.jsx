import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GamerLayout from '../../layouts/GamerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  TournamentCard,
  SearchInput,
  Select,
  FilterPanel,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
  PrimaryButton,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

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
        setError('Failed to load competitive tournaments from the EVOQ network.');
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, [search, selectedGame, selectedStatus, selectedFormat]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGame('');
    setSelectedStatus('');
    setSelectedFormat('');
  };

  const isFiltered = Boolean(search || selectedGame || selectedStatus || selectedFormat);

  return (
    <GamerLayout
      title="Tournament Discovery"
      actions={
        <Link to="/tournaments" className="evoq-btn evoq-btn-secondary evoq-btn-sm">
          <Icon name="external" size={14} />
          <span>Public Directory</span>
        </Link>
      }
    >
      {error && (
        <div className="evoq-alert evoq-alert-danger" role="alert">
          <Icon name="x" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Search & Filter Controls ── */}
      <FilterPanel
        isFiltered={isFiltered}
        onReset={handleResetFilters}
        totalResults={tournaments.length}
      >
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search by event title..."
        />

        <Select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          placeholder="All Esports Titles"
        >
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>

        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          placeholder="All Event Statuses"
        >
          <option value="REGISTRATION_OPEN">Registration Open</option>
          <option value="IN_PROGRESS">Live Competition</option>
          <option value="COMPLETED">Completed</option>
        </Select>

        <Select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          placeholder="All Tournament Formats"
        >
          <option value="SINGLE_ELIMINATION">Single Elimination</option>
          <option value="DOUBLE_ELIMINATION">Double Elimination</option>
          <option value="ROUND_ROBIN">Round Robin</option>
          <option value="SWISS">Swiss Format</option>
        </Select>
      </FilterPanel>

      {/* ── Tournament Cards Grid ── */}
      {loading ? (
        <SkeletonLoader type="card" count={4} height="240px" />
      ) : tournaments.length === 0 ? (
        <EmptyState
          icon="tournament"
          title="No Tournaments Match Criteria"
          description="Try broadening your game title or status filter to see open events."
          action={
            isFiltered ? (
              <PrimaryButton onClick={handleResetFilters} size="sm">
                Clear Filters
              </PrimaryButton>
            ) : null
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '20px',
          }}
        >
          {tournaments.map((t) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              linkPrefix="/gamer/tournaments"
            />
          ))}
        </div>
      )}
    </GamerLayout>
  );
}
