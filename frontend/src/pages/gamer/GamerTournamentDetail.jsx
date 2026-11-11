import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import GamerLayout from '../../layouts/GamerLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { evoqService } from '../../services/evoq.service.js';
import {
  Modal,
  Select,
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

export default function GamerTournamentDetail() {
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

  // Register modal
  const [showRegModal, setShowRegModal] = useState(false);
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
      setError('Failed to load tournament details.');
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

      if (matchData && matchData.length > 0) {
        for (const m of matchData) {
          if (m.credentials && m.credentials.isReleased) {
            setCredentialInfo(m.credentials);
            break;
          }
        }
      }
    } catch (err) {
      console.error('Subdata load failed:', err);
    }
  }

  const handleOpenRegister = async () => {
    setShowRegModal(true);
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
        console.error('Error fetching teams:', err);
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
          setRegError('Please select a team to register.');
          setSubmittingReg(false);
          return;
        }
        payload.teamId = selectedTeamId;
      }
      await evoqService.registerTournament(tournament.id, payload);
      setRegSuccess('Registration submitted! Awaiting organizer review.');
      await loadTournament();
      setTimeout(() => setShowRegModal(false), 1500);
    } catch (err) {
      setRegError(err.response?.data?.error?.message || 'Registration failed.');
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw your tournament registration?')) return;
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
      <GamerLayout>
        <SkeletonLoader type="card" count={3} height="180px" />
      </GamerLayout>
    );
  }

  if (error || !tournament) {
    return (
      <GamerLayout>
        <EmptyState
          icon="tournament"
          title="Tournament Not Found"
          description={error || 'The requested event is not available.'}
          action={
            <Link to="/gamer/tournaments" className="evoq-btn evoq-btn-primary evoq-btn-sm">
              Explore Open Tournaments
            </Link>
          }
        />
      </GamerLayout>
    );
  }

  const tabList = [
    { id: 'overview', label: 'Overview & Rules' },
    { id: 'participants', label: 'Participants', count: registrations.length },
    { id: 'matches', label: 'Brackets & Fixtures', count: matches.length },
    { id: 'standings', label: 'Standings', count: standings.length },
  ];

  return (
    <GamerLayout
      title={tournament.name || tournament.title}
      actions={
        <Link to="/gamer/tournaments" className="evoq-btn evoq-btn-secondary evoq-btn-sm">
          <Icon name="arrow-left" size={14} />
          <span>All Tournaments</span>
        </Link>
      }
    >
      {/* ── Tournament Hero Card ── */}
      <div className="evoq-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        {tournament.bannerUrl ? (
          <img
            src={tournament.bannerUrl}
            alt={tournament.name || tournament.title}
            style={{ width: '100%', height: '220px', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '140px',
              background: 'linear-gradient(135deg, #152212 0%, #080A08 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '16px 24px',
              boxSizing: 'border-box',
            }}
          >
            <Badge variant="lime">SANCTIONED TOURNAMENT</Badge>
          </div>
        )}

        <div
          style={{
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <Badge variant="lime">{tournament.game?.name || 'Competitive'}</Badge>
              {tournament.format && <Badge variant="neutral">{tournament.format.replace(/_/g, ' ')}</Badge>}
              <Badge variant="neutral">{tournament.participationType || 'TEAM'}</Badge>
              <StatusIndicator status={tournament.status} />
            </div>

            <h1 className="evoq-display-title" style={{ fontSize: 'clamp(1.6rem, 3.8vw, 2.5rem)', margin: '0 0 6px 0' }}>
              {tournament.name || tournament.title}
            </h1>

            <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Operated by{' '}
              <strong style={{ color: 'var(--evoq-text-primary)' }}>
                {tournament.organization?.name || tournament.organizerUser?.username || 'Verified Tournament Director'}
              </strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {myRegistration ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Badge variant={myRegistration.status === 'APPROVED' ? 'lime' : 'neutral'}>
                  STATUS: {myRegistration.status}
                </Badge>
                {['PENDING', 'APPROVED'].includes(myRegistration.status) && (
                  <SecondaryButton
                    variant="danger"
                    size="sm"
                    onClick={handleWithdraw}
                  >
                    Withdraw
                  </SecondaryButton>
                )}
              </div>
            ) : tournament.status === 'REGISTRATION_OPEN' ? (
              <PrimaryButton onClick={handleOpenRegister} icon="check" size="lg">
                Register Competitor
              </PrimaryButton>
            ) : (
              <Badge variant="neutral">REGISTRATION CLOSED</Badge>
            )}
          </div>
        </div>
      </div>

      {/* ── Released Match Credentials Alert (If Available) ── */}
      {credentialInfo && (
        <div
          className="evoq-card"
          style={{
            marginBottom: '24px',
            borderColor: 'var(--evoq-border-accent)',
            backgroundColor: '#111910',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Icon name="shield" size={18} color="#C9FF52" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--evoq-lime)' }}>
              MATCH ROOM CREDENTIALS RELEASED
            </h4>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {credentialInfo.lobbyName && (
              <div>
                <span className="evoq-mono-label">LOBBY / ROOM NAME</span>
                <div style={{ fontWeight: 700, color: 'var(--evoq-text-primary)', fontFamily: 'var(--evoq-font-mono)' }}>
                  {credentialInfo.lobbyName}
                </div>
              </div>
            )}
            {credentialInfo.password && (
              <div>
                <span className="evoq-mono-label">PASSWORD / PIN</span>
                <div style={{ fontWeight: 700, color: 'var(--evoq-lime)', fontFamily: 'var(--evoq-font-mono)' }}>
                  {credentialInfo.password}
                </div>
              </div>
            )}
            {credentialInfo.serverRegion && (
              <div>
                <span className="evoq-mono-label">SERVER REGION</span>
                <div style={{ fontWeight: 600, color: 'var(--evoq-text-primary)' }}>
                  {credentialInfo.serverRegion}
                </div>
              </div>
            )}
          </div>
          {credentialInfo.customInstructions && (
            <p style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--evoq-text-secondary)', borderTop: '1px solid var(--evoq-border-subtle)', paddingTop: '8px' }}>
              Note: {credentialInfo.customInstructions}
            </p>
          )}
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <Tabs tabs={tabList} activeTab={activeTab} onChange={setActiveTab} />

      {/* ── TAB 1: OVERVIEW & RULES ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div className="evoq-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: 0 }}>Tournament Format &amp; Details</h3>
            <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              {tournament.description || 'Official competitive esports tournament hosted under EVOQ standardized rules.'}
            </p>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '20px', color: 'var(--evoq-lime)' }}>
              Competition Rules
            </h4>
            <div style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {tournament.rules || 'Standard fair-play rules apply. Connected game handles required. Disconnections must be reported to the referee.'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="evoq-card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0' }}>Operation Metadata</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--evoq-text-muted)' }}>Format</span>
                  <strong style={{ color: 'var(--evoq-text-primary)' }}>{tournament.format?.replace(/_/g, ' ')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--evoq-text-muted)' }}>Slots Available</span>
                  <strong style={{ color: 'var(--evoq-text-primary)' }}>
                    {registrations.length} / {tournament.maxParticipants || 16}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--evoq-text-muted)' }}>Start Date</span>
                  <strong style={{ color: 'var(--evoq-text-primary)' }}>
                    {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBD'}
                  </strong>
                </div>
                {tournament.prizePool && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--evoq-text-muted)' }}>Prize Pool</span>
                    <strong style={{ color: 'var(--evoq-lime)' }}>{tournament.prizePool}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PARTICIPANTS ── */}
      {activeTab === 'participants' && (
        <div className="evoq-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: 0 }}>Registered Competitors ({registrations.length})</h3>
          {registrations.length === 0 ? (
            <EmptyState icon="teams" title="No Registrations Yet" description="Be the first to register for this event." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--evoq-surface-elevated)',
                    borderRadius: 'var(--evoq-radius-sm)',
                    border: '1px solid var(--evoq-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar
                      src={reg.team?.logoUrl || reg.user?.avatarUrl}
                      name={reg.team?.name || reg.user?.username}
                      size="sm"
                    />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--evoq-text-primary)' }}>
                        {reg.team?.name || reg.user?.username}
                      </strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--evoq-text-muted)' }}>
                        {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : 'Registered'}
                      </div>
                    </div>
                  </div>
                  <Badge variant={reg.status === 'APPROVED' ? 'lime' : 'neutral'} size="sm">
                    {reg.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: MATCHES & BRACKET ── */}
      {activeTab === 'matches' && (
        <div className="evoq-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: 0 }}>Fixtures &amp; Scheduled Rounds</h3>
          {matches.length === 0 ? (
            <EmptyState
              icon="matches"
              title="Bracket Not Generated Yet"
              description="Fixtures and match lobbies will be scheduled once registration closes."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {matches.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--evoq-surface-elevated)',
                    borderRadius: 'var(--evoq-radius-sm)',
                    border: '1px solid var(--evoq-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <span className="evoq-mono-label">{m.roundName || `ROUND ${m.round || 1}`}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--evoq-text-primary)' }}>
                        {m.teamA?.name || 'TBD'}
                      </span>
                      <span style={{ fontFamily: 'var(--evoq-font-display)', color: 'var(--evoq-lime)' }}>
                        {m.scoreA ?? '-'} : {m.scoreB ?? '-'}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--evoq-text-primary)' }}>
                        {m.teamB?.name || 'TBD'}
                      </span>
                    </div>
                  </div>
                  <StatusIndicator status={m.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: STANDINGS ── */}
      {activeTab === 'standings' && (
        <div className="evoq-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: 0 }}>Tournament Standings</h3>
          {standings.length === 0 ? (
            <EmptyState
              icon="trophy"
              title="Standings Not Released"
              description="Official standings will update as match results are verified."
            />
          ) : (
            <DataTable
              columns={[
                { key: 'rank', header: 'Rank', render: (val, _, idx) => `#${idx + 1}` },
                {
                  key: 'participant',
                  header: 'Competitor / Team',
                  render: (_, row) => row.team?.name || row.user?.username || 'Team',
                },
                { key: 'points', header: 'Points / Score', render: (val) => val ?? '-' },
                { key: 'status', header: 'Status', render: (val) => <StatusIndicator status={val || 'COMPLETED'} /> },
              ]}
              data={standings}
            />
          )}
        </div>
      )}

      {/* ── Register Competitor Modal ── */}
      <Modal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        title="Register for Tournament"
        subtitle={`Submit entry to ${tournament.name || tournament.title}`}
        maxWidth="460px"
      >
        <form onSubmit={handleRegisterSubmit} noValidate>
          {regError && (
            <div className="evoq-alert evoq-alert-danger" role="alert">
              <Icon name="x" size={16} />
              <span>{regError}</span>
            </div>
          )}

          {regSuccess && (
            <div className="evoq-alert evoq-alert-success" role="alert">
              <Icon name="check" size={16} />
              <span>{regSuccess}</span>
            </div>
          )}

          {tournament.participationType === 'TEAM' ? (
            <div>
              {myTeams.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.9rem', marginBottom: '14px' }}>
                    This tournament requires a squad roster. You do not hold an active team membership.
                  </p>
                  <Link to="/gamer/teams" className="evoq-btn evoq-btn-primary evoq-btn-sm">
                    Create or Join a Squad
                  </Link>
                </div>
              ) : (
                <Select
                  label="Select Registering Squad"
                  id="regTeam"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
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
                </Select>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', margin: '0 0 16px 0' }}>
              Registering your individual gamer handle <strong style={{ color: 'var(--evoq-text-primary)' }}>@{user?.username}</strong> for this tournament.
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton onClick={() => setShowRegModal(false)} disabled={submittingReg}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={submittingReg || (tournament.participationType === 'TEAM' && myTeams.length === 0)}
              loading={submittingReg}
            >
              {submittingReg ? 'Confirming Entry...' : 'Confirm Registration'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </GamerLayout>
  );
}
