import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/nebula.css';

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
      <div className="nebula-shell">
        <PublicNavbar />
        <div className="nebula-container nebula-empty-state">
          <div className="nebula-empty-icon">—</div>
          <p>Loading organization profile...</p>
        </div>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="nebula-shell">
        <PublicNavbar />
        <div className="nebula-container nebula-empty-state">
          <div className="nebula-empty-icon">—</div>
          <h2>Organization Not Found</h2>
          <p style={{ color: 'var(--nebula-text-secondary)', marginTop: '0.5rem' }}>{error}</p>
          <Link to="/tournaments" className="nebula-btn nebula-btn-cyan" style={{ marginTop: '1.5rem' }}>
            Browse Tournaments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="nebula-shell">
      <PublicNavbar />
      <main className="nebula-container">
        {/* Org Hero Header */}
        <div
          className="nebula-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            marginBottom: '2rem',
            border: '1px solid var(--nebula-border)',
          }}
        >
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
                background: 'linear-gradient(135deg, #0d2235 0%, #0d1222 100%)',
              }}
            />
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
                  borderRadius: 'var(--nebula-radius-lg)',
                  border: '3px solid var(--nebula-surface-primary)',
                  marginTop: '-48px',
                  backgroundColor: 'var(--nebula-surface-elevated)',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: 'var(--nebula-radius-lg)',
                  border: '3px solid var(--nebula-surface-primary)',
                  marginTop: '-48px',
                  backgroundColor: 'var(--nebula-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: '#0B1020',
                }}
              >
                {org.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>{org.name}</h1>
                <span className="nebula-badge nebula-badge-cyan">VERIFIED CLUB</span>
              </div>
              {org.tagline && (
                <p style={{ color: 'var(--nebula-cyan)', fontSize: '1rem', margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                  {org.tagline}
                </p>
              )}
              {org.websiteUrl && (
                <a
                  href={org.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--nebula-text-secondary)',
                    fontSize: '0.85rem',
                    display: 'inline-block',
                    marginTop: '0.35rem',
                  }}
                >
                  {org.websiteUrl}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content Columns */}
        <div className="nebula-grid-2col">
          {/* About & Staff */}
          <div>
            <div className="nebula-card" style={{ marginBottom: '1.5rem' }}>
              <h2 className="nebula-card-title" style={{ marginBottom: '1rem' }}>About Organization</h2>
              <p style={{ color: 'var(--nebula-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {org.description || 'No public description provided.'}
              </p>
            </div>

            <div className="nebula-card">
              <h2 className="nebula-card-title" style={{ marginBottom: '1rem' }}>Leadership &amp; Staff</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {org.memberships && org.memberships.length > 0 ? (
                  org.memberships.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.65rem 0',
                        borderBottom: '1px solid var(--nebula-border)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{m.user?.username || 'Staff Member'}</div>
                        {m.title && <div style={{ fontSize: '0.8rem', color: 'var(--nebula-text-muted)' }}>{m.title}</div>}
                      </div>
                      <span className="nebula-badge nebula-badge-cyan">{m.role}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--nebula-text-secondary)' }}>No staff members listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* Tournaments by Org */}
          <div>
            <div className="nebula-card">
              <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>
                 Official Tournaments
              </h2>
              {org.tournaments && org.tournaments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {org.tournaments.map((t) => (
                    <Link
                      key={t.id}
                      to={`/tournaments/${t.slug}`}
                      className="nebula-card-clickable"
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--nebula-surface-elevated)',
                        borderRadius: 'var(--nebula-radius-md)',
                        border: '1px solid var(--nebula-border)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{t.name || t.title}</h3>
                        <span className="nebula-badge nebula-badge-lime">{t.status}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--nebula-text-muted)', marginTop: '0.35rem' }}>
                        Game: {t.game?.name || 'Esports'} • Format: {t.format}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--nebula-text-secondary)' }}>No active tournaments published yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
