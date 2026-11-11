import React from 'react';
import { DashboardSidebar, DashboardHeader } from '../components/ui/LayoutPrimitives.jsx';

export default function OrganizerLayout({ children, title, actions, activeSubtab = '' }) {
  const navLinks = [
    { label: 'Operations Hub', path: '/organizer/dashboard', icon: 'home', exact: true },
    { label: 'Tournaments', path: '/organizer/tournaments', icon: 'tournament' },
    { label: '+ Create Event', path: '/organizer/tournaments/create', icon: 'plus', isSpecial: true },
    { label: 'Organization', path: '/organizer/organization', icon: 'organization' },
    { label: 'Staff & Roles', path: '/organizer/organization/members', icon: 'teams' },
    { label: 'Event Portfolio', path: '/organizer/events', icon: 'trophy' },
    { label: 'Alerts', path: '/organizer/notifications', icon: 'bell' },
    { label: 'Settings', path: '/organizer/settings', icon: 'settings' },
  ];

  return (
    <div className="evoq-dashboard-layout evoq-portal-root">
      {/* Desktop Operations Sidebar (Hidden <= 960px) */}
      <DashboardSidebar role="ORGANIZER" navLinks={navLinks} />

      {/* Main Operations Workspace Column */}
      <div className="evoq-dashboard-main evoq-portal-main">
        {/* Operations Header */}
        <DashboardHeader role="ORGANIZER" title={title} actions={actions} />

        {/* Content Container */}
        <main className="evoq-dashboard-content evoq-portal-content-container">
          {children}
        </main>
      </div>
    </div>
  );
}

export { OrganizerLayout as OrganizerDashboardLayout };
