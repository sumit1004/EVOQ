import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export function GamerProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="evoq-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--evoq-text-secondary)' }}>
          <div className="evoq-spinner" style={{ margin: '0 auto 1.5rem auto' }} />
          <p style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--evoq-accent)' }}>
            Verifying Gamer Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (location.pathname === '/gamer/login') return null;
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
      <div className="evoq-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--evoq-text-secondary)' }}>
          <div className="evoq-spinner" style={{ margin: '0 auto 1.5rem auto' }} />
          <p style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.9rem', color: '#22D3EE' }}>
            Verifying Operations Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (location.pathname === '/organizer/login') return null;
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

  // Fallback for generic protected routes
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="evoq-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--evoq-text-secondary)' }}>
          <div className="evoq-spinner" style={{ margin: '0 auto 1.5rem auto' }} />
          <p style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--evoq-accent)' }}>
            Authenticating Session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (location.pathname === '/gamer/login' || location.pathname === '/login') return null;
    return <Navigate to="/gamer/login" state={{ from: location }} replace />;
  }

  // Route according to user account type
  const userAccountType = user.accountType || 'GAMER';
  if (userAccountType === 'ORGANIZER') {
    return <Navigate to="/organizer/dashboard" replace />;
  }

  return children;
}
