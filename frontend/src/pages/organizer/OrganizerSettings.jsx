import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizerLayout from '../../layouts/OrganizerLayout.jsx';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import {
  PrimaryButton,
  SecondaryButton,
  Badge,
  PageHeader,
  SectionHeader,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function OrganizerSettings() {
  const { user, logoutAll } = useAuth();
  const navigate = useNavigate();

  const [revoking, setRevoking] = useState(false);
  const [message, setMessage] = useState('');

  const handleRevokeAll = async () => {
    if (!window.confirm('Revoke all operational sessions on other devices? You will be signed out.')) return;
    try {
      setRevoking(true);
      await logoutAll();
      navigate('/organizer/login');
    } catch (err) {
      setMessage('Failed to revoke sessions.');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <OrganizerLayout>
      <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <PageHeader
          badge="OPERATIONS CREDENTIALS"
          title="ORGANIZER SETTINGS"
          subtitle="Manage organizer administrative profile, authentication security, and session tokens."
        />

        {message && (
          <div className="evoq-alert evoq-alert-danger" role="alert">
            <Icon name="alert" size={18} />
            <span>{message}</span>
          </div>
        )}

        <div className="evoq-panel">
          <SectionHeader
            title="Operational Access Identity"
            badge="AUTHENTICATED PRINCIPAL"
            subtitle="Verified credentials assigned to tournament management APIs"
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              marginTop: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                User ID (UUID v4)
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', wordBreak: 'break-all', margin: '0.35rem 0 0 0', color: 'var(--evoq-text-primary)' }}>
                {user?.id || user?.userId || '—'}
              </p>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Staff Username
              </div>
              <p style={{ fontWeight: 700, margin: '0.35rem 0 0 0', color: 'var(--evoq-text-primary)' }}>
                {user?.username || '—'}
              </p>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Director Email
              </div>
              <p style={{ margin: '0.35rem 0 0 0', color: 'var(--evoq-text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                {user?.email || '—'}
              </p>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Operations Privilege
              </div>
              <div style={{ marginTop: '0.35rem' }}>
                <Badge variant="ops">TOURNAMENT DIRECTOR</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="evoq-panel" style={{ borderColor: 'rgba(239, 68, 68, 0.25)' }}>
          <SectionHeader
            title="Session Security &amp; Access Revocation"
            badge="SECURITY CONTROL"
            subtitle="Force sign-out across all active terminal sessions and referee stations"
          />
          <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: '1rem 0 1.5rem 0' }}>
            Revoking all sessions invalidates every active refresh token and operational authentication token on all registered devices. You will immediately be signed out and redirected to login.
          </p>

          <SecondaryButton
            onClick={handleRevokeAll}
            disabled={revoking}
            style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
          >
            {revoking ? 'Revoking...' : 'Revoke All Operations Sessions'}
          </SecondaryButton>
        </div>
      </div>
    </OrganizerLayout>
  );
}
