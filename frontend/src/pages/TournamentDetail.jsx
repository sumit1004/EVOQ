import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/nebula.css';

export default function TournamentDetail() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [myRegistration, setMyRegistration] = useState(null);
  const [credentialInfo, setCredentialInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  useEffect(() => {
    loadTournament();
  }, [slug]);

  async function loadTournament() {
    setLoading(true);
    setError('');
    try {
      const data = await evoqService.getTournamentBySlug(slug);
      setTournament(data);
      if (data?.myRegistration) {
        setMyRegistration(data.myRegistration);
      }
      if (data?.id) {
        loadSubData(data.id);
      }
    } catch (err) {
      setError('Tournament not found.');
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

      if (user && matchData && matchData.length > 0) {
        for (const m of matchData) {
          if (m.credentials && m.credentials.isReleased) {
            setCredentialInfo(m.credentials);
            break;
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleOpenRegister = async () => {
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
        console.error(err);
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!tournament) return;
    setSubmittingReg(true);
    setRegError('');
    setRegSuccess('');
    try {
      const payload = {};
      if (tournament.participationType === 'TEAM') {
        if (!selectedTeamId) {
          setRegError('Please select a team.');
          setSubmittingReg(false);
          return;
        }
        payload.teamId = selectedTeamId;
      }
      await evoqService.registerTournament(tournament.id, payload);
      setRegSuccess('Registration submitted! Awaiting review.');
      await loadTournament();
      setTimeout(() => setShowRegisterModal(false), 1500);
    } catch (err) {
      setRegError(err.response?.data?.error?.message || 'Registration failed.');
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('Withdraw tournament registration?')) return;
    try {
      await evoqService.withdrawRegistration(tournament.id);
      setMyRegistration(null);
      await loadTournament();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to withdraw.');
    }
  };

  if (loading) {
    return (
      <div className="nebula-shell">
        <PublicNavbar />
        <div className="nebula-container nebula-empty-state">
          <div className="nebula-empty-icon">⏳</div>
          <p>Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="nebula-shell">
        <PublicNavbar />
        <div className="nebula-container nebula-empty-state">
          <div className="nebula-empty-icon">⚠️</div>
          <h2>Tournament Not Found</h2>
          <p style={{ color: 'var(--nebula-text-secondary)' }}>{error}</p>
          <Link to="/tournaments" className="nebula-btn nebula-btn-primary" style={{ marginTop: '1.5rem' }}>
            Browse Tournaments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="nebula-shell">
      <PublicNavbar />
      <main className="nebula-container">
        {/* Tournament Hero */}
        <div
          className="nebula-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            marginBottom: '2rem',
            border: '1px solid var(--nebula-border)',
          }}
        >
          {tournament.bannerUrl ? (
            <img
              src={tournament.bannerUrl}
              alt={tournament.name || tournament.title}
              style={{ width: '100%', height: '240px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '180px',
                background: 'linear-gradient(135deg, #1b1738 0%, #0d1020 100%)',
              }}
            />
          )}

          <div
            style={{
              padding: '1.75rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span className="nebula-badge nebula-badge-violet">{tournament.game?.name || 'Esports'}</span>
                <span className="nebula-badge nebula-badge-neutral">{tournament.format?.replace(/_/g, ' ')}</span>
                <span className="nebula-badge nebula-badge-neutral">{tournament.participationType}</span>
                <span className="nebula-badge nebula-badge-lime">{tournament.status?.replace(/_/g, ' ')}</span>
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 0.4rem 0' }}>
                {tournament.name || tournament.title}
              </h1>
              <p style={{ color: 'var(--nebula-text-secondary)', margin: 0 }}>
                Hosted by{' '}
                <strong style={{ color: 'var(--nebula-text-primary)' }}>
                  {tournament.organization?.name || tournament.organizerUser?.username || 'Verified Organizer'}
                </strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {user ? (
                myRegistration ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="nebula-badge nebula-badge-lime">
                      Registered ({myRegistration.status})
                    </span>
                    {['PENDING', 'APPROVED'].includes(myRegistration.status) && (
                      <button onClick={handleWithdraw} className="nebula-btn nebula-btn-coral nebula-btn-sm">
                        Withdraw
                      </button>
                    )}
                  </div>
                ) : tournament.status === 'REGISTRATION_OPEN' ? (
                  <button onClick={handleOpenRegister} className="nebula-btn nebula-btn-primary">
                    Register Competitor
                  </button>
                ) : (
                  <span className="nebula-badge nebula-badge-neutral">Registration Closed</span>
                )
              ) : (
                <Link to="/gamer/login" className="nebula-btn nebula-btn-primary">
                  Sign In to Register
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Released Match Lobby Credentials Box */}
        {credentialInfo && (
          <div
            className="nebula-card"
            style={{
              marginBottom: '2rem',
              borderLeft: '4px solid var(--nebula-lime)',
              backgroundColor: 'var(--nebula-surface-elevated)',
            }}
          >
            <span className="nebula-badge nebula-badge-lime" style={{ marginBottom: '0.5rem' }}>
              🔒 MATCH LOBBY CREDENTIALS RELEASED
            </span>
            <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Lobby credentials have been released by the tournament referee for your fixture.
            </p>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {credentialInfo.lobbyName && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--nebula-text-muted)' }}>ROOM NAME / ID</span>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{credentialInfo.lobbyName}</div>
                </div>
              )}
              {credentialInfo.password && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--nebula-text-muted)' }}>PASSWORD</span>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--nebula-cyan)' }}>
                    {credentialInfo.password}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="nebula-tabs">
          <button
            className={`nebula-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview &amp; Rules
          </button>
          <button
            className={`nebula-tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            Competitors ({registrations.filter((r) => r.status === 'APPROVED').length})
          </button>
          <button
            className={`nebula-tab-btn ${activeTab === 'bracket' ? 'active' : ''}`}
            onClick={() => setActiveTab('bracket')}
          >
            Bracket ({matches.length})
          </button>
          <button
            className={`nebula-tab-btn ${activeTab === 'standings' ? 'active' : ''}`}
            onClick={() => setActiveTab('standings')}
          >
            Standings
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="nebula-grid-2col">
            <div className="nebula-card">
              <h2 className="nebula-card-title" style={{ marginBottom: '1rem' }}>Event Details</h2>
              <p style={{ color: 'var(--nebula-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {tournament.description || 'No detailed description provided.'}
              </p>

              {tournament.rules && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                    Rulebook &amp; Code of Conduct
                  </h3>
                  <div
                    style={{
                      backgroundColor: 'var(--nebula-surface-elevated)',
                      padding: '1.25rem',
                      borderRadius: 'var(--nebula-radius-md)',
                      fontSize: '0.88rem',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      color: 'var(--nebula-text-secondary)',
                    }}
                  >
                    {tournament.rules}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="nebula-card" style={{ marginBottom: '1.5rem' }}>
                <h2 className="nebula-card-title" style={{ marginBottom: '1rem' }}>Specifications</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--nebula-text-muted)' }}>Format:</span>
                    <strong>{tournament.format?.replace(/_/g, ' ')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--nebula-text-muted)' }}>Participation:</span>
                    <strong>{tournament.participationType}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--nebula-text-muted)' }}>Capacity:</span>
                    <strong>{tournament.maxParticipants} Competitors</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--nebula-text-muted)' }}>Starts:</span>
                    <strong>{tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBA'}</strong>
                  </div>
                </div>
              </div>

              {tournament.prizePool && (
                <div className="nebula-card">
                  <h2 className="nebula-card-title" style={{ marginBottom: '0.5rem' }}>Prize Pool</h2>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--nebula-lime)' }}>
                    {tournament.prizePool} {tournament.prizeCurrency || 'USD'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Participants */}
        {activeTab === 'participants' && (
          <div className="nebula-card">
            <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>Approved Competitors</h2>
            {registrations.filter((r) => r.status === 'APPROVED').length === 0 ? (
              <div className="nebula-empty-state">
                <p>No competitors approved yet.</p>
              </div>
            ) : (
              <div className="nebula-table-wrapper">
                <table className="nebula-table">
                  <thead>
                    <tr>
                      <th>Seed</th>
                      <th>Competitor</th>
                      <th>Type</th>
                      <th>Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations
                      .filter((r) => r.status === 'APPROVED')
                      .map((r, index) => (
                        <tr key={r.id}>
                          <td><strong>#{r.seed || index + 1}</strong></td>
                          <td><strong>{r.team?.name || r.gamerProfile?.inGameName || 'Solo Competitor'}</strong></td>
                          <td>{tournament.participationType}</td>
                          <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Bracket */}
        {activeTab === 'bracket' && (
          <div>
            {matches.length === 0 ? (
              <div className="nebula-card nebula-empty-state">
                <div className="nebula-empty-icon">⚔️</div>
                <h3>Bracket Fixtures Pending</h3>
                <p>Matches will populate once the organizer generates the tournament bracket.</p>
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
                        <span className={`nebula-badge ${isCompleted ? 'nebula-badge-violet' : 'nebula-badge-neutral'}`}>
                          {m.status}
                        </span>
                      </div>

                      <div className={`nebula-match-row ${p1?.isWinner ? 'winner' : ''}`} style={{ marginBottom: '0.4rem' }}>
                        <span>{p1?.registration?.team?.name || p1?.registration?.gamerProfile?.inGameName || 'TBD'}</span>
                        <span className="nebula-match-score">{p1?.score ?? '-'}</span>
                      </div>

                      <div className={`nebula-match-row ${p2?.isWinner ? 'winner' : ''}`}>
                        <span>{p2?.registration?.team?.name || p2?.registration?.gamerProfile?.inGameName || 'TBD'}</span>
                        <span className="nebula-match-score">{p2?.score ?? '-'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Standings */}
        {activeTab === 'standings' && (
          <div className="nebula-card">
            <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>Stage Standings</h2>
            {standings.length === 0 ? (
              <div className="nebula-empty-state">
                <p>Standings will be updated as matches conclude.</p>
              </div>
            ) : (
              <div className="nebula-table-wrapper">
                <table className="nebula-table">
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
                        <td><strong>#{s.rank || idx + 1}</strong></td>
                        <td><strong>{s.participantName || s.team?.name || 'Competitor'}</strong></td>
                        <td>{s.points ?? 0}</td>
                        <td style={{ color: 'var(--nebula-lime)' }}>{s.wins ?? 0}</td>
                        <td style={{ color: 'var(--nebula-coral)' }}>{s.losses ?? 0}</td>
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
          <div className="nebula-modal-overlay" onClick={() => setShowRegisterModal(false)}>
            <div className="nebula-modal" onClick={(e) => e.stopPropagation()}>
              <div className="nebula-modal-header">
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Register for {tournament.name || tournament.title}</h2>
                <button className="nebula-modal-close" onClick={() => setShowRegisterModal(false)}>×</button>
              </div>

              {regError && <div className="nebula-alert nebula-alert-danger">{regError}</div>}
              {regSuccess && <div className="nebula-alert nebula-alert-success">{regSuccess}</div>}

              <form onSubmit={handleRegisterSubmit}>
                {tournament.participationType === 'TEAM' ? (
                  <div>
                    {myTeams.length === 0 ? (
                      <div className="nebula-empty-state" style={{ padding: '1rem' }}>
                        <p style={{ marginBottom: '1rem' }}>This tournament requires team participation. You do not captain an active squad.</p>
                        <Link to="/gamer/teams" className="nebula-btn nebula-btn-primary">
                          Create Team Roster
                        </Link>
                      </div>
                    ) : (
                      <div className="nebula-form-group">
                        <label className="nebula-label">Select Team *</label>
                        <select
                          value={selectedTeamId}
                          onChange={(e) => setSelectedTeamId(e.target.value)}
                          className="nebula-select"
                          required
                        >
                          {myTeams.map((t) => {
                            const teamObj = t.team || t;
                            return (
                              <option key={teamObj.id} value={teamObj.id}>
                                {teamObj.name} [{teamObj.tag || 'TEAM'}]
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: 'var(--nebula-text-secondary)', lineHeight: '1.5' }}>
                    You are registering as an individual competitor. Your match results will be recorded directly into your Gamer Profile.
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="nebula-btn nebula-btn-ghost" onClick={() => setShowRegisterModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="nebula-btn nebula-btn-primary"
                    disabled={submittingReg || (tournament.participationType === 'TEAM' && myTeams.length === 0)}
                  >
                    {submittingReg ? 'Submitting...' : 'Confirm Registration'}
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
