import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.jsx';

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/gamer/login" replace />;
  return <Navigate to={user.accountType === 'ORGANIZER' ? '/organizer/notifications' : '/gamer/notifications'} replace />;
}
