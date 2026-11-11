import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import OrganizerLayout from '../../layouts/OrganizerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  Modal,
  Input,
  Select,
  Textarea,
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

  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [stages, setStages] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active Control Center Tab
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  // 1. Credentials Modal
  const [activeCredMatch, setActiveCredMatch] = useState(null);
  const [credForm, setCredForm] = useState({
    roomId: '',
    roomPassword: '',
    lobbyDetails: '',
    accessInstructions: '',
    isReleased: false,
  });
  const [savingCred, setSavingCred] = useState(false);

  // 2. Reschedule Match Modal
  const [activeScheduleMatch, setActiveScheduleMatch] = useState(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleLobby, setScheduleLobby] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  // 3. Result Entry / Correction Modal
  const [activeResultMatch, setActiveResultMatch] = useState(null);
  const [resultMode, setResultMode] = useState('SUBMIT'); // 'SUBMIT' | 'CORRECT'
  const [activeResultId, setActiveResultId] = useState(null);
  const [brResults, setBrResults] = useState([]);
  const [h2hScores, setH2hScores] = useState({ p1Score: 0, p2Score: 0 });
  const [correctionReason, setCorrectionReason] = useState('');
  const [savingResult, setSavingResult] = useState(false);

  // 4. Generate Structure Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  // 5. Advance Stage Modal
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceCount, setAdvanceCount] = useState(6);
  const [advancing, setAdvancing] = useState(false);

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

      const [regs, matchData, stageData, standingsData] = await Promise.all([
        evoqService.getRegistrations(tourneyData.id).catch(() => []),
        evoqService.getMatches(tourneyData.id).catch(() => []),
        evoqService.getStages(tourneyData.id).catch(() => []),
        evoqService.getStandings(tourneyData.id).catch(() => ({ rows: [] })),
      ]);

      setRegistrations(regs || []);
      setMatches(matchData || []);
      setStages(stageData || []);
      setStandings(standingsData?.rows || []);
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

  const handleGenerateMatches = async () => {
    setGenerating(true);
    setError('');
    try {
      await evoqService.generateMatches(tournament.id);
      setSuccess('Tournament matches and bracket structure generated!');
      setShowGenerateModal(false);
      await loadAllData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate matches.');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenCheckIn = async (matchId) => {
    try {
      await evoqService.openMatchCheckIn(matchId);
      setSuccess('Check-in window opened. Participants notified.');
      await loadAllData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to open check-in.');
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!activeScheduleMatch) return;
    setSavingSchedule(true);
    try {
      await evoqService.scheduleMatch(activeScheduleMatch.id, {
        scheduledTime: scheduleTime ? new Date(scheduleTime).toISOString() : null,
        lobbyInfo: scheduleLobby || null,
      });
      setSuccess('Match schedule saved.');
      setActiveScheduleMatch(null);
      await loadAllData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to reschedule match.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleOpenCredentials = async (match) => {
    setActiveCredMatch(match);
    try {
      const cred = await evoqService.getMatchCredentials(match.id).catch(() => null);
      if (cred) {
        setCredForm({
          roomId: cred.roomId || '',
          roomPassword: cred.roomPassword || '',
          lobbyDetails: cred.lobbyDetails || '',
          accessInstructions: cred.accessInstructions || '',
          isReleased: Boolean(cred.isReleased),
        });
      } else {
        setCredForm({
          roomId: '',
          roomPassword: '',
          lobbyDetails: '',
          accessInstructions: '',
          isReleased: false,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!activeCredMatch) return;
    setSavingCred(true);
    try {
      await evoqService.setMatchCredentials(activeCredMatch.id, credForm);
      setSuccess('Room credentials updated successfully.');
      setActiveCredMatch(null);
      await loadAllData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to configure credentials.');
    } finally {
      setSavingCred(false);
    }
  };

  const handleRevokeCredentials = async (matchId) => {
    if (!window.confirm('Are you sure you want to revoke room credentials?')) return;
    try {
      await evoqService.revokeMatchCredentials(matchId);
      setSuccess('Room credentials revoked.');
      setActiveCredMatch(null);
      await loadAllData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to revoke credentials.');
    }
  };

  const handleOpenResultEntry = (match, mode = 'SUBMIT', resultId = null) => {
    setActiveResultMatch(match);
    setResultMode(mode);
    setActiveResultId(resultId || match.result?.id);
    setCorrectionReason('');

    const isBR = match.matchData?.engine === 'BATTLE_ROYALE' || tournament.format === 'BATTLE_ROYALE';
    if (isBR) {
      setBrResults(
        (match.participants || []).map((p, idx) => ({
          registrationId: p.registrationId,
          name: p.registration?.team?.name || p.registration?.gamerProfile?.displayName || `Team ${idx + 1}`,
          placement: idx + 1,
          eliminations: 0,
          penalties: 0,
        }))
      );
    } else {
      setH2hScores({
        p1Score: match.participants?.[0]?.score || 0,
        p2Score: match.participants?.[1]?.score || 0,
      });
    }
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!activeResultMatch) return;
    setSavingResult(true);

    try {
      const isBR = activeResultMatch.matchData?.engine === 'BATTLE_ROYALE' || tournament.format === 'BATTLE_ROYALE';
      let payload = {};

      if (isBR) {
        payload.participantResults = brResults.map((r) => ({
          registrationId: r.registrationId,
          placement: Number(r.placement),
          eliminations: Number(r.eliminations || 0),
          penalties: Number(r.penalties || 0),
          isWinner: Number(r.placement) === 1,
        }));
      } else {
        const p1 = activeResultMatch.participants?.[0];
        const p2 = activeResultMatch.participants?.[1];
        payload.mapScores = [
          { p1Score: Number(h2hScores.p1Score), p2Score: Number(h2hScores.p2Score) },
        ];
        payload.participantResults = [
          { registrationId: p1.registrationId, score: Number(h2hScores.p1Score), isWinner: Number(h2hScores.p1Score) > Number(h2hScores.p2Score) },
          { registrationId: p2.registrationId, score: Number(h2hScores.p2Score), isWinner: Number(h2hScores.p2Score) > Number(h2hScores.p1Score) },
        ];
      }

      if (resultMode === 'CORRECT' && activeResultId) {
        payload.reason = correctionReason || 'Official organizer score correction';
        await evoqService.correctMatchResult(activeResultId, payload);
        setSuccess('Result corrected and standings reconciled!');
      } else {
        await evoqService.submitMatchResult(activeResultMatch.id, payload);
        setSuccess('Match result recorded and approved!');
      }

      setActiveResultMatch(null);
      await loadAllData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit match result.');
    } finally {
      setSavingResult(false);
    }
  };

  const handleApproveResult = async (resultId) => {
    try {
      await evoqService.approveMatchResult(resultId);
      setSuccess('Match result approved!');
      await loadAllData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to approve result.');
    }
  };

  const handleAdvanceStage = async () => {
    if (stages.length < 2) {
      setError('At least two stages (e.g. Group Stage and Finals) are required to advance teams.');
      return;
    }
    setAdvancing(true);
    try {
      await evoqService.advanceTournamentStage(tournament.id, {
        fromStageId: stages[0].id,
        toStageId: stages[1].id,
        advancePerGroup: Number(advanceCount),
      });
      setSuccess('Top teams advanced to Grand Finals!');
      setShowAdvanceModal(false);
      await loadAllData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to advance stage.');
    } finally {
      setAdvancing(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await evoqService.updateTournamentStatus(tournament.id, newStatus);
      setSuccess(`Tournament status updated to ${newStatus}.`);
      await loadAllData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to transition tournament status.');
    }
  };

  if (loading) {
    return (
      <OrganizerLayout title="Tournament Control Center">
        <SkeletonLoader type="card" count={3} height="160px" />
      </OrganizerLayout>
    );
  }

  if (!tournament) {
    return (
      <OrganizerLayout title="Tournament Not Found">
        <EmptyState
          icon="tournament"
          title="Tournament Not Found"
          description="The tournament does not exist or you lack authorization."
          action={
            <Link to="/organizer/tournaments" className="evoq-btn evoq-btn-primary evoq-btn-sm">
              Return to Tournaments
            </Link>
          }
        />
      </OrganizerLayout>
    );
  }

  const approvedRegistrations = registrations.filter((r) => r.status === 'APPROVED');
  const pendingRegistrations = registrations.filter((r) => r.status === 'PENDING');
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED');
  const pendingResultsMatches = matches.filter((m) => m.result && m.result.status === 'PENDING');

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'registrations', label: `Registrations (${pendingRegistrations.length})`, icon: 'users' },
    { id: 'participants', label: `Teams (${approvedRegistrations.length})`, icon: 'shield' },
    { id: 'stages', label: 'Stages & Groups', icon: 'filter' },
    { id: 'matches', label: `Matches (${matches.length})`, icon: 'matches' },
    { id: 'rooms', label: 'Rooms & Credentials', icon: 'settings' },
    { id: 'results', label: `Results & Scoring (${pendingResultsMatches.length})`, icon: 'check' },
    { id: 'leaderboards', label: 'Leaderboard', icon: 'trophy' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <OrganizerLayout
      title={tournament.name}
      actions={
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <StatusIndicator status={tournament.status} />
          <Link
            to={`/tournaments/${tournament.slug}`}
            target="_blank"
            className="evoq-btn evoq-btn-secondary evoq-btn-sm"
          >
            <Icon name="external" size={13} />
            <span>Public View</span>
          </Link>
        </div>
      }
    >
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

      {/* ── Control Center Tab Navigation ── */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '1px solid var(--evoq-border)',
          marginBottom: '20px',
          overflowX: 'auto',
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
              padding: '10px 14px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid var(--evoq-lime)' : '2px solid transparent',
              color: activeTab === t.id ? 'var(--evoq-lime)' : 'var(--evoq-text-secondary)',
              fontWeight: activeTab === t.id ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Icon name={t.icon} size={14} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

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
              label="Matches Completed"
              value={`${completedMatches.length}/${matches.length}`}
              subtext="Total competition schedule"
              icon="matches"
            />
            <StatCard
              label="Pending Results"
              value={pendingResultsMatches.length}
              subtext="Scores awaiting review"
              icon="trophy"
            />
          </div>

          <div className="evoq-card">
            <SectionHeader
              title="Event Quick Actions"
              subtitle="Execute core tournament lifecycle transitions and bracket generation"
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
              {matches.length === 0 && approvedRegistrations.length >= 2 && (
                <PrimaryButton onClick={() => setShowGenerateModal(true)} icon="plus">
                  Generate Competition Structure
                </PrimaryButton>
              )}
              {stages.length > 1 && (
                <SecondaryButton onClick={() => setShowAdvanceModal(true)} icon="arrow-right">
                  Advance Qualifiers to Finals
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
            title="Tournament Entrant Registrations"
            subtitle="Approve or decline squad and individual entries"
          />

          {registrations.length === 0 ? (
            <EmptyState
              icon="users"
              title="No Registrations Yet"
              description="Share the tournament link to recruit players and squads."
            />
          ) : (
            <DataTable
              columns={[
                {
                  key: 'entrant',
                  header: 'Team / Entrant',
                  render: (_, r) => {
                    const name = r.team?.name || r.gamerProfile?.displayName || 'Competitor';
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar src={r.team?.logoUrl || r.gamerProfile?.avatarUrl} name={name} size="sm" />
                        <div>
                          <strong>{name}</strong>
                          {r.team?.tag && <span style={{ color: 'var(--evoq-lime)', marginLeft: '6px' }}>[{r.team.tag}]</span>}
                        </div>
                      </div>
                    );
                  },
                },
                {
                  key: 'members',
                  header: 'Roster Members',
                  render: (_, r) => (
                    <span style={{ fontSize: '0.82rem', color: 'var(--evoq-text-secondary)' }}>
                      {r.members?.length || 1} Player{r.members?.length === 1 ? '' : 's'}
                    </span>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (s) => <StatusIndicator status={s} />,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (_, r) => (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {r.status === 'PENDING' && (
                        <>
                          <PrimaryButton size="sm" onClick={() => handleRegStatus(r.id, 'APPROVED')}>
                            Approve
                          </PrimaryButton>
                          <SecondaryButton size="sm" variant="danger" onClick={() => handleRegStatus(r.id, 'REJECTED')}>
                            Reject
                          </SecondaryButton>
                        </>
                      )}
                      {r.status === 'APPROVED' && (
                        <SecondaryButton size="sm" variant="danger" onClick={() => handleRegStatus(r.id, 'REJECTED')}>
                          Revoke
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

      {/* ── TAB 3: PARTICIPANTS & TEAMS ── */}
      {activeTab === 'participants' && (
        <div className="evoq-card">
          <SectionHeader
            title="Approved Squad Rosters"
            subtitle="Verified players competing in this tournament"
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {approvedRegistrations.map((r, idx) => (
              <div
                key={r.id}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--evoq-surface-elevated)',
                  borderRadius: 'var(--evoq-radius-sm)',
                  border: '1px solid var(--evoq-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar src={r.team?.logoUrl || r.gamerProfile?.avatarUrl} name={r.team?.name || 'Entrant'} size="md" />
                    <div>
                      <strong style={{ color: 'var(--evoq-text-primary)' }}>{r.team?.name || r.gamerProfile?.displayName}</strong>
                      {r.team?.tag && <Badge variant="lime" size="xs">[{r.team.tag}]</Badge>}
                    </div>
                  </div>
                  <Badge variant="neutral">Seed #{r.seed || idx + 1}</Badge>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)' }}>
                  Roster snapshot: {r.members?.length || 1} player(s) registered
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: STAGES & GROUPS ── */}
      {activeTab === 'stages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="evoq-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <SectionHeader
                title="Tournament Stages"
                subtitle="Multi-stage qualifiers and knockout brackets"
              />
              {matches.length === 0 && approvedRegistrations.length >= 2 && (
                <PrimaryButton size="sm" onClick={() => setShowGenerateModal(true)}>
                  Generate Matches
                </PrimaryButton>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stages.map((st) => (
                <div
                  key={st.id}
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--evoq-surface-elevated)',
                    borderRadius: 'var(--evoq-radius-sm)',
                    border: '1px solid var(--evoq-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--evoq-text-primary)' }}>
                        Stage {st.sequence}: {st.name}
                      </strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--evoq-text-muted)', marginTop: '2px' }}>
                        Type: {st.stageType} • {st.rounds?.length || 0} Rounds • {st.groups?.length || 0} Groups
                      </div>
                    </div>
                    <Badge variant={st.sequence === 1 ? 'lime' : 'neutral'}>
                      {st.status || 'UPCOMING'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: MATCHES & SCHEDULE ── */}
      {activeTab === 'matches' && (
        <div className="evoq-card">
          <SectionHeader
            title="Tournament Match Schedule"
            subtitle="View fixtures, open check-in, set room details, and submit scores"
          />

          {matches.length === 0 ? (
            <EmptyState
              icon="matches"
              title="No Matches Generated"
              description="Approve registrations and generate the competition schedule."
              action={
                approvedRegistrations.length >= 2 && (
                  <PrimaryButton onClick={() => setShowGenerateModal(true)}>
                    Generate Bracket
                  </PrimaryButton>
                )
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {matches.map((m) => {
                const isBR = m.matchData?.engine === 'BATTLE_ROYALE' || tournament.format === 'BATTLE_ROYALE';
                return (
                  <div
                    key={m.id}
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
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: 'var(--evoq-text-primary)', fontSize: '0.98rem' }}>
                          {m.title || `Match #${m.matchNumber}`}
                        </strong>
                        <Badge variant="lime" size="xs">
                          {isBR ? 'BATTLE ROYALE' : m.seriesConfig?.format || 'BO3'}
                        </Badge>
                        <StatusIndicator status={m.status} />
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)', marginTop: '4px' }}>
                        {m.stage?.name} • {m.round?.name} {m.mapName ? `• Map: ${m.mapName}` : ''}
                        {m.scheduledTime && ` • Scheduled: ${new Date(m.scheduledTime).toLocaleString()}`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {m.status === 'SCHEDULED' && (
                        <SecondaryButton size="sm" onClick={() => handleOpenCheckIn(m.id)}>
                          Open Check-In
                        </SecondaryButton>
                      )}
                      <SecondaryButton size="sm" onClick={() => setActiveScheduleMatch(m)}>
                        Reschedule
                      </SecondaryButton>
                      <SecondaryButton size="sm" onClick={() => handleOpenCredentials(m)}>
                        Room
                      </SecondaryButton>
                      <PrimaryButton size="sm" onClick={() => handleOpenResultEntry(m, 'SUBMIT')}>
                        Enter Result
                      </PrimaryButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 6: ROOMS & CREDENTIALS ── */}
      {activeTab === 'rooms' && (
        <div className="evoq-card">
          <SectionHeader
            title="Lobby Room Credentials"
            subtitle="Manage encrypted lobby IDs and passwords for match rooms"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {matches.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: '14px 18px',
                  backgroundColor: 'var(--evoq-surface-elevated)',
                  borderRadius: 'var(--evoq-radius-sm)',
                  border: '1px solid var(--evoq-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--evoq-text-primary)' }}>{m.title}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)' }}>
                    Match #{m.matchNumber} {m.mapName ? `• ${m.mapName}` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <PrimaryButton size="sm" onClick={() => handleOpenCredentials(m)}>
                    Configure Room
                  </PrimaryButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 7: RESULTS & SCORING ── */}
      {activeTab === 'results' && (
        <div className="evoq-card">
          <SectionHeader
            title="Results Review & Approval"
            subtitle="Approve verified match scores, revise results, and update standings"
          />

          {matches.filter((m) => m.result).length === 0 ? (
            <EmptyState
              icon="trophy"
              title="No Results Recorded"
              description="Results entered for completed matches will appear here for review."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {matches
                .filter((m) => m.result)
                .map((m) => {
                  const res = m.result;
                  const isApproved = res.status === 'APPROVED';
                  return (
                    <div
                      key={m.id}
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--evoq-surface-elevated)',
                        borderRadius: 'var(--evoq-radius-sm)',
                        border: isApproved ? '1px solid var(--evoq-border)' : '1px solid var(--evoq-lime)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ color: 'var(--evoq-text-primary)', fontSize: '1rem' }}>
                            {m.title}
                          </strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)' }}>
                            Status: <StatusIndicator status={res.status} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          {!isApproved && (
                            <PrimaryButton size="sm" onClick={() => handleApproveResult(res.id)}>
                              Approve Result
                            </PrimaryButton>
                          )}
                          <SecondaryButton
                            size="sm"
                            onClick={() => handleOpenResultEntry(m, 'CORRECT', res.id)}
                          >
                            Correct / Revise
                          </SecondaryButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 8: LEADERBOARDS ── */}
      {activeTab === 'leaderboards' && (
        <div className="evoq-card">
          <SectionHeader
            title="Tournament Leaderboard & Points Table"
            subtitle="Cumulative verified scores across all approved match results"
          />

          {standings.length === 0 ? (
            <EmptyState
              icon="trophy"
              title="No Standings Calculated Yet"
              description="Approve completed match results to generate official standings."
            />
          ) : (
            <DataTable
              columns={[
                { key: 'rank', header: 'Rank', render: (val) => <strong>#{val}</strong> },
                {
                  key: 'team',
                  header: 'Team / Entrant',
                  render: (_, row) => (
                    <div>
                      <strong>{row.registration?.team?.name || row.registration?.gamerProfile?.displayName || 'Competitor'}</strong>
                      {row.registration?.team?.tag && <span style={{ color: 'var(--evoq-lime)', marginLeft: '6px' }}>[{row.registration.team.tag}]</span>}
                    </div>
                  ),
                },
                { key: 'played', header: 'Played', render: (val) => val ?? 0 },
                { key: 'wins', header: 'Wins / Booyahs', render: (val) => <span style={{ color: 'var(--evoq-lime)', fontWeight: 700 }}>{val ?? 0}</span> },
                {
                  key: 'elims',
                  header: 'Elims / Finishes',
                  render: (_, row) => row.metrics?.eliminations ?? '-',
                },
                {
                  key: 'placePts',
                  header: 'Placement Pts',
                  render: (_, row) => row.metrics?.placementPoints ?? '-',
                },
                {
                  key: 'points',
                  header: 'Total Points',
                  render: (val) => <strong style={{ color: 'var(--evoq-lime)', fontSize: '1rem' }}>{val ?? 0}</strong>,
                },
              ]}
              data={standings}
            />
          )}
        </div>
      )}

      {/* ── TAB 9: SETTINGS ── */}
      {activeTab === 'settings' && (
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
      )}

      {/* ── MODAL: GENERATE MATCHES ── */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Tournament Matches"
        subtitle={`Generate bracket for ${approvedRegistrations.length} approved teams`}
        maxWidth="460px"
      >
        <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          This will construct rounds, groups, and match lobby fixtures according to the tournament's <strong>{tournament.format}</strong> engine.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <SecondaryButton onClick={() => setShowGenerateModal(false)} disabled={generating}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={handleGenerateMatches} disabled={generating} loading={generating}>
            Confirm & Generate
          </PrimaryButton>
        </div>
      </Modal>

      {/* ── MODAL: RESCHEDULE MATCH ── */}
      <Modal
        isOpen={!!activeScheduleMatch}
        onClose={() => setActiveScheduleMatch(null)}
        title="Reschedule Match"
        subtitle={activeScheduleMatch?.title}
        maxWidth="460px"
      >
        <form onSubmit={handleSaveSchedule} noValidate>
          <Input
            label="Scheduled Date & Time"
            type="datetime-local"
            id="scheduleTime"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            required
          />
          <Input
            label="Lobby Information / Server (Optional)"
            id="scheduleLobby"
            value={scheduleLobby}
            onChange={(e) => setScheduleLobby(e.target.value)}
            placeholder="e.g. EU-West Server 04"
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton onClick={() => setActiveScheduleMatch(null)} disabled={savingSchedule}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={savingSchedule} loading={savingSchedule}>
              Save Schedule
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: ROOM CREDENTIALS ── */}
      <Modal
        isOpen={!!activeCredMatch}
        onClose={() => setActiveCredMatch(null)}
        title="Configure Room Credentials"
        subtitle={activeCredMatch?.title}
        maxWidth="480px"
      >
        <form onSubmit={handleSaveCredentials} noValidate>
          <Input
            label="Room / Lobby ID"
            id="roomId"
            value={credForm.roomId}
            onChange={(e) => setCredForm((p) => ({ ...p, roomId: e.target.value }))}
            placeholder="e.g. 5829104"
            required
          />
          <Input
            label="Room Password"
            id="roomPassword"
            value={credForm.roomPassword}
            onChange={(e) => setCredForm((p) => ({ ...p, roomPassword: e.target.value }))}
            placeholder="e.g. EVOQ99"
            required
            helperText="Encrypted at rest using AES-256-GCM."
          />
          <Textarea
            label="Player Connection Instructions"
            id="accessInstructions"
            value={credForm.accessInstructions}
            onChange={(e) => setCredForm((p) => ({ ...p, accessInstructions: e.target.value }))}
            rows={2}
            placeholder="e.g. Join Custom Room, select designated team slot..."
          />

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="isReleased"
              checked={credForm.isReleased}
              onChange={(e) => setCredForm((p) => ({ ...p, isReleased: e.target.checked }))}
            />
            <label htmlFor="isReleased" style={{ fontSize: '0.86rem', color: 'var(--evoq-text-primary)', cursor: 'pointer' }}>
              Release credentials to verified match participants immediately
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            {credForm.isReleased && (
              <SecondaryButton
                type="button"
                variant="danger"
                onClick={() => handleRevokeCredentials(activeCredMatch.id)}
              >
                Revoke Credentials
              </SecondaryButton>
            )}
            <SecondaryButton onClick={() => setActiveCredMatch(null)} disabled={savingCred}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={savingCred || !credForm.roomId.trim()} loading={savingCred}>
              Save Credentials
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: RESULT ENTRY / CORRECTION ── */}
      <Modal
        isOpen={!!activeResultMatch}
        onClose={() => setActiveResultMatch(null)}
        title={resultMode === 'CORRECT' ? 'Correct Match Result' : 'Enter Match Result'}
        subtitle={activeResultMatch?.title}
        maxWidth="540px"
      >
        <form onSubmit={handleSaveResult} noValidate>
          {resultMode === 'CORRECT' && (
            <Input
              label="Correction Reason"
              id="correctionReason"
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="e.g. Disconnect correction / placement adjustment"
              required
              helperText="Recorded in the permanent audit trail."
            />
          )}

          {brResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
              <span className="evoq-mono-label">LOBBY PLACEMENT & ELIMINATIONS</span>
              {brResults.map((r, i) => (
                <div
                  key={r.registrationId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--evoq-surface-elevated)',
                    borderRadius: 'var(--evoq-radius-sm)',
                  }}
                >
                  <strong style={{ width: '140px', fontSize: '0.85rem', color: 'var(--evoq-text-primary)' }}>
                    {r.name}
                  </strong>
                  <Input
                    label="Place"
                    type="number"
                    value={r.placement}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBrResults((prev) => {
                        const copy = [...prev];
                        copy[i].placement = val;
                        return copy;
                      });
                    }}
                    min={1}
                    max={25}
                    style={{ width: '70px', margin: 0 }}
                  />
                  <Input
                    label="Kills"
                    type="number"
                    value={r.eliminations}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBrResults((prev) => {
                        const copy = [...prev];
                        copy[i].eliminations = val;
                        return copy;
                      });
                    }}
                    min={0}
                    style={{ width: '70px', margin: 0 }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input
                label={`${activeResultMatch?.participants?.[0]?.registration?.team?.name || 'Player 1'} Score`}
                type="number"
                value={h2hScores.p1Score}
                onChange={(e) => setH2hScores((p) => ({ ...p, p1Score: e.target.value }))}
                min={0}
                required
              />
              <Input
                label={`${activeResultMatch?.participants?.[1]?.registration?.team?.name || 'Player 2'} Score`}
                type="number"
                value={h2hScores.p2Score}
                onChange={(e) => setH2hScores((p) => ({ ...p, p2Score: e.target.value }))}
                min={0}
                required
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton onClick={() => setActiveResultMatch(null)} disabled={savingResult}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={savingResult} loading={savingResult}>
              {savingResult ? 'Submitting...' : 'Save & Calculate Standings'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: ADVANCE STAGE ── */}
      <Modal
        isOpen={showAdvanceModal}
        onClose={() => setShowAdvanceModal(false)}
        title="Advance Qualifiers to Grand Finals"
        subtitle="Progress top ranking teams from Group Stage to Finals Stage"
        maxWidth="440px"
      >
        <Input
          label="Teams Advancing Per Group"
          type="number"
          id="advanceCount"
          value={advanceCount}
          onChange={(e) => setAdvanceCount(e.target.value)}
          min={1}
          max={16}
          required
          helperText="e.g. Top 6 teams from each group."
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <SecondaryButton onClick={() => setShowAdvanceModal(false)} disabled={advancing}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={handleAdvanceStage} disabled={advancing} loading={advancing}>
            Advance Teams
          </PrimaryButton>
        </div>
      </Modal>
    </OrganizerLayout>
  );
}
