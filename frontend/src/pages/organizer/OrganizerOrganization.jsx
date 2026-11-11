import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganizerLayout from '../../layouts/OrganizerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  PrimaryButton,
  SecondaryButton,
  Modal,
  Input,
  Textarea,
  Badge,
  EmptyState,
  SkeletonLoader,
  PageHeader,
  SectionHeader,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

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
      setError('Failed to load esports organizations.');
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
      const slug =
        createForm.slug ||
        createForm.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
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
    <OrganizerLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <PageHeader
          badge="OPERATIONS ECOSYSTEM"
          title="ESPORTS ORGANIZATIONS"
          subtitle="Tournament organizing entities, brands, and official competition clubs."
          actions={
            <PrimaryButton
              variant="ops"
              icon="plus"
              onClick={() => setShowCreateModal(true)}
            >
              Establish Organization
            </PrimaryButton>
          }
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            <SkeletonLoader height={240} />
            <SkeletonLoader height={240} />
          </div>
        ) : organizations.length === 0 ? (
          <EmptyState
            icon="organization"
            title="No Organization Formed"
            description="Establish an esports organization to host branded leagues, assign staff permissions, and build a verified event portfolio."
            actionLabel="Establish Organization"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <div>
            <SectionHeader
              title="Active Organization Entities"
              badge={`${organizations.length} ENTITIES`}
              subtitle="Entities with registered tournament sanctioning privileges"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
              {organizations.map((item) => {
                const org = item.organization || item;
                const role = item.role || 'MEMBER';
                const canManage = ['OWNER', 'ADMIN'].includes(role);

                return (
                  <div key={org.id} className="evoq-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '8px',
                              background: 'rgba(34,211,238,0.1)',
                              border: '1px solid rgba(34,211,238,0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#22D3EE',
                              fontWeight: 900,
                              fontFamily: 'var(--font-display)',
                              fontSize: '1.25rem',
                            }}
                          >
                            {org.logoUrl ? (
                              <img src={org.logoUrl} alt={org.name} style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }} />
                            ) : (
                              org.name?.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--evoq-text-primary)' }}>
                              {org.name}
                            </h2>
                            {org.tagline && (
                              <div style={{ color: '#22D3EE', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                                {org.tagline}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="ops">{role}</Badge>
                      </div>

                      {org.description && (
                        <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', margin: '0 0 1.25rem 0' }}>
                          {org.description}
                        </p>
                      )}

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '0.75rem',
                          background: 'rgba(0,0,0,0.25)',
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          border: '1px solid var(--evoq-border-subtle)',
                          marginBottom: '1.25rem',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--evoq-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Staff Members</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--evoq-text-primary)', marginTop: '0.15rem' }}>
                            {org._count?.memberships || 1}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--evoq-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sanctioned Events</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22D3EE', marginTop: '0.15rem' }}>
                            {org._count?.tournaments || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--evoq-border-subtle)' }}>
                      <SecondaryButton
                        as={Link}
                        to={`/organizations/${org.slug}`}
                        size="sm"
                        style={{ flex: 1, textAlign: 'center' }}
                      >
                        Public Profile ↗
                      </SecondaryButton>
                      {canManage && (
                        <PrimaryButton
                          as={Link}
                          to="/organizer/organization/members"
                          variant="ops"
                          size="sm"
                        >
                          Staff &amp; Roster
                        </PrimaryButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Org Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Establish Esports Organization"
          size="md"
        >
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Organization Name *"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              required
              placeholder="e.g. Apex Premier Circuit"
            />

            <Input
              label="URL Slug (Permanent Identifier)"
              value={createForm.slug}
              onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
              placeholder="apex-premier-circuit"
              helper="Leave blank to auto-generate from name"
            />

            <Input
              label="Tagline"
              value={createForm.tagline}
              onChange={(e) => setCreateForm({ ...createForm, tagline: e.target.value })}
              placeholder="e.g. Official collegiate esports league"
            />

            <Textarea
              label="Description"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              rows={3}
              placeholder="About this tournament operations organization, jurisdiction, and background..."
            />

            <Input
              label="Official Website URL"
              type="url"
              value={createForm.websiteUrl}
              onChange={(e) => setCreateForm({ ...createForm, websiteUrl: e.target.value })}
              placeholder="https://apexpremier.gg"
            />

            <Input
              label="Brand Logo URL"
              type="url"
              value={createForm.logoUrl}
              onChange={(e) => setCreateForm({ ...createForm, logoUrl: e.target.value })}
              placeholder="https://.../logo.png"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <SecondaryButton type="button" onClick={() => setShowCreateModal(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" variant="ops" disabled={creating}>
                {creating ? 'Establishing...' : 'Establish Organization'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      </div>
    </OrganizerLayout>
  );
}
