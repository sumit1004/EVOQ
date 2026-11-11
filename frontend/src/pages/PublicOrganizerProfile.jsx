import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import { evoqService } from '../services/evoq.service.js';
import {
  PrimaryButton,
  SecondaryButton,
  Badge,
  StatCard,
  DataTable,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
} from '../components/ui/index.js';
import { Icon } from '../components/Icons.jsx';

export default function PublicOrganizerProfile() {
  const { slug } = useParams();
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrganizer() {
      setLoading(true);
      setError('');
      try {
        const data = await evoqService.getPublicOrganizer(slug);
        setOrganizer(data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Organizer profile not found.');
      } finally {
        setLoading(false);
      }
    }
    loadOrganizer();
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

  if (error || !organizer) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem' }}>
          <EmptyState
            icon="organization"
            title="Organizer Profile Not Found"
            description={error || 'The requested tournament organizer profile does not exist.'}
            actionLabel="Browse Tournaments"
            actionHref="/tournaments"
          />
        </div>
      </PublicLayout>
    );
  }

  const { credibility = organizer.metrics || {}, portfolioRecords = organizer.portfolio || [] } = organizer;

  const portfolioColumns = [
    {
      header: 'Tournament Event',
      accessor: (item) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--evoq-text-primary)' }}>
            {item.tournament?.name || item.tournamentTitle || 'Tournament'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)', fontFamily: 'var(--font-mono)' }}>
            ID: {item.tournamentId || item.id}
          </div>
        </div>
      ),
    },
    {
      header: 'Game Title',
      accessor: (item) => <Badge variant="neutral">{item.gameName || 'Esports'}</Badge>,
    },
    {
      header: 'Competitors',
      align: 'center',
      accessor: (item) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--evoq-accent)' }}>
          {item.participantCount || 0}
        </span>
      ),
    },
    {
      header: 'Matches Concluded',
      align: 'center',
      accessor: (item) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--evoq-text-primary)' }}>
          {item.matchCount || 0}
        </span>
      ),
    },
    {
      header: 'Completed Date',
      accessor: (item) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--evoq-text-muted)' }}>
          {new Date(item.completedAt || item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Status',
      align: 'right',
      accessor: () => <Badge variant="ops">VERIFIED AUDIT</Badge>,
    },
  ];

  return (
    <PublicLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Organizer Hero Card */}
        <div className="evoq-panel" style={{ borderLeft: '4px solid #22D3EE' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(34, 211, 238, 0.15)',
                  color: '#22D3EE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {organizer.organizationName ? organizer.organizationName.slice(0, 2).toUpperCase() : 'OR'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
                    {organizer.organizationName || organizer.user?.username || 'Verified Esports Organizer'}
                  </h1>
                  <Badge variant="ops">VERIFIED DIRECTOR</Badge>
                </div>
                <p style={{ color: 'var(--evoq-text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.92rem' }}>
                  Official Tournament Operations Authority • Member since {new Date(organizer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <SecondaryButton as={Link} to="/tournaments" icon="tournament">
              Sanctioned Tournaments
            </SecondaryButton>
          </div>

          {organizer.bio && (
            <p style={{ marginTop: '1.25rem', color: 'var(--evoq-text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
              {organizer.bio}
            </p>
          )}
        </div>

        {/* Operational Credibility Metrics */}
        <div>
          <SectionHeader
            title="Operations Credibility &amp; History"
            badge="AUDITED"
            subtitle="Authoritative operational metrics recorded from finalized brackets"
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <StatCard
              label="Completed Tournaments"
              value={credibility.completedTournaments || 0}
              icon="tournament"
              accent="cyan"
            />
            <StatCard
              label="Completed Matches"
              value={credibility.completedMatches || 0}
              icon="sword"
            />
            <StatCard
              label="Competitors Hosted"
              value={credibility.approvedParticipants || 0}
              icon="teams"
              accent="lime"
            />
            <StatCard
              label="Verification Tier"
              value={organizer.verificationStatus || 'VERIFIED'}
              icon="badge"
              accent="lime"
            />
          </div>
        </div>

        {/* Verified Event Portfolio */}
        <div className="evoq-panel">
          <SectionHeader
            title="Verified Event Portfolio"
            badge={`${portfolioRecords.length} CONCLUDED`}
            subtitle="Immutable event completion history derived directly from verified match results"
          />
          <div style={{ marginTop: '1rem' }}>
            <DataTable
              columns={portfolioColumns}
              data={portfolioRecords}
              keyField="id"
              emptyMessage="No concluded tournament records in this organizer's public portfolio yet."
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
