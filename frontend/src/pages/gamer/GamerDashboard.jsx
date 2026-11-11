import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GamerLayout from '../../layouts/GamerLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { evoqService } from '../../services/evoq.service.js';
import GamerOnboardingModal from '../../components/GamerOnboardingModal.jsx';
import {
  StatCard,
  PrimaryButton,
  SecondaryButton,
  Badge,
  Avatar,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
  StatusIndicator,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function GamerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [copiedEvoqId, setCopiedEvoqId] = useState(false);

  const loadGamerData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profData, myTeams, tourns] = await Promise.all([
        evoqService.getMyProfile().catch(() => null),
        evoqService.getMyTeams().catch(() => []),
        evoqService.getTournaments({ pageSize: 4 }).catch(() => ({ tournaments: [] })),
      ]);
      setProfile(profData);
      setTeams(myTeams || []);
      setTournaments(tourns?.tournaments || tourns?.data || []);
    } catch (err) {
      setError('Failed to synchronize gamer profile with EVOQ network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGamerData();
  }, []);

  const handleCopyEvoqId = () => {
    if (!profile?.evoqId) return;
    navigator.clipboard.writeText(profile.evoqId);
    setCopiedEvoqId(true);
    setTimeout(() => setCopiedEvoqId(false), 2000);
  };

  const achievements = profile?.achievements || [];
  const careerRecords = profile?.careerRecords || [];
  const identities = profile?.gameIdentities || [];
  const completeness = profile?.completeness || 25;

  return (
    <GamerLayout activeTab="overview">
      {/* ── Gamer Onboarding Action Banner ── */}
      {(!profile?.evoqId || !profile?.isComplete || identities.length === 0) && (
        <div
          className="evoq-card"
          style={{
            marginBottom: '20px',
            border: '1px solid var(--evoq-lime)',
            backgroundColor: 'rgba(201, 255, 82, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: 'rgba(201, 255, 82, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--evoq-lime)',
                flexShrink: 0,
              }}
            >
              <Icon name="gamepad" size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--evoq-text-primary)' }}>
                  Complete Gamer Passport & Claim EVOQ ID
                </strong>
                <Badge variant="lime" size="sm">ACTION REQUIRED</Badge>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--evoq-text-secondary)' }}>
                Select your primary competitive title (Free Fire, BGMI, Valorant, CoD, CS2), set your in-game identity, and receive your permanent unique EVOQ ID.
              </p>
            </div>
          </div>

          <PrimaryButton
            size="sm"
            onClick={() => setShowOnboarding(true)}
            icon="arrow-right"
          >
            Start Onboarding
          </PrimaryButton>
        </div>
      )}

      {/* ── Gamer Hero Overview Card ── */}
      <div className="evoq-card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Avatar
              src={profile?.avatarUrl}
              name={profile?.displayName || user?.username}
              size="lg"
              verified={user?.emailVerified}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 className="evoq-display-title" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)' }}>
                  {profile?.displayName || user?.username || 'Competitor'}
                </h1>
                {profile?.primaryGame?.name && (
                  <Badge variant="lime">{profile.primaryGame.name.toUpperCase()}</Badge>
                )}
                <Badge variant="neutral">TIER-1 PRO</Badge>
                {user?.emailVerified && <Badge variant="neutral">VERIFIED</Badge>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                  Handle: <strong style={{ color: 'var(--evoq-text-primary)' }}>@{user?.username}</strong>
                  {profile?.country ? ` • ${profile.country}` : ''}
                  {identities.length > 0 && ` • ${identities.length} Connected Game${identities.length === 1 ? '' : 's'}`}
                </p>

                {profile?.evoqId ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '3px 10px',
                      background: 'rgba(201, 255, 82, 0.08)',
                      border: '1px solid rgba(201, 255, 82, 0.3)',
                      borderRadius: 'var(--evoq-radius-sm)',
                      fontFamily: 'var(--evoq-font-mono)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <span style={{ color: 'var(--evoq-text-muted)', fontSize: '0.72rem' }}>EVOQ ID</span>
                    <strong style={{ color: 'var(--evoq-lime)', letterSpacing: '0.05em' }}>
                      {profile.evoqId}
                    </strong>
                    <button
                      type="button"
                      onClick={handleCopyEvoqId}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedEvoqId ? 'var(--evoq-lime)' : 'var(--evoq-text-secondary)',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Copy EVOQ ID"
                    >
                      <Icon name={copiedEvoqId ? 'check' : 'copy'} size={13} />
                      <span style={{ fontSize: '0.7rem' }}>{copiedEvoqId ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowOnboarding(true)}
                    className="evoq-btn evoq-btn-secondary evoq-btn-xs"
                    style={{ color: 'var(--evoq-lime)', borderColor: 'var(--evoq-lime)' }}
                  >
                    Claim EVOQ ID
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/gamer/profile" className="evoq-btn evoq-btn-secondary evoq-btn-sm">
              <Icon name="user" size={14} />
              <span>Gamer Passport</span>
            </Link>
            <Link to="/gamer/profile/edit" className="evoq-btn evoq-btn-primary evoq-btn-sm">
              <Icon name="settings" size={14} />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>

        {/* Profile Completeness Bar */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--evoq-border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--evoq-text-muted)', fontFamily: 'var(--evoq-font-mono)' }}>
              PROFILE READINESS
            </span>
            <span style={{ color: 'var(--evoq-lime)', fontWeight: 700, fontFamily: 'var(--evoq-font-mono)' }}>
              {completeness}% COMPLETE
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '5px',
              backgroundColor: 'var(--evoq-bg)',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${completeness}%`,
                height: '100%',
                backgroundColor: 'var(--evoq-lime)',
                borderRadius: '9999px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="evoq-alert evoq-alert-danger" role="alert">
          <Icon name="x" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Key Performance Metrics ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          label="Active Rosters"
          value={teams.length}
          subtext="Competitive squad memberships"
          icon="teams"
        />
        <StatCard
          label="Verified Trophies"
          value={achievements.length}
          subtext="Permanent match achievements"
          icon="trophy"
          lime
        />
        <StatCard
          label="Connected Games"
          value={identities.length}
          subtext="Publisher accounts verified"
          icon="games"
        />
        <StatCard
          label="Career Entries"
          value={careerRecords.length}
          subtext="Official sanctioned events"
          icon="matches"
        />
      </div>

      {/* ── 2-Column Responsive Workspace Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Left Column: Active Events & Trophies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Recommended Tournaments */}
          <div className="evoq-card">
            <SectionHeader
              title="Official Tournaments"
              subtitle="Open events for individual & squad registration"
              action={
                <Link
                  to="/gamer/tournaments"
                  className="evoq-link-muted"
                  style={{ fontSize: '0.82rem', color: 'var(--evoq-lime)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Explore Arena</span>
                  <Icon name="arrow-right" size={13} />
                </Link>
              }
            />

            {loading ? (
              <SkeletonLoader type="card" count={2} height="110px" />
            ) : tournaments.length === 0 ? (
              <EmptyState
                icon="tournament"
                title="No Tournaments Discovered"
                description="Check back soon or explore open global brackets."
                action={
                  <Link to="/tournaments" className="evoq-btn evoq-btn-secondary evoq-btn-sm">
                    Discover Events
                  </Link>
                }
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tournaments.map((t) => (
                  <Link
                    key={t.id}
                    to={`/gamer/tournaments/${t.slug}`}
                    className="evoq-card evoq-card-hover"
                    style={{
                      padding: '14px 16px',
                      textDecoration: 'none',
                      backgroundColor: 'var(--evoq-surface-elevated)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                          <Badge variant="lime" size="sm">{t.game?.name || 'Competitive'}</Badge>
                          {t.format && <Badge variant="neutral" size="sm">{t.format.replace(/_/g, ' ')}</Badge>}
                        </div>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--evoq-text-primary)' }}>
                          {t.name || t.title}
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)' }}>
                          Max: {t.maxParticipants || 16} {t.participationType || 'Team'}s
                        </div>
                      </div>
                      <StatusIndicator status={t.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Verified Achievements Showcase */}
          <div className="evoq-card">
            <SectionHeader
              title="Verified Trophy Cabinet"
              subtitle="Immutable blockchain & tournament placements"
              action={
                <Link
                  to="/gamer/achievements"
                  className="evoq-link-muted"
                  style={{ fontSize: '0.82rem', color: 'var(--evoq-lime)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>All ({achievements.length})</span>
                  <Icon name="arrow-right" size={13} />
                </Link>
              }
            />

            {achievements.length === 0 ? (
              <EmptyState
                icon="trophy"
                title="Trophy Cabinet Empty"
                description="Place in official sanctioned tournaments to unlock verified badges."
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '12px',
                }}
              >
                {achievements.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    style={{
                      backgroundColor: 'var(--evoq-surface-elevated)',
                      border: '1px solid var(--evoq-border-accent)',
                      borderRadius: 'var(--evoq-radius-sm)',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <Badge variant="lime" size="sm">{a.type || 'PLACEMENT'}</Badge>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--evoq-text-primary)' }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)' }}>
                      {a.game?.name || 'Tournament'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Teams & Game Identities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* My Teams */}
          <div className="evoq-card">
            <SectionHeader
              title="My Competitive Teams"
              subtitle="Active squad rosters & memberships"
              action={
                <Link
                  to="/gamer/teams"
                  className="evoq-link-muted"
                  style={{ fontSize: '0.82rem', color: 'var(--evoq-lime)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Manage</span>
                  <Icon name="arrow-right" size={13} />
                </Link>
              }
            />

            {teams.length === 0 ? (
              <EmptyState
                icon="teams"
                title="No Team Roster Joined"
                description="Form a competitive roster with teammates to enter team-based brackets."
                action={
                  <Link to="/gamer/teams" className="evoq-btn evoq-btn-secondary evoq-btn-sm">
                    <Icon name="plus" size={13} />
                    <span>Create Team</span>
                  </Link>
                }
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {teams.map((t) => {
                  const teamObj = t.team || t;
                  const role = t.role || 'MEMBER';
                  return (
                    <div
                      key={teamObj.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 14px',
                        backgroundColor: 'var(--evoq-surface-elevated)',
                        borderRadius: 'var(--evoq-radius-sm)',
                        border: '1px solid var(--evoq-border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar src={teamObj.logoUrl} name={teamObj.name} size="sm" />
                        <div>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--evoq-text-primary)' }}>
                            {teamObj.name}
                          </strong>
                          <div style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)' }}>
                            Tag: [{teamObj.tag || 'TEAM'}]
                          </div>
                        </div>
                      </div>
                      <Badge variant={role === 'CAPTAIN' ? 'lime' : 'neutral'}>
                        {role}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Connected Game Identities */}
          <div className="evoq-card">
            <SectionHeader
              title="Connected Game IDs"
              subtitle="Linked Riot, Steam, and Epic accounts"
              action={
                <Link
                  to="/gamer/profile/edit"
                  className="evoq-link-muted"
                  style={{ fontSize: '0.82rem', color: 'var(--evoq-lime)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Icon name="plus" size={13} />
                  <span>Connect ID</span>
                </Link>
              }
            />

            {identities.length === 0 ? (
              <EmptyState
                icon="games"
                title="No Game ID Connected"
                description="Link your game handles to allow tournament organizers to invite you to match lobbies."
                action={
                  <Link to="/gamer/profile/edit" className="evoq-btn evoq-btn-primary evoq-btn-sm">
                    Link Game Handle
                  </Link>
                }
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {identities.map((id) => (
                  <div
                    key={id.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      backgroundColor: 'var(--evoq-surface-elevated)',
                      borderRadius: 'var(--evoq-radius-sm)',
                      border: '1px solid var(--evoq-border)',
                    }}
                  >
                    <div>
                      <span className="evoq-mono-label" style={{ color: 'var(--evoq-lime)' }}>
                        {id.game?.name || 'Esports Title'}
                      </span>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--evoq-text-primary)' }}>
                        {id.inGameIdentifier || id.inGameName}
                      </div>
                    </div>
                    {id.isVerified ? (
                      <Badge variant="lime" size="sm">VERIFIED</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">LINKED</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Gamer Onboarding Modal ── */}
      <GamerOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        initialProfile={profile}
        onComplete={(updated) => {
          setProfile((prev) => ({ ...prev, ...updated }));
          loadGamerData();
        }}
      />
    </GamerLayout>
  );
}
