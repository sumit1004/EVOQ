import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { evoqService } from '../services/evoq.service.js';
import {
  PrimaryButton,
  SecondaryButton,
  Badge,
  StatusIndicator,
  Tabs,
  Modal,
  Select,
  DataTable,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
} from '../components/ui/index.js';
import { Icon } from '../components/Icons.jsx';

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
      setError('Tournament not found or unavailable.');
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
      setRegSuccess('Registration confirmed! Awaiting organizer verification.');
      await loadTournament();
      setTimeout(() => setShowRegisterModal(false), 1500);
    } catch (err) {
      setRegError(err.response?.data?.error?.message || 'Registration failed.');
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Withdraw tournament registration?')) return;
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
      <PublicLayout>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <SkeletonLoader height={320} />
        </div>
      </PublicLayout>
    );
  }

  if (error || !tournament) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem' }}>
          <EmptyState
            icon="tournament"
            title="Tournament Not Found"
            description={error || 'The requested tournament does not exist or has been removed.'}
            actionLabel="Browse Tournaments"
            actionHref="/tournaments"
          />
        </div>
      </PublicLayout>
    );
  }

  const approvedRegistrations = registrations.filter((r) => r.status === 'APPROVED');
  const tournamentTitle = tournament.name || tournament.title || 'Tournament Event';
  const organizerName =
    tournament.organization?.name ||
    tournament.organizerUser?.username ||
    'EVOQ Sanctioned Organizer';

  const tabs = [
    { id: 'overview', label: 'Overview & Rules' },
    { id: 'participants', label: 'Competitors', count: approvedRegistrations.length },
    { id: 'bracket', label: 'Bracket Fixtures', count: matches.length },
    { id: 'standings', label: 'Stage Standings' },
  ];

  const participantColumns = [
    {
      header: 'Seed',
      accessor: (r, index) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--evoq-accent)' }}>
          #{r.seed || index + 1}
        </span>
      ),
    },
    {
      header: 'Competitor',
      accessor: (r) => (
        <div style={{ fontWeight: 800, color: 'var(--evoq-text-primary)' }}>
          {r.team?.name || r.gamerProfile?.inGameName || 'Solo Competitor'}
        </div>
      ),
    },
    {
      header: 'Mode',
      accessor: () => <Badge variant="neutral">{tournament.participationType}</Badge>,
    },
    {
      header: 'Registered Date',
      accessor: (r) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--evoq-text-muted)' }}>
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <PublicLayout>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Hero Banner Panel */}
        <div className="evoq-panel" style={{ padding: 0, overflow: 'hidden' }}>
          {tournament.bannerUrl ? (
            <img
              src={tournament.bannerUrl}
              alt={tournamentTitle}
              style={{ width: '100%', height: '260px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '180px',
                background: 'linear-gradient(135deg, rgba(201, 255, 82, 0.08) 0%, rgba(34, 211, 238, 0.08) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid var(--evoq-border-subtle)',
              }}
            >
              <Icon name="tournament" size={54} color="var(--evoq-accent)" />
            </div>
          )}

          <div
            style={{
              padding: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <Badge variant="brand">{tournament.game?.name || 'Esports Title'}</Badge>
                <Badge variant="neutral">{tournament.format?.replace(/_/g, ' ')}</Badge>
                <Badge variant="neutral">{tournament.participationType}</Badge>
                <StatusIndicator status={tournament.status} />
              </div>

              <h1 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '0 0 0.5rem 0', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
                {tournamentTitle}
              </h1>

              <p style={{ color: 'var(--evoq-text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                Sanctioned by{' '}
                <strong style={{ color: 'var(--evoq-text-primary)' }}>{organizerName}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {user ? (
                myRegistration ? (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Badge variant="brand">Registered ({myRegistration.status})</Badge>
                    {['PENDING', 'APPROVED'].includes(myRegistration.status) && (
                      <SecondaryButton
                        size="sm"
                        onClick={handleWithdraw}
                        style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      >
                        Withdraw Entry
                      </SecondaryButton>
                    )}
                  </div>
                ) : tournament.status === 'REGISTRATION_OPEN' ? (
                  <PrimaryButton onClick={handleOpenRegister} icon="sword">
                    Register Competitor
                  </PrimaryButton>
                ) : (
                  <Badge variant="neutral">Registration Closed</Badge>
                )
              ) : (
                <PrimaryButton as={Link} to="/gamer/login" icon="shield">
                  Sign In to Compete
                </PrimaryButton>
              )}
            </div>
          </div>
        </div>

        {/* Released Match Lobby Credentials */}
        {credentialInfo && (
          <div
            className="evoq-panel"
            style={{
              borderColor: 'var(--evoq-accent)',
              background: 'rgba(201, 255, 82, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Icon name="key" size={20} color="var(--evoq-accent)" />
              <span className="evoq-mono-label" style={{ color: 'var(--evoq-accent)' }}>
                MATCH LOBBY CREDENTIALS RELEASED
              </span>
            </div>
            <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Authoritative credentials have been released by the tournament referee for your match room fixture.
            </p>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {credentialInfo.lobbyName && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ROOM ID / NAME
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--evoq-text-primary)', marginTop: '0.2rem' }}>
                    {credentialInfo.lobbyName}
                  </div>
                </div>
              )}
              {credentialInfo.password && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ROOM PASSWORD
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--evoq-accent)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {credentialInfo.password}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="evoq-panel" style={{ gridColumn: 'span 2' }}>
              <SectionHeader title="Event Details" badge="OVERVIEW" />
              <p style={{ color: 'var(--evoq-text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
                {tournament.description || 'No detailed briefing published by the organizer.'}
              </p>

              {tournament.rules && (
                <div style={{ marginTop: '2.5rem' }}>
                  <SectionHeader title="Official Rulebook &amp; Code of Conduct" badge="RULES" />
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      border: '1px solid var(--evoq-border-subtle)',
                      fontSize: '0.9rem',
                      lineHeight: '1.7',
                      whiteSpace: 'pre-wrap',
                      color: 'var(--evoq-text-secondary)',
                      marginTop: '1rem',
                    }}
                  >
                    {tournament.rules}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="evoq-panel">
                <SectionHeader title="Specifications" badge="METRICS" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--evoq-border-subtle)' }}>
                    <span style={{ color: 'var(--evoq-text-muted)' }}>Format:</span>
                    <strong>{tournament.format?.replace(/_/g, ' ')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--evoq-border-subtle)' }}>
                    <span style={{ color: 'var(--evoq-text-muted)' }}>Participation:</span>
                    <strong>{tournament.participationType}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--evoq-border-subtle)' }}>
                    <span style={{ color: 'var(--evoq-text-muted)' }}>Capacity:</span>
                    <strong>{tournament.maxParticipants} Competitors</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--evoq-text-muted)' }}>Starts:</span>
                    <strong>{tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBA'}</strong>
                  </div>
                </div>
              </div>

              {tournament.prizePool && (
                <div className="evoq-panel">
                  <SectionHeader title="Prize Pool" badge="REWARD" />
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--evoq-accent)', fontFamily: 'var(--font-display)', marginTop: '0.75rem' }}>
                    {tournament.prizePool} {tournament.prizeCurrency || 'USD'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Participants */}
        {activeTab === 'participants' && (
          <div className="evoq-panel">
            <SectionHeader
              title="Approved Competitors"
              badge={`${approvedRegistrations.length} SEEDED`}
              subtitle="Registered and verified players/teams roster"
            />
            <div style={{ marginTop: '1.25rem' }}>
              <DataTable
                columns={participantColumns}
                data={approvedRegistrations}
                keyField="id"
                emptyMessage="No competitors approved for this bracket yet."
              />
            </div>
          </div>
        )}

        {/* Tab 3: Bracket / Matches */}
        {activeTab === 'bracket' && (
          <div>
            {matches.length === 0 ? (
              <EmptyState
                icon="bracket"
                title="Bracket Fixtures Pending"
                description="Matches will populate once the tournament organizer publishes seeded pairings."
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {matches.map((m) => {
                  const p1 = m.participants?.[0];
                  const p2 = m.participants?.[1];
                  const isCompleted = m.status === 'COMPLETED';

                  return (
                    <div key={m.id} className="evoq-panel" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span className="evoq-mono-label">
                          R{m.round?.sequence || 1} • MATCH #{m.matchNumber}
                        </span>
                        <Badge variant={isCompleted ? 'brand' : 'neutral'}>{m.status}</Badge>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '6px',
                          background: p1?.isWinner ? 'rgba(201, 255, 82, 0.1)' : 'rgba(0,0,0,0.25)',
                          border: p1?.isWinner ? '1px solid var(--evoq-accent)' : '1px solid var(--evoq-border-subtle)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <span style={{ fontWeight: p1?.isWinner ? 800 : 500, color: p1?.isWinner ? 'var(--evoq-accent)' : 'var(--evoq-text-primary)' }}>
                          {p1?.registration?.team?.name || p1?.registration?.gamerProfile?.inGameName || 'TBD'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{p1?.score ?? '-'}</span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '6px',
                          background: p2?.isWinner ? 'rgba(201, 255, 82, 0.1)' : 'rgba(0,0,0,0.25)',
                          border: p2?.isWinner ? '1px solid var(--evoq-accent)' : '1px solid var(--evoq-border-subtle)',
                        }}
                      >
                        <span style={{ fontWeight: p2?.isWinner ? 800 : 500, color: p2?.isWinner ? 'var(--evoq-accent)' : 'var(--evoq-text-primary)' }}>
                          {p2?.registration?.team?.name || p2?.registration?.gamerProfile?.inGameName || 'TBD'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{p2?.score ?? '-'}</span>
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
          <div className="evoq-panel">
            <SectionHeader
              title="Official Stage Standings"
              badge="AUDITED"
              subtitle="Leaderboard points and records verified by referees"
            />
            {standings.length === 0 ? (
              <EmptyState
                icon="trophy"
                title="Standings Not Yet Calculated"
                description="Standings will update automatically as completed match scores are verified."
              />
            ) : (
              <div style={{ marginTop: '1.25rem' }}>
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
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--evoq-accent)' }}>
                            #{s.rank || idx + 1}
                          </span>
                        </td>
                        <td>
                          <strong>{s.participantName || s.team?.name || 'Competitor'}</strong>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{s.points ?? 0}</td>
                        <td style={{ color: 'var(--evoq-accent)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {s.wins ?? 0}
                        </td>
                        <td style={{ color: '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {s.losses ?? 0}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--evoq-text-muted)' }}>
                          {s.ties ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Registration Modal */}
        <Modal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          title={`Register for ${tournamentTitle}`}
          size="md"
        >
          {regError && (
            <div className="evoq-alert evoq-alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
              <Icon name="alert" size={18} />
              <span>{regError}</span>
            </div>
          )}

          {regSuccess && (
            <div className="evoq-alert evoq-alert-success" role="alert" style={{ marginBottom: '1rem' }}>
              <Icon name="check" size={18} />
              <span>{regSuccess}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {tournament.participationType === 'TEAM' ? (
              <div>
                {myTeams.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <p style={{ color: 'var(--evoq-text-secondary)', marginBottom: '1.25rem' }}>
                      This tournament requires team participation. You do not captain an active squad.
                    </p>
                    <PrimaryButton as={Link} to="/gamer/teams">
                      Form Team Roster
                    </PrimaryButton>
                  </div>
                ) : (
                  <Select
                    label="Select Team Roster *"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    options={myTeams.map((t) => {
                      const teamObj = t.team || t;
                      return {
                        value: teamObj.id,
                        label: `${teamObj.name} [${teamObj.tag || 'TEAM'}]`,
                      };
                    })}
                    required
                  />
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--evoq-text-secondary)', lineHeight: '1.6', margin: 0 }}>
                You are entering as an individual competitor. Your match results and tournament placements will be permanently verified into your Gamer Profile.
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <SecondaryButton type="button" onClick={() => setShowRegisterModal(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                disabled={submittingReg || (tournament.participationType === 'TEAM' && myTeams.length === 0)}
              >
                {submittingReg ? 'Submitting...' : 'Confirm Registration'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      </div>
    </PublicLayout>
  );
}
