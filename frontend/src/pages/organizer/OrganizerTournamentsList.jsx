import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganizerLayout from '../../layouts/OrganizerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  PrimaryButton,
  SecondaryButton,
  Badge,
  StatusIndicator,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
  DataTable,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

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
      setError('Failed to load tournament operations roster.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = statusFilter
    ? tournaments.filter((t) => t.status === statusFilter)
    : tournaments;

  const columns = [
    {
      key: 'name',
      header: 'Tournament Name',
      render: (_, row) => (
        <div>
          <Link
            to={`/organizer/tournaments/${row.slug || row.id}`}
            style={{ fontWeight: 700, color: 'var(--evoq-text-primary)', textDecoration: 'none' }}
          >
            {row.name || row.title}
          </Link>
          <div style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)' }}>
            Slug: /{row.slug || row.id}
          </div>
        </div>
      ),
    },
    {
      key: 'game',
      header: 'Game Title',
      render: (_, row) => (
        <Badge variant="cyan" size="sm">{row.game?.name || 'Esports'}</Badge>
      ),
    },
    {
      key: 'format',
      header: 'Format',
      render: (val) => val ? val.replace(/_/g, ' ') : 'Single Elimination',
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusIndicator status={val} />,
    },
    {
      key: 'registrations',
      header: 'Entries',
      render: (_, row) => (
        <span>
          {row._count?.registrations || row.registrations?.length || 0} / {row.maxParticipants || 16}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Link
            to={`/organizer/tournaments/${row.slug || row.id}`}
            className="evoq-btn evoq-btn-primary evoq-btn-sm"
          >
            Manage
          </Link>
          <Link
            to={`/tournaments/${row.slug || row.id}`}
            target="_blank"
            className="evoq-btn evoq-btn-secondary evoq-btn-sm"
            title="Public View"
          >
            <Icon name="external" size={13} />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <OrganizerLayout
      title="Tournament Management"
      actions={
        <Link to="/organizer/tournaments/create" className="evoq-btn evoq-btn-primary evoq-btn-sm">
          <Icon name="plus" size={14} />
          <span>Launch Tournament</span>
        </Link>
      }
    >
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', margin: 0 }}>
          Manage tournament brackets, review competitor rosters, release lobby credentials, and finalize official rankings.
        </p>
      </div>

      {error && (
        <div className="evoq-alert evoq-alert-danger" role="alert">
          <Icon name="x" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Status Filters Bar ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setStatusFilter('')}
          className={`evoq-tab-item ${!statusFilter ? 'active' : ''}`}
        >
          All Events ({tournaments.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('REGISTRATION_OPEN')}
          className={`evoq-tab-item ${statusFilter === 'REGISTRATION_OPEN' ? 'active' : ''}`}
        >
          Registration Open
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('ONGOING')}
          className={`evoq-tab-item ${statusFilter === 'ONGOING' ? 'active' : ''}`}
        >
          Live / Ongoing
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('DRAFT')}
          className={`evoq-tab-item ${statusFilter === 'DRAFT' ? 'active' : ''}`}
        >
          Drafts
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('CONCLUDED')}
          className={`evoq-tab-item ${statusFilter === 'CONCLUDED' ? 'active' : ''}`}
        >
          Concluded
        </button>
      </div>

      {loading ? (
        <SkeletonLoader type="table-row" count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="tournament"
          title="No Tournaments In This State"
          description="Create a new competitive event or adjust status filters."
          action={
            <Link to="/organizer/tournaments/create" className="evoq-btn evoq-btn-primary evoq-btn-sm">
              <Icon name="plus" size={14} />
              <span>Create Tournament</span>
            </Link>
          }
        />
      ) : (
        <div className="evoq-card" style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable
            columns={columns}
            data={filtered}
            keyField="id"
          />
        </div>
      )}
    </OrganizerLayout>
  );
}
