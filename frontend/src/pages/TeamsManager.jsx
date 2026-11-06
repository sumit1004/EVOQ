import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import FormInput from '../components/FormInput.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/platform.css';

export default function TeamsManager() {
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Create Team Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    description: '',
    primaryGameId: '',
    country: '',
    region: '',
    logoUrl: '',
  });

  // Invite Member Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [inviteForm, setInviteForm] = useState({
    usernameOrEmail: '',
    role: 'PLAYER',
  });

  const fetchData = async () => {
    try {
      const [myTeams, myInvs, allGames] = await Promise.all([
        evoqService.getMyTeams(),
        evoqService.getMyInvitations(),
        evoqService.getGames(),
      ]);
      setTeams(myTeams || []);
      setInvitations(myInvs || []);
      setGames(allGames || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await evoqService.createTeam(createForm);
      setCreateModalOpen(false);
      setCreateForm({
        name: '',
        slug: '',
        description: '',
        primaryGameId: '',
        country: '',
        region: '',
        logoUrl: '',
      });
      setMessage('Team created successfully!');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to create team');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      await evoqService.inviteTeamMember(selectedTeamId, inviteForm);
      setInviteModalOpen(false);
      setInviteForm({ usernameOrEmail: '', role: 'PLAYER' });
      setMessage('Invitation dispatched to player!');
    } catch (err) {
      alert(err.message || 'Failed to send invitation');
    }
  };

  const handleRespondInvitation = async (invitationId, action) => {
    try {
      await evoqService.respondInvitation(invitationId, action);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to process invitation');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="platform-page">Loading teams...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="platform-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Team Management</h1>
            <p className="page-subtitle">Form rosters, manage team roles, and accept invitations</p>
          </div>
          <button onClick={() => setCreateModalOpen(true)} className="btn-primary" style={{ width: 'auto' }}>
            + Create New Team
          </button>
        </div>

        {message && <div className="auth-alert success">{message}</div>}
        {error && <div className="auth-alert error">{error}</div>}

        {/* Pending Team Invitations */}
        {invitations.length > 0 && (
          <div className="evoq-card" style={{ marginBottom: 'var(--space-xl)', borderColor: 'var(--warning)' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--warning)', marginBottom: '1rem' }}>
              Pending Team Invitations ({invitations.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    backgroundColor: 'var(--surface-raised)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1.1rem' }}>{inv.team?.name}</h4>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                      Invited as: <strong>{inv.role}</strong> by @{inv.inviter?.username} • Title: {inv.team?.primaryGame?.name || 'Multi-title'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleRespondInvitation(inv.id, 'ACCEPT')}
                      className="btn-primary"
                      style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', width: 'auto' }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondInvitation(inv.id, 'REJECT')}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Teams List */}
        <h2 style={{ fontSize: '1.4rem', marginBottom: 'var(--space-md)' }}>My Teams</h2>
        {teams.length === 0 ? (
          <div className="evoq-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
              You are not a member of any competitive teams yet.
            </p>
            <button onClick={() => setCreateModalOpen(true)} className="btn-primary" style={{ display: 'inline-block', width: 'auto' }}>
              Create Your First Team
            </button>
          </div>
        ) : (
          <div className="grid-cards">
            {teams.map((t) => (
              <div key={t.id} className="evoq-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{t.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
                      {t.primaryGame?.name || 'Competitive Team'}
                    </span>
                  </div>
                  <span className="badge badge-verified">{t.myRole}</span>
                </div>

                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {t.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <Link to={`/teams/${t.slug}`} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                    View Team Page →
                  </Link>
                  {['OWNER', 'CAPTAIN', 'MANAGER'].includes(t.myRole) && (
                    <button
                      onClick={() => {
                        setSelectedTeamId(t.id);
                        setInviteModalOpen(true);
                      }}
                      className="btn-primary"
                      style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    >
                      + Invite Player
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {createModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Competitive Team</h2>
              <button className="close-btn" onClick={() => setCreateModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="auth-form">
              <FormInput
                id="name"
                label="Team Name *"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Sentinels / Cloud9"
                required
              />

              <FormInput
                id="slug"
                label="Unique Team Slug (/teams/your-slug) *"
                value={createForm.slug}
                onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                placeholder="sentinels-esports"
                required
              />

              <div className="form-group">
                <label className="form-label">Primary Game Title</label>
                <select
                  value={createForm.primaryGameId}
                  onChange={(e) => setCreateForm({ ...createForm, primaryGameId: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select title...</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Tagline</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                  className="form-textarea"
                  placeholder="Semi-pro roster competing in tier-2 leagues..."
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '0.5rem' }}>
                <FormInput
                  id="country"
                  label="Country"
                  value={createForm.country}
                  onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })}
                  placeholder="Canada"
                />
                <FormInput
                  id="region"
                  label="Region"
                  value={createForm.region}
                  onChange={(e) => setCreateForm({ ...createForm, region: e.target.value })}
                  placeholder="North America"
                />
              </div>

              <FormInput
                id="logoUrl"
                label="Logo Image URL"
                value={createForm.logoUrl}
                onChange={(e) => setCreateForm({ ...createForm, logoUrl: e.target.value })}
                placeholder="https://..."
              />

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                Create Team Roster
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invite Player Modal */}
      {inviteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Invite Player to Roster</h2>
              <button className="close-btn" onClick={() => setInviteModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleInviteMember} className="auth-form">
              <FormInput
                id="usernameOrEmail"
                label="Player Username or Email *"
                value={inviteForm.usernameOrEmail}
                onChange={(e) => setInviteForm({ ...inviteForm, usernameOrEmail: e.target.value })}
                placeholder="pro_gamer / player@example.com"
                required
              />

              <div className="form-group">
                <label className="form-label">Assigned Roster Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="form-select"
                >
                  <option value="PLAYER">Player (Starter)</option>
                  <option value="SUBSTITUTE">Substitute</option>
                  <option value="CAPTAIN">Captain</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                Dispatch Invitation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

