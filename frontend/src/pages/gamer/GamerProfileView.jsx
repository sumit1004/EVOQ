import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GamerLayout from '../../layouts/GamerLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { evoqService } from '../../services/evoq.service.js';
import {
  Avatar,
  Badge,
  PrimaryButton,
  SecondaryButton,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
  StatCard,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function GamerProfileView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError('');
      try {
        const [profData, myTeams] = await Promise.all([
          evoqService.getMyProfile(),
          evoqService.getMyTeams().catch(() => []),
        ]);
        setProfile(profData);
        setTeams(myTeams || []);
      } catch (err) {
        setError('Failed to load gamer profile portfolio.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const achievements = profile?.achievements || [];
  const careerRecords = profile?.careerRecords || [];
  const identities = profile?.gameIdentities || [];

  return (
    <GamerLayout activeTab="profile">
      {loading ? (
        <SkeletonLoader type="card" count={3} height="180px" />
      ) : error ? (
        <div className="evoq-alert evoq-alert-danger" role="alert">
          <Icon name="x" size={16} />
          <span>{error}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* ── Player Portfolio Hero Card ── */}
          <div className="evoq-card" style={{ padding: 0, overflow: 'hidden' }}>
            {profile?.bannerUrl ? (
              <img
                src={profile.bannerUrl}
                alt={user?.username}
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
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
                <Badge variant="lime">OFFICIAL ESPORTS PASSPORT</Badge>
              </div>
            )}

            <div
              style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Avatar
                  src={profile?.avatarUrl}
                  name={profile?.displayName || user?.username}
                  size="xl"
                  verified={user?.emailVerified}
                  style={{ marginTop: '-48px', border: '3px solid var(--evoq-surface)' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h1 className="evoq-display-title" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
                      {profile?.displayName || user?.username}
                    </h1>
                    <Badge variant="lime">TIER-1 PRO</Badge>
                    {user?.emailVerified && <Badge variant="neutral">VERIFIED</Badge>}
                  </div>
                  <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                    Handle: <strong style={{ color: 'var(--evoq-text-primary)' }}>@{user?.username}</strong>
                    {profile?.country ? ` • ${profile.country}` : ''}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link to="/gamer/profile/edit" className="evoq-btn evoq-btn-primary evoq-btn-sm">
                  <Icon name="settings" size={14} />
                  <span>Edit Profile</span>
                </Link>
                {profile?.slug && (
                  <Link
                    to={`/players/${profile.slug}`}
                    target="_blank"
                    className="evoq-btn evoq-btn-secondary evoq-btn-sm"
                  >
                    <Icon name="external" size={14} />
                    <span>Public View</span>
                  </Link>
                )}
              </div>
            </div>

            {profile?.bio && (
              <div style={{ padding: '0 24px 24px 24px' }}>
                <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
                  {profile.bio}
                </p>
              </div>
            )}
          </div>

          {/* ── Key Statistics ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <StatCard
              label="Connected Games"
              value={identities.length}
              subtext="Linked game credentials"
              icon="games"
            />
            <StatCard
              label="Verified Trophies"
              value={achievements.length}
              subtext="Sanctioned placements"
              icon="trophy"
              lime
            />
            <StatCard
              label="Competitive Rosters"
              value={teams.length}
              subtext="Team memberships"
              icon="teams"
            />
            <StatCard
              label="Career Matches"
              value={careerRecords.length}
              subtext="Official results verified"
              icon="matches"
            />
          </div>

          {/* ── Connected Game Identities ── */}
          <div className="evoq-card">
            <SectionHeader
              title="Connected Game Identities"
              subtitle="Publisher handles verified for official competition lobbies"
              action={
                <Link to="/gamer/profile/edit" className="evoq-btn evoq-btn-secondary evoq-btn-sm">
                  <Icon name="plus" size={13} />
                  <span>Manage IDs</span>
                </Link>
              }
            />

            {identities.length === 0 ? (
              <EmptyState
                icon="games"
                title="No Game Accounts Connected"
                description="Link your game accounts to verify match lobbies and receive bracket credentials."
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '12px',
                }}
              >
                {identities.map((id) => (
                  <div
                    key={id.id}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'var(--evoq-surface-elevated)',
                      borderRadius: 'var(--evoq-radius-sm)',
                      border: '1px solid var(--evoq-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span className="evoq-mono-label" style={{ color: 'var(--evoq-lime)' }}>
                        {id.game?.name || 'Esports Title'}
                      </span>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--evoq-text-primary)' }}>
                        {id.inGameIdentifier || id.inGameName}
                      </div>
                      {id.region && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--evoq-text-muted)' }}>
                          Region: {id.region}
                        </div>
                      )}
                    </div>
                    {id.isVerified ? (
                      <Badge variant="lime" size="sm">VERIFIED</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">CONNECTED</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Verified Achievements & Placements ── */}
          <div className="evoq-card">
            <SectionHeader
              title="Verified Tournament Placements"
              subtitle="Sanctioned awards and competitive trophies"
            />

            {achievements.length === 0 ? (
              <EmptyState
                icon="trophy"
                title="No Placements Recorded Yet"
                description="Compete in approved EVOQ tournaments to earn verified permanent placement badges."
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '14px',
                }}
              >
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--evoq-surface-elevated)',
                      border: '1px solid var(--evoq-border-accent)',
                      borderRadius: 'var(--evoq-radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <Badge variant="lime" size="sm">{ach.type || 'CHAMPIONSHIP'}</Badge>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--evoq-text-primary)' }}>
                      {ach.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)' }}>
                      {ach.game?.name || 'Official Sanctioned Event'}
                    </div>
                    {ach.awardedAt && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--evoq-text-muted)', marginTop: 'auto' }}>
                        Awarded {new Date(ach.awardedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </GamerLayout>
  );
}
