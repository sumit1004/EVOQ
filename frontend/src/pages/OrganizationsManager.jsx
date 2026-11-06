import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/platform.css';

export default function OrganizationsManager() {
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

  // Manage Staff Modal
  const [activeOrg, setActiveOrg] = useState(null);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState('MEMBER');
  const [staffTitle, setStaffTitle] = useState('');
  const [submittingStaff, setSubmittingStaff] = useState(false);

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
      setError(err.response?.data?.error?.message || 'Failed to load organizations.');
    } finally {
      setLoading(false);
    }
  }

  function handleCreateChange(e) {
    const { name, value } = e.target;
    setCreateForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'name' && !prev.slug) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      const newOrg = await evoqService.createOrganization(createForm);
      setSuccess(`Organization "${newOrg.name}" created successfully!`);
      setShowCreateModal(false);
      setCreateForm({ name: '', slug: '', tagline: '', description: '', websiteUrl: '', logoUrl: '' });
      await loadOrganizations();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create organization.');
    } finally {
      setCreating(false);
    }
  }

  async function handleAddStaff(e) {
    e.preventDefault();
    if (!activeOrg) return;
    setSubmittingStaff(true);
    setError('');
    setSuccess('');
    try {
      await evoqService.addOrgStaff(activeOrg.id, {
        identifier: staffEmail,
        role: staffRole,
        title: staffTitle,
      });
      setSuccess(`Staff invitation added.`);
      setStaffEmail('');
      setStaffTitle('');
      // Reload active org details
      const freshOrg = await evoqService.getOrganizationBySlug(activeOrg.slug);
      setActiveOrg(freshOrg);
      await loadOrganizations();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to add staff member.');
    } finally {
      setSubmittingStaff(false);
    }
  }

  async function handleRemoveStaff(userId) {
    if (!activeOrg || !confirm('Are you sure you want to remove this staff member?')) return;
    setError('');
    setSuccess('');
    try {
      await evoqService.removeOrgStaff(activeOrg.id, userId);
      setSuccess('Staff member removed.');
      const freshOrg = await evoqService.getOrganizationBySlug(activeOrg.slug);
      setActiveOrg(freshOrg);
      await loadOrganizations();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to remove staff member.');
    }
  }

  return (
    <>
      <Navbar />
      <div className="platform-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Esports Organizations</h1>
            <p className="page-subtitle">Manage tournament organizing bodies, staff roles, and public brand presence.</p>
          </div>
          <button className="evoq-btn evoq-btn-primary" onClick={() => setShowCreateModal(true)}>
            + Create Organization
          </button>
        </div>

        {error && <div className="evoq-card status-danger" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}
        {success && <div className="evoq-card status-success" style={{ marginBottom: 'var(--space-md)' }}>{success}</div>}

        {loading ? (
          <div className="empty-state">Loading your organizations...</div>
        ) : organizations.length === 0 ? (
          <div className="empty-state">
            <p>You are not currently part of any organization.</p>
            <button className="evoq-btn evoq-btn-primary" onClick={() => setShowCreateModal(true)} style={{ marginTop: 'var(--space-md)' }}>
              Create Your First Organization
            </button>
          </div>
        ) : (
          <div className="grid-cards">
            {organizations.map((item) => {
              const org = item.organization || item;
              const userRole = item.role || 'MEMBER';
              const canManage = ['OWNER', 'ADMIN'].includes(userRole);

              return (
                <div key={org.id} className="evoq-card">
                  {org.bannerUrl && <img src={org.bannerUrl} alt={org.name} className="card-banner" />}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{org.name}</h3>
                    <span className={`evoq-badge ${userRole === 'OWNER' ? 'badge-primary' : 'badge-secondary'}`}>
                      {userRole}
                    </span>
                  </div>

                  {org.tagline && <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 'var(--space-md)' }}>{org.tagline}</p>}

                  <div style={{ display: 'flex', gap: 'var(--space-md)', fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 'var(--space-md)' }}>
                    <span>Members: {org._count?.memberships || org.memberships?.length || 1}</span>
                    <span>Tournaments: {org._count?.tournaments || 0}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    <Link to={`/organizations/${org.slug}`} className="evoq-btn evoq-btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                      Public Profile
                    </Link>
                    {canManage && (
                      <button
                        className="evoq-btn evoq-btn-primary"
                        onClick={async () => {
                          const detailed = await evoqService.getOrganizationBySlug(org.slug);
                          setActiveOrg(detailed);
                        }}
                      >
                        Manage Staff
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Organization Modal */}
        {showCreateModal && (
          <div className="evoq-modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="evoq-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Organization</h2>
                <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
              </div>
              <form onSubmit={handleCreateSubmit} className="evoq-form">
                <div className="form-group">
                  <label>Organization Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={createForm.name}
                    onChange={handleCreateChange}
                    required
                    placeholder="e.g. Apex Premier League"
                    className="evoq-input"
                  />
                </div>
                <div className="form-group">
                  <label>Slug (URL Identifier) *</label>
                  <input
                    type="text"
                    name="slug"
                    value={createForm.slug}
                    onChange={handleCreateChange}
                    required
                    placeholder="apex-premier-league"
                    className="evoq-input"
                  />
                </div>
                <div className="form-group">
                  <label>Tagline</label>
                  <input
                    type="text"
                    name="tagline"
                    value={createForm.tagline}
                    onChange={handleCreateChange}
                    placeholder="Brief headline"
                    className="evoq-input"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={createForm.description}
                    onChange={handleCreateChange}
                    rows="3"
                    placeholder="About this esports organization..."
                    className="evoq-textarea"
                  />
                </div>
                <div className="form-group">
                  <label>Website URL</label>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={createForm.websiteUrl}
                    onChange={handleCreateChange}
                    placeholder="https://organization.gg"
                    className="evoq-input"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="evoq-btn evoq-btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="evoq-btn evoq-btn-primary" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Organization'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manage Staff Modal */}
        {activeOrg && (
          <div className="evoq-modal-overlay" onClick={() => setActiveOrg(null)}>
            <div className="evoq-modal modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Manage Staff — {activeOrg.name}</h2>
                <button className="close-btn" onClick={() => setActiveOrg(null)}>×</button>
              </div>

              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-sm)' }}>Add Staff Member</h3>
                <form onSubmit={handleAddStaff} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: 'var(--space-sm)', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>User Email or Username</label>
                    <input
                      type="text"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      required
                      placeholder="user@example.com"
                      className="evoq-input"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Role</label>
                    <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)} className="evoq-input">
                      <option value="ADMIN">ADMIN</option>
                      <option value="TOURNAMENT_ADMIN">TOURNAMENT_ADMIN</option>
                      <option value="REFEREE">REFEREE</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Staff Title</label>
                    <input
                      type="text"
                      value={staffTitle}
                      onChange={(e) => setStaffTitle(e.target.value)}
                      placeholder="e.g. Lead Tournament Director"
                      className="evoq-input"
                    />
                  </div>
                  <button type="submit" className="evoq-btn evoq-btn-primary" disabled={submittingStaff}>
                    {submittingStaff ? 'Adding...' : 'Add Staff'}
                  </button>
                </form>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-sm)' }}>Current Staff Roster</h3>
                <div className="table-responsive">
                  <table className="evoq-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Title</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrg.memberships?.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <strong>{m.user?.username || m.user?.email}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{m.user?.email}</div>
                          </td>
                          <td>
                            <span className="evoq-badge badge-primary">{m.role}</span>
                          </td>
                          <td>{m.title || '—'}</td>
                          <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                          <td>
                            {m.role !== 'OWNER' && (
                              <button
                                className="evoq-btn evoq-btn-danger"
                                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                                onClick={() => handleRemoveStaff(m.userId)}
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: 'var(--space-lg)' }}>
                <button type="button" className="evoq-btn evoq-btn-secondary" onClick={() => setActiveOrg(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

