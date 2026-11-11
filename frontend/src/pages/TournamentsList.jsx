import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import { evoqService } from '../services/evoq.service.js';
import {
  PrimaryButton,
  SecondaryButton,
  SearchInput,
  Select,
  TournamentCard,
  EmptyState,
  SkeletonLoader,
  PageHeader,
  Badge,
} from '../components/ui/index.js';
import { Icon } from '../components/Icons.jsx';

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
        setTournaments(res?.tournaments || res?.data || []);
      } catch (err) {
        setError('Failed to load tournaments catalog.');
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, [search, selectedGame, selectedStatus, selectedFormat]);

  const hasActiveFilters = Boolean(search || selectedGame || selectedStatus || selectedFormat);

  const resetFilters = () => {
    setSearch('');
    setSelectedGame('');
    setSelectedStatus('');
    setSelectedFormat('');
  };

  return (
    <PublicLayout>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <PageHeader
          badge="ESPORTS DISCOVERY"
          title="ACTIVE TOURNAMENTS &amp; CIRCUITS"
          subtitle="Explore official esports tournaments. Approved match results permanently contribute to gamer career records and verified achievements."
          actions={
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <PrimaryButton as={Link} to="/gamer/login" icon="sword">
                Compete
              </PrimaryButton>
              <SecondaryButton as={Link} to="/organizer/login">
                Host Tournament
              </SecondaryButton>
            </div>
          }
        />

        {/* Filter Controls Bar */}
        <div
          className="evoq-panel"
          style={{
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'flex-end',
          }}
        >
          <SearchInput
            label="Search Tournament"
            placeholder="Search by title, brand, or circuit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />

          <Select
            label="Game Title"
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            options={[
              { value: '', label: 'All Esports Titles' },
              ...games.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />

          <Select
            label="Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'REGISTRATION_OPEN', label: 'Registration Open' },
              { value: 'ONGOING', label: 'Live / In Progress' },
              { value: 'COMPLETED', label: 'Concluded' },
            ]}
          />

          <Select
            label="Format"
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            options={[
              { value: '', label: 'All Bracket Formats' },
              { value: 'SINGLE_ELIMINATION', label: 'Single Elimination' },
              { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination' },
              { value: 'ROUND_ROBIN', label: 'Round Robin' },
              { value: 'BATTLE_ROYALE', label: 'Battle Royale' },
            ]}
          />
        </div>

        {error && (
          <div className="evoq-alert evoq-alert-danger" role="alert">
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <SkeletonLoader height={320} />
            <SkeletonLoader height={320} />
            <SkeletonLoader height={320} />
          </div>
        ) : tournaments.length === 0 ? (
          <EmptyState
            icon="tournament"
            title="No Tournaments Match Your Search"
            description="Adjust your search criteria, reset status filters, or browse other competitive game titles."
            actionLabel={hasActiveFilters ? 'Reset Filters' : undefined}
            onAction={hasActiveFilters ? resetFilters : undefined}
          />
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span className="evoq-mono-label">
                SHOWING {tournaments.length} SANCTIONED {tournaments.length === 1 ? 'TOURNAMENT' : 'TOURNAMENTS'}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--evoq-accent)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Clear all filters
                </button>
              )}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {tournaments.map((t) => (
                <TournamentCard key={t.id} tournament={t} linkPrefix="/tournaments" />
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
