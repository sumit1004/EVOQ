import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganizerNavbar from '../../components/OrganizerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function OrganizerOrganization() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create Org Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    websiteUrl: '',
    logoUrl: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    setLoading(true);
    setError('');
    try {
      const data = await evoqService.getMyOrganizations();
      setOrganizations(data || []);
    } catch (err) {
      setError('Failed to load organizations.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      const slug = createForm.slug || createForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newOrg = await evoqService.createOrganization({ ...createForm, slug });
      setSuccess(`Organization "${newOrg.name}" established!`);
      setShowCreateModal(false);
      setCreateForm({ name: '', slug: '', tagline: '', description: '', websiteUrl: '', logoUrl: '' });
      await loadOrganizations();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create organization.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="nebula-shell">
      <OrganizerNavbar />
      <main className="nebula-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="nebula-badge nebula-badge-cyan" style={{ marginBottom: '0.4rem' }}>
              ESPORTS ORGANIZATIONS
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Organization Profile &amp; Identity</h1>
            <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Tournament organizing entities, brands, and official competition clubs.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="nebula-btn nebula-btn-cyan"
          >
            + Create New Organization
          </button>
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}
        {success && <div className="nebula-alert nebula-alert-success">{success}</div>}

        {loading ? (
          <div className="nebula-empty-state">
            <div className="nebula-empty-icon">—</div>
            <p>Loading organizations...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="nebula-card nebula-empty-state">
            <div className="nebula-empty-icon"></div>
            <h3>No Organization Formed</h3>
            <p style={{ color: 'var(--nebula-text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              Establish an esports organization to host branded leagues, assign staff permissions, and build a verified event portfolio.
            </p>
            <button onClick={() => setShowCreateModal(true)} className="nebula-btn nebula-btn-cyan">
              Create Organization
            </button>
          </div>
        ) : (
          <div className="nebula-grid-cards">
            {organizations.map((item) => {
              const org = item.organization || item;
              const role = item.role || 'MEMBER';
              const canManage = ['OWNER', 'ADMIN'].includes(role);

              return (
                <div key={org.id} className="nebula-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{org.name}</h2>
                      {org.tagline && (
                        <div style={{ color: 'var(--nebula-cyan)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                          {org.tagline}
                        </div>
                      )}
                    </div>
                    <span className="nebula-badge nebula-badge-cyan">{role}</span>
                  </div>

                  {org.description && (
                    <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', margin: '0 0 1.25rem 0' }}>
                      {org.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--nebula-text-muted)', marginBottom: '1.25rem' }}>
                    <span>Staff: {org._count?.memberships || 1}</span>
                    <span>Events: {org._count?.tournaments || 0}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link to={`/organizations/${org.slug}`} className="nebula-btn nebula-btn-secondary nebula-btn-sm" style={{ flex: 1, textAlign: 'center' }} target="_blank">
                      Public Brand Page ↗
                    </Link>
                    {canManage && (
                      <Link to="/organizer/organization/members" className="nebula-btn nebula-btn-cyan nebula-btn-sm">
                        Manage Staff &amp; Roles
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="nebula-modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="nebula-modal" onClick={(e) => e.stopPropagation()}>
              <div className="nebula-modal-header">
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Create Esports Organization</h2>
                <button className="nebula-modal-close" onClick={() => setShowCreateModal(false)}>×</button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div className="nebula-form-group">
                  <label className="nebula-label">Organization Name *</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                    placeholder="e.g. Apex Premier League"
                    className="nebula-input"
                  />
                </div>

                <div className="nebula-form-group">
                  <label className="nebula-label">URL Slug (Identifier) *</label>
                  <input
                    type="text"
                    value={createForm.slug}
                    onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                    placeholder="apex-premier-league"
                    className="nebula-input"
                  />
                </div>

                <div className="nebula-form-group">
                  <label className="nebula-label">Tagline</label>
                  <input
                    type="text"
                    value={createForm.tagline}
                    onChange={(e) => setCreateForm({ ...createForm, tagline: e.target.value })}
                    placeholder="Official regional collegiate esports circuit"
                    className="nebula-input"
                  />
                </div>

                <div className="nebula-form-group">
                  <label className="nebula-label">Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows="3"
                    placeholder="About this tournament operations body..."
                    className="nebula-textarea"
                  />
                </div>

                <div className="nebula-form-group">
                  <label className="nebula-label">Website URL</label>
                  <input
                    type="url"
                    value={createForm.websiteUrl}
                    onChange={(e) => setCreateForm({ ...createForm, websiteUrl: e.target.value })}
                    placeholder="https://organization.gg"
                    className="nebula-input"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="nebula-btn nebula-btn-ghost" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="nebula-btn nebula-btn-cyan" disabled={creating}>
                    {creating ? 'Creating...' : 'Establish Organization'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

