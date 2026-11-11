import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GamerLayout from '../../layouts/GamerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  Modal,
  Input,
  Select,
  Textarea,
  PrimaryButton,
  SecondaryButton,
  Badge,
  Avatar,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

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
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!inviteIdentifier || inviteIdentifier.trim().length < 3) {
      setLookupResult(null);
      setLookupError('');
      return;
    }
    const timer = setTimeout(async () => {
      setLookupLoading(true);
      setLookupError('');
      try {
        const res = await evoqService.lookupGamerByEvoqId(inviteIdentifier.trim());
        setLookupResult(res);
        setLookupError('');
      } catch (err) {
        setLookupResult(null);
        if (inviteIdentifier.trim().toUpperCase().startsWith('EVOQ-')) {
          setLookupError('No competitor found with this EVOQ ID.');
        }
      } finally {
        setLookupLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [inviteIdentifier]);

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
      setError('Failed to load team rosters.');
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
      const teamSlug =
        createForm.slug ||
        createForm.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      await evoqService.createTeam({
        ...createForm,
        slug: teamSlug,
      });
      setSuccess(`Squad "${createForm.name}" created! You are the Captain.`);
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        tag: '',
        slug: '',
        gameId: games[0]?.id || '',
        bio: '',
        logoUrl: '',
      });
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
      setSuccess(`Invitation sent to ${inviteIdentifier.trim()}!`);
      setActiveTeamForInvite(null);
      setInviteIdentifier('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to dispatch squad invitation.');
    } finally {
      setInviting(false);
    }
  };

  const handleLeaveTeam = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to leave ${teamName}?`)) return;
    setError('');
    try {
      await evoqService.leaveTeam(teamId);
      setSuccess(`You have left ${teamName}.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to leave squad.');
    }
  };

  return (
    <GamerLayout
      title="My Competitive Teams"
      actions={
        <PrimaryButton
          icon="plus"
          size="sm"
          onClick={() => setShowCreateModal(true)}
        >
          Create Squad
        </PrimaryButton>
      }
    >
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

      {/* ── Pending Invitations Section ── */}
      {invitations.length > 0 && (
        <div className="evoq-card" style={{ marginBottom: '24px', borderColor: 'var(--evoq-border-accent)' }}>
          <SectionHeader
            title="Pending Squad Invitations"
            subtitle="Rosters requesting your competitive membership"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invitations.map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  backgroundColor: 'var(--evoq-surface-elevated)',
                  borderRadius: 'var(--evoq-radius-sm)',
                  border: '1px solid var(--evoq-border)',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar src={inv.team?.logoUrl} name={inv.team?.name} size="md" />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--evoq-text-primary)' }}>
                        {inv.team?.name}
                      </strong>
                      <Badge variant="lime">[{inv.team?.tag || 'TEAM'}]</Badge>
                      <Badge variant="neutral">{inv.role || 'PLAYER'}</Badge>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--evoq-text-muted)' }}>
                      Invited by {inv.inviter?.username || 'Team Captain'} • {inv.team?.game?.name || 'Esports'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <PrimaryButton
                    size="sm"
                    icon="check"
                    onClick={() => handleRespondInvitation(inv.id, 'ACCEPT')}
                  >
                    Accept
                  </PrimaryButton>
                  <SecondaryButton
                    size="sm"
                    icon="x"
                    variant="danger"
                    onClick={() => handleRespondInvitation(inv.id, 'REJECT')}
                  >
                    Decline
                  </SecondaryButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Active Teams Roster List ── */}
      {loading ? (
        <SkeletonLoader type="card" count={2} height="160px" />
      ) : teams.length === 0 ? (
        <EmptyState
          icon="teams"
          title="No Active Squad Memberships"
          description="Form a competitive roster to compete in official team brackets and tournaments."
          action={
            <PrimaryButton icon="plus" onClick={() => setShowCreateModal(true)}>
              Create Your First Squad
            </PrimaryButton>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {teams.map((t) => {
            const teamObj = t.team || t;
            const role = t.role || (teamObj.captainId === t.userId ? 'CAPTAIN' : 'MEMBER');
            const isCaptain = role === 'CAPTAIN';
            const members = teamObj.members || [];

            return (
              <div key={teamObj.id} className="evoq-team-card">
                <div className="evoq-team-card-header">
                  <Avatar src={teamObj.logoUrl} name={teamObj.name} size="lg" />
                  <div className="evoq-team-card-info">
                    <div className="evoq-team-name-row">
                      <h3 className="evoq-team-card-title">
                        <Link to={`/teams/${teamObj.slug || teamObj.id}`}>{teamObj.name}</Link>
                      </h3>
                      {teamObj.tag && <Badge variant="lime">[{teamObj.tag}]</Badge>}
                    </div>
                    {teamObj.game && (
                      <span className="evoq-mono-label" style={{ color: 'var(--evoq-lime)' }}>
                        {teamObj.game.name}
                      </span>
                    )}
                  </div>
                </div>

                {teamObj.bio && (
                  <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                    {teamObj.bio}
                  </p>
                )}

                <div className="evoq-team-card-meta">
                  <div className="evoq-team-meta-col">
                    <span className="evoq-meta-label">MY ROLE</span>
                    <span className="evoq-meta-val" style={{ color: isCaptain ? 'var(--evoq-lime)' : 'inherit' }}>
                      {role}
                    </span>
                  </div>
                  <div className="evoq-team-meta-col">
                    <span className="evoq-meta-label">ROSTER</span>
                    <span className="evoq-meta-val">{members.length || 1} Competitor{members.length === 1 ? '' : 's'}</span>
                  </div>
                </div>

                {/* Team Members List */}
                {members.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span className="evoq-mono-label">ACTIVE ROSTER ({members.length})</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {members.map((m) => {
                        const mUser = m.user || {};
                        const mProfile = mUser.gamerProfile || {};
                        const mName = mProfile.displayName || mUser.username || 'Competitor';
                        const mEvoqId = mProfile.evoqId;
                        const mIgn = mProfile.inGameName;
                        const mRole = m.role || 'PLAYER';
                        return (
                          <div
                            key={m.id || m.userId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              borderRadius: 'var(--evoq-radius-sm)',
                              backgroundColor: 'var(--evoq-surface-elevated)',
                              border: '1px solid var(--evoq-border-subtle)',
                              fontSize: '0.82rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Avatar src={mProfile.avatarUrl || mUser.avatarUrl} name={mName} size="xs" />
                              <div>
                                <span style={{ fontWeight: 600, color: 'var(--evoq-text-primary)' }}>{mName}</span>
                                {mIgn && (
                                  <span style={{ color: 'var(--evoq-text-muted)', fontSize: '0.74rem', marginLeft: '6px' }}>
                                    IGN: {mIgn}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {mEvoqId && (
                                <span
                                  style={{
                                    fontFamily: 'var(--evoq-font-mono)',
                                    fontSize: '0.72rem',
                                    color: 'var(--evoq-lime)',
                                    background: 'rgba(201, 255, 82, 0.08)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(201, 255, 82, 0.2)',
                                  }}
                                >
                                  {mEvoqId}
                                </span>
                              )}
                              <Badge variant={mRole === 'CAPTAIN' ? 'lime' : 'neutral'} size="xs">
                                {mRole}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px' }}>
                  {isCaptain ? (
                    <PrimaryButton
                      size="sm"
                      icon="plus"
                      onClick={() => setActiveTeamForInvite(teamObj)}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Invite Member
                    </PrimaryButton>
                  ) : (
                    <SecondaryButton
                      size="sm"
                      variant="danger"
                      onClick={() => handleLeaveTeam(teamObj.id, teamObj.name)}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Leave Squad
                    </SecondaryButton>
                  )}
                  <Link
                    to={`/teams/${teamObj.slug || teamObj.id}`}
                    className="evoq-btn evoq-btn-secondary evoq-btn-sm"
                  >
                    <span>Portfolio</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Squad Modal ── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Competitive Squad"
        subtitle="Form an esports team to compete in title-specific brackets"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateSubmit} noValidate>
          <Input
            label="Squad Name"
            id="teamName"
            value={createForm.name}
            onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Sentinels Vanguard"
            required
          />

          <Input
            label="Squad Tag (2-5 letters)"
            id="teamTag"
            value={createForm.tag}
            onChange={(e) => setCreateForm((p) => ({ ...p, tag: e.target.value.toUpperCase() }))}
            placeholder="e.g. SEN"
            maxLength={5}
            required
            helperText="Short acronym displayed in tournament bracket fixtures."
          />

          <Select
            label="Primary Esports Title"
            id="teamGame"
            value={createForm.gameId}
            onChange={(e) => setCreateForm((p) => ({ ...p, gameId: e.target.value }))}
            required
          >
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>

          <Textarea
            label="Squad Bio & Mission"
            id="teamBio"
            value={createForm.bio}
            onChange={(e) => setCreateForm((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Introduce your team, ambitions, and competitive focus..."
            rows={3}
          />

          <Input
            label="Squad Logo URL (Optional)"
            id="teamLogo"
            value={createForm.logoUrl}
            onChange={(e) => setCreateForm((p) => ({ ...p, logoUrl: e.target.value }))}
            placeholder="https://example.com/logo.png"
          />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton onClick={() => setShowCreateModal(false)} disabled={creating}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={creating || !createForm.name.trim()} loading={creating}>
              {creating ? 'Creating Squad...' : 'Found Squad'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ── Invite Member Modal ── */}
      <Modal
        isOpen={!!activeTeamForInvite}
        onClose={() => {
          setActiveTeamForInvite(null);
          setInviteIdentifier('');
          setLookupResult(null);
          setLookupError('');
        }}
        title={`Invite to ${activeTeamForInvite?.name}`}
        subtitle="Dispatch an official roster invitation using competitor's EVOQ ID"
        maxWidth="460px"
      >
        <form onSubmit={handleSendInvite} noValidate>
          <Input
            label="Teammate EVOQ ID or Username"
            id="inviteIdentifier"
            value={inviteIdentifier}
            onChange={(e) => setInviteIdentifier(e.target.value)}
            placeholder="e.g. EVOQ-XXXXXX or username"
            required
            helperText="Enter teammate's permanent EVOQ ID or username for live verification."
          />

          {lookupLoading && (
            <div style={{ fontSize: '0.82rem', color: 'var(--evoq-text-muted)', margin: '-8px 0 14px 0' }}>
              Resolving player passport...
            </div>
          )}

          {lookupResult && (
            <div
              style={{
                padding: '12px 14px',
                marginBottom: '16px',
                backgroundColor: 'rgba(201, 255, 82, 0.05)',
                border: '1px solid var(--evoq-lime)',
                borderRadius: 'var(--evoq-radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar
                  src={lookupResult.avatarUrl}
                  name={lookupResult.displayName || lookupResult.username}
                  size="md"
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--evoq-text-primary)' }}>
                      {lookupResult.displayName || lookupResult.username}
                    </strong>
                    {lookupResult.evoqId && (
                      <span
                        style={{
                          fontFamily: 'var(--evoq-font-mono)',
                          fontSize: '0.72rem',
                          color: 'var(--evoq-lime)',
                          fontWeight: 700,
                          background: 'rgba(201, 255, 82, 0.12)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {lookupResult.evoqId}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)', marginTop: '2px' }}>
                    @{lookupResult.username}
                    {lookupResult.primaryGame?.name && ` • ${lookupResult.primaryGame.name}`}
                    {lookupResult.inGameName && ` • IGN: ${lookupResult.inGameName}`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {lookupError && (
            <div style={{ fontSize: '0.8rem', color: '#ff6b6b', margin: '-8px 0 14px 0' }}>
              {lookupError}
            </div>
          )}

          <Select
            label="Roster Role"
            id="inviteRole"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
          >
            <option value="PLAYER">Player (Starter)</option>
            <option value="SUBSTITUTE">Substitute</option>
            <option value="COACH">Coach</option>
            <option value="MANAGER">Manager</option>
          </Select>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton
              onClick={() => {
                setActiveTeamForInvite(null);
                setInviteIdentifier('');
                setLookupResult(null);
                setLookupError('');
              }}
              disabled={inviting}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={inviting || !inviteIdentifier.trim()} loading={inviting}>
              {inviting ? 'Dispatching...' : 'Invite to Squad'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </GamerLayout>
  );
}
