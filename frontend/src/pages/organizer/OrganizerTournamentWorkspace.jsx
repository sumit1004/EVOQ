import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import OrganizerNavbar from '../../components/OrganizerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function OrganizerTournamentWorkspace() {
  const { id } = useParams();

  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('registrations'); // registrations, matches, settings

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
    if (!confirm('Generate bracket matches for all approved competitors?')) return;
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      await evoqService.generateMatches(tournament.id);
      setSuccess('Bracket fixtures generated successfully!');
      const freshMatches = await evoqService.getMatches(tournament.id);
      setMatches(freshMatches || []);
      setActiveTab('matches');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate matches.');
    } finally {
      setGenerating(false);
    }
  };

  const openCredModal = (match) => {
    setActiveCredMatch(match);
    setCredForm({
      lobbyName: match.credentials?.lobbyName || '',
      password: '',
      serverRegion: match.credentials?.serverRegion || '',
      instructions: match.credentials?.instructions || '',
      isReleased: match.credentials?.isReleased || false,
    });
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!activeCredMatch) return;
    setSavingCred(true);
    setError('');
    try {
      await evoqService.setMatchCredentials(activeCredMatch.id, credForm);
      setSuccess('Encrypted credentials saved and updated.');
      setActiveCredMatch(null);
      const freshMatches = await evoqService.getMatches(tournament.id);
      setMatches(freshMatches || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save credentials.');
    } finally {
      setSavingCred(false);
    }
  };

  const openResultModal = (match) => {
    setActiveResultMatch(match);
    const p1 = match.participants?.[0];
    const p2 = match.participants?.[1];
    setResultForm({
      p1Score: p1?.score ?? 0,
      p2Score: p2?.score ?? 0,
      winnerParticipantId: p1?.isWinner ? p1.id : p2?.isWinner ? p2?.id : p1?.id || '',
      notes: '',
    });
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!activeResultMatch) return;
    setSavingResult(true);
    setError('');
    try {
      const p1 = activeResultMatch.participants?.[0];
      const p2 = activeResultMatch.participants?.[1];

      const participantResults = [];
      if (p1) {
        participantResults.push({
          participantId: p1.id,
          score: Number(resultForm.p1Score),
          isWinner: resultForm.winnerParticipantId === p1.id,
          rank: resultForm.winnerParticipantId === p1.id ? 1 : 2,
        });
      }
      if (p2) {
        participantResults.push({
          participantId: p2.id,
          score: Number(resultForm.p2Score),
          isWinner: resultForm.winnerParticipantId === p2.id,
          rank: resultForm.winnerParticipantId === p2.id ? 1 : 2,
        });
      }

      const submitted = await evoqService.submitMatchResult(activeResultMatch.id, {
        participantResults,
        notes: resultForm.notes,
      });

      if (submitted?.id) {
        await evoqService.approveMatchResult(submitted.id);
      }

      setSuccess('Result approved! Bracket progressed and gamer achievements awarded.');
      setActiveResultMatch(null);
      const freshMatches = await evoqService.getMatches(tournament.id);
      setMatches(freshMatches || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to approve result.');
    } finally {
      setSavingResult(false);
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!activeScheduleMatch) return;
    try {
      await evoqService.scheduleMatch(activeScheduleMatch.id, {
        scheduledAt: new Date(scheduleTime).toISOString(),
      });
      setSuccess('Match scheduled.');
      setActiveScheduleMatch(null);
      const freshMatches = await evoqService.getMatches(tournament.id);
      setMatches(freshMatches || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to schedule match.');
    }
  };

  if (loading) {
    return (
      <div className="nebula-shell">
        <OrganizerNavbar />
        <div className="nebula-container nebula-empty-state">
          <div className="nebula-empty-icon">⏳</div>
          <p>Loading tournament workspace...</p>
        </div>
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div className="nebula-shell">
        <OrganizerNavbar />
        <div className="nebula-container nebula-empty-state">
          <div className="nebula-empty-icon">⚠️</div>
          <h2>Control Room Error</h2>
          <p>{error}</p>
          <Link to="/organizer/dashboard" className="nebula-btn nebula-btn-cyan">
            Return to Operations Hub
          </Link>
        </div>
      </div>
    );
  }

  const approvedCount = registrations.filter((r) => r.status === 'APPROVED').length;

  return (
    <div className="nebula-shell">
      <OrganizerNavbar />
      <main className="nebula-container">
        {/* Workspace Header */}
        <div className="nebula-card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid var(--nebula-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                <span className="nebula-badge nebula-badge-cyan">{tournament.game?.name || 'Esports'}</span>
                <span className="nebula-badge nebula-badge-neutral">{tournament.format?.replace(/_/g, ' ')}</span>
                <span className="nebula-badge nebula-badge-lime">{tournament.status?.replace(/_/g, ' ')}</span>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 0.25rem 0' }}>
                {tournament.name || tournament.title}
              </h1>
              <div style={{ fontSize: '0.85rem', color: 'var(--nebula-text-muted)' }}>
                Organizer Control Room • Tournament ID: <code>{tournament.id}</code>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                to={`/tournaments/${tournament.slug}`}
                className="nebula-btn nebula-btn-ghost nebula-btn-sm"
                target="_blank"
              >
                View Public Page ↗
              </Link>
            </div>
          </div>

          {/* Lifecycle State Transitions Bar */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--nebula-border)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--nebula-text-muted)', marginBottom: '0.5rem' }}>
              State Machine Transitions
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {tournament.status === 'DRAFT' && (
                <button onClick={() => handleStatusChange('ANNOUNCED')} className="nebula-btn nebula-btn-cyan nebula-btn-sm">
                  📢 Announce Event
                </button>
              )}
              {['DRAFT', 'ANNOUNCED'].includes(tournament.status) && (
                <button onClick={() => handleStatusChange('REGISTRATION_OPEN')} className="nebula-btn nebula-btn-lime nebula-btn-sm">
                  🔓 Open Registrations
                </button>
              )}
              {tournament.status === 'REGISTRATION_OPEN' && (
                <button onClick={() => handleStatusChange('REGISTRATION_CLOSED')} className="nebula-btn nebula-btn-secondary nebula-btn-sm">
                  🔒 Close Registrations
                </button>
              )}
              {['REGISTRATION_CLOSED', 'REGISTRATION_OPEN'].includes(tournament.status) && (
                <button onClick={() => handleStatusChange('ONGOING')} className="nebula-btn nebula-btn-cyan nebula-btn-sm">
                  ⚔ Start Tournament (Live)
                </button>
              )}
              {tournament.status === 'ONGOING' && (
                <button onClick={() => handleStatusChange('CONCLUDED')} className="nebula-btn nebula-btn-lime nebula-btn-sm">
                  🏆 Conclude &amp; Award Trophies
                </button>
              )}
              {tournament.status !== 'CANCELLED' && tournament.status !== 'CONCLUDED' && (
                <button
                  onClick={() => { if (confirm('Cancel tournament?')) handleStatusChange('CANCELLED'); }}
                  className="nebula-btn nebula-btn-coral nebula-btn-sm"
                >
                  Cancel Event
                </button>
              )}
            </div>
          </div>
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}
        {success && <div className="nebula-alert nebula-alert-success">{success}</div>}

        {/* Tab Controls */}
        <div className="nebula-tabs">
          <button
            className={`nebula-tab-btn nebula-tab-btn-ops ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            Registrations ({registrations.length})
          </button>
          <button
            className={`nebula-tab-btn nebula-tab-btn-ops ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            Matches &amp; Bracket Operations ({matches.length})
          </button>
        </div>

        {/* Tab 1: Registrations Management */}
        {activeTab === 'registrations' && (
          <div className="nebula-card">
            <div className="nebula-card-header">
              <div>
                <h2 className="nebula-card-title">Participant Registrations</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--nebula-text-muted)' }}>
                  {approvedCount} / {tournament.maxParticipants} approved competitors
                </div>
              </div>

              {approvedCount >= 2 && matches.length === 0 && (
                <button
                  onClick={handleGenerateMatches}
                  className="nebula-btn nebula-btn-cyan"
                  disabled={generating}
                >
                  {generating ? 'Generating...' : '⚡ Generate Bracket from Approved'}
                </button>
              )}
            </div>

            {registrations.length === 0 ? (
              <div className="nebula-empty-state">
                <p>No competitor registrations submitted yet.</p>
              </div>
            ) : (
              <div className="nebula-table-wrapper">
                <table className="nebula-table">
                  <thead>
                    <tr>
                      <th>Competitor</th>
                      <th>Registered By</th>
                      <th>Roster Members</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td><strong>{reg.team?.name || reg.gamerProfile?.inGameName || 'Solo Competitor'}</strong></td>
                        <td>{reg.user?.email || reg.user?.username}</td>
                        <td>
                          {reg.rosterMembers?.length > 0
                            ? reg.rosterMembers.map((m) => m.gamerProfile?.inGameName || m.user?.username).join(', ')
                            : '—'}
                        </td>
                        <td>
                          <span
                            className={`nebula-badge ${
                              reg.status === 'APPROVED'
                                ? 'nebula-badge-lime'
                                : reg.status === 'WAITLISTED'
                                ? 'nebula-badge-cyan'
                                : reg.status === 'REJECTED'
                                ? 'nebula-badge-coral'
                                : 'nebula-badge-neutral'
                            }`}
                          >
                            {reg.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {reg.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateRegStatus(reg.id, 'APPROVED')}
                                className="nebula-btn nebula-btn-lime nebula-btn-sm"
                              >
                                Approve
                              </button>
                            )}
                            {reg.status !== 'WAITLISTED' && (
                              <button
                                onClick={() => handleUpdateRegStatus(reg.id, 'WAITLISTED')}
                                className="nebula-btn nebula-btn-secondary nebula-btn-sm"
                              >
                                Waitlist
                              </button>
                            )}
                            {reg.status !== 'REJECTED' && (
                              <button
                                onClick={() => handleUpdateRegStatus(reg.id, 'REJECTED')}
                                className="nebula-btn nebula-btn-coral nebula-btn-sm"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Matches & Bracket Operations */}
        {activeTab === 'matches' && (
          <div>
            <div className="nebula-card" style={{ marginBottom: '1.5rem' }}>
              <div className="nebula-card-header">
                <div>
                  <h2 className="nebula-card-title">Match Operations &amp; Encrypted Lobbies</h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--nebula-text-muted)' }}>
                    Schedule fixtures, set AES-256 encrypted room passwords, and record authoritative results.
                  </div>
                </div>

                {matches.length === 0 && (
                  <button
                    onClick={handleGenerateMatches}
                    className="nebula-btn nebula-btn-cyan"
                    disabled={generating || approvedCount < 2}
                  >
                    {generating ? 'Generating...' : '⚡ Generate Fixtures'}
                  </button>
                )}
              </div>

              {matches.length === 0 ? (
                <div className="nebula-empty-state">
                  <div className="nebula-empty-icon">⚔️</div>
                  <p>Approve at least 2 competitors in the Registrations tab, then generate tournament matches.</p>
                </div>
              ) : (
                <div className="nebula-grid-cards">
                  {matches.map((m) => {
                    const p1 = m.participants?.[0];
                    const p2 = m.participants?.[1];
                    const isCompleted = m.status === 'COMPLETED';

                    return (
                      <div key={m.id} className="nebula-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--nebula-text-muted)' }}>
                            Round {m.round?.sequence || 1} • Match #{m.matchNumber}
                          </span>
                          <span className={`nebula-badge ${isCompleted ? 'nebula-badge-lime' : 'nebula-badge-neutral'}`}>
                            {m.status}
                          </span>
                        </div>

                        <div className={`nebula-match-row ${p1?.isWinner ? 'winner' : ''}`} style={{ marginBottom: '0.4rem' }}>
                          <span>{p1?.registration?.team?.name || p1?.registration?.gamerProfile?.inGameName || 'TBD'}</span>
                          <span className="nebula-match-score">{p1?.score ?? '-'}</span>
                        </div>

                        <div className={`nebula-match-row ${p2?.isWinner ? 'winner' : ''}`} style={{ marginBottom: '1rem' }}>
                          <span>{p2?.registration?.team?.name || p2?.registration?.gamerProfile?.inGameName || 'TBD'}</span>
                          <span className="nebula-match-score">{p2?.score ?? '-'}</span>
                        </div>

                        {/* Match controls */}
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => {
                              setActiveScheduleMatch(m);
                              setScheduleTime(m.scheduledAt ? m.scheduledAt.slice(0, 16) : '');
                            }}
                            className="nebula-btn nebula-btn-secondary nebula-btn-sm"
                          >
                            🕒 Schedule
                          </button>
                          <button
                            onClick={() => openCredModal(m)}
                            className="nebula-btn nebula-btn-secondary nebula-btn-sm"
                          >
                            🔒 Room Credentials {m.credentials?.isReleased ? '✔' : ''}
                          </button>
                          {!isCompleted && p1 && p2 && (
                            <button
                              onClick={() => openResultModal(m)}
                              className="nebula-btn nebula-btn-cyan nebula-btn-sm"
                            >
                              🏆 Enter Result
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Credentials Modal */}
        {activeCredMatch && (
          <div className="nebula-modal-overlay" onClick={() => setActiveCredMatch(null)}>
            <div className="nebula-modal" onClick={(e) => e.stopPropagation()}>
              <div className="nebula-modal-header">
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  🔒 Match Lobby Credentials (Match #{activeCredMatch.matchNumber})
                </h2>
                <button className="nebula-modal-close" onClick={() => setActiveCredMatch(null)}>×</button>
              </div>

              <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Passwords are encrypted at rest with AES-256-GCM. Released credentials appear exclusively to approved match participants.
              </p>

              <form onSubmit={handleSaveCredentials}>
                <div className="nebula-form-group">
                  <label className="nebula-label">Lobby / Room Name *</label>
                  <input
                    type="text"
                    value={credForm.lobbyName}
                    onChange={(e) => setCredForm({ ...credForm, lobbyName: e.target.value })}
                    required
                    placeholder="e.g. EVOQ-ROOM-01"
                    className="nebula-input"
                  />
                </div>
                <div className="nebula-form-group">
                  <label className="nebula-label">Lobby Password *</label>
                  <input
                    type="text"
                    value={credForm.password}
                    onChange={(e) => setCredForm({ ...credForm, password: e.target.value })}
                    required
                    placeholder="Enter room password to encrypt"
                    className="nebula-input"
                  />
                </div>
                <div className="nebula-form-group">
                  <label className="nebula-label">Server Region</label>
                  <input
                    type="text"
                    value={credForm.serverRegion}
                    onChange={(e) => setCredForm({ ...credForm, serverRegion: e.target.value })}
                    placeholder="e.g. US-East, Frankfurt"
                    className="nebula-input"
                  />
                </div>
                <div className="nebula-form-group">
                  <label className="nebula-label">Player Instructions</label>
                  <textarea
                    value={credForm.instructions}
                    onChange={(e) => setCredForm({ ...credForm, instructions: e.target.value })}
                    rows="2"
                    placeholder="Join 10 mins prior to start. Check-in on Discord..."
                    className="nebula-textarea"
                  />
                </div>
                <div className="nebula-form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <input
                    type="checkbox"
                    id="relToggle"
                    checked={credForm.isReleased}
                    onChange={(e) => setCredForm({ ...credForm, isReleased: e.target.checked })}
                  />
                  <label htmlFor="relToggle" style={{ cursor: 'pointer', margin: 0, fontSize: '0.9rem', color: 'var(--nebula-cyan)' }}>
                    Release credentials to approved competitors now
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="nebula-btn nebula-btn-ghost" onClick={() => setActiveCredMatch(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="nebula-btn nebula-btn-cyan" disabled={savingCred}>
                    {savingCred ? 'Encrypting...' : 'Save & Encrypt'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Result Authorization Modal */}
        {activeResultMatch && (
          <div className="nebula-modal-overlay" onClick={() => setActiveResultMatch(null)}>
            <div className="nebula-modal" onClick={(e) => e.stopPropagation()}>
              <div className="nebula-modal-header">
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  🏆 Authorize Match Result (Match #{activeResultMatch.matchNumber})
                </h2>
                <button className="nebula-modal-close" onClick={() => setActiveResultMatch(null)}>×</button>
              </div>

              <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Authorizing this match result will advance the winner in the tournament bracket and generate immutable Gamer Profile achievements.
              </p>

              <form onSubmit={handleSaveResult}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="nebula-form-group">
                    <label className="nebula-label">
                      {activeResultMatch.participants?.[0]?.registration?.team?.name || 'Competitor 1'} Score
                    </label>
                    <input
                      type="number"
                      value={resultForm.p1Score}
                      onChange={(e) => setResultForm({ ...resultForm, p1Score: e.target.value })}
                      required
                      min="0"
                      className="nebula-input"
                    />
                  </div>
                  <div className="nebula-form-group">
                    <label className="nebula-label">
                      {activeResultMatch.participants?.[1]?.registration?.team?.name || 'Competitor 2'} Score
                    </label>
                    <input
                      type="number"
                      value={resultForm.p2Score}
                      onChange={(e) => setResultForm({ ...resultForm, p2Score: e.target.value })}
                      required
                      min="0"
                      className="nebula-input"
                    />
                  </div>
                </div>

                <div className="nebula-form-group">
                  <label className="nebula-label">Designated Winner *</label>
                  <select
                    value={resultForm.winnerParticipantId}
                    onChange={(e) => setResultForm({ ...resultForm, winnerParticipantId: e.target.value })}
                    required
                    className="nebula-select"
                  >
                    <option value="">Select Match Winner</option>
                    {activeResultMatch.participants?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.registration?.team?.name || p.registration?.gamerProfile?.inGameName || 'Competitor'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="nebula-form-group">
                  <label className="nebula-label">Referee Verification Notes</label>
                  <input
                    type="text"
                    value={resultForm.notes}
                    onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })}
                    placeholder="e.g. Official referee verification"
                    className="nebula-input"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="nebula-btn nebula-btn-ghost" onClick={() => setActiveResultMatch(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="nebula-btn nebula-btn-cyan" disabled={savingResult}>
                    {savingResult ? 'Authorizing...' : '✔ Authorize & Advance Winner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {activeScheduleMatch && (
          <div className="nebula-modal-overlay" onClick={() => setActiveScheduleMatch(null)}>
            <div className="nebula-modal" onClick={(e) => e.stopPropagation()}>
              <div className="nebula-modal-header">
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  Schedule Match #{activeScheduleMatch.matchNumber}
                </h2>
                <button className="nebula-modal-close" onClick={() => setActiveScheduleMatch(null)}>×</button>
              </div>

              <form onSubmit={handleSaveSchedule}>
                <div className="nebula-form-group">
                  <label className="nebula-label">Scheduled Fixture Time *</label>
                  <input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    required
                    className="nebula-input"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="nebula-btn nebula-btn-ghost" onClick={() => setActiveScheduleMatch(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="nebula-btn nebula-btn-cyan">
                    Save Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

