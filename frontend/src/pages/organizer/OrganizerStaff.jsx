import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganizerNavbar from '../../components/OrganizerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

export default function OrganizerStaff() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add staff
  const [staffIdentifier, setStaffIdentifier] = useState('');
  const [staffRole, setStaffRole] = useState('TOURNAMENT_ADMIN');
  const [staffTitle, setStaffTitle] = useState('');
  const [submittingStaff, setSubmittingStaff] = useState(false);

  useEffect(() => {
    loadOrgs();
  }, []);

  async function loadOrgs() {
    setLoading(true);
    setError('');
    try {
      const data = await evoqService.getMyOrganizations();
      setOrganizations(data || []);
      if (data && data.length > 0) {
        const first = data[0].organization || data[0];
        const detailed = await evoqService.getOrganizationBySlug(first.slug);
        setSelectedOrg(detailed);
      }
    } catch (err) {
      setError('Failed to load organization staff rosters.');
    } finally {
      setLoading(false);
    }
  }

  const handleOrgChange = async (slug) => {
    try {
      const detailed = await evoqService.getOrganizationBySlug(slug);
      setSelectedOrg(detailed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!selectedOrg) return;
    setSubmittingStaff(true);
    setError('');
    setSuccess('');
    try {
      await evoqService.addOrgStaff(selectedOrg.id, {
        identifier: staffIdentifier.trim(),
        role: staffRole,
        title: staffTitle.trim() || undefined,
      });
      setSuccess(`Staff role granted to ${staffIdentifier}`);
      setStaffIdentifier('');
      setStaffTitle('');
      const refreshed = await evoqService.getOrganizationBySlug(selectedOrg.slug);
      setSelectedOrg(refreshed);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to add staff member.');
    } finally {
      setSubmittingStaff(false);
    }
  };

  const handleRemoveStaff = async (userId) => {
    if (!selectedOrg || !confirm('Remove this staff member from the organization?')) return;
    try {
      await evoqService.removeOrgStaff(selectedOrg.id, userId);
      setSuccess('Staff member removed.');
      const refreshed = await evoqService.getOrganizationBySlug(selectedOrg.slug);
      setSelectedOrg(refreshed);
    } catch (err) {
      setError('Failed to remove staff member.');
    }
  };

  return (
    <div className="nebula-shell">
      <OrganizerNavbar />
      <main className="nebula-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="nebula-badge nebula-badge-cyan" style={{ marginBottom: '0.4rem' }}>
              ROLE-BASED ACCESS CONTROL (RBAC)
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Organization Staff &amp; Referees</h1>
            <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Assign tournament directors, operations managers, and authoritative referees.
            </p>
          </div>
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}
        {success && <div className="nebula-alert nebula-alert-success">{success}</div>}

        {loading ? (
          <div className="nebula-empty-state">
            <div className="nebula-empty-icon">—</div>
            <p>Loading staff rosters...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="nebula-card nebula-empty-state">
            <div className="nebula-empty-icon">—</div>
            <h3>No Organization Found</h3>
            <p style={{ color: 'var(--nebula-text-secondary)', marginBottom: '1rem' }}>
              Create an organization first to assign staff and referee roles.
            </p>
            <Link to="/organizer/organization" className="nebula-btn nebula-btn-cyan">
              Create Organization
            </Link>
          </div>
        ) : (
          <div>
            {/* Org Selector */}
            {organizations.length > 1 && (
              <div className="nebula-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <label className="nebula-label" style={{ marginRight: '1rem' }}>Active Organization:</label>
                <select
                  value={selectedOrg?.slug || ''}
                  onChange={(e) => handleOrgChange(e.target.value)}
                  className="nebula-select"
                  style={{ display: 'inline-block', width: 'auto', minWidth: '240px' }}
                >
                  {organizations.map((item) => {
                    const org = item.organization || item;
                    return (
                      <option key={org.id} value={org.slug}>
                        {org.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {selectedOrg && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Add Staff Card */}
                <div className="nebula-card">
                  <h2 className="nebula-card-title" style={{ marginBottom: '1rem' }}>
                     Grant Staff or Referee Role
                  </h2>
                  <form onSubmit={handleAddStaff} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1fr auto', gap: '0.85rem', alignItems: 'flex-end' }}>
                    <div>
                      <label className="nebula-label">User Email or Username *</label>
                      <input
                        type="text"
                        value={staffIdentifier}
                        onChange={(e) => setStaffIdentifier(e.target.value)}
                        placeholder="referee@example.com"
                        required
                        className="nebula-input"
                      />
                    </div>
                    <div>
                      <label className="nebula-label">Role Assignment *</label>
                      <select
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value)}
                        className="nebula-select"
                      >
                        <option value="ADMIN">ADMIN (Full Operations Access)</option>
                        <option value="TOURNAMENT_ADMIN">TOURNAMENT_ADMIN (Tournament Manager)</option>
                        <option value="REFEREE">REFEREE (Result Entry &amp; Approval)</option>
                        <option value="MEMBER">MEMBER (Staff)</option>
                      </select>
                    </div>
                    <div>
                      <label className="nebula-label">Official Title</label>
                      <input
                        type="text"
                        value={staffTitle}
                        onChange={(e) => setStaffTitle(e.target.value)}
                        placeholder="e.g. Lead Referee"
                        className="nebula-input"
                      />
                    </div>
                    <button
                      type="submit"
                      className="nebula-btn nebula-btn-cyan"
                      disabled={submittingStaff}
                    >
                      {submittingStaff ? 'Granting...' : 'Assign Role'}
                    </button>
                  </form>
                </div>

                {/* Staff Table */}
                <div className="nebula-card">
                  <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>
                     Active Staff Roster — {selectedOrg.name}
                  </h2>

                  <div className="nebula-table-wrapper">
                    <table className="nebula-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Title</th>
                          <th>Assigned Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrg.memberships?.map((m) => (
                          <tr key={m.id}>
                            <td>
                              <strong>{m.user?.username || m.user?.email}</strong>
                              <div style={{ fontSize: '0.78rem', color: 'var(--nebula-text-muted)' }}>{m.user?.email}</div>
                            </td>
                            <td>
                              <span
                                className={`nebula-badge ${
                                  m.role === 'OWNER'
                                    ? 'nebula-badge-violet'
                                    : m.role === 'ADMIN'
                                    ? 'nebula-badge-cyan'
                                    : 'nebula-badge-lime'
                                }`}
                              >
                                {m.role}
                              </span>
                            </td>
                            <td>{m.title || '—'}</td>
                            <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                            <td>
                              {m.role !== 'OWNER' && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStaff(m.userId)}
                                  className="nebula-btn nebula-btn-coral nebula-btn-sm"
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
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

