import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import GamerLayout from '../../layouts/GamerLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { evoqService } from '../../services/evoq.service.js';
import {
  Modal,
  Input,
  Select,
  PrimaryButton,
  SecondaryButton,
  Badge,
  Avatar,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

const TEAM_SIZE_PRESETS = [
  { value: 1, label: '1 Member — Solo', name: 'Solo' },
  { value: 2, label: '2 Members — Duo', name: 'Duo' },
  { value: 3, label: '3 Members — Trio', name: 'Trio' },
  { value: 4, label: '4 Members — Squad (Default)', name: 'Squad' },
  { value: 5, label: '5 Members — 5v5 Competitive', name: '5v5' },
  { value: 6, label: '6 Members', name: '6-Stack' },
  { value: 7, label: '7 Members', name: '7-Stack' },
  { value: 8, label: '8 Members', name: '8-Stack' },
  { value: 'custom', label: 'Custom Roster Size...', name: 'Custom' },
];

function getTeamSizeBadge(size) {
  if (size === 1) return { label: 'Solo (1)', variant: 'neutral' };
  if (size === 2) return { label: 'Duo (2)', variant: 'neutral' };
  if (size === 3) return { label: 'Trio (3)', variant: 'neutral' };
  if (size === 4) return { label: 'Squad (4)', variant: 'lime' };
  return { label: `Team (${size})`, variant: 'lime' };
}

export default function GamerTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Create Team Modal State ──
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamSizeSelection, setTeamSizeSelection] = useState(4);
  const [customTeamSize, setCustomTeamSize] = useState(5);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Staged member invitations in Create Modal
  const [stagedEvoqInput, setStagedEvoqInput] = useState('');
  const [stagedLookupLoading, setStagedLookupLoading] = useState(false);
  const [stagedLookupResult, setStagedLookupResult] = useState(null);
  const [stagedLookupError, setStagedLookupError] = useState('');
  const [stagedMembers, setStagedMembers] = useState([]); // [{ evoqId, displayName, avatarUrl, inGameName }]
  const fileInputRef = useRef(null);

  // ── Invite Member to Existing Team Modal ──
  const [activeTeamForInvite, setActiveTeamForInvite] = useState(null);
  const [inviteEvoqInput, setInviteEvoqInput] = useState('');
  const [inviteLookupLoading, setInviteLookupLoading] = useState(false);
  const [inviteLookupResult, setInviteLookupResult] = useState(null);
  const [inviteLookupError, setInviteLookupError] = useState('');
  const [inviting, setInviting] = useState(false);

  // ── Edit Team Size Modal ──
  const [activeTeamForResize, setActiveTeamForResize] = useState(null);
  const [newTeamSize, setNewTeamSize] = useState(4);
  const [resizing, setResizing] = useState(false);

  // ── Transfer Ownership Modal ──
  const [activeTeamForTransfer, setActiveTeamForTransfer] = useState(null);
  const [newOwnerId, setNewOwnerId] = useState('');
  const [transferring, setTransferring] = useState(false);

  // ── Delete Team Modal ──
  const [activeTeamForDelete, setActiveTeamForDelete] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(false);

  const effectiveMaxMembers =
    teamSizeSelection === 'custom' ? Number(customTeamSize) || 4 : Number(teamSizeSelection);

  useEffect(() => {
    loadData();
  }, []);

  // Live lookup for staged member in Create Modal
  useEffect(() => {
    if (!stagedEvoqInput || stagedEvoqInput.trim().length < 3) {
      setStagedLookupResult(null);
      setStagedLookupError('');
      return;
    }
    const timer = setTimeout(async () => {
      setStagedLookupLoading(true);
      setStagedLookupError('');
      try {
        const res = await evoqService.lookupGamerByEvoqId(stagedEvoqInput.trim());
        setStagedLookupResult(res);
        setStagedLookupError('');
      } catch (err) {
        setStagedLookupResult(null);
        setStagedLookupError('No competitor found with this EVOQ ID.');
      } finally {
        setStagedLookupLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [stagedEvoqInput]);

  // Live lookup for Quick Invite Modal
  useEffect(() => {
    if (!inviteEvoqInput || inviteEvoqInput.trim().length < 3) {
      setInviteLookupResult(null);
      setInviteLookupError('');
      return;
    }
    const timer = setTimeout(async () => {
      setInviteLookupLoading(true);
      setInviteLookupError('');
      try {
        const res = await evoqService.lookupGamerByEvoqId(inviteEvoqInput.trim());
        setInviteLookupResult(res);
        setInviteLookupError('');
      } catch (err) {
        setInviteLookupResult(null);
        setInviteLookupError('No competitor found with this EVOQ ID.');
      } finally {
        setInviteLookupLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [inviteEvoqInput]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [myTeams, myInvites] = await Promise.all([
        evoqService.getMyTeams(),
        evoqService.getMyInvitations().catch(() => []),
      ]);
      setTeams(myTeams || []);
      setInvitations(myInvites || []);
    } catch (err) {
      setError('Failed to load team rosters.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Logo Selection & Base64 preview
  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be under 5 MB.');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setLogoPreview(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add Member to Staged list in Create Modal
  const handleAddStagedMember = () => {
    if (!stagedLookupResult) return;

    const evoqId = (stagedLookupResult.evoqId || stagedEvoqInput).trim().toUpperCase();

    // Check if inviting oneself
    if (user && (user.id === stagedLookupResult.user?.id || user.id === stagedLookupResult.userId)) {
      setStagedLookupError('You cannot invite yourself. You are automatically the squad creator.');
      return;
    }

    // Check duplicate in staged list
    if (stagedMembers.some((m) => m.evoqId === evoqId)) {
      setStagedLookupError('This player is already in your invitation list.');
      return;
    }

    // Check team capacity: Creator takes 1 slot
    const maxInvites = effectiveMaxMembers - 1;
    if (stagedMembers.length >= maxInvites) {
      setStagedLookupError(
        `Team size is ${effectiveMaxMembers} (1 Creator + ${maxInvites} Members). Capacity reached.`
      );
      return;
    }

    setStagedMembers((prev) => [
      ...prev,
      {
        evoqId,
        displayName: stagedLookupResult.displayName || stagedLookupResult.username || 'Competitor',
        avatarUrl: stagedLookupResult.avatarUrl || null,
        inGameName: stagedLookupResult.inGameName || null,
        username: stagedLookupResult.username || '',
      },
    ]);

    setStagedEvoqInput('');
    setStagedLookupResult(null);
    setStagedLookupError('');
  };

  const handleRemoveStagedMember = (evoqIdToRemove) => {
    setStagedMembers((prev) => prev.filter((m) => m.evoqId !== evoqIdToRemove));
  };

  // Submit Simplified Team Creation
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const cleanName = teamName.trim();
    if (!cleanName || cleanName.length < 2) {
      setError('Please provide a team name of at least 2 characters.');
      return;
    }

    setCreating(true);
    setError('');
    setSuccess('');

    try {
      let uploadedLogoUrl = null;

      // Upload logo if file is selected
      if (logoPreview && logoPreview.startsWith('data:')) {
        setUploadingLogo(true);
        try {
          const uploadedAsset = await evoqService.uploadMedia(
            logoPreview,
            logoFile?.name || 'team-logo'
          );
          uploadedLogoUrl = uploadedAsset.url;
        } catch (uploadErr) {
          setError('Failed to upload team logo. Please try another image.');
          setCreating(false);
          setUploadingLogo(false);
          return;
        }
        setUploadingLogo(false);
      }

      const payload = {
        name: cleanName,
        maxMembers: effectiveMaxMembers,
        logoUrl: uploadedLogoUrl,
        memberEvoqIds: stagedMembers.map((m) => m.evoqId),
      };

      const newTeam = await evoqService.createTeam(payload);
      setSuccess(`Team "${newTeam.name}" created successfully!`);
      setShowCreateModal(false);

      // Reset form
      setTeamName('');
      setTeamSizeSelection(4);
      setCustomTeamSize(5);
      removeSelectedLogo();
      setStagedMembers([]);
      setStagedEvoqInput('');

      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create team.');
    } finally {
      setCreating(false);
      setUploadingLogo(false);
    }
  };

  // Quick Invite to Existing Team
  const handleSendExistingInvite = async (e) => {
    e.preventDefault();
    if (!activeTeamForInvite) return;

    const idToInvite = (inviteLookupResult?.evoqId || inviteEvoqInput).trim().toUpperCase();
    if (!idToInvite) return;

    setInviting(true);
    setError('');
    setSuccess('');

    try {
      await evoqService.inviteTeamMember(activeTeamForInvite.id, {
        evoqId: idToInvite,
        role: 'PLAYER',
      });
      setSuccess(`Invitation sent to ${idToInvite}!`);
      setActiveTeamForInvite(null);
      setInviteEvoqInput('');
      setInviteLookupResult(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to send invitation.');
    } finally {
      setInviting(false);
    }
  };

  // Cancel Outgoing Invitation
  const handleCancelInvitation = async (teamId, invitationId, inviteeName) => {
    if (!window.confirm(`Cancel invitation for ${inviteeName || 'this competitor'}?`)) return;
    setError('');
    setSuccess('');
    try {
      await evoqService.cancelTeamInvitation(teamId, invitationId);
      setSuccess('Invitation cancelled.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to cancel invitation.');
    }
  };

  // Respond to Incoming Invitation
  const handleRespondInvitation = async (invitationId, action) => {
    setError('');
    setSuccess('');
    try {
      await evoqService.respondInvitation(invitationId, action);
      setSuccess(`Invitation ${action.toLowerCase()}ed.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || `Failed to ${action.toLowerCase()} invitation.`);
    }
  };

  // Remove Member
  const handleRemoveMember = async (teamId, targetUserId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the squad?`)) return;
    setError('');
    setSuccess('');
    try {
      await evoqService.removeTeamMember(teamId, targetUserId);
      setSuccess(`${memberName} removed from squad.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to remove member.');
    }
  };

  // Leave Team
  const handleLeaveTeam = async (teamId, teamName, isOwner, memberCount) => {
    if (isOwner && memberCount > 1) {
      const team = teams.find((t) => t.id === teamId);
      setActiveTeamForTransfer(team);
      setError('You are the squad owner. Please transfer ownership to another member before leaving.');
      return;
    }

    if (!window.confirm(`Are you sure you want to leave ${teamName}?`)) return;
    setError('');
    setSuccess('');
    try {
      await evoqService.leaveTeam(teamId);
      setSuccess(`You have left ${teamName}.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to leave squad.');
    }
  };

  // Submit Resize
  const handleResizeSubmit = async (e) => {
    e.preventDefault();
    if (!activeTeamForResize) return;
    setResizing(true);
    setError('');
    setSuccess('');
    try {
      await evoqService.updateTeam(activeTeamForResize.id, {
        maxMembers: Number(newTeamSize),
      });
      setSuccess(`Roster size updated to ${newTeamSize} members.`);
      setActiveTeamForResize(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update team size.');
    } finally {
      setResizing(false);
    }
  };

  // Submit Ownership Transfer
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!activeTeamForTransfer || !newOwnerId) return;
    setTransferring(true);
    setError('');
    setSuccess('');
    try {
      await evoqService.transferTeamOwnership(activeTeamForTransfer.id, newOwnerId);
      setSuccess('Team ownership successfully transferred.');
      setActiveTeamForTransfer(null);
      setNewOwnerId('');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to transfer ownership.');
    } finally {
      setTransferring(false);
    }
  };

  // Submit Delete Team
  const handleDeleteTeam = async (e) => {
    e.preventDefault();
    if (!activeTeamForDelete) return;
    setDeletingTeam(true);
    setError('');
    setSuccess('');
    try {
      await evoqService.deleteTeam(activeTeamForDelete.id);
      setSuccess(`Squad "${activeTeamForDelete.name}" deleted successfully.`);
      setActiveTeamForDelete(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete squad.');
    } finally {
      setDeletingTeam(false);
    }
  };

  return (
    <GamerLayout
      title="My Competitive Teams"
      actions={
        <PrimaryButton icon="plus" size="sm" onClick={() => setShowCreateModal(true)}>
          Create Team
        </PrimaryButton>
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

      {/* ── Pending Received Invitations ── */}
      {invitations.length > 0 && (
        <div className="evoq-card" style={{ marginBottom: '24px', borderColor: 'var(--evoq-border-accent)' }}>
          <SectionHeader
            title="Pending Team Invitations"
            subtitle="Competitive squads requesting your roster participation"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invitations.map((inv) => {
              const invTeam = inv.team || {};
              const badge = getTeamSizeBadge(invTeam.maxMembers || 4);

              return (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Avatar src={invTeam.logoUrl} name={invTeam.name} size="md" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--evoq-text-primary)' }}>
                          {invTeam.name}
                        </strong>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                        <Badge variant="neutral">{inv.role || 'PLAYER'}</Badge>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--evoq-text-muted)', marginTop: '4px' }}>
                        Invited by @{inv.inviter?.username || 'Team Leader'}
                        {inv.inviter?.gamerProfile?.displayName && ` (${inv.inviter.gamerProfile.displayName})`}
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
              );
            })}
          </div>
        </div>
      )}

      {/* ── Active Teams Roster List ── */}
      {loading ? (
        <SkeletonLoader type="card" count={2} height="160px" />
      ) : teams.length === 0 ? (
        <EmptyState
          icon="teams"
          title="No Competitive Teams"
          description="Create a team with your desired roster size (Solo, Duo, Trio, Squad, or custom) and invite teammates with their EVOQ ID."
          action={
            <PrimaryButton icon="plus" onClick={() => setShowCreateModal(true)}>
              Create Your First Team
            </PrimaryButton>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
          {teams.map((t) => {
            const teamObj = t.team || t;
            const myRole = t.myRole || (teamObj.ownerId === user?.id ? 'OWNER' : 'MEMBER');
            const isOwner = myRole === 'OWNER';
            const isLeader = isOwner || myRole === 'CAPTAIN';

            const activeMembers = teamObj.members || [];
            const pendingInvites = teamObj.pendingInvitations || [];
            const maxCapacity = teamObj.maxMembers || 4;
            const confirmedCount = activeMembers.length;
            const pendingCount = pendingInvites.length;
            const totalOccupied = confirmedCount + pendingCount;
            const isFull = totalOccupied >= maxCapacity;
            const sizeBadge = getTeamSizeBadge(maxCapacity);

            return (
              <div
                key={teamObj.id}
                className="evoq-team-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  backgroundColor: 'var(--evoq-surface)',
                  border: '1px solid var(--evoq-border)',
                  borderRadius: 'var(--evoq-radius-md)',
                  padding: '20px',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Avatar src={teamObj.logoUrl} name={teamObj.name} size="lg" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--evoq-text-primary)' }}>
                          <Link to={`/teams/${teamObj.slug || teamObj.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {teamObj.name}
                          </Link>
                        </h3>
                        <Badge variant={sizeBadge.variant}>{sizeBadge.label}</Badge>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.8rem', color: isOwner ? 'var(--evoq-lime)' : 'var(--evoq-text-secondary)', fontWeight: 600 }}>
                          {isOwner ? '👑 Team Owner' : 'Competitor'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)' }}>•</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--evoq-text-muted)' }}>
                          Created {new Date(teamObj.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capacity Counter & Progress Bar */}
                <div
                  style={{
                    backgroundColor: 'var(--evoq-bg)',
                    borderRadius: 'var(--evoq-radius-sm)',
                    padding: '10px 14px',
                    border: '1px solid var(--evoq-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--evoq-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Roster Status
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isFull ? '#ffb84d' : 'var(--evoq-lime)' }}>
                      {confirmedCount} Confirmed {pendingCount > 0 && `(${pendingCount} pending)`} / {maxCapacity} Max
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      display: 'flex',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (confirmedCount / maxCapacity) * 100)}%`,
                        backgroundColor: 'var(--evoq-lime)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                    {pendingCount > 0 && (
                      <div
                        style={{
                          width: `${Math.min(100 - (confirmedCount / maxCapacity) * 100, (pendingCount / maxCapacity) * 100)}%`,
                          backgroundColor: '#ffb84d',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Confirmed Members List */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--evoq-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Confirmed Members ({confirmedCount})
                    </span>
                    {isOwner && maxCapacity > 1 && (
                      <button
                        onClick={() => {
                          setActiveTeamForResize(teamObj);
                          setNewTeamSize(maxCapacity);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--evoq-lime)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                        }}
                      >
                        Change Size
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {activeMembers.map((m) => {
                      const mUser = m.user || {};
                      const mProfile = mUser.gamerProfile || {};
                      const mName = mProfile.displayName || mUser.username || 'Competitor';
                      const mEvoqId = mProfile.evoqId;
                      const mIgn = mProfile.inGameName;
                      const mRole = m.role || 'PLAYER';
                      const isMemberOwner = mRole === 'OWNER';

                      return (
                        <div
                          key={m.id || m.userId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: 'var(--evoq-radius-sm)',
                            backgroundColor: 'var(--evoq-surface-elevated)',
                            border: '1px solid var(--evoq-border-subtle)',
                            fontSize: '0.84rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Avatar src={mProfile.avatarUrl || mUser.avatarUrl} name={mName} size="xs" />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--evoq-text-primary)' }}>{mName}</span>
                                {isMemberOwner && <span style={{ fontSize: '0.7rem' }}>👑</span>}
                              </div>
                              {mIgn && (
                                <span style={{ color: 'var(--evoq-text-muted)', fontSize: '0.74rem' }}>
                                  IGN: {mIgn}
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                            <Badge variant={isMemberOwner ? 'lime' : 'neutral'} size="xs">
                              {mRole}
                            </Badge>

                            {/* Remove button for owner (cannot remove self) */}
                            {isOwner && !isMemberOwner && (
                              <button
                                onClick={() => handleRemoveMember(teamObj.id, m.userId, mName)}
                                title="Remove member from squad"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ff6b6b',
                                  cursor: 'pointer',
                                  padding: '2px 4px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Icon name="x" size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pending Invitations Section (Visible to Team Leadership) */}
                {isLeader && pendingInvites.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffb84d', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                      Pending Invitations ({pendingInvites.length})
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {pendingInvites.map((inv) => {
                        const invProfile = inv.invitee?.gamerProfile || {};
                        const invName = invProfile.displayName || inv.invitee?.username || 'Competitor';
                        const invEvoqId = invProfile.evoqId;

                        return (
                          <div
                            key={inv.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: 'var(--evoq-radius-sm)',
                              backgroundColor: 'rgba(255, 184, 77, 0.05)',
                              border: '1px solid rgba(255, 184, 77, 0.2)',
                              fontSize: '0.84rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Avatar src={invProfile.avatarUrl} name={invName} size="xs" />
                              <div>
                                <span style={{ fontWeight: 600, color: 'var(--evoq-text-primary)' }}>{invName}</span>
                                <div style={{ fontSize: '0.72rem', color: '#ffb84d' }}>Pending acceptance</div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {invEvoqId && (
                                <span
                                  style={{
                                    fontFamily: 'var(--evoq-font-mono)',
                                    fontSize: '0.72rem',
                                    color: 'var(--evoq-text-secondary)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {invEvoqId}
                                </span>
                              )}
                              <SecondaryButton
                                size="sm"
                                variant="danger"
                                icon="x"
                                onClick={() => handleCancelInvitation(teamObj.id, inv.id, invName)}
                                style={{ padding: '2px 8px', fontSize: '0.75rem', height: '26px' }}
                              >
                                Cancel
                              </SecondaryButton>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Team Footer Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px', flexWrap: 'wrap' }}>
                  {isLeader && (
                    <PrimaryButton
                      size="sm"
                      icon="plus"
                      disabled={isFull}
                      onClick={() => {
                        setActiveTeamForInvite(teamObj);
                        setInviteEvoqInput('');
                        setInviteLookupResult(null);
                        setInviteLookupError('');
                      }}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      {isFull ? `Team Full (${maxCapacity}/${maxCapacity})` : 'Invite Member'}
                    </PrimaryButton>
                  )}

                  {!isOwner ? (
                    <SecondaryButton
                      size="sm"
                      variant="danger"
                      onClick={() => handleLeaveTeam(teamObj.id, teamObj.name, false, confirmedCount)}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Leave Team
                    </SecondaryButton>
                  ) : (
                    <>
                      {confirmedCount > 1 && (
                        <SecondaryButton
                          size="sm"
                          onClick={() => {
                            setActiveTeamForTransfer(teamObj);
                            const otherMember = activeMembers.find((m) => m.userId !== user?.id);
                            setNewOwnerId(otherMember?.userId || '');
                          }}
                        >
                          Transfer
                        </SecondaryButton>
                      )}
                      <SecondaryButton
                        size="sm"
                        variant="danger"
                        icon="trash"
                        onClick={() => setActiveTeamForDelete(teamObj)}
                        title="Delete squad"
                      >
                        Delete
                      </SecondaryButton>
                    </>
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

      {/* ── SIMPLIFIED CREATE TEAM MODAL ── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Competitive Team"
        subtitle="Form your competitive roster with flexible size and EVOQ ID invites"
        maxWidth="540px"
      >
        <form onSubmit={handleCreateSubmit} noValidate>
          {/* 1. Team Name */}
          <Input
            label="Team Name"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Sentinels, Apex Preds, Phoenix Duo"
            required
            helperText="Minimum 2 characters. Enter a distinct competitive team name."
          />

          {/* 2. Team Size Selector */}
          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="teamSizeSelector"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--evoq-text-secondary)',
                marginBottom: '6px',
              }}
            >
              Team Size (Roster Capacity)
            </label>
            <Select
              id="teamSizeSelector"
              value={teamSizeSelection}
              onChange={(e) => {
                const val = e.target.value;
                setTeamSizeSelection(val === 'custom' ? 'custom' : Number(val));
              }}
            >
              {TEAM_SIZE_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>

            {teamSizeSelection === 'custom' && (
              <div style={{ marginTop: '10px' }}>
                <Input
                  label="Enter Custom Team Size (1 - 32 Members)"
                  id="customTeamSize"
                  type="number"
                  min="1"
                  max="32"
                  value={customTeamSize}
                  onChange={(e) => setCustomTeamSize(Math.max(1, Math.min(32, Number(e.target.value) || 1)))}
                  required
                />
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '6px',
                fontSize: '0.78rem',
                color: 'var(--evoq-text-muted)',
              }}
            >
              <Icon name="users" size={14} color="var(--evoq-lime)" />
              {effectiveMaxMembers === 1 ? (
                <span>
                  <strong>Solo Roster:</strong> You will be the sole competitor on this team.
                </span>
              ) : (
                <span>
                  <strong>Roster breakdown:</strong> 1 Creator (You) + {effectiveMaxMembers - 1} Member Slots.
                </span>
              )}
            </div>
          </div>

          {/* 3. Team Logo (Optional Image Upload with preview) */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--evoq-text-secondary)',
                marginBottom: '6px',
              }}
            >
              Team Logo <span style={{ color: 'var(--evoq-text-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>

            {logoPreview ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px',
                  backgroundColor: 'var(--evoq-surface-elevated)',
                  border: '1px solid var(--evoq-border)',
                  borderRadius: 'var(--evoq-radius-sm)',
                }}
              >
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid var(--evoq-border-accent)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--evoq-text-primary)' }}>
                    {logoFile?.name || 'Selected Logo'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--evoq-lime)' }}>
                    Image loaded • Ready for creation
                  </div>
                </div>
                <SecondaryButton size="sm" variant="danger" icon="trash" onClick={removeSelectedLogo}>
                  Remove
                </SecondaryButton>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  border: '1px dashed var(--evoq-border)',
                  borderRadius: 'var(--evoq-radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--evoq-lime)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--evoq-border)')}
              >
                <Icon name="upload" size={24} color="var(--evoq-text-muted)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--evoq-text-primary)', marginTop: '8px', fontWeight: 600 }}>
                  Click to upload team badge or logo
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)', marginTop: '4px' }}>
                  PNG, JPG, WEBP, GIF up to 5 MB
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>

          {/* 4. Member EVOQ IDs (Optional Staged Invitations) */}
          {effectiveMaxMembers > 1 && (
            <div
              style={{
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: 'var(--evoq-bg)',
                borderRadius: 'var(--evoq-radius-sm)',
                border: '1px solid var(--evoq-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--evoq-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon name="teams" size={16} color="var(--evoq-lime)" />
                  Invite Members Using EVOQ ID
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)' }}>
                  {stagedMembers.length} / {effectiveMaxMembers - 1} invited
                </span>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)', margin: '0 0 12px 0' }}>
                Enter a competitor's unique EVOQ ID (e.g. <code>EVOQ-7K9M2P</code>). Invitations will be dispatched immediately on creation.
              </p>

              {/* Input Row */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={stagedEvoqInput}
                    onChange={(e) => setStagedEvoqInput(e.target.value.toUpperCase())}
                    placeholder="EVOQ-XXXXXX"
                    disabled={stagedMembers.length >= effectiveMaxMembers - 1}
                    className="evoq-input"
                    style={{
                      fontFamily: 'var(--evoq-font-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      width: '100%',
                    }}
                  />
                </div>
                <SecondaryButton
                  type="button"
                  onClick={handleAddStagedMember}
                  disabled={!stagedLookupResult || stagedMembers.length >= effectiveMaxMembers - 1}
                  icon="plus"
                >
                  Add
                </SecondaryButton>
              </div>

              {stagedLookupLoading && (
                <div style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)', marginTop: '6px' }}>
                  Resolving passport...
                </div>
              )}

              {/* Resolved Player Card Preview */}
              {stagedLookupResult && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    marginTop: '8px',
                    backgroundColor: 'rgba(201, 255, 82, 0.05)',
                    border: '1px solid rgba(201, 255, 82, 0.25)',
                    borderRadius: 'var(--evoq-radius-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar
                      src={stagedLookupResult.avatarUrl}
                      name={stagedLookupResult.displayName || stagedLookupResult.username}
                      size="xs"
                    />
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--evoq-text-primary)' }}>
                        {stagedLookupResult.displayName || stagedLookupResult.username}
                      </span>
                      {stagedLookupResult.inGameName && (
                        <span style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)', marginLeft: '6px' }}>
                          IGN: {stagedLookupResult.inGameName}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="lime" size="xs">
                    {stagedLookupResult.evoqId || stagedEvoqInput}
                  </Badge>
                </div>
              )}

              {stagedLookupError && (
                <div style={{ fontSize: '0.76rem', color: '#ff6b6b', marginTop: '6px' }}>
                  {stagedLookupError}
                </div>
              )}

              {/* Staged Members List */}
              {stagedMembers.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--evoq-text-muted)', textTransform: 'uppercase' }}>
                    Staged Invitations ({stagedMembers.length}):
                  </span>
                  {stagedMembers.map((sm) => (
                    <div
                      key={sm.evoqId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        backgroundColor: 'var(--evoq-surface-elevated)',
                        borderRadius: 'var(--evoq-radius-sm)',
                        border: '1px solid var(--evoq-border-subtle)',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar src={sm.avatarUrl} name={sm.displayName} size="xs" />
                        <span style={{ fontWeight: 600, color: 'var(--evoq-text-primary)' }}>{sm.displayName}</span>
                        <span
                          style={{
                            fontFamily: 'var(--evoq-font-mono)',
                            fontSize: '0.72rem',
                            color: 'var(--evoq-lime)',
                          }}
                        >
                          {sm.evoqId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStagedMember(sm.evoqId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff6b6b',
                          cursor: 'pointer',
                          padding: '2px 4px',
                        }}
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <SecondaryButton onClick={() => setShowCreateModal(false)} disabled={creating}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={creating || !teamName.trim()}
              loading={creating || uploadingLogo}
            >
              {creating ? (uploadingLogo ? 'Uploading Logo...' : 'Creating Squad...') : 'Create Squad'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ── QUICK INVITE MODAL (EXISTING TEAM) ── */}
      <Modal
        isOpen={!!activeTeamForInvite}
        onClose={() => {
          setActiveTeamForInvite(null);
          setInviteEvoqInput('');
          setInviteLookupResult(null);
          setInviteLookupError('');
        }}
        title={`Invite to ${activeTeamForInvite?.name}`}
        subtitle="Invite a competitor to your roster using their unique EVOQ ID"
        maxWidth="460px"
      >
        <form onSubmit={handleSendExistingInvite} noValidate>
          <div style={{ marginBottom: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: 'var(--evoq-surface-elevated)',
                borderRadius: 'var(--evoq-radius-sm)',
                border: '1px solid var(--evoq-border)',
                marginBottom: '14px',
                fontSize: '0.82rem',
              }}
            >
              <span style={{ color: 'var(--evoq-text-muted)' }}>Roster Capacity:</span>
              <span style={{ fontWeight: 700, color: 'var(--evoq-lime)' }}>
                {(activeTeamForInvite?.members?.length || 0) + (activeTeamForInvite?.pendingInvitations?.length || 0)} /{' '}
                {activeTeamForInvite?.maxMembers || 4} Max
              </span>
            </div>

            <Input
              label="Competitor EVOQ ID"
              id="inviteEvoqInput"
              value={inviteEvoqInput}
              onChange={(e) => setInviteEvoqInput(e.target.value.toUpperCase())}
              placeholder="EVOQ-XXXXXX"
              required
              helperText="Enter the 6-character EVOQ ID found on competitor's passport."
            />

            {inviteLookupLoading && (
              <div style={{ fontSize: '0.8rem', color: 'var(--evoq-text-muted)', margin: '-8px 0 12px 0' }}>
                Verifying competitor passport...
              </div>
            )}

            {inviteLookupResult && (
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
                    src={inviteLookupResult.avatarUrl}
                    name={inviteLookupResult.displayName || inviteLookupResult.username}
                    size="md"
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--evoq-text-primary)' }}>
                        {inviteLookupResult.displayName || inviteLookupResult.username}
                      </strong>
                      <Badge variant="lime" size="xs">
                        {inviteLookupResult.evoqId}
                      </Badge>
                    </div>
                    {inviteLookupResult.inGameName && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)', marginTop: '2px' }}>
                        IGN: {inviteLookupResult.inGameName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {inviteLookupError && (
              <div style={{ fontSize: '0.8rem', color: '#ff6b6b', margin: '-8px 0 12px 0' }}>
                {inviteLookupError}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton
              onClick={() => {
                setActiveTeamForInvite(null);
                setInviteEvoqInput('');
                setInviteLookupResult(null);
                setInviteLookupError('');
              }}
              disabled={inviting}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={inviting || !inviteEvoqInput.trim() || !inviteLookupResult}
              loading={inviting}
            >
              {inviting ? 'Sending...' : 'Send Invitation'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ── EDIT TEAM SIZE MODAL ── */}
      <Modal
        isOpen={!!activeTeamForResize}
        onClose={() => setActiveTeamForResize(null)}
        title={`Adjust Roster Size: ${activeTeamForResize?.name}`}
        subtitle="Set the maximum intended roster size for this competitive team"
        maxWidth="440px"
      >
        <form onSubmit={handleResizeSubmit} noValidate>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--evoq-text-muted)', margin: '0 0 14px 0' }}>
              Current confirmed members: <strong>{activeTeamForResize?.members?.length || 1}</strong>.
              You cannot set the roster size lower than confirmed members.
            </p>

            <Input
              label="New Maximum Roster Size"
              id="newTeamSize"
              type="number"
              min={activeTeamForResize?.members?.length || 1}
              max="32"
              value={newTeamSize}
              onChange={(e) => setNewTeamSize(Math.max(1, Math.min(32, Number(e.target.value) || 1)))}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton onClick={() => setActiveTeamForResize(null)} disabled={resizing}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" loading={resizing} disabled={resizing}>
              Save Team Size
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ── TRANSFER OWNERSHIP MODAL ── */}
      <Modal
        isOpen={!!activeTeamForTransfer}
        onClose={() => {
          setActiveTeamForTransfer(null);
          setNewOwnerId('');
        }}
        title={`Transfer Ownership: ${activeTeamForTransfer?.name}`}
        subtitle="Hand over full squad ownership to another confirmed active member"
        maxWidth="440px"
      >
        <form onSubmit={handleTransferSubmit} noValidate>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="newOwnerSelect"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--evoq-text-secondary)',
                marginBottom: '6px',
              }}
            >
              Select New Squad Owner
            </label>
            <Select
              id="newOwnerSelect"
              value={newOwnerId}
              onChange={(e) => setNewOwnerId(e.target.value)}
              required
            >
              <option value="">-- Choose active member --</option>
              {activeTeamForTransfer?.members
                ?.filter((m) => m.userId !== user?.id)
                .map((m) => {
                  const mProf = m.user?.gamerProfile || {};
                  const mLabel = mProf.displayName || m.user?.username || m.userId;
                  return (
                    <option key={m.userId} value={m.userId}>
                      {mLabel} ({mProf.evoqId || 'No EVOQ ID'})
                    </option>
                  );
                })}
            </Select>

            <p style={{ fontSize: '0.78rem', color: '#ffb84d', marginTop: '10px' }}>
              Warning: Once transferred, the selected player becomes the sole owner of this squad. You will be downgraded to Captain.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton onClick={() => setActiveTeamForTransfer(null)} disabled={transferring}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" loading={transferring} disabled={transferring || !newOwnerId}>
              Confirm Transfer
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ── DELETE TEAM MODAL ── */}
      <Modal
        isOpen={!!activeTeamForDelete}
        onClose={() => setActiveTeamForDelete(null)}
        title={`Delete Squad: ${activeTeamForDelete?.name}`}
        subtitle="Permanent destruction of team roster and invitations"
        maxWidth="440px"
      >
        <form onSubmit={handleDeleteTeam} noValidate>
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(255, 107, 107, 0.08)',
                border: '1px solid rgba(255, 107, 107, 0.25)',
                borderRadius: 'var(--evoq-radius-sm)',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b6b', fontWeight: 700, marginBottom: '6px' }}>
                <Icon name="trash" size={16} />
                <span>Permanent Action</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--evoq-text-secondary)', lineHeight: 1.4 }}>
                Are you sure you want to delete <strong>{activeTeamForDelete?.name}</strong>? All confirmed members, pending invitations, and team records will be permanently removed.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <SecondaryButton onClick={() => setActiveTeamForDelete(null)} disabled={deletingTeam}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" variant="danger" icon="trash" loading={deletingTeam} disabled={deletingTeam}>
              {deletingTeam ? 'Deleting...' : 'Permanently Delete Squad'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </GamerLayout>
  );
}
