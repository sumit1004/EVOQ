import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganizerLayout from '../../layouts/OrganizerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  Modal,
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
  const [activeTournamentForDelete, setActiveTournamentForDelete] = useState(null);
  const [deletingTournament, setDeletingTournament] = useState(false);
  const [success, setSuccess] = useState('');

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

  const handleDeleteTournament = async (e) => {
    e.preventDefault();
    if (!activeTournamentForDelete) return;
    setDeletingTournament(true);
    setError('');
    setSuccess('');
    try {
      await evoqService.deleteTournament(activeTournamentForDelete.id);
      setSuccess(`Tournament "${activeTournamentForDelete.name}" deleted successfully.`);
      setActiveTournamentForDelete(null);
      await loadTournaments();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete tournament.');
    } finally {
      setDeletingTournament(false);
    }
  };

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
            to={`/organizer/tournaments/${row.id || row.slug}`}
            style={{ fontWeight: 700, color: 'var(--evoq-text-primary)', textDecoration: 'none' }}
          >
            {row.name || row.title}
          </Link>
          <div style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)' }}>
            Slug: /{row.slug}
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
          <button
            type="button"
            className="evoq-btn evoq-btn-danger evoq-btn-sm"
            onClick={() => setActiveTournamentForDelete(row)}
            title="Delete Tournament"
          >
            <Icon name="trash" size={13} />
          </button>
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
        <div className="evoq-alert evoq-alert-danger" role="alert" style={{ marginBottom: '16px' }}>
          <Icon name="x" size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="evoq-alert evoq-alert-success" role="alert" style={{ marginBottom: '16px' }}>
          <Icon name="check" size={16} />
          <span>{success}</span>
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

      {/* ── DELETE TOURNAMENT MODAL ── */}
      <Modal
        isOpen={!!activeTournamentForDelete}
        onClose={() => setActiveTournamentForDelete(null)}
        title={`Delete Tournament: ${activeTournamentForDelete?.name}`}
        subtitle="Permanent destruction of tournament, matches, stages and entries"
        maxWidth="440px"
      >
        <form onSubmit={handleDeleteTournament} noValidate>
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(255, 107, 107, 0.08)',
                border: '1px solid rgba(255, 107, 107, 0.25)',
                borderRadius: 'var(--evoq-radius-sm)',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b6b', fontWeight: 700, marginBottom: '6px' }}>
                <Icon name="trash" size={16} />
                <span>Permanent Destruction</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--evoq-text-secondary)', lineHeight: 1.4 }}>
                Are you sure you want to delete <strong>{activeTournamentForDelete?.name}</strong>? All stages, rounds, groups, matches, room credentials, and results will be permanently removed.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton onClick={() => setActiveTournamentForDelete(null)} disabled={deletingTournament}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" variant="danger" icon="trash" loading={deletingTournament} disabled={deletingTournament}>
              {deletingTournament ? 'Deleting...' : 'Delete Tournament'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </OrganizerLayout>
  );
}
