import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import { evoqService } from '../services/evoq.service.js';
import {
  PrimaryButton,
  SecondaryButton,
  Badge,
  Tabs,
  StatCard,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
} from '../components/ui/index.js';
import { Icon } from '../components/Icons.jsx';

export default function PublicPlayerProfile() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    evoqService
      .getPublicProfile(slug)
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message || 'Player not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 1.5rem' }}>
          <SkeletonLoader height={340} />
        </div>
      </PublicLayout>
    );
  }

  if (error || !profile) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem' }}>
          <EmptyState
            icon="user"
            title="Player Profile Not Found"
            description={error || 'The requested competitor passport does not exist.'}
            actionLabel="Browse Tournaments"
            actionHref="/tournaments"
          />
        </div>
      </PublicLayout>
    );
  }

  const stats = profile.statistics?.[0] || {
    tournamentsPlayed: profile.careerRecords?.length || 0,
    tournamentsWon: profile.achievements?.filter((a) => a.type === 'CHAMPION' || a.type === 'WINNER').length || 0,
    matchesPlayed: profile.careerRecords?.length || 0,
    matchesWon: profile.careerRecords?.filter((c) => c.placement === 1).length || 0,
  };

  const achievements = profile.achievements || [];
  const careerRecords = profile.careerRecords || [];
  const identities = profile.gameIdentities || [];

  const tabs = [
    { id: 'overview', label: 'Overview & Game IDs' },
    { id: 'achievements', label: 'Verified Achievements', count: achievements.length },
    { id: 'timeline', label: 'Career Timeline', count: careerRecords.length },
  ];

  return (
    <PublicLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Profile Hero Panel */}
        <div className="evoq-panel" style={{ padding: 0, overflow: 'hidden' }}>
          {profile.bannerUrl ? (
            <img
              src={profile.bannerUrl}
              alt={profile.displayName || profile.inGameName}
              style={{ width: '100%', height: '220px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '160px',
                background: 'linear-gradient(135deg, rgba(201, 255, 82, 0.12) 0%, rgba(34, 211, 238, 0.08) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '1.5rem',
                borderBottom: '1px solid var(--evoq-border-subtle)',
              }}
            >
              <Badge variant="brand">VERIFIED COMPETITOR PASSPORT</Badge>
            </div>
          )}

          <div
            style={{
              padding: '1.5rem 2rem 2rem 2rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.inGameName}
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '12px',
                    border: '3px solid var(--evoq-bg-surface)',
                    marginTop: '-48px',
                    backgroundColor: 'var(--evoq-bg-subtle)',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '12px',
                    border: '3px solid var(--evoq-bg-surface)',
                    marginTop: '-48px',
                    backgroundColor: 'rgba(201, 255, 82, 0.15)',
                    color: 'var(--evoq-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.4rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {profile.inGameName ? profile.inGameName.slice(0, 2).toUpperCase() : 'EV'}
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
                    {profile.displayName || profile.inGameName}
                  </h1>
                  <Badge variant="brand">VERIFIED ESPORTS ID</Badge>
                </div>
                <div style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
                  <strong style={{ color: 'var(--evoq-text-primary)' }}>@{profile.user?.username || profile.inGameName}</strong>{' '}
                  {profile.country ? `• ${profile.country}` : ''}
                </div>
              </div>
            </div>

            <SecondaryButton as={Link} to="/tournaments" icon="tournament">
              Explore Active Events
            </SecondaryButton>
          </div>

          {profile.bio && (
            <div style={{ padding: '0 2rem 1.5rem 2rem', color: 'var(--evoq-text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
              {profile.bio}
            </div>
          )}
        </div>

        {/* Career Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <StatCard
            label="Tournaments Entered"
            value={stats.tournamentsPlayed}
            icon="tournament"
          />
          <StatCard
            label="1st Place Championships"
            value={stats.tournamentsWon}
            icon="trophy"
            accent="lime"
          />
          <StatCard
            label="Verified Badges"
            value={achievements.length}
            icon="badge"
            accent="cyan"
          />
          <StatCard
            label="Connected Titles"
            value={identities.length}
            icon="gamepad"
          />
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="evoq-panel">
              <SectionHeader
                title="Connected Publisher Handles"
                badge={`${identities.length} LINKED`}
                subtitle="Official gamer handles verified across game titles"
              />
              {identities.length === 0 ? (
                <p style={{ color: 'var(--evoq-text-secondary)', marginTop: '1rem' }}>No public game identities connected.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  {identities.map((id) => (
                    <div
                      key={id.id}
                      style={{
                        padding: '1rem',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '8px',
                        border: '1px solid var(--evoq-border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--evoq-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {id.game?.name || 'Esports Title'}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--evoq-text-primary)', marginTop: '0.15rem' }}>
                          {id.inGameIdentifier || id.inGameName}
                        </div>
                      </div>
                      <Badge variant="brand">VERIFIED</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="evoq-panel">
              <SectionHeader title="Competitor Passport" badge="REGISTRY" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--evoq-border-subtle)' }}>
                  <span style={{ color: 'var(--evoq-text-muted)' }}>Permanent Identifier:</span>
                  <code style={{ color: 'var(--evoq-accent)', fontFamily: 'var(--font-mono)' }}>/players/{profile.slug}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--evoq-border-subtle)' }}>
                  <span style={{ color: 'var(--evoq-text-muted)' }}>Country / Jurisdiction:</span>
                  <strong>{profile.country || 'Global'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--evoq-text-muted)' }}>Passport Issued:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{new Date(profile.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Achievements */}
        {activeTab === 'achievements' && (
          <div>
            {achievements.length === 0 ? (
              <EmptyState
                icon="trophy"
                title="No Verified Achievements Yet"
                description="Achievements and trophies are automatically awarded upon concluding official tournaments."
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="evoq-panel"
                    style={{
                      borderLeft: '4px solid var(--evoq-accent)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Badge variant="brand">{ach.type}</Badge>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--evoq-text-muted)' }}>
                        {new Date(ach.awardedAt || ach.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--evoq-text-primary)' }}>
                      {ach.title}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--evoq-text-secondary)' }}>
                      Game: {ach.game?.name || 'Official Title'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Timeline */}
        {activeTab === 'timeline' && (
          <div className="evoq-panel">
            <SectionHeader
              title="Career Timeline"
              badge={`${careerRecords.length} EVENTS`}
              subtitle="Chronological tournament competition record"
            />
            {careerRecords.length === 0 ? (
              <p style={{ color: 'var(--evoq-text-secondary)', marginTop: '1rem' }}>No tournament records logged yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {careerRecords.map((cr) => (
                  <div
                    key={cr.id}
                    style={{
                      padding: '1rem 1.25rem',
                      background: 'rgba(0,0,0,0.25)',
                      borderRadius: '8px',
                      border: '1px solid var(--evoq-border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--evoq-text-primary)', fontSize: '1rem' }}>
                        {cr.tournament?.name || cr.tournament?.title || 'Tournament Event'}
                      </strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--evoq-text-muted)', marginTop: '0.2rem' }}>
                        Title: {cr.game?.name || 'Esports'} • {new Date(cr.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={cr.placement === 1 ? 'brand' : 'neutral'}>
                      {cr.placement ? `RANK #${cr.placement}` : 'COMPETITOR'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
