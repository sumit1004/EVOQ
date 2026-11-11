import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.jsx';

export default function Dashboard() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/gamer/login" replace />;
  return <Navigate to={user.accountType === 'ORGANIZER' ? '/organizer/dashboard' : '/gamer/dashboard'} replace />;
}
