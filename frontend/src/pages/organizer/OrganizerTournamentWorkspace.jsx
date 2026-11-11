import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import OrganizerLayout from '../../layouts/OrganizerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  Modal,
  Input,
  Select,
  Textarea,
  Checkbox,
  PrimaryButton,
  SecondaryButton,
  Badge,
  StatusIndicator,
  Avatar,
  EmptyState,
  SkeletonLoader,
  Tabs,
  DataTable,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function OrganizerTournamentWorkspace() {
  const { id } = useParams();

  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('registrations');

  // Credentials Modal State
  const [activeCredMatch, setActiveCredMatch] = useState(null);
  const [credForm, setCredForm] = useState({
    lobbyName: '',
    password: '',
    serverRegion: '',
    instructions: '',
    isReleased: false,
  });
  const [savingCred, setSavingCred] = useState(false);

  // Result Modal State
  const [activeResultMatch, setActiveResultMatch] = useState(null);
  const [resultForm, setResultForm] = useState({
    p1Score: 0,
    p2Score: 0,
    winnerParticipantId: '',
    notes: '',
  });
  const [savingResult, setSavingResult] = useState(false);

  // Scheduling Modal State
  const [activeScheduleMatch, setActiveScheduleMatch] = useState(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Bracket Generation
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadTournamentData();
  }, [id]);

  async function loadTournamentData() {
    setLoading(true);
    setError('');
    try {
      const data = await evoqService.getTournamentBySlug(id);
      setTournament(data);

      if (data?.id) {
        const [regs, matchData] = await Promise.all([
          evoqService.getRegistrations(data.id),
          evoqService.getMatches(data.id),
        ]);
        setRegistrations(regs || []);
        setMatches(matchData || []);
      }
    } catch (err) {
      setError('Failed to load tournament operations control room.');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (!tournament) return;
    setError('');
    setSuccess('');
    try {
      const updated = await evoqService.updateTournamentStatus(tournament.id, newStatus);
      setTournament((prev) => ({ ...prev, status: updated.status }));
      setSuccess(`Tournament state updated to ${newStatus}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update status.');
    }
  };

  const handleUpdateRegStatus = async (regId, status) => {
    if (!tournament) return;
    setError('');
    setSuccess('');
    try {
      await evoqService.updateRegistrationStatus(tournament.id, regId, { status });
      setSuccess(`Registration marked as ${status}`);
      const freshRegs = await evoqService.getRegistrations(tournament.id);
      setRegistrations(freshRegs || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update registration.');
    }
  };

  const handleGenerateMatches = async () => {
    if (!tournament) return;
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      const res = await evoqService.generateTournamentMatches(tournament.id);
      setSuccess(`Generated ${res?.length || 'official'} bracket fixtures!`);
      const freshMatches = await evoqService.getMatches(tournament.id);
      setMatches(freshMatches || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate bracket fixtures.');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenCredentials = (m) => {
    setActiveCredMatch(m);
    const existing = m.credentials || {};
    setCredForm({
      lobbyName: existing.lobbyName || `EVOQ-M${m.round || 1}-${m.id.slice(-4)}`,
      password: existing.password || Math.random().toString(36).slice(-6).toUpperCase(),
      serverRegion: existing.serverRegion || 'Default Server',
      instructions: existing.customInstructions || '',
      isReleased: existing.isReleased || false,
    });
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!activeCredMatch) return;
    setSavingCred(true);
    try {
      await evoqService.updateMatchCredentials(activeCredMatch.id, {
        lobbyName: credForm.lobbyName,
        password: credForm.password,
        serverRegion: credForm.serverRegion,
        customInstructions: credForm.instructions,
        isReleased: credForm.isReleased,
      });
      setSuccess('Match room credentials updated!');
      setActiveCredMatch(null);
      const freshMatches = await evoqService.getMatches(tournament.id);
      setMatches(freshMatches || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save credentials.');
    } finally {
      setSavingCred(false);
    }
  };

  const handleOpenResult = (m) => {
    setActiveResultMatch(m);
    setResultForm({
      p1Score: m.scoreA || 0,
      p2Score: m.scoreB || 0,
      winnerParticipantId: m.winnerParticipantId || '',
      notes: '',
    });
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!activeResultMatch) return;
    setSavingResult(true);
    try {
      await evoqService.submitMatchResult(activeResultMatch.id, {
        p1Score: Number(resultForm.p1Score),
        p2Score: Number(resultForm.p2Score),
        winnerParticipantId: resultForm.winnerParticipantId || undefined,
        notes: resultForm.notes || undefined,
      });
      setSuccess('Match score and winner recorded!');
      setActiveResultMatch(null);
      const freshMatches = await evoqService.getMatches(tournament.id);
      setMatches(freshMatches || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit result.');
    } finally {
      setSavingResult(false);
    }
  };

  const handleOpenSchedule = (m) => {
    setActiveScheduleMatch(m);
    setScheduleTime(m.scheduledAt ? new Date(m.scheduledAt).toISOString().slice(0, 16) : '');
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!activeScheduleMatch) return;
    setSavingSchedule(true);
    try {
      await evoqService.scheduleMatch(activeScheduleMatch.id, {
        scheduledAt: scheduleTime ? new Date(scheduleTime).toISOString() : undefined,
      });
      setSuccess('Match schedule confirmed!');
      setActiveScheduleMatch(null);
      const freshMatches = await evoqService.getMatches(tournament.id);
      setMatches(freshMatches || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update schedule.');
    } finally {
      setSavingSchedule(false);
    }
  };

  if (loading) {
    return (
      <OrganizerLayout>
        <SkeletonLoader type="card" count={3} height="180px" />
      </OrganizerLayout>
    );
  }

  if (error || !tournament) {
    return (
      <OrganizerLayout>
        <EmptyState
          icon="tournament"
          title="Tournament Workspace Not Found"
          description={error || 'Could not load event control room.'}
          action={
            <Link to="/organizer/tournaments" className="evoq-btn evoq-btn-primary evoq-btn-sm">
              Back to Catalog
            </Link>
          }
        />
      </OrganizerLayout>
    );
  }

  const workspaceTabs = [
    { id: 'registrations', label: 'Registrations', count: registrations.length },
    { id: 'competition', label: 'Competition & Brackets', count: matches.length },
    { id: 'settings', label: 'Tournament Lifecycle' },
  ];

  return (
    <OrganizerLayout
      title={`Workspace: ${tournament.name || tournament.title}`}
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            to={`/tournaments/${tournament.slug || tournament.id}`}
            target="_blank"
            className="evoq-btn evoq-btn-secondary evoq-btn-sm"
          >
            <Icon name="external" size={13} />
            <span>Public Arena</span>
          </Link>
        </div>
      }
    >
      {/* ── Status Banner ── */}
      <div
        className="evoq-card"
        style={{
          marginBottom: '24px',
          borderColor: 'rgba(34, 211, 238, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
            <Badge variant="cyan">{tournament.game?.name || 'Esports'}</Badge>
            <StatusIndicator status={tournament.status} />
            <Badge variant="neutral">{tournament.format?.replace(/_/g, ' ')}</Badge>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--evoq-text-primary)' }}>
            {tournament.name || tournament.title}
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--evoq-text-muted)' }}>
            Slug: /{tournament.slug || tournament.id} • Slots: {registrations.length} / {tournament.maxParticipants || 16}
          </div>
        </div>

        {/* Quick Lifecycle Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tournament.status === 'DRAFT' && (
            <PrimaryButton
              size="sm"
              icon="check"
              onClick={() => handleStatusChange('REGISTRATION_OPEN')}
            >
              Open Registrations
            </PrimaryButton>
          )}
          {tournament.status === 'REGISTRATION_OPEN' && (
            <PrimaryButton
              size="sm"
              icon="matches"
              onClick={() => handleStatusChange('ONGOING')}
            >
              Start Competition (Live)
            </PrimaryButton>
          )}
          {tournament.status === 'ONGOING' && (
            <SecondaryButton
              size="sm"
              variant="secondary"
              onClick={() => handleStatusChange('CONCLUDED')}
            >
              Conclude Event
            </SecondaryButton>
          )}
        </div>
      </div>

      {error && (
        <div className="evoq-alert evoq-alert-danger" role="alert">
          <Icon name="x" size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="evoq-alert evoq-alert-success" role="alert">
          <Icon name="check" size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <Tabs tabs={workspaceTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ── TAB 1: REGISTRATIONS MANAGEMENT ── */}
      {activeTab === 'registrations' && (
        <div className="evoq-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Competitor Entries ({registrations.length})
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--evoq-text-secondary)', margin: '2px 0 0 0' }}>
                Review, approve, or reject rosters before seeding brackets.
              </p>
            </div>

            {registrations.filter((r) => r.status === 'APPROVED').length >= 2 && matches.length === 0 && (
              <PrimaryButton
                size="sm"
                icon="matches"
                disabled={generating}
                loading={generating}
                onClick={handleGenerateMatches}
              >
                {generating ? 'Seeding...' : 'Generate Bracket Matches'}
              </PrimaryButton>
            )}
          </div>

          {registrations.length === 0 ? (
            <EmptyState
              icon="teams"
              title="No Registrations Yet"
              description="Open registration to allow competitive squads and gamers to enter."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  style={{
                    padding: '14px 18px',
                    backgroundColor: 'var(--evoq-surface-elevated)',
                    borderRadius: 'var(--evoq-radius-sm)',
                    border: '1px solid var(--evoq-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar
                      src={reg.team?.logoUrl || reg.user?.avatarUrl}
                      name={reg.team?.name || reg.user?.username}
                      size="md"
                    />
                    <div>
                      <strong style={{ fontSize: '0.98rem', color: 'var(--evoq-text-primary)' }}>
                        {reg.team?.name || reg.user?.username}
                      </strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)' }}>
                        Registered: {new Date(reg.registeredAt || reg.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Badge variant={reg.status === 'APPROVED' ? 'lime' : reg.status === 'REJECTED' ? 'danger' : 'warning'}>
                      {reg.status}
                    </Badge>

                    {reg.status !== 'APPROVED' && (
                      <PrimaryButton
                        size="sm"
                        icon="check"
                        onClick={() => handleUpdateRegStatus(reg.id, 'APPROVED')}
                      >
                        Approve
                      </PrimaryButton>
                    )}
                    {reg.status !== 'REJECTED' && (
                      <SecondaryButton
                        size="sm"
                        variant="danger"
                        icon="x"
                        onClick={() => handleUpdateRegStatus(reg.id, 'REJECTED')}
                      >
                        Reject
                      </SecondaryButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: COMPETITION & BRACKETS ── */}
      {activeTab === 'competition' && (
        <div className="evoq-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Fixtures &amp; Match Operations ({matches.length})
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--evoq-text-secondary)', margin: '2px 0 0 0' }}>
                Schedule match times, release room credentials, and confirm referee scores.
              </p>
            </div>

            <PrimaryButton
              size="sm"
              icon="matches"
              disabled={generating}
              loading={generating}
              onClick={handleGenerateMatches}
            >
              {matches.length > 0 ? 'Regenerate Bracket' : 'Generate Matches'}
            </PrimaryButton>
          </div>

          {matches.length === 0 ? (
            <EmptyState
              icon="matches"
              title="No Fixtures Generated"
              description="Approve at least two competitor registrations, then generate the bracket."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {matches.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '16px 20px',
                    backgroundColor: 'var(--evoq-surface-elevated)',
                    borderRadius: 'var(--evoq-radius-sm)',
                    border: '1px solid var(--evoq-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="evoq-mono-label">{m.roundName || `ROUND ${m.round || 1}`}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StatusIndicator status={m.status} />
                      {m.credentials?.isReleased && (
                        <Badge variant="lime" size="sm">LOBBY RELEASED</Badge>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', backgroundColor: 'var(--evoq-bg)', padding: '12px 16px', borderRadius: 'var(--evoq-radius-sm)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--evoq-text-primary)', flex: 1 }}>
                      {m.teamA?.name || 'Competitor A'}
                    </span>
                    <div style={{ fontFamily: 'var(--evoq-font-display)', fontSize: '1.4rem', color: 'var(--evoq-lime)' }}>
                      {m.scoreA ?? '-'} : {m.scoreB ?? '-'}
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--evoq-text-primary)', flex: 1, textAlign: 'right' }}>
                      {m.teamB?.name || 'Competitor B'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <SecondaryButton
                      size="sm"
                      icon="calendar"
                      onClick={() => handleOpenSchedule(m)}
                    >
                      Schedule
                    </SecondaryButton>
                    <SecondaryButton
                      size="sm"
                      icon="shield"
                      onClick={() => handleOpenCredentials(m)}
                    >
                      Room Credentials
                    </SecondaryButton>
                    <PrimaryButton
                      size="sm"
                      icon="check"
                      onClick={() => handleOpenResult(m)}
                    >
                      Submit Result
                    </PrimaryButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: LIFECYCLE SETTINGS ── */}
      {activeTab === 'settings' && (
        <div className="evoq-card">
          <SectionHeader
            title="Tournament Lifecycle & Operations"
            subtitle="Authoritative state transitions for this event"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--evoq-surface-elevated)', borderRadius: 'var(--evoq-radius-sm)' }}>
              <div>
                <strong>Registration Open</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)' }}>Allow teams and players to enter.</div>
              </div>
              <PrimaryButton
                size="sm"
                disabled={tournament.status === 'REGISTRATION_OPEN'}
                onClick={() => handleStatusChange('REGISTRATION_OPEN')}
              >
                Set Open
              </PrimaryButton>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--evoq-surface-elevated)', borderRadius: 'var(--evoq-radius-sm)' }}>
              <div>
                <strong>Live Competition (Ongoing)</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)' }}>Close registration and orchestrate matches.</div>
              </div>
              <PrimaryButton
                size="sm"
                disabled={tournament.status === 'ONGOING'}
                onClick={() => handleStatusChange('ONGOING')}
              >
                Set Live
              </PrimaryButton>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--evoq-surface-elevated)', borderRadius: 'var(--evoq-radius-sm)' }}>
              <div>
                <strong>Conclude Event</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)' }}>Finalize standings and archive results.</div>
              </div>
              <SecondaryButton
                size="sm"
                disabled={tournament.status === 'CONCLUDED'}
                onClick={() => handleStatusChange('CONCLUDED')}
              >
                Conclude
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}

      {/* ── Credentials Modal ── */}
      <Modal
        isOpen={!!activeCredMatch}
        onClose={() => setActiveCredMatch(null)}
        title="Match Room Credentials"
        subtitle={`Encrypted lobby credentials for Round: ${activeCredMatch?.roundName || activeCredMatch?.round || '1'}`}
        maxWidth="480px"
      >
        <form onSubmit={handleSaveCredentials} noValidate>
          <Input
            label="Lobby / Match Name"
            id="lobbyName"
            value={credForm.lobbyName}
            onChange={(e) => setCredForm((p) => ({ ...p, lobbyName: e.target.value }))}
            required
          />

          <Input
            label="Lobby Password / PIN"
            id="password"
            value={credForm.password}
            onChange={(e) => setCredForm((p) => ({ ...p, password: e.target.value }))}
            required
          />

          <Input
            label="Server Region / Cluster"
            id="serverRegion"
            value={credForm.serverRegion}
            onChange={(e) => setCredForm((p) => ({ ...p, serverRegion: e.target.value }))}
          />

          <Textarea
            label="Referee Instructions"
            id="instructions"
            value={credForm.instructions}
            onChange={(e) => setCredForm((p) => ({ ...p, instructions: e.target.value }))}
            rows={3}
            placeholder="e.g. Join Discord channel #referee-1 for map pick/ban."
          />

          <Checkbox
            label="Release Credentials to Registered Teams"
            description="When checked, players on rosters for this match will see the room code."
            checked={credForm.isReleased}
            onChange={(e) => setCredForm((p) => ({ ...p, isReleased: e.target.checked }))}
          />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton onClick={() => setActiveCredMatch(null)} disabled={savingCred}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={savingCred} loading={savingCred}>
              {savingCred ? 'Saving...' : 'Save Credentials'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ── Results Submission Modal ── */}
      <Modal
        isOpen={!!activeResultMatch}
        onClose={() => setActiveResultMatch(null)}
        title="Authoritative Match Score"
        subtitle="Submit confirmed referee scoreline and match winner"
        maxWidth="460px"
      >
        <form onSubmit={handleSaveResult} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label={activeResultMatch?.teamA?.name || 'Competitor A'}
              type="number"
              min="0"
              value={resultForm.p1Score}
              onChange={(e) => setResultForm((p) => ({ ...p, p1Score: e.target.value }))}
            />
            <Input
              label={activeResultMatch?.teamB?.name || 'Competitor B'}
              type="number"
              min="0"
              value={resultForm.p2Score}
              onChange={(e) => setResultForm((p) => ({ ...p, p2Score: e.target.value }))}
            />
          </div>

          <Textarea
            label="Referee Verification Notes (Optional)"
            id="resultNotes"
            value={resultForm.notes}
            onChange={(e) => setResultForm((p) => ({ ...p, notes: e.target.value }))}
            rows={2}
            placeholder="e.g. Map 1: Haven (13-9). Clean match verified."
          />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton onClick={() => setActiveResultMatch(null)} disabled={savingResult}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={savingResult} loading={savingResult}>
              {savingResult ? 'Submitting...' : 'Confirm Authoritative Result'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ── Scheduling Modal ── */}
      <Modal
        isOpen={!!activeScheduleMatch}
        onClose={() => setActiveScheduleMatch(null)}
        title="Schedule Match Time"
        subtitle="Set official fixture time for competitors and broadcast"
        maxWidth="420px"
      >
        <form onSubmit={handleSaveSchedule} noValidate>
          <Input
            label="Match Date & Time"
            type="datetime-local"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            required
          />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton onClick={() => setActiveScheduleMatch(null)} disabled={savingSchedule}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={savingSchedule} loading={savingSchedule}>
              {savingSchedule ? 'Saving...' : 'Set Schedule'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </OrganizerLayout>
  );
}
