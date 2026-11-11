import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import { evoqService } from '../services/evoq.service.js';
import {
  PrimaryButton,
  SecondaryButton,
  Badge,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
} from '../components/ui/index.js';
import { Icon } from '../components/Icons.jsx';

export default function PublicOrganizationProfile() {
  const { slug } = useParams();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrg() {
      setLoading(true);
      setError('');
      try {
        const data = await evoqService.getOrganizationBySlug(slug);
        setOrg(data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Organization not found.');
      } finally {
        setLoading(false);
      }
    }
    loadOrg();
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

  if (error || !org) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem' }}>
          <EmptyState
            icon="organization"
            title="Organization Not Found"
            description={error || 'The requested esports organization does not exist.'}
            actionLabel="Browse Tournaments"
            actionHref="/tournaments"
          />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Org Hero Panel */}
        <div className="evoq-panel" style={{ padding: 0, overflow: 'hidden' }}>
          {org.bannerUrl ? (
            <img
              src={org.bannerUrl}
              alt={org.name}
              style={{ width: '100%', height: '220px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '160px',
                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.12) 0%, rgba(201, 255, 82, 0.06) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '1.5rem',
                borderBottom: '1px solid var(--evoq-border-subtle)',
              }}
            >
              <Badge variant="ops">VERIFIED ESPORTS LEAGUE ENTITY</Badge>
            </div>
          )}

          <div
            style={{
              padding: '1.5rem 2rem 2rem 2rem',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            {org.logoUrl ? (
              <img
                src={org.logoUrl}
                alt={org.name}
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
                  backgroundColor: 'rgba(34, 211, 238, 0.15)',
                  color: '#22D3EE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {org.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
                  {org.name}
                </h1>
                <Badge variant="ops">SANCTIONED ENTITY</Badge>
              </div>

              {org.tagline && (
                <p style={{ color: '#22D3EE', fontSize: '1rem', margin: '0.35rem 0 0 0', fontWeight: 600 }}>
                  {org.tagline}
                </p>
              )}

              {org.websiteUrl && (
                <a
                  href={org.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--evoq-text-secondary)',
                    fontSize: '0.88rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    marginTop: '0.5rem',
                    textDecoration: 'none',
                  }}
                >
                  <Icon name="link" size={14} />
                  <span>{org.websiteUrl}</span>
                </a>
              )}
            </div>

            <SecondaryButton as={Link} to="/tournaments" icon="tournament">
              View Sanctioned Events
            </SecondaryButton>
          </div>
        </div>

        {/* Content Grids */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {/* About & Staff */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="evoq-panel">
              <SectionHeader title="About Organization" badge="PROFILE" />
              <p style={{ color: 'var(--evoq-text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
                {org.description || 'No public organization mission brief published.'}
              </p>
            </div>

            <div className="evoq-panel">
              <SectionHeader
                title="Leadership &amp; Operations Staff"
                badge={`${org.memberships?.length || 0} APPOINTED`}
                subtitle="Credentialed directors, coordinators, and referees"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {org.memberships && org.memberships.length > 0 ? (
                  org.memberships.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'rgba(0,0,0,0.25)',
                        borderRadius: '6px',
                        border: '1px solid var(--evoq-border-subtle)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--evoq-text-primary)' }}>
                          {m.user?.username || 'Staff Operator'}
                        </div>
                        {m.title && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)' }}>{m.title}</div>
                        )}
                      </div>
                      <Badge variant="ops">{m.role}</Badge>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--evoq-text-secondary)' }}>No staff members listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* Tournaments by Org */}
          <div className="evoq-panel">
            <SectionHeader
              title="Sanctioned Tournaments"
              badge={`${org.tournaments?.length || 0} EVENTS`}
              subtitle="Tournaments organized and operated under this banner"
            />
            {org.tournaments && org.tournaments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {org.tournaments.map((t) => (
                  <Link
                    key={t.id}
                    to={`/tournaments/${t.slug}`}
                    style={{
                      padding: '1.25rem',
                      background: 'rgba(0,0,0,0.25)',
                      borderRadius: '8px',
                      border: '1px solid var(--evoq-border-subtle)',
                      display: 'block',
                      textDecoration: 'none',
                      transition: 'border-color 0.2s, transform 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--evoq-text-primary)' }}>
                        {t.name || t.title}
                      </h3>
                      <Badge variant="brand">{t.status}</Badge>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--evoq-text-muted)', marginTop: '0.4rem' }}>
                      Game: {t.game?.name || 'Esports'} • Format: {t.format?.replace(/_/g, ' ')}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--evoq-text-secondary)', marginTop: '1rem' }}>
                No active tournaments published yet by this organization.
              </p>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
