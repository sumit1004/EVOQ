import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import { evoqService } from '../services/evoq.service.js';
import {
  PrimaryButton,
  SecondaryButton,
  Badge,
  DataTable,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
} from '../components/ui/index.js';
import { Icon } from '../components/Icons.jsx';

export default function PublicTeamProfile() {
  const { slug } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    evoqService
      .getTeamBySlug(slug)
      .then((data) => setTeam(data))
      .catch((err) => setError(err.message || 'Team squad not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 1.5rem' }}>
          <SkeletonLoader height={320} />
        </div>
      </PublicLayout>
    );
  }

  if (error || !team) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem' }}>
          <EmptyState
            icon="teams"
            title="Team Squad Not Found"
            description={error || 'The requested esports team does not exist or has disbanded.'}
            actionLabel="Browse Tournaments"
            actionHref="/tournaments"
          />
        </div>
      </PublicLayout>
    );
  }

  const rosterColumns = [
    {
      header: 'Gamer Profile',
      accessor: (m) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--evoq-text-primary)' }}>
            {m.gamerProfile?.displayName || m.user?.username || 'Competitor'}
          </div>
          {m.gamerProfile?.inGameName && (
            <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)', fontFamily: 'var(--font-mono)' }}>
              IGN: {m.gamerProfile.inGameName}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Squad Role',
      accessor: (m) => (
        <Badge variant={m.role === 'CAPTAIN' ? 'brand' : 'neutral'}>
          {m.role}
        </Badge>
      ),
    },
    {
      header: 'Enlisted Date',
      accessor: (m) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--evoq-text-muted)' }}>
          {new Date(m.joinedAt || m.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <PublicLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Team Hero Panel */}
        <div className="evoq-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              height: '180px',
              background: 'linear-gradient(135deg, rgba(201, 255, 82, 0.12) 0%, rgba(34, 211, 238, 0.08) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '1.5rem',
              borderBottom: '1px solid var(--evoq-border-subtle)',
            }}
          >
            <Badge variant="brand">REGISTERED ESPORTS SQUAD</Badge>
          </div>

          <div
            style={{
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '12px',
                  border: '3px solid var(--evoq-bg-surface)',
                  marginTop: '-42px',
                  backgroundColor: 'rgba(201, 255, 82, 0.15)',
                  color: 'var(--evoq-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {team.tag || team.name?.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
                    {team.name}
                  </h1>
                  <Badge variant="neutral">[{team.tag || 'TEAM'}]</Badge>
                </div>
                <div style={{ color: 'var(--evoq-accent)', fontSize: '0.88rem', marginTop: '0.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {team.game?.name || 'Competitive Esports Title'}
                </div>
              </div>
            </div>

            <SecondaryButton as={Link} to="/tournaments" icon="tournament">
              Find Tournaments
            </SecondaryButton>
          </div>

          {team.bio && (
            <div style={{ padding: '0 2rem 1.5rem 2rem', color: 'var(--evoq-text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
              {team.bio}
            </div>
          )}
        </div>

        {/* Content Grids */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {/* Active Roster */}
          <div className="evoq-panel">
            <SectionHeader
              title="Official Squad Roster"
              badge={`${team.memberships?.length || 0} MEMBERS`}
              subtitle="Registered competitive competitors on this squad"
            />
            <div style={{ marginTop: '1.25rem' }}>
              <DataTable
                columns={rosterColumns}
                data={team.memberships || []}
                keyField="id"
                emptyMessage="No roster members currently enlisted."
              />
            </div>
          </div>

          {/* Tournament Participation */}
          <div className="evoq-panel">
            <SectionHeader
              title="Tournament History"
              badge={`${team.registrations?.length || 0} SANCTIONED`}
              subtitle="Events this squad has registered or competed in"
            />
            {team.registrations && team.registrations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
                {team.registrations.map((r) => (
                  <div
                    key={r.id}
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
                      <strong style={{ color: 'var(--evoq-text-primary)' }}>
                        {r.tournament?.name || r.tournament?.title || 'Tournament Event'}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                        REGISTRATION ID: {r.id}
                      </div>
                    </div>
                    <Badge variant={r.status === 'APPROVED' ? 'brand' : 'neutral'}>{r.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--evoq-text-secondary)', marginTop: '1.25rem' }}>
                No tournament participation recorded yet for this squad.
              </p>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
