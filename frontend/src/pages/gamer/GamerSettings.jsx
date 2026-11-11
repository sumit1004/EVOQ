import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GamerLayout from '../../layouts/GamerLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import {
  Badge,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function GamerSettings() {
  const { user, logoutAll } = useAuth();
  const navigate = useNavigate();

  const [revoking, setRevoking] = useState(false);
  const [message, setMessage] = useState('');

  const handleRevokeAll = async () => {
    if (!window.confirm('Revoke all active sessions on other devices? You will be signed out.')) return;
    try {
      setRevoking(true);
      await logoutAll();
      navigate('/gamer/login');
    } catch (err) {
      setMessage('Failed to revoke sessions.');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <GamerLayout title="Account Settings">
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        {message && (
          <div className="evoq-alert evoq-alert-danger" role="alert">
            <Icon name="x" size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* ── Authenticated Identity Details ── */}
        <div className="evoq-card" style={{ marginBottom: '24px' }}>
          <SectionHeader
            title="Authenticated Identity Details"
            subtitle="Credentials and security passport registered on the EVOQ network"
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '18px',
            }}
          >
            <div>
              <span className="evoq-mono-label">COMPETITOR UUID</span>
              <p style={{ fontFamily: 'var(--evoq-font-mono)', fontSize: '0.82rem', wordBreak: 'break-all', margin: '6px 0 0 0', color: 'var(--evoq-text-secondary)' }}>
                {user?.id || user?.userId || 'N/A'}
              </p>
            </div>
            <div>
              <span className="evoq-mono-label">GAMER USERNAME</span>
              <p style={{ fontWeight: 700, margin: '6px 0 0 0', color: 'var(--evoq-text-primary)' }}>
                {user?.username}
              </p>
            </div>
            <div>
              <span className="evoq-mono-label">REGISTERED EMAIL</span>
              <p style={{ margin: '6px 0 0 0', color: 'var(--evoq-text-secondary)' }}>
                {user?.email}
              </p>
            </div>
            <div>
              <span className="evoq-mono-label">VERIFICATION STATUS</span>
              <div style={{ marginTop: '6px' }}>
                <Badge variant={user?.emailVerified ? 'lime' : 'warning'}>
                  {user?.emailVerified ? 'EMAIL VERIFIED' : 'PENDING ACTIVATION'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* ── Session Security & Device Revocation ── */}
        <div className="evoq-card" style={{ borderColor: 'rgba(255, 77, 77, 0.3)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--evoq-danger)' }}>
            Session Security &amp; Device Revocation
          </h3>
          <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 18px 0' }}>
            Session tokens are cryptographically secured with SHA-256 and stored in MySQL, delivered exclusively via HttpOnly, SameSite cookies. Revoking all sessions terminates authenticated tokens across all mobile and desktop devices.
          </p>

          <SecondaryButton
            variant="danger"
            onClick={handleRevokeAll}
            disabled={revoking}
            loading={revoking}
          >
            {revoking ? 'Revoking...' : 'Revoke All Active Sessions'}
          </SecondaryButton>
        </div>
      </div>
    </GamerLayout>
  );
}
