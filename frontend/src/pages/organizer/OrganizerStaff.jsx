import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganizerLayout from '../../layouts/OrganizerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  PrimaryButton,
  SecondaryButton,
  Select,
  Input,
  Badge,
  EmptyState,
  SkeletonLoader,
  PageHeader,
  SectionHeader,
  DataTable,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

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
    if (!selectedOrg || !window.confirm('Remove this staff member from the organization?')) return;
    try {
      await evoqService.removeOrgStaff(selectedOrg.id, userId);
      setSuccess('Staff member removed.');
      const refreshed = await evoqService.getOrganizationBySlug(selectedOrg.slug);
      setSelectedOrg(refreshed);
    } catch (err) {
      setError('Failed to remove staff member.');
    }
  };

  const staffColumns = [
    {
      header: 'Staff Member',
      accessor: (m) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--evoq-text-primary)' }}>
            {m.user?.username || m.user?.email}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--evoq-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {m.user?.email}
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (m) => (
        <Badge
          variant={
            m.role === 'OWNER'
              ? 'brand'
              : m.role === 'ADMIN'
              ? 'ops'
              : m.role === 'REFEREE'
              ? 'warning'
              : 'neutral'
          }
        >
          {m.role}
        </Badge>
      ),
    },
    {
      header: 'Title / Designation',
      accessor: (m) => (
        <span style={{ color: m.title ? 'var(--evoq-text-secondary)' : 'var(--evoq-text-muted)' }}>
          {m.title || '—'}
        </span>
      ),
    },
    {
      header: 'Date Appointed',
      accessor: (m) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--evoq-text-muted)' }}>
          {new Date(m.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Action',
      align: 'right',
      accessor: (m) =>
        m.role !== 'OWNER' ? (
          <SecondaryButton
            size="sm"
            onClick={() => handleRemoveStaff(m.userId)}
            style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            Revoke
          </SecondaryButton>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)', fontFamily: 'var(--font-mono)' }}>
            IMMUTABLE
          </span>
        ),
    },
  ];

  return (
    <OrganizerLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <PageHeader
          badge="ACCESS &amp; PERMISSIONS"
          title="STAFF ROSTER &amp; REFEREES"
          subtitle="Assign tournament directors, operations managers, and authoritative referees."
        />

        {error && (
          <div className="evoq-alert evoq-alert-danger" role="alert">
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="evoq-alert evoq-alert-success" role="alert">
            <Icon name="check" size={18} />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <SkeletonLoader height={280} />
        ) : organizations.length === 0 ? (
          <EmptyState
            icon="teams"
            title="No Organization Found"
            description="Create an organization first to assign staff, referee roles, and tournament permissions."
            actionLabel="Create Organization"
            onAction={() => {}}
            actionHref="/organizer/organization"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Org Selector */}
            {organizations.length > 1 && (
              <div
                className="evoq-panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--evoq-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Organization:
                </span>
                <select
                  value={selectedOrg?.slug || ''}
                  onChange={(e) => handleOrgChange(e.target.value)}
                  className="evoq-select"
                  style={{ width: 'auto', minWidth: '260px' }}
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
              <>
                {/* Add Staff Panel */}
                <div className="evoq-panel">
                  <SectionHeader
                    title="Grant Staff or Referee Role"
                    badge="INVITE OPERATOR"
                    subtitle={`Appoint credentialed operations staff to ${selectedOrg.name}`}
                  />
                  <form
                    onSubmit={handleAddStaff}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto',
                      gap: '1rem',
                      alignItems: 'flex-end',
                      marginTop: '1.25rem',
                    }}
                  >
                    <Input
                      label="User Email or Username *"
                      value={staffIdentifier}
                      onChange={(e) => setStaffIdentifier(e.target.value)}
                      placeholder="referee@example.com"
                      required
                    />

                    <Select
                      label="Role Assignment *"
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                      options={[
                        { value: 'ADMIN', label: 'ADMIN (Full Operations Access)' },
                        { value: 'TOURNAMENT_ADMIN', label: 'TOURNAMENT_ADMIN (Tournament Manager)' },
                        { value: 'REFEREE', label: 'REFEREE (Result Entry & Approval)' },
                        { value: 'MEMBER', label: 'MEMBER (Staff Observer)' },
                      ]}
                    />

                    <Input
                      label="Official Title / Position"
                      value={staffTitle}
                      onChange={(e) => setStaffTitle(e.target.value)}
                      placeholder="e.g. Lead Referee"
                    />

                    <PrimaryButton
                      type="submit"
                      variant="ops"
                      disabled={submittingStaff}
                      style={{ height: '44px', whiteSpace: 'nowrap' }}
                    >
                      {submittingStaff ? 'Granting...' : 'Assign Role'}
                    </PrimaryButton>
                  </form>
                </div>

                {/* Staff Table */}
                <div className="evoq-panel">
                  <SectionHeader
                    title={`Active Staff Roster — ${selectedOrg.name}`}
                    badge={`${selectedOrg.memberships?.length || 0} APPOINTED`}
                    subtitle="Credentialed operators with administrative privileges over sanctioned tournaments"
                  />
                  <div style={{ marginTop: '1rem' }}>
                    <DataTable
                      columns={staffColumns}
                      data={selectedOrg.memberships || []}
                      keyField="id"
                      emptyMessage="No staff members appointed to this organization yet."
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
}
