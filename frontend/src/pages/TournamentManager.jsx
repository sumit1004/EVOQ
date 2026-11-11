import React from 'react';
import { Navigate } from 'react-router-dom';

export default function TournamentManager() {
  return <Navigate to="/organizer/tournaments" replace />;
}
