import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/platform.css';

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
      <>
        <Navbar />
        <div className="platform-page">
          <div className="empty-state">Loading organization profile...</div>
        </div>
      </>
    );
  }

  if (error || !org) {
    return (
      <>
        <Navbar />
        <div className="platform-page">
          <div className="empty-state">
            <h2>Organization Not Found</h2>
            <p>{error || 'The requested organization could not be located.'}</p>
            <Link to="/organizations" className="evoq-btn evoq-btn-primary" style={{ marginTop: 'var(--space-md)' }}>
              Browse Organizations
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="platform-page">
        {/* Org Hero Header */}
        <div
          className="evoq-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            marginBottom: 'var(--space-xl)',
            border: '1px solid var(--border)',
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
                background: 'linear-gradient(135deg, #1f1b3a 0%, #0d0f17 100%)',
              }}
            />
          )}

          <div
            style={{
              padding: 'var(--space-xl)',
              display: 'flex',
              gap: 'var(--space-lg)',
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
                  borderRadius: 'var(--radius-lg)',
                  border: '3px solid var(--surface)',
                  marginTop: '-48px',
                  backgroundColor: 'var(--surface-raised)',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: 'var(--radius-lg)',
                  border: '3px solid var(--surface)',
                  marginTop: '-48px',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#fff',
                }}
              >
                {org.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>{org.name}</h1>
                {org.isVerified && (
                  <span className="evoq-badge badge-primary">✔ Verified Organization</span>
                )}
              </div>
              {org.tagline && (
                <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginTop: 'var(--space-xs)' }}>
                  {org.tagline}
                </p>
              )}
              {org.websiteUrl && (
                <a
                  href={org.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--primary)',
                    fontSize: '0.9rem',
                    display: 'inline-block',
                    marginTop: 'var(--space-xs)',
                  }}
                >
                  🔗 {org.websiteUrl}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid-cols-2" style={{ alignItems: 'start' }}>
          {/* Left Column: About & Staff */}
          <div>
            <div className="evoq-card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>About Organization</h2>
              <p style={{ color: 'var(--text)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {org.description || 'No description provided by the organization.'}
              </p>
            </div>

            <div className="evoq-card">
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>Staff & Leadership</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {org.memberships && org.memberships.length > 0 ? (
                  org.memberships.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-sm) 0',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600' }}>{m.user?.username || 'Staff Member'}</div>
                        {m.title && <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{m.title}</div>}
                      </div>
                      <span className="evoq-badge badge-secondary">{m.role}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--muted)' }}>No staff members listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Tournaments & Events */}
          <div>
            <div className="evoq-card">
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>
                Tournaments by {org.name}
              </h2>
              {org.tournaments && org.tournaments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  {org.tournaments.map((t) => (
                    <Link
                      key={t.id}
                      to={`/tournaments/${t.slug}`}
                      className="evoq-card clickable"
                      style={{ padding: 'var(--space-md)', textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{t.title}</h3>
                        <span className="evoq-badge badge-primary">{t.status}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 'var(--space-xs)' }}>
                        Game: {t.game?.name || 'Esports'} • Format: {t.format}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--muted)' }}>No tournaments published yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

