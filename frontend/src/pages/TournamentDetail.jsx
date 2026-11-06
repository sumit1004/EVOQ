import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import { useAuth } from '../features/auth/AuthContext.jsx';
import '../styles/platform.css';

export default function TournamentDetail() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, participants, bracket, standings

  // Sub-data
  const [registrations, setRegistrations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [myRegistration, setMyRegistration] = useState(null);

  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Credentials for active participant
  const [credentialInfo, setCredentialInfo] = useState(null);

  useEffect(() => {
    loadTournament();
  }, [slug]);

  async function loadTournament() {
    setLoading(true);
    setError('');
    try {
      const data = await evoqService.getTournamentBySlug(slug);
      setTournament(data);

      // Load related data
      if (data?.id) {
        loadSubData(data.id);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Tournament not found.');
    } finally {
      setLoading(false);
    }
  }

  async function loadSubData(tournamentId) {
    try {
      const [regs, matchData, standingData] = await Promise.all([
        evoqService.getRegistrations(tournamentId).catch(() => []),
        evoqService.getMatches(tournamentId).catch(() => []),
        evoqService.getStandings(tournamentId).catch(() => []),
      ]);

      setRegistrations(regs || []);
      setMatches(matchData || []);
      setStandings(standingData || []);

      // Check if logged-in user is registered
      if (user) {
        const found = (regs || []).find(
          (r) =>
            r.userId === user.id ||
            r.rosterMembers?.some((m) => m.userId === user.id || m.gamerProfile?.userId === user.id)
        );
        setMyRegistration(found || null);

        // Check if any match has released credentials for this participant
        if (matchData && matchData.length > 0) {
          for (const m of matchData) {
            if (m.credentials && m.credentials.isReleased) {
              setCredentialInfo(m.credentials);
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading tournament details subdata:', err);
    }
  }

  async function handleOpenRegister() {
    setShowRegisterModal(true);
    setRegError('');
    setRegSuccess('');
    if (tournament.participationType === 'TEAM') {
      try {
        const teams = await evoqService.getMyTeams();
        setMyTeams(teams || []);
        if (teams && teams.length > 0) {
          setSelectedTeamId(teams[0].team?.id || teams[0].id);
        }
      } catch (err) {
        console.error('Error fetching teams for registration:', err);
      }
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    if (!tournament) return;
    setSubmittingReg(true);
    setRegError('');
    setRegSuccess('');
    try {
      const payload = {};
      if (tournament.participationType === 'TEAM') {
        if (!selectedTeamId) {
          setRegError('Please select a team to register.');
          setSubmittingReg(false);
          return;
        }
        payload.teamId = selectedTeamId;
      }

      await evoqService.registerTournament(tournament.id, payload);
      setRegSuccess('Registration submitted successfully! Awaiting organizer review.');
      await loadSubData(tournament.id);
      setTimeout(() => setShowRegisterModal(false), 1500);
    } catch (err) {
      setRegError(err.response?.data?.error?.message || 'Failed to complete registration.');
    } finally {
      setSubmittingReg(false);
    }
  }

  async function handleWithdraw() {
    if (!confirm('Are you sure you want to withdraw your tournament registration?')) return;
    try {
      await evoqService.withdrawRegistration(tournament.id);
      alert('Registration withdrawn.');
      await loadSubData(tournament.id);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to withdraw.');
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="platform-page">
          <div className="empty-state">Loading tournament...</div>
        </div>
      </>
    );
  }

  if (error || !tournament) {
    return (
      <>
        <Navbar />
        <div className="platform-page">
          <div className="empty-state">
            <h2>Tournament Not Found</h2>
            <p>{error || 'The requested tournament does not exist.'}</p>
            <Link to="/tournaments" className="evoq-btn evoq-btn-primary" style={{ marginTop: 'var(--space-md)' }}>
              Browse Tournaments
            </Link>
          </div>
        </div>
      </>
    );
  }

  const isOrganizerOrAdmin =
    user && (user.id === tournament.organizerId || user.id === tournament.organization?.ownerId);

  return (
    <>
      <Navbar />
      <div className="platform-page">
        {/* Tournament Hero Banner */}
        <div
          className="evoq-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            marginBottom: 'var(--space-xl)',
            border: '1px solid var(--border)',
          }}
        >
          {tournament.bannerUrl ? (
            <img
              src={tournament.bannerUrl}
              alt={tournament.title}
              style={{ width: '100%', height: '240px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '180px',
                background: 'linear-gradient(135deg, #1f1b3a 0%, #0d0f17 100%)',
              }}
            />
          )}

          <div
            style={{
              padding: 'var(--space-xl)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 'var(--space-md)',
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', marginBottom: 'var(--space-xs)' }}>
                <span className="evoq-badge badge-primary">{tournament.game?.name || 'Esports'}</span>
                <span className="evoq-badge badge-secondary">{tournament.format?.replace(/_/g, ' ')}</span>
                <span className="evoq-badge badge-secondary">{tournament.participationType}</span>
                <span className="evoq-badge badge-warning">{tournament.status?.replace(/_/g, ' ')}</span>
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: '800' }}>{tournament.title}</h1>
              <p style={{ color: 'var(--muted)', marginTop: 'var(--space-xs)' }}>
                Hosted by{' '}
                {tournament.organization ? (
                  <Link to={`/organizations/${tournament.organization.slug}`} style={{ color: 'var(--primary)' }}>
                    {tournament.organization.name}
                  </Link>
                ) : (
                  <span>Verified Organizer</span>
                )}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
              {isOrganizerOrAdmin && (
                <Link
                  to={`/dashboard/tournaments/${tournament.id}/manage`}
                  className="evoq-btn evoq-btn-secondary"
                >
                  ⚙ Tournament Control Room
                </Link>
              )}

              {user ? (
                myRegistration ? (
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                    <span className="evoq-badge badge-success">
                      Registered ({myRegistration.status})
                    </span>
                    {['PENDING', 'APPROVED'].includes(myRegistration.status) && (
                      <button className="evoq-btn evoq-btn-danger" onClick={handleWithdraw}>
                        Withdraw
                      </button>
                    )}
                  </div>
                ) : tournament.status === 'REGISTRATION_OPEN' ? (
                  <button className="evoq-btn evoq-btn-primary" onClick={handleOpenRegister}>
                    Register Now
                  </button>
                ) : (
                  <span className="evoq-badge badge-muted">Registration Closed</span>
                )
              ) : (
                <Link to="/login" className="evoq-btn evoq-btn-primary">
                  Login to Register
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Released Match Credentials Alert (Secure AES-256 decrypted) */}
        {credentialInfo && (
          <div
            className="evoq-card status-success"
            style={{ marginBottom: 'var(--space-xl)', borderLeft: '4px solid var(--success)' }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: 'var(--space-xs)' }}>
              🔒 Match Room Credentials Released
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-sm)' }}>
              The organizer has released encrypted lobby credentials for your scheduled match.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap', marginTop: 'var(--space-xs)' }}>
              {credentialInfo.lobbyName && (
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>ROOM / LOBBY ID:</span>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{credentialInfo.lobbyName}</div>
                </div>
              )}
              {credentialInfo.password && (
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>PASSWORD:</span>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '1px' }}>
                    {credentialInfo.password}
                  </div>
                </div>
              )}
              {credentialInfo.serverRegion && (
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>SERVER REGION:</span>
                  <div style={{ fontWeight: '700' }}>{credentialInfo.serverRegion}</div>
                </div>
              )}
            </div>
            {credentialInfo.instructions && (
              <p style={{ marginTop: 'var(--space-sm)', fontSize: '0.85rem', color: 'var(--muted)' }}>
                <strong>Instructions:</strong> {credentialInfo.instructions}
              </p>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="evoq-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview & Rules
          </button>
          <button
            className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            Participants ({registrations.filter((r) => r.status === 'APPROVED').length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'bracket' ? 'active' : ''}`}
            onClick={() => setActiveTab('bracket')}
          >
            Bracket & Matches ({matches.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'standings' ? 'active' : ''}`}
            onClick={() => setActiveTab('standings')}
          >
            Standings & Leaderboard
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid-cols-2" style={{ alignItems: 'start' }}>
            <div className="evoq-card">
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>
                Tournament Details
              </h2>
              <div style={{ color: 'var(--text)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {tournament.description || 'No detailed description provided.'}
              </div>

              {tournament.rules && (
                <div style={{ marginTop: 'var(--space-xl)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
                    Rulebook & Competition Guidelines
                  </h3>
                  <div
                    style={{
                      backgroundColor: 'var(--surface-raised)',
                      padding: 'var(--space-md)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {tournament.rules}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="evoq-card" style={{ marginBottom: 'var(--space-lg)' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>Schedule</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Registration Closes:</span>
                    <strong>{tournament.registrationClosesAt ? new Date(tournament.registrationClosesAt).toLocaleString() : 'TBA'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Tournament Starts:</span>
                    <strong>{tournament.startsAt ? new Date(tournament.startsAt).toLocaleString() : 'TBA'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Format:</span>
                    <strong>{tournament.format?.replace(/_/g, ' ')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Max Capacity:</span>
                    <strong>{tournament.maxParticipants} {tournament.participationType}s</strong>
                  </div>
                </div>
              </div>

              {tournament.prizePool && (
                <div className="evoq-card">
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>Prize Pool</h2>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>
                    {tournament.prizePool} {tournament.currency || 'USD'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="evoq-card">
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>
              Approved Competitors
            </h2>
            {registrations.filter((r) => r.status === 'APPROVED').length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>No participants approved yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="evoq-table">
                  <thead>
                    <tr>
                      <th>Seed</th>
                      <th>Competitor</th>
                      <th>Type</th>
                      <th>Roster Members</th>
                      <th>Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations
                      .filter((r) => r.status === 'APPROVED')
                      .map((r, index) => (
                        <tr key={r.id}>
                          <td>#{r.seed || index + 1}</td>
                          <td>
                            <strong>{r.team?.name || r.gamerProfile?.inGameName || r.user?.username}</strong>
                          </td>
                          <td>{tournament.participationType}</td>
                          <td>
                            {r.rosterMembers && r.rosterMembers.length > 0
                              ? r.rosterMembers.map((m) => m.gamerProfile?.inGameName || m.user?.username).join(', ')
                              : '—'}
                          </td>
                          <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bracket' && (
          <div>
            {matches.length === 0 ? (
              <div className="evoq-card empty-state">
                <h3>Bracket Not Generated Yet</h3>
                <p>Matches will be displayed once the organizer initiates the competition stage.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div className="grid-cards">
                  {matches.map((m) => {
                    const p1 = m.participants?.[0];
                    const p2 = m.participants?.[1];
                    const isCompleted = m.status === 'COMPLETED';

                    return (
                      <div key={m.id} className="evoq-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            Round {m.round?.roundNumber || 1} • Match {m.matchNumber}
                          </span>
                          <span className={`evoq-badge ${isCompleted ? 'badge-primary' : 'badge-secondary'}`}>
                            {m.status}
                          </span>
                        </div>

                        {/* Competitor 1 */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
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
                          <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{p1?.score ?? '-'}</span>
                        </div>

                        {/* Competitor 2 */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--space-sm)',
                            backgroundColor: p2?.isWinner ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface-raised)',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: p2?.isWinner ? '3px solid var(--primary)' : 'none',
                          }}
                        >
                          <span style={{ fontWeight: p2?.isWinner ? '700' : '500' }}>
                            {p2?.registration?.team?.name || p2?.registration?.gamerProfile?.inGameName || 'TBD'}
                          </span>
                          <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{p2?.score ?? '-'}</span>
                        </div>

                        {m.scheduledAt && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 'var(--space-sm)' }}>
                            Scheduled: {new Date(m.scheduledAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="evoq-card">
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>
              Tournament Standings
            </h2>
            {standings.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>Standings will be updated as matches conclude.</p>
            ) : (
              <div className="table-responsive">
                <table className="evoq-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Competitor</th>
                      <th>Points</th>
                      <th>Wins</th>
                      <th>Losses</th>
                      <th>Ties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, idx) => (
                      <tr key={s.id || idx}>
                        <td>
                          <strong>#{s.rank || idx + 1}</strong>
                        </td>
                        <td>
                          <strong>{s.participantName || s.team?.name || s.gamerProfile?.inGameName || 'Participant'}</strong>
                        </td>
                        <td>{s.points ?? 0}</td>
                        <td style={{ color: 'var(--success)' }}>{s.wins ?? 0}</td>
                        <td style={{ color: 'var(--danger)' }}>{s.losses ?? 0}</td>
                        <td>{s.ties ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Register Modal */}
        {showRegisterModal && (
          <div className="evoq-modal-overlay" onClick={() => setShowRegisterModal(false)}>
            <div className="evoq-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Register for {tournament.title}</h2>
                <button className="close-btn" onClick={() => setShowRegisterModal(false)}>×</button>
              </div>

              {regError && <div className="evoq-card status-danger" style={{ marginBottom: 'var(--space-md)' }}>{regError}</div>}
              {regSuccess && <div className="evoq-card status-success" style={{ marginBottom: 'var(--space-md)' }}>{regSuccess}</div>}

              <form onSubmit={handleRegisterSubmit} className="evoq-form">
                {tournament.participationType === 'TEAM' ? (
                  <div>
                    {myTeams.length === 0 ? (
                      <div>
                        <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-md)' }}>
                          This tournament requires team participation. You do not currently captain or belong to an active team.
                        </p>
                        <Link to="/dashboard/teams" className="evoq-btn evoq-btn-primary">
                          Create or Join a Team
                        </Link>
                      </div>
                    ) : (
                      <div className="form-group">
                        <label>Select Team to Register *</label>
                        <select
                          value={selectedTeamId}
                          onChange={(e) => setSelectedTeamId(e.target.value)}
                          className="evoq-input"
                          required
                        >
                          {myTeams.map((t) => {
                            const teamObj = t.team || t;
                            return (
                              <option key={teamObj.id} value={teamObj.id}>
                                {teamObj.name} ({teamObj.tag || 'TEAM'})
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-md)' }}>
                      You are registering as an individual competitor. Your match results will be recorded directly into your Gamer Profile.
                    </p>
                  </div>
                )}

                <div className="modal-actions" style={{ marginTop: 'var(--space-lg)' }}>
                  <button type="button" className="evoq-btn evoq-btn-secondary" onClick={() => setShowRegisterModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="evoq-btn evoq-btn-primary"
                    disabled={submittingReg || (tournament.participationType === 'TEAM' && myTeams.length === 0)}
                  >
                    {submittingReg ? 'Submitting...' : 'Confirm Registration'}
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

