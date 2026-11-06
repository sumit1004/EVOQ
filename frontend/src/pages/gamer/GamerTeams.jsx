import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GamerNavbar from '../../components/GamerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function GamerTeams() {
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create Team Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    tag: '',
    slug: '',
    gameId: '',
    bio: '',
    logoUrl: '',
  });

  // Invite Member Modal
  const [activeTeamForInvite, setActiveTeamForInvite] = useState(null);
  const [inviteIdentifier, setInviteIdentifier] = useState('');
  const [inviteRole, setInviteRole] = useState('PLAYER');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [myTeams, myInvites, gamesList] = await Promise.all([
        evoqService.getMyTeams(),
        evoqService.getMyInvitations().catch(() => []),
        evoqService.getGames().catch(() => []),
      ]);
      setTeams(myTeams || []);
      setInvitations(myInvites || []);
      setGames(gamesList || []);
      if (gamesList && gamesList.length > 0 && !createForm.gameId) {
        setCreateForm((prev) => ({ ...prev, gameId: gamesList[0].id }));
      }
    } catch (err) {
      setError('Failed to load teams.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      const teamSlug = createForm.slug || createForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await evoqService.createTeam({
        ...createForm,
        slug: teamSlug,
      });
      setSuccess(`Team "${createForm.name}" created! You are the Captain.`);
      setShowCreateModal(false);
      setCreateForm({ name: '', tag: '', slug: '', gameId: games[0]?.id || '', bio: '', logoUrl: '' });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create team.');
    } finally {
      setCreating(false);
    }
  };

  const handleRespondInvitation = async (invitationId, action) => {
    setError('');
    setSuccess('');
    try {
      await evoqService.respondInvitation(invitationId, action);
      setSuccess(`Invitation ${action.toLowerCase()}ed.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || `Failed to ${action} invitation.`);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!activeTeamForInvite) return;
    setInviting(true);
    setError('');
    try {
      await evoqService.inviteTeamMember(activeTeamForInvite.id, {
        identifier: inviteIdentifier.trim(),
        role: inviteRole,
      });
      setSuccess(`Invitation sent to ${inviteIdentifier}`);
      setActiveTeamForInvite(null);
      setInviteIdentifier('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to send invitation.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="nebula-shell">
      <GamerNavbar />
      <main className="nebula-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="nebula-badge nebula-badge-violet" style={{ marginBottom: '0.4rem' }}>
              ROSTER &amp; SQUADS
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>My Competitive Teams</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="nebula-btn nebula-btn-primary"
          >
            + Create New Squad
          </button>
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}
        {success && <div className="nebula-alert nebula-alert-success">{success}</div>}

        {/* Pending Invitations Alert Section */}
        {invitations.length > 0 && (
          <div className="nebula-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--nebula-cyan)' }}>
            <h2 className="nebula-card-title" style={{ color: 'var(--nebula-cyan)', marginBottom: '1rem' }}>
              <span>📩</span> Pending Team Invitations ({invitations.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1.25rem',
                    backgroundColor: 'var(--nebula-surface-elevated)',
                    borderRadius: 'var(--nebula-radius-md)',
                    border: '1px solid var(--nebula-border)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <strong>{inv.team?.name || 'Competitive Team'}</strong> [{inv.team?.tag || 'TAG'}]
                    <div style={{ fontSize: '0.8rem', color: 'var(--nebula-text-muted)' }}>
                      Invited as: <span className="nebula-badge nebula-badge-violet">{inv.role}</span> • Invited by: {inv.inviter?.username || 'Captain'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleRespondInvitation(inv.id, 'ACCEPT')}
                      className="nebula-btn nebula-btn-lime nebula-btn-sm"
                    >
                      Accept Roster Spot
                    </button>
                    <button
                      onClick={() => handleRespondInvitation(inv.id, 'DECLINE')}
                      className="nebula-btn nebula-btn-coral nebula-btn-sm"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teams Grid */}
        {loading ? (
          <div className="nebula-empty-state">
            <div className="nebula-empty-icon">⏳</div>
            <p>Loading your squads...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="nebula-card nebula-empty-state">
            <div className="nebula-empty-icon">🛡️</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Active Teams</h3>
            <p style={{ color: 'var(--nebula-text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              Create a squad to register in 5v5 or team-based tournaments, manage rosters, and earn team tournament achievements.
            </p>
            <button onClick={() => setShowCreateModal(true)} className="nebula-btn nebula-btn-primary">
              Create Your First Team
            </button>
          </div>
        ) : (
          <div className="nebula-grid-cards">
            {teams.map((item) => {
              const team = item.team || item;
              const role = item.role || 'MEMBER';
              const isCaptain = role === 'CAPTAIN';

              return (
                <div key={team.id} className="nebula-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{team.name}</h2>
                        <span className="nebula-badge nebula-badge-neutral">[{team.tag || 'TEAM'}]</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--nebula-cyan)', marginTop: '0.2rem', fontWeight: 600 }}>
                        {team.game?.name || 'Esports'}
                      </div>
                    </div>
                    <span className={`nebula-badge ${isCaptain ? 'nebula-badge-violet' : 'nebula-badge-lime'}`}>
                      {role}
                    </span>
                  </div>

                  {team.bio && (
                    <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', margin: '0 0 1.25rem 0' }}>
                      {team.bio}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--nebula-text-muted)', marginBottom: '1.25rem' }}>
                    <span>👥 Roster: {team.memberships?.length || team._count?.memberships || 1} members</span>
                    <span>🏆 Tournaments: {team._count?.registrations || 0}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link to={`/teams/${team.slug}`} className="nebula-btn nebula-btn-secondary nebula-btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                      Public Profile
                    </Link>
                    {isCaptain && (
                      <button
                        onClick={() => setActiveTeamForInvite(team)}
                        className="nebula-btn nebula-btn-cyan nebula-btn-sm"
                      >
                        + Invite Player
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Team Modal */}
        {showCreateModal && (
          <div className="nebula-modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="nebula-modal" onClick={(e) => e.stopPropagation()}>
              <div className="nebula-modal-header">
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Create Competitive Squad</h2>
                <button className="nebula-modal-close" onClick={() => setShowCreateModal(false)}>×</button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div className="nebula-form-group">
                  <label className="nebula-label">Team Name *</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                    placeholder="e.g. Sentinels Core"
                    className="nebula-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="nebula-form-group">
                    <label className="nebula-label">Team Tag (2-5 chars) *</label>
                    <input
                      type="text"
                      value={createForm.tag}
                      onChange={(e) => setCreateForm({ ...createForm, tag: e.target.value.toUpperCase() })}
                      required
                      maxLength="5"
                      placeholder="SEN"
                      className="nebula-input"
                    />
                  </div>
                  <div className="nebula-form-group">
                    <label className="nebula-label">Focus Game *</label>
                    <select
                      value={createForm.gameId}
                      onChange={(e) => setCreateForm({ ...createForm, gameId: e.target.value })}
                      className="nebula-select"
                      required
                    >
                      {games.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="nebula-form-group">
                  <label className="nebula-label">Custom Slug (optional)</label>
                  <input
                    type="text"
                    value={createForm.slug}
                    onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                    placeholder="sentinels-core"
                    className="nebula-input"
                  />
                </div>

                <div className="nebula-form-group">
                  <label className="nebula-label">Squad Bio / Motto</label>
                  <textarea
                    value={createForm.bio}
                    onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
                    rows="2"
                    placeholder="Tier 1 competitive squad competing in regional open qualifiers..."
                    className="nebula-textarea"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="nebula-btn nebula-btn-ghost" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="nebula-btn nebula-btn-primary" disabled={creating}>
                    {creating ? 'Creating Team...' : 'Form Team'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invite Member Modal */}
        {activeTeamForInvite && (
          <div className="nebula-modal-overlay" onClick={() => setActiveTeamForInvite(null)}>
            <div className="nebula-modal" onClick={(e) => e.stopPropagation()}>
              <div className="nebula-modal-header">
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  Invite Player to {activeTeamForInvite.name}
                </h2>
                <button className="nebula-modal-close" onClick={() => setActiveTeamForInvite(null)}>×</button>
              </div>

              <form onSubmit={handleSendInvite}>
                <div className="nebula-form-group">
                  <label className="nebula-label">Gamer Username or Email *</label>
                  <input
                    type="text"
                    value={inviteIdentifier}
                    onChange={(e) => setInviteIdentifier(e.target.value)}
                    required
                    placeholder="Username or user@example.com"
                    className="nebula-input"
                  />
                </div>

                <div className="nebula-form-group">
                  <label className="nebula-label">Roster Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="nebula-select"
                  >
                    <option value="PLAYER">PLAYER (Starting Roster)</option>
                    <option value="SUBSTITUTE">SUBSTITUTE</option>
                    <option value="COACH">COACH</option>
                    <option value="ANALYST">ANALYST</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="nebula-btn nebula-btn-ghost" onClick={() => setActiveTeamForInvite(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="nebula-btn nebula-btn-cyan" disabled={inviting}>
                    {inviting ? 'Dispatching...' : 'Send Roster Invitation'}
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

