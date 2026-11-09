import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/platform.css';

export default function TournamentManager() {
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
      // id can be UUID or we can query
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
      setError(err.response?.data?.error?.message || 'Failed to load tournament manager.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus) {
    if (!tournament) return;
    setError('');
    setSuccess('');
    try {
      const updated = await evoqService.updateTournamentStatus(tournament.id, newStatus);
      setTournament((prev) => ({ ...prev, status: updated.status }));
      setSuccess(`Tournament status updated to ${newStatus}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update status.');
    }
  }

  async function handleUpdateRegStatus(regId, status) {
    if (!tournament) return;
    setError('');
    setSuccess('');
    try {
      await evoqService.updateRegistrationStatus(tournament.id, regId, { status });
      setSuccess(`Registration status updated to ${status}`);
      const freshRegs = await evoqService.getRegistrations(tournament.id);
      setRegistrations(freshRegs || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update registration.');
    }
  }

  async function handleGenerateMatches() {
    if (!tournament) return;
    if (!confirm('Generate bracket matches for all approved participants?')) return;
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      await evoqService.generateMatches(tournament.id);
      setSuccess('Bracket and matches generated successfully!');
      const freshMatches = await evoqService.getMatches(tournament.id);
      setMatches(freshMatches || []);
      setActiveTab('matches');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate matches.');
    } finally {
      setGenerating(false);
    }
  }

  // Credentials actions
  function openCredModal(match) {
    setActiveCredMatch(match);
    setCredForm({
      lobbyName: match.credentials?.lobbyName || '',
      password: '',
      serverRegion: match.credentials?.serverRegion || '',
      instructions: match.credentials?.instructions || '',
      isReleased: match.credentials?.isReleased || false,
    });
  }

  async function handleSaveCredentials(e) {
    e.preventDefault();
    if (!activeCredMatch) return;
    setSavingCred(true);
    setError('');
    setSuccess('');
    try {
      await evoqService.setMatchCredentials(activeCredMatch.id, credForm);
      setSuccess('Match credentials securely saved and updated.');
      setActiveCredMatch(null);
      const freshMatches = await evoqService.getMatches(tournament.id);
      setMatches(freshMatches || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save credentials.');
    } finally {
      setSavingCred(false);
    }
  }

  // Result actions
  function openResultModal(match) {
    setActiveResultMatch(match);
    const p1 = match.participants?.[0];
    const p2 = match.participants?.[1];
    setResultForm({
      p1Score: p1?.score ?? 0,
      p2Score: p2?.score ?? 0,
      winnerParticipantId: p1?.isWinner ? p1.id : p2?.isWinner ? p2?.id : p1?.id || '',
      notes: '',
    });
  }

  async function handleSaveResult(e) {
    e.preventDefault();
    if (!activeResultMatch) return;
    setSavingResult(true);
    setError('');
    setSuccess('');
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

      // Submit and automatically approve as organizer
      const submitted = await evoqService.submitMatchResult(activeResultMatch.id, {
        participantResults,
        notes: resultForm.notes,
      });

      // Authoritative approval
      if (submitted?.id) {
        await evoqService.approveMatchResult(submitted.id);
      }

      setSuccess('Result approved! Bracket progressed and gamer career achievements updated.');
      setActiveResultMatch(null);
      const freshMatches = await evoqService.getMatches(tournament.id);
      setMatches(freshMatches || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit/approve match result.');
    } finally {
      setSavingResult(false);
    }
  }

  // Schedule Match
  async function handleSaveSchedule(e) {
    e.preventDefault();
    if (!activeScheduleMatch) return;
    setError('');
    setSuccess('');
    try {
      await evoqService.scheduleMatch(activeScheduleMatch.id, {
        scheduledAt: new Date(scheduleTime).toISOString(),
      });
      setSuccess('Match scheduled successfully.');
      setActiveScheduleMatch(null);
      const freshMatches = await evoqService.getMatches(tournament.id);
      setMatches(freshMatches || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to schedule match.');
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="platform-page">
          <div className="empty-state">Loading tournament operations room...</div>
        </div>
      </>
    );
  }

  if (error && !tournament) {
    return (
      <>
        <Navbar />
        <div className="platform-page">
          <div className="empty-state">
            <h2>Error Loading Tournament</h2>
            <p>{error}</p>
            <Link to="/dashboard/organizer" className="evoq-btn evoq-btn-primary" style={{ marginTop: 'var(--space-md)' }}>
              Organizer Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  const approvedCount = registrations.filter((r) => r.status === 'APPROVED').length;

  return (
    <>
      <Navbar />
      <div className="platform-page">
        {/* Header with status flow */}
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
              <span className="evoq-badge badge-primary">{tournament.game?.name}</span>
              <span className="evoq-badge badge-secondary">{tournament.format?.replace(/_/g, ' ')}</span>
              <span className="evoq-badge badge-warning">{tournament.status?.replace(/_/g, ' ')}</span>
            </div>
            <h1 className="page-title">{tournament.title}</h1>
            <p className="page-subtitle">Tournament Operations & Lifecycle Management Control Room</p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <Link to={`/tournaments/${tournament.slug}`} className="evoq-btn evoq-btn-secondary" target="_blank">
              ↗ View Public Page
            </Link>
          </div>
        </div>

        {error && <div className="evoq-card status-danger" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}
        {success && <div className="evoq-card status-success" style={{ marginBottom: 'var(--space-md)' }}>{success}</div>}

        {/* Lifecycle Transitions Workflow Bar */}
        <div className="evoq-card" style={{ marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
            Tournament Lifecycle Transitions
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
            {tournament.status === 'DRAFT' && (
              <button className="evoq-btn evoq-btn-primary" onClick={() => handleStatusChange('ANNOUNCED')}>
                Announce Tournament
              </button>
            )}
            {['DRAFT', 'ANNOUNCED'].includes(tournament.status) && (
              <button className="evoq-btn evoq-btn-primary" onClick={() => handleStatusChange('REGISTRATION_OPEN')}>
                Open Registrations
              </button>
            )}
            {tournament.status === 'REGISTRATION_OPEN' && (
              <button className="evoq-btn evoq-btn-secondary" onClick={() => handleStatusChange('REGISTRATION_CLOSED')}>
                Close Registrations
              </button>
            )}
            {['REGISTRATION_CLOSED', 'REGISTRATION_OPEN'].includes(tournament.status) && (
              <button className="evoq-btn evoq-btn-primary" onClick={() => handleStatusChange('ONGOING')}>
                Start Tournament (Ongoing)
              </button>
            )}
            {tournament.status === 'ONGOING' && (
              <button className="evoq-btn evoq-btn-success" onClick={() => handleStatusChange('CONCLUDED')}>
                Conclude Tournament & Finalize Standings
              </button>
            )}
            {tournament.status !== 'CANCELLED' && tournament.status !== 'CONCLUDED' && (
              <button
                className="evoq-btn evoq-btn-danger"
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this tournament?')) {
                    handleStatusChange('CANCELLED');
                  }
                }}
              >
                Cancel Tournament
              </button>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="evoq-tabs">
          <button
            className={`tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            Registrations ({registrations.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            Matches & Operations ({matches.length})
          </button>
        </div>

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <div className="evoq-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Competitor Registrations</h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  {approvedCount} / {tournament.maxParticipants} approved competitors.
                </p>
              </div>

              {approvedCount >= 2 && matches.length === 0 && (
                <button
                  className="evoq-btn evoq-btn-primary"
                  onClick={handleGenerateMatches}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate Matches from Approved'}
                </button>
              )}
            </div>

            {registrations.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>No registrations submitted yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="evoq-table">
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Contact / User</th>
                      <th>Roster</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>
                          <strong>{reg.team?.name || reg.gamerProfile?.inGameName || 'Solo Competitor'}</strong>
                        </td>
                        <td>{reg.user?.email || reg.user?.username}</td>
                        <td>
                          {reg.rosterMembers?.length > 0
                            ? reg.rosterMembers.map((m) => m.gamerProfile?.inGameName || m.user?.username).join(', ')
                            : '—'}
                        </td>
                        <td>{new Date(reg.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`evoq-badge ${
                              reg.status === 'APPROVED'
                                ? 'badge-success'
                                : reg.status === 'REJECTED'
                                ? 'badge-danger'
                                : reg.status === 'WAITLISTED'
                                ? 'badge-warning'
                                : 'badge-muted'
                            }`}
                          >
                            {reg.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {reg.status !== 'APPROVED' && (
                              <button
                                className="evoq-btn evoq-btn-primary"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => handleUpdateRegStatus(reg.id, 'APPROVED')}
                              >
                                Approve
                              </button>
                            )}
                            {reg.status !== 'WAITLISTED' && (
                              <button
                                className="evoq-btn evoq-btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => handleUpdateRegStatus(reg.id, 'WAITLISTED')}
                              >
                                Waitlist
                              </button>
                            )}
                            {reg.status !== 'REJECTED' && (
                              <button
                                className="evoq-btn evoq-btn-danger"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => handleUpdateRegStatus(reg.id, 'REJECTED')}
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

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Competition Matches & Lobbies</h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  Manage scheduled fixtures, release encrypted lobby credentials, and enter authoritative match results.
                </p>
              </div>

              {matches.length === 0 && (
                <button
                  className="evoq-btn evoq-btn-primary"
                  onClick={handleGenerateMatches}
                  disabled={generating || approvedCount < 2}
                >
                  {generating ? 'Generating...' : 'Generate Matches'}
                </button>
              )}
            </div>

            {matches.length === 0 ? (
              <div className="evoq-card empty-state">
                <h3>No Matches Generated</h3>
                <p>Approve at least 2 participants then generate tournament fixtures.</p>
              </div>
            ) : (
              <div className="grid-cards">
                {matches.map((m) => {
                  const p1 = m.participants?.[0];
                  const p2 = m.participants?.[1];
                  const isCompleted = m.status === 'COMPLETED';

                  return (
                    <div key={m.id} className="evoq-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          Round {m.round?.roundNumber || 1} • Match #{m.matchNumber}
                        </span>
                        <span className={`evoq-badge ${isCompleted ? 'badge-primary' : 'badge-secondary'}`}>
                          {m.status}
                        </span>
                      </div>

                      {/* Participant 1 */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: 'var(--space-sm)',
                          backgroundColor: p1?.isWinner ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface-raised)',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: '4px',
                          borderLeft: p1?.isWinner ? '3px solid var(--primary)' : 'none',
                        }}
                      >
                        <span style={{ fontWeight: p1?.isWinner ? '700' : '500' }}>
                          {p1?.registration?.team?.name || p1?.registration?.gamerProfile?.inGameName || 'TBD'}
                        </span>
                        <span style={{ fontWeight: '700' }}>{p1?.score ?? '-'}</span>
                      </div>

                      {/* Participant 2 */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: 'var(--space-sm)',
                          backgroundColor: p2?.isWinner ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface-raised)',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: 'var(--space-md)',
                          borderLeft: p2?.isWinner ? '3px solid var(--primary)' : 'none',
                        }}
                      >
                        <span style={{ fontWeight: p2?.isWinner ? '700' : '500' }}>
                          {p2?.registration?.team?.name || p2?.registration?.gamerProfile?.inGameName || 'TBD'}
                        </span>
                        <span style={{ fontWeight: '700' }}>{p2?.score ?? '-'}</span>
                      </div>

                      {/* Match controls */}
                      <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                        <button
                          className="evoq-btn evoq-btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => {
                            setActiveScheduleMatch(m);
                            setScheduleTime(m.scheduledAt ? m.scheduledAt.slice(0, 16) : '');
                          }}
                        >
                          Schedule
                        </button>
                        <button
                          className="evoq-btn evoq-btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => openCredModal(m)}
                        >
                          Credentials {m.credentials?.isReleased ? '' : ''}
                        </button>
                        {!isCompleted && p1 && p2 && (
                          <button
                            className="evoq-btn evoq-btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            onClick={() => openResultModal(m)}
                          >
                            Enter Result
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Credentials Modal */}
        {activeCredMatch && (
          <div className="evoq-modal-overlay" onClick={() => setActiveCredMatch(null)}>
            <div className="evoq-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Match Room Credentials (Match #{activeCredMatch.matchNumber})</h2>
                <button className="close-btn" onClick={() => setActiveCredMatch(null)}>×</button>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
                Room passwords are encrypted at rest using AES-256-GCM and only decrypted for verified participants once released.
              </p>
              <form onSubmit={handleSaveCredentials} className="evoq-form">
                <div className="form-group">
                  <label>Room / Lobby Name *</label>
                  <input
                    type="text"
                    value={credForm.lobbyName}
                    onChange={(e) => setCredForm({ ...credForm, lobbyName: e.target.value })}
                    required
                    placeholder="e.g. EVOQ-LOBBY-01"
                    className="evoq-input"
                  />
                </div>
                <div className="form-group">
                  <label>Room Password *</label>
                  <input
                    type="text"
                    value={credForm.password}
                    onChange={(e) => setCredForm({ ...credForm, password: e.target.value })}
                    required
                    placeholder="Encrypted password for players"
                    className="evoq-input"
                  />
                </div>
                <div className="form-group">
                  <label>Server Region</label>
                  <input
                    type="text"
                    value={credForm.serverRegion}
                    onChange={(e) => setCredForm({ ...credForm, serverRegion: e.target.value })}
                    placeholder="e.g. US-East, EU-Frankfurt, Asia-Mumbai"
                    className="evoq-input"
                  />
                </div>
                <div className="form-group">
                  <label>Participant Instructions</label>
                  <textarea
                    value={credForm.instructions}
                    onChange={(e) => setCredForm({ ...credForm, instructions: e.target.value })}
                    rows="2"
                    placeholder="Join 10 mins prior to start. Check-in on Discord..."
                    className="evoq-textarea"
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <input
                    type="checkbox"
                    id="releaseToggle"
                    checked={credForm.isReleased}
                    onChange={(e) => setCredForm({ ...credForm, isReleased: e.target.checked })}
                  />
                  <label htmlFor="releaseToggle" style={{ cursor: 'pointer', margin: 0 }}>
                    Release Credentials to Approved Competitors Now
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="evoq-btn evoq-btn-secondary" onClick={() => setActiveCredMatch(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="evoq-btn evoq-btn-primary" disabled={savingCred}>
                    {savingCred ? 'Saving...' : 'Save & Encrypt'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Result Submission Modal */}
        {activeResultMatch && (
          <div className="evoq-modal-overlay" onClick={() => setActiveResultMatch(null)}>
            <div className="evoq-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Record & Approve Result (Match #{activeResultMatch.matchNumber})</h2>
                <button className="close-btn" onClick={() => setActiveResultMatch(null)}>×</button>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
                Approving this result will immediately advance the winner in the bracket and generate verified Gamer Profile achievements.
              </p>
              <form onSubmit={handleSaveResult} className="evoq-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label>
                      {activeResultMatch.participants?.[0]?.registration?.team?.name ||
                        activeResultMatch.participants?.[0]?.registration?.gamerProfile?.inGameName ||
                        'Participant 1'}{' '}
                      Score
                    </label>
                    <input
                      type="number"
                      value={resultForm.p1Score}
                      onChange={(e) => setResultForm({ ...resultForm, p1Score: e.target.value })}
                      required
                      min="0"
                      className="evoq-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      {activeResultMatch.participants?.[1]?.registration?.team?.name ||
                        activeResultMatch.participants?.[1]?.registration?.gamerProfile?.inGameName ||
                        'Participant 2'}{' '}
                      Score
                    </label>
                    <input
                      type="number"
                      value={resultForm.p2Score}
                      onChange={(e) => setResultForm({ ...resultForm, p2Score: e.target.value })}
                      required
                      min="0"
                      className="evoq-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Designated Match Winner *</label>
                  <select
                    value={resultForm.winnerParticipantId}
                    onChange={(e) => setResultForm({ ...resultForm, winnerParticipantId: e.target.value })}
                    required
                    className="evoq-input"
                  >
                    <option value="">Select Winner</option>
                    {activeResultMatch.participants?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.registration?.team?.name || p.registration?.gamerProfile?.inGameName || 'Participant'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Referee Notes / Verification Details</label>
                  <input
                    type="text"
                    value={resultForm.notes}
                    onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })}
                    placeholder="e.g. Confirmed via in-game screenshot"
                    className="evoq-input"
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="evoq-btn evoq-btn-secondary" onClick={() => setActiveResultMatch(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="evoq-btn evoq-btn-primary" disabled={savingResult}>
                    {savingResult ? 'Approving...' : 'Authorize & Approve Result'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Scheduling Modal */}
        {activeScheduleMatch && (
          <div className="evoq-modal-overlay" onClick={() => setActiveScheduleMatch(null)}>
            <div className="evoq-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Schedule Match #{activeScheduleMatch.matchNumber}</h2>
                <button className="close-btn" onClick={() => setActiveScheduleMatch(null)}>×</button>
              </div>
              <form onSubmit={handleSaveSchedule} className="evoq-form">
                <div className="form-group">
                  <label>Scheduled Start Time *</label>
                  <input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    required
                    className="evoq-input"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="evoq-btn evoq-btn-secondary" onClick={() => setActiveScheduleMatch(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="evoq-btn evoq-btn-primary">
                    Save Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

