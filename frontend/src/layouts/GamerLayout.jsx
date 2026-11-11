import React from 'react';
import { DashboardSidebar, DashboardHeader } from '../components/ui/LayoutPrimitives.jsx';
import MobileBottomNavigation from '../components/MobileBottomNavigation.jsx';

export default function GamerLayout({ children, title, actions, activeTab = '' }) {
  const navLinks = [
    { label: 'Overview', path: '/gamer/dashboard', icon: 'home', exact: true },
    { label: 'Tournaments', path: '/gamer/tournaments', icon: 'tournament' },
    { label: 'Teams', path: '/gamer/teams', icon: 'teams' },
    { label: 'Matches', path: '/gamer/matches', icon: 'matches' },
    { label: 'Achievements', path: '/gamer/achievements', icon: 'achievements' },
    { label: 'Stats & Rank', path: '/gamer/statistics', icon: 'statistics' },
    { label: 'Settings', path: '/gamer/settings', icon: 'settings' },
  ];

  return (
    <div className="evoq-dashboard-layout evoq-portal-root">
      {/* Desktop Navigation Sidebar (Hidden <= 960px) */}
      <DashboardSidebar role="GAMER" navLinks={navLinks} />

      {/* Main Workspace Column */}
      <div className="evoq-dashboard-main evoq-portal-main">
        {/* Authenticated Topbar */}
        <DashboardHeader role="GAMER" title={title} actions={actions} />

        {/* Workspace Content Container */}
        <main className="evoq-dashboard-content evoq-portal-content-container">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible <= 960px) */}
      <MobileBottomNavigation />
    </div>
  );
}

export { GamerLayout as GamerDashboardLayout };
