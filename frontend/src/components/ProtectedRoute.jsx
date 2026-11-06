import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export function GamerProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="nebula-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--nebula-text-secondary)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎮</div>
          <p style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.9rem' }}>
            Verifying Gamer Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/gamer/login" state={{ from: location }} replace />;
  }

  const userAccountType = user.accountType || 'GAMER';
  if (userAccountType !== 'GAMER') {
    // Authenticated Organizer attempting to access Gamer Portal
    return <Navigate to="/organizer/dashboard" replace />;
  }

  return children;
}

export function OrganizerProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="nebula-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--nebula-text-secondary)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
          <p style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.9rem' }}>
            Verifying Operations Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/organizer/login" state={{ from: location }} replace />;
  }

  const userAccountType = user.accountType || 'GAMER';
  if (userAccountType !== 'ORGANIZER') {
    // Authenticated Gamer attempting to access Organizer Portal
    return <Navigate to="/gamer/dashboard" replace />;
  }

  return children;
}

export default function ProtectedRoute({ children, allowedAccountType = null }) {
  if (allowedAccountType === 'ORGANIZER') {
    return <OrganizerProtectedRoute>{children}</OrganizerProtectedRoute>;
  }
  if (allowedAccountType === 'GAMER') {
    return <GamerProtectedRoute>{children}</GamerProtectedRoute>;
  }

  // Fallback for legacy generic protected routes
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="nebula-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--nebula-text-secondary)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.9rem' }}>
            Authenticating Session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/gamer/login" state={{ from: location }} replace />;
  }

  // Route according to user account type
  const userAccountType = user.accountType || 'GAMER';
  if (userAccountType === 'ORGANIZER') {
    return <Navigate to="/organizer/dashboard" replace />;
  }

  return children;
}
