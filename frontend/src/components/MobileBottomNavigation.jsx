import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from './Icons.jsx';

export default function MobileBottomNavigation() {
  const location = useLocation();

  const tabs = [
    { label: 'Home', path: '/gamer/dashboard', icon: 'home' },
    { label: 'Tournaments', path: '/gamer/tournaments', icon: 'tournament' },
    { label: 'Teams', path: '/gamer/teams', icon: 'teams' },
    { label: 'Awards', path: '/gamer/achievements', icon: 'achievements' },
    { label: 'Profile', path: '/gamer/profile', icon: 'user' },
  ];

  const isTabActive = (tabPath) => {
    if (tabPath === '/gamer/dashboard') {
      return location.pathname === '/gamer/dashboard';
    }
    return location.pathname.startsWith(tabPath);
  };

  return (
    <nav className="evoq-bottom-nav evoq-mobile-bottom-nav" aria-label="Mobile Gamer Navigation">
      {tabs.map((tab) => {
        const active = isTabActive(tab.path);
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`evoq-bottom-item evoq-mobile-nav-tab ${active ? 'active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <div className="evoq-tab-icon-wrap">
              <Icon
                name={tab.icon}
                size={20}
                color={active ? '#C9FF52' : '#687064'}
              />
            </div>
            <span className="evoq-bottom-label evoq-tab-label">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
