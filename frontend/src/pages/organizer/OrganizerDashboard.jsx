import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganizerLayout from '../../layouts/OrganizerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  StatCard,
  PrimaryButton,
  SecondaryButton,
  Badge,
  StatusIndicator,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
  DataTable,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function OrganizerDashboard() {
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const [dashData, orgProf] = await Promise.all([
          evoqService.getOrganizerDashboard(),
          evoqService.getMyOrganizerProfile().catch(() => null),
        ]);
        setData(dashData);
        setProfile(orgProf);
      } catch (err) {
        setError('Failed to synchronize organizer operations center.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const tournaments = data?.tournaments || [];
  const metrics = data?.metrics || {
    totalTournaments: tournaments.length,
    activeTournaments: tournaments.filter((t) => ['REGISTRATION_OPEN', 'ONGOING'].includes(t.status)).length,
    completedTournaments: tournaments.filter((t) => ['COMPLETED', 'CONCLUDED'].includes(t.status)).length,
    totalParticipants: tournaments.reduce((acc, t) => acc + (t._count?.registrations || 0), 0),
  };

  const upcomingMatches = data?.upcomingMatches || [];

  return (
    <OrganizerLayout
      title="Operations Command Center"
      actions={
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/organizer/tournaments/create" className="evoq-btn evoq-btn-primary evoq-btn-sm">
            <Icon name="plus" size={14} />
            <span>New Tournament</span>
          </Link>
          <Link to="/organizer/organization" className="evoq-btn evoq-btn-secondary evoq-btn-sm">
            <Icon name="organization" size={14} />
            <span>Organization</span>
          </Link>
        </div>
      }
    >
      {/* ── Operations Hero Overview ── */}
      <div
        className="evoq-card"
        style={{
          marginBottom: '24px',
          background: 'linear-gradient(135deg, var(--evoq-surface) 0%, #0d1b1d 100%)',
          borderColor: 'rgba(34, 211, 238, 0.35)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Badge variant="cyan">OPERATIONS COMMAND</Badge>
              <Badge variant="lime">LIVE ORCHESTRATION</Badge>
            </div>
            <h1 className="evoq-display-title" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)', margin: '0 0 6px 0' }}>
              Tournament Control Hub
            </h1>
            <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.9rem', margin: 0, maxWidth: '640px' }}>
              Manage bracket seedings, generate match fixtures, release secure room credentials, and verify authoritative scores.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/organizer/tournaments/create" className="evoq-btn evoq-btn-primary evoq-btn-sm">
              <Icon name="plus" size={14} />
              <span>Launch Event</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="evoq-alert evoq-alert-danger" role="alert">
          <Icon name="x" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Operations Metrics ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          label="Managed Tournaments"
          value={metrics.totalTournaments || 0}
          subtext="Total events created"
          icon="tournament"
        />
        <StatCard
          label="Active / Live Events"
          value={metrics.activeTournaments || 0}
          subtext="Brackets in progress"
          icon="matches"
          lime
        />
        <StatCard
          label="Completed Tournaments"
          value={metrics.completedTournaments || 0}
          subtext="Concluded & archived"
          icon="trophy"
        />
        <StatCard
          label="Total Registrations"
          value={metrics.totalParticipants || 0}
          subtext="Enrolled squads and soloists"
          icon="teams"
        />
      </div>

      {/* ── 2-Column Operations View ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Managed Tournaments */}
        <div className="evoq-card">
          <SectionHeader
            title="Managed Tournaments"
            subtitle="Recent events requiring director attention"
            action={
              <Link
                to="/organizer/tournaments"
                className="evoq-link-muted"
                style={{ fontSize: '0.82rem', color: 'var(--evoq-lime)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>View All ({tournaments.length})</span>
                <Icon name="arrow-right" size={13} />
              </Link>
            }
          />

          {loading ? (
            <SkeletonLoader type="card" count={2} height="120px" />
          ) : tournaments.length === 0 ? (
            <EmptyState
              icon="tournament"
              title="No Tournaments Created"
              description="Launch your first esports tournament using our step-by-step wizard."
              action={
                <Link to="/organizer/tournaments/create" className="evoq-btn evoq-btn-primary evoq-btn-sm">
                  <Icon name="plus" size={13} />
                  <span>Create Tournament</span>
                </Link>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tournaments.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: 'var(--evoq-surface-elevated)',
                    borderRadius: 'var(--evoq-radius-sm)',
                    border: '1px solid var(--evoq-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                      <Badge variant="cyan" size="sm">{t.game?.name || 'Esports'}</Badge>
                      <StatusIndicator status={t.status} />
                    </div>
                    <strong style={{ fontSize: '0.98rem', color: 'var(--evoq-text-primary)' }}>
                      {t.name || t.title}
                    </strong>
                    <div style={{ fontSize: '0.76rem', color: 'var(--evoq-text-muted)' }}>
                      Format: {t.format?.replace(/_/g, ' ')} • {t._count?.registrations || 0} Entries
                    </div>
                  </div>

                  <Link
                    to={`/organizer/tournaments/${t.slug || t.id}`}
                    className="evoq-btn evoq-btn-secondary evoq-btn-sm"
                  >
                    <span>Manage Workspace</span>
                    <Icon name="arrow-right" size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Matches & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Upcoming Matches */}
          <div className="evoq-card">
            <SectionHeader
              title="Scheduled Match Fixtures"
              subtitle="Rounds waiting for lobby credentials or score validation"
            />

            {upcomingMatches.length === 0 ? (
              <EmptyState
                icon="matches"
                title="No Pending Fixtures"
                description="When tournament brackets generate match fixtures, they will queue here for referee review."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingMatches.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--evoq-surface-elevated)',
                      borderRadius: 'var(--evoq-radius-sm)',
                      border: '1px solid var(--evoq-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span className="evoq-mono-label">{m.roundName || 'MATCH ROUND'}</span>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--evoq-text-primary)', marginTop: '2px' }}>
                        {m.teamA?.name || 'TBD'} vs {m.teamB?.name || 'TBD'}
                      </div>
                    </div>
                    <StatusIndicator status={m.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Operations Actions */}
          <div className="evoq-card">
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--evoq-text-primary)' }}>
              Operations Suite Shortcuts
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Link to="/organizer/tournaments/create" className="evoq-btn evoq-btn-secondary evoq-btn-sm" style={{ justifyContent: 'center' }}>
                <Icon name="plus" size={14} />
                <span>Create Event</span>
              </Link>
              <Link to="/organizer/organization" className="evoq-btn evoq-btn-secondary evoq-btn-sm" style={{ justifyContent: 'center' }}>
                <Icon name="organization" size={14} />
                <span>Club Info</span>
              </Link>
              <Link to="/organizer/organization/members" className="evoq-btn evoq-btn-secondary evoq-btn-sm" style={{ justifyContent: 'center' }}>
                <Icon name="teams" size={14} />
                <span>Staff &amp; Roles</span>
              </Link>
              <Link to="/organizer/events" className="evoq-btn evoq-btn-secondary evoq-btn-sm" style={{ justifyContent: 'center' }}>
                <Icon name="trophy" size={14} />
                <span>Portfolio</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
}
