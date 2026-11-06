import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GamerNavbar from '../../components/GamerNavbar.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import '../../styles/nebula.css';

export default function GamerSettings() {
  const { user, logoutAll } = useAuth();
  const navigate = useNavigate();

  const [revoking, setRevoking] = useState(false);
  const [message, setMessage] = useState('');

  const handleRevokeAll = async () => {
    if (!confirm('Revoke all active sessions on other devices? You will be signed out.')) return;
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
    <div className="nebula-shell">
      <GamerNavbar />
      <main className="nebula-container" style={{ maxWidth: '840px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span className="nebula-badge nebula-badge-violet" style={{ marginBottom: '0.4rem' }}>
            ACCOUNT &amp; SECURITY
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Gamer Account Settings</h1>
        </div>

        {message && <div className="nebula-alert nebula-alert-danger">{message}</div>}

        <div className="nebula-card" style={{ marginBottom: '1.5rem' }}>
          <h2 className="nebula-card-title" style={{ marginBottom: '1.25rem' }}>
            <span>👤</span> Authenticated Identity Details
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div>
              <span className="nebula-metric-label">User ID (UUID v4)</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', wordBreak: 'break-all', margin: '0.25rem 0 0 0' }}>
                {user?.id || user?.userId}
              </p>
            </div>
            <div>
              <span className="nebula-metric-label">Gamer Username</span>
              <p style={{ fontWeight: 700, margin: '0.25rem 0 0 0' }}>{user?.username}</p>
            </div>
            <div>
              <span className="nebula-metric-label">Registered Email</span>
              <p style={{ margin: '0.25rem 0 0 0' }}>{user?.email}</p>
            </div>
            <div>
              <span className="nebula-metric-label">Verification Status</span>
              <p style={{ margin: '0.25rem 0 0 0' }}>
                <span className={`nebula-badge ${user?.emailVerified ? 'nebula-badge-lime' : 'nebula-badge-coral'}`}>
                  {user?.emailVerified ? '✔ EMAIL VERIFIED' : 'PENDING ACTIVATION'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="nebula-card">
          <h2 className="nebula-card-title" style={{ color: 'var(--nebula-coral)', marginBottom: '0.75rem' }}>
            <span>🛡️</span> Session Security &amp; Device Revocation
          </h2>
          <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
            Your session token is cryptographically hashed with SHA-256 and stored in MySQL, delivered exclusively via HttpOnly, SameSite cookies. Revoking all sessions forces re-authentication across all mobile and desktop devices.
          </p>

          <button
            onClick={handleRevokeAll}
            className="nebula-btn nebula-btn-coral"
            disabled={revoking}
          >
            {revoking ? 'Revoking...' : 'Revoke All Active Sessions'}
          </button>
        </div>
      </main>
    </div>
  );
}

