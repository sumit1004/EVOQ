import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganizerLayout from '../../layouts/OrganizerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  PrimaryButton,
  SecondaryButton,
  Badge,
  EmptyState,
  SkeletonLoader,
  PageHeader,
  SectionHeader,
  DataTable,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function OrganizerPortfolio() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPortfolio() {
      setLoading(true);
      setError('');
      try {
        const prof = await evoqService.getMyOrganizerProfile();
        setProfile(prof);
      } catch (err) {
        setError('Failed to load organizer verified event portfolio.');
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  const portfolio = profile?.portfolioRecords || [];

  const portfolioColumns = [
    {
      header: 'Tournament Event',
      accessor: (item) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--evoq-text-primary)', fontSize: '0.95rem' }}>
            {item.tournament?.name || item.tournament?.title || item.tournamentTitle || 'Tournament'}
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
      header: 'Competitors Hosted',
      align: 'center',
      accessor: (item) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--evoq-accent)' }}>
          {item.participantCount || 0}
        </span>
      ),
    },
    {
      header: 'Completed Matches',
      align: 'center',
      accessor: (item) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--evoq-text-primary)' }}>
          {item.matchCount || 0}
        </span>
      ),
    },
    {
      header: 'Concluded Date',
      accessor: (item) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--evoq-text-muted)' }}>
          {new Date(item.completedAt || item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Verification',
      align: 'right',
      accessor: () => <Badge variant="brand">VERIFIED CONCLUDED</Badge>,
    },
  ];

  return (
    <OrganizerLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <PageHeader
          badge="OPERATIONAL CREDENTIALS"
          title="VERIFIED EVENT PORTFOLIO"
          subtitle="Permanent operational record of concluded tournaments, verified competitor counts, and completed fixtures."
          actions={
            <PrimaryButton
              as={Link}
              to="/organizer/tournaments"
              variant="ops"
              icon="tournament"
            >
              Operations Center
            </PrimaryButton>
          }
        />

        {error && (
          <div className="evoq-alert evoq-alert-danger" role="alert">
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <SkeletonLoader height={280} />
        ) : portfolio.length === 0 ? (
          <EmptyState
            icon="trophy"
            title="No Concluded Tournaments in Portfolio Yet"
            description="When you conclude a live tournament and finalize bracket results, the event is permanently verified into your organizer credentials."
            actionLabel="View Active Tournaments"
            actionHref="/organizer/tournaments"
          />
        ) : (
          <div className="evoq-panel">
            <SectionHeader
              title="Official Event Registry"
              badge={`${portfolio.length} CONCLUDED EVENTS`}
              subtitle="Audited records backing organizer credibility score"
            />
            <div style={{ marginTop: '1rem' }}>
              <DataTable
                columns={portfolioColumns}
                data={portfolio}
                keyField="id"
              />
            </div>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
}
