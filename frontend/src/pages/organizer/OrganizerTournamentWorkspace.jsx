import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import OrganizerLayout from '../../layouts/OrganizerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  Modal,
  Input,
  Select,
  PrimaryButton,
  SecondaryButton,
  Badge,
  StatusIndicator,
  Avatar,
  EmptyState,
  SkeletonLoader,
  StatCard,
  SectionHeader,
  DataTable,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function OrganizerTournamentWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active Control Center Tab
  const [activeTab, setActiveTab] = useState('overview');

  // Delete Tournament Modal
  const [showDeleteTournamentModal, setShowDeleteTournamentModal] = useState(false);
  const [deletingTournament, setDeletingTournament] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const tourneyData = await evoqService.getTournamentById(id).catch(async () => {
        return evoqService.getTournamentBySlug(id).catch(async () => {
          const list = await evoqService.getTournaments();
          return (list?.tournaments || []).find((t) => t.id === id || t.slug === id);
        });
      });

      if (!tourneyData) {
        throw new Error('Tournament not found or unauthorized.');
      }

      setTournament(tourneyData);

      const regs = await evoqService.getRegistrations(tourneyData.id).catch(() => []);
      setRegistrations(regs || []);
    } catch (err) {
      setError(err.message || 'Failed to synchronize tournament control center.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [id]);

  // Actions
  const handleRegStatus = async (regId, status) => {
    try {
      await evoqService.updateRegistrationStatus(tournament.id, regId, { status });
      setSuccess(`Entrant ${status.toLowerCase()} successfully.`);
      await loadAllData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update registration status.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await evoqService.updateTournamentStatus(tournament.id, newStatus);
      setSuccess(`Tournament transitioned to ${newStatus}.`);
      await loadAllData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update tournament status.');
    }
  };

  const handleDeleteTournament = async (e) => {
    e.preventDefault();
    setDeletingTournament(true);
    setError('');
    try {
      await evoqService.deleteTournament(tournament.id);
      setShowDeleteTournamentModal(false);
      navigate('/organizer/tournaments');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete tournament.');
    } finally {
      setDeletingTournament(false);
    }
  };

  if (loading) {
    return (
      <OrganizerLayout title="Tournament Control Center">
        <SkeletonLoader type="card" count={3} height="200px" />
      </OrganizerLayout>
    );
  }

  if (!tournament) {
    return (
      <OrganizerLayout title="Tournament Not Found">
        <EmptyState
          icon="tournament"
          title="Tournament Not Found"
          description="The requested tournament event could not be retrieved or has been removed."
          action={
            <Link to="/organizer/tournaments" className="evoq-btn evoq-btn-primary evoq-btn-sm">
              <Icon name="arrow-left" size={14} />
              <span>Back to Tournaments</span>
            </Link>
          }
        />
      </OrganizerLayout>
    );
  }

  const approvedRegistrations = registrations.filter((r) => r.status === 'APPROVED');
  const pendingRegistrations = registrations.filter((r) => r.status === 'PENDING');

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'registrations', label: `Registrations (${pendingRegistrations.length})`, icon: 'users' },
    { id: 'participants', label: `Teams (${approvedRegistrations.length})`, icon: 'shield' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <OrganizerLayout
      title={tournament.name}
      actions={
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <StatusIndicator status={tournament.status} />
          <Link
            to={`/tournaments/${tournament.slug || tournament.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="evoq-btn evoq-btn-secondary evoq-btn-sm"
          >
            <Icon name="arrow-right" size={13} />
            <span>Public Arena View</span>
          </Link>
          <Link to="/organizer/tournaments" className="evoq-btn evoq-btn-secondary evoq-btn-sm">
            <Icon name="arrow-left" size={13} />
            <span>All Events</span>
          </Link>
        </div>
      }
    >
      {/* ── Sub-navigation Tabs Bar ── */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--evoq-border)',
          marginBottom: '24px',
          overflowX: 'auto',
          gap: '8px',
        }}
      >
        {navTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setActiveTab(t.id);
              setError('');
              setSuccess('');
            }}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid var(--evoq-lime)' : '2px solid transparent',
              color: activeTab === t.id ? 'var(--evoq-lime)' : 'var(--evoq-text-secondary)',
              fontWeight: activeTab === t.id ? 700 : 500,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <Icon name={t.icon} size={15} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="evoq-alert evoq-alert-danger" role="alert" style={{ marginBottom: '20px' }}>
          <Icon name="x" size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="evoq-alert evoq-alert-success" style={{ marginBottom: '20px' }}>
          <Icon name="check" size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* ── TAB 1: OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <StatCard
              label="Approved Entrants"
              value={`${approvedRegistrations.length}/${tournament.maxParticipants}`}
              subtext="Roster slots occupied"
              icon="teams"
              lime
            />
            <StatCard
              label="Pending Entrants"
              value={pendingRegistrations.length}
              subtext="Awaiting organizer approval"
              icon="users"
            />
            <StatCard
              label="Event Status"
              value={tournament.status}
              subtext={tournament.game?.name || 'Competitive Title'}
              icon="tournament"
            />
            <StatCard
              label="Capacity Limit"
              value={`${tournament.maxParticipants} Max`}
              subtext={`Format: ${tournament.format?.replace(/_/g, ' ')}`}
              icon="trophy"
            />
          </div>

          <div className="evoq-card">
            <SectionHeader
              title="Event Quick Actions"
              subtitle="Execute core tournament lifecycle status transitions"
            />
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {tournament.status === 'DRAFT' && (
                <PrimaryButton onClick={() => handleStatusChange('PUBLISHED')}>
                  Publish Tournament
                </PrimaryButton>
              )}
              {tournament.status === 'PUBLISHED' && (
                <PrimaryButton onClick={() => handleStatusChange('REGISTRATION_OPEN')}>
                  Open Registrations
                </PrimaryButton>
              )}
              {tournament.status === 'REGISTRATION_OPEN' && (
                <SecondaryButton onClick={() => handleStatusChange('REGISTRATION_CLOSED')}>
                  Close Registrations
                </SecondaryButton>
              )}
              {tournament.status === 'REGISTRATION_CLOSED' && (
                <PrimaryButton onClick={() => handleStatusChange('ONGOING')}>
                  Mark as Ongoing
                </PrimaryButton>
              )}
              {tournament.status === 'ONGOING' && (
                <SecondaryButton onClick={() => handleStatusChange('COMPLETED')}>
                  Conclude Tournament
                </SecondaryButton>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: REGISTRATIONS ── */}
      {activeTab === 'registrations' && (
        <div className="evoq-card">
          <SectionHeader
            title="Team & Competitor Registrations"
            subtitle="Approve or decline incoming participant submissions"
          />

          {registrations.length === 0 ? (
            <EmptyState
              icon="users"
              title="No Registrations Received"
              description="When teams and players submit entries from the public tournament arena, they will queue here for validation."
            />
          ) : (
            <DataTable
              columns={[
                {
                  key: 'entrant',
                  header: 'Competitor / Squad',
                  render: (r) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar
                        src={r.team?.logoUrl || r.gamerProfile?.avatarUrl}
                        name={r.team?.name || r.gamerProfile?.displayName || 'Entrant'}
                        size="sm"
                      />
                      <div>
                        <strong style={{ color: 'var(--evoq-text-primary)', display: 'block', fontSize: '0.92rem' }}>
                          {r.team?.name || r.gamerProfile?.displayName}
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)' }}>
                          {r.entrantType === 'TEAM' ? `Squad (${r.members?.length || 0} members)` : 'Solo Player'}
                        </span>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => <StatusIndicator status={r.status} />,
                },
                {
                  key: 'date',
                  header: 'Registered',
                  render: (r) => (
                    <span style={{ fontSize: '0.82rem', color: 'var(--evoq-text-muted)' }}>
                      {new Date(r.registeredAt).toLocaleDateString()}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Decision',
                  render: (r) => (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {r.status === 'PENDING' && (
                        <>
                          <PrimaryButton size="xs" onClick={() => handleRegStatus(r.id, 'APPROVED')}>
                            Approve
                          </PrimaryButton>
                          <SecondaryButton size="xs" onClick={() => handleRegStatus(r.id, 'REJECTED')}>
                            Reject
                          </SecondaryButton>
                          <SecondaryButton size="xs" onClick={() => handleRegStatus(r.id, 'WAITLISTED')}>
                            Waitlist
                          </SecondaryButton>
                        </>
                      )}
                      {r.status === 'WAITLISTED' && (
                        <PrimaryButton size="xs" onClick={() => handleRegStatus(r.id, 'APPROVED')}>
                          Promote to Approved
                        </PrimaryButton>
                      )}
                      {r.status === 'APPROVED' && (
                        <SecondaryButton size="xs" onClick={() => handleRegStatus(r.id, 'WAITLISTED')}>
                          Demote to Waitlist
                        </SecondaryButton>
                      )}
                      {r.status === 'REJECTED' && (
                        <SecondaryButton size="xs" onClick={() => handleRegStatus(r.id, 'PENDING')}>
                          Re-open
                        </SecondaryButton>
                      )}
                    </div>
                  ),
                },
              ]}
              data={registrations}
            />
          )}
        </div>
      )}

      {/* ── TAB 3: PARTICIPANTS ── */}
      {activeTab === 'participants' && (
        <div className="evoq-card">
          <SectionHeader
            title="Confirmed Competitors"
            subtitle={`Official participating lineup (${approvedRegistrations.length}/${tournament.maxParticipants})`}
          />

          {approvedRegistrations.length === 0 ? (
            <EmptyState
              icon="shield"
              title="No Confirmed Participants"
              description="Approve incoming registrations to confirm official competitors."
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {approvedRegistrations.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--evoq-surface-elevated)',
                    border: '1px solid var(--evoq-border)',
                    borderRadius: 'var(--evoq-radius-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Avatar
                      src={r.team?.logoUrl || r.gamerProfile?.avatarUrl}
                      name={r.team?.name || r.gamerProfile?.displayName}
                      size="md"
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--evoq-lime)', fontFamily: 'var(--evoq-font-mono)' }}>
                          #{i + 1}
                        </span>
                        <strong style={{ fontSize: '0.98rem', color: 'var(--evoq-text-primary)' }}>
                          {r.team?.name || r.gamerProfile?.displayName}
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)' }}>
                        {r.entrantType === 'TEAM' ? 'Competitive Squad' : 'Soloist'}
                      </span>
                    </div>
                  </div>

                  {r.members && r.members.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--evoq-border-subtle)', paddingTop: '10px' }}>
                      <span className="evoq-mono-label" style={{ fontSize: '0.68rem', display: 'block', marginBottom: '6px' }}>
                        ROSTER LINEUP ({r.members.length})
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {r.members.map((m) => (
                          <div
                            key={m.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.78rem',
                              color: 'var(--evoq-text-secondary)',
                            }}
                          >
                            <span>{m.gamerProfile?.displayName || 'Player'}</span>
                            <span style={{ color: 'var(--evoq-lime)', fontFamily: 'var(--evoq-font-mono)' }}>
                              {m.inGameName || m.gamerProfile?.inGameName || 'IGN Verified'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: SETTINGS ── */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="evoq-card">
            <SectionHeader
              title="Tournament Lifecycle & Controls"
              subtitle="Manage operational lifecycle states"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '400px' }}>
              <Select
                label="Tournament Status"
                id="tournamentStatus"
                value={tournament.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="REGISTRATION_OPEN">REGISTRATION_OPEN</option>
                <option value="REGISTRATION_CLOSED">REGISTRATION_CLOSED</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </Select>
            </div>
          </div>

          {/* Danger Zone: Delete Tournament */}
          <div
            className="evoq-card"
            style={{
              borderColor: 'rgba(255, 107, 107, 0.4)',
              backgroundColor: 'rgba(255, 107, 107, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b6b', fontWeight: 700, marginBottom: '6px' }}>
              <Icon name="trash" size={18} />
              <span style={{ fontSize: '1.05rem' }}>Danger Zone: Delete Tournament</span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--evoq-text-secondary)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Permanently delete this tournament and erase all stages, rounds, groups, match lobby credentials, participants, and official results. This action cannot be reversed.
            </p>
            <PrimaryButton
              variant="danger"
              icon="trash"
              onClick={() => setShowDeleteTournamentModal(true)}
            >
              Permanently Delete Tournament
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE TOURNAMENT ── */}
      <Modal
        isOpen={showDeleteTournamentModal}
        onClose={() => setShowDeleteTournamentModal(false)}
        title={`Delete Tournament: ${tournament?.name}`}
        subtitle="Permanent destruction of tournament and all associated participant entries"
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
                Are you sure you want to delete <strong>{tournament?.name}</strong>? All registrations, participants, and event records will be permanently removed.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton onClick={() => setShowDeleteTournamentModal(false)} disabled={deletingTournament}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" variant="danger" icon="trash" loading={deletingTournament} disabled={deletingTournament}>
              {deletingTournament ? 'Deleting...' : 'Permanently Delete Tournament'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </OrganizerLayout>
  );
}
