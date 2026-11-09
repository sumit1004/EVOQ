import React from 'react';

export default function DemoSidebar({ chapter, screen, onNavigate }) {
  const isOrganizer = chapter === 'ORGANIZER';
  const isGamer = chapter === 'GAMER';

  if (!isOrganizer && !isGamer) {
    return null;
  }

  // Determine active tab based on current screen
  const getActiveTab = () => {
    if (isOrganizer) {
      if (['profile'].includes(screen)) return 'profile';
      if (['dashboard'].includes(screen)) return 'dashboard';
      if (['tournaments', 'create', 'create-filled', 'bracket-live'].includes(screen)) return 'tournaments';
      if (['registrations', 'registrations-approved'].includes(screen)) return 'registrations';
      if (['credentials-modal', 'credentials-sent'].includes(screen)) return 'matches';
      if (['result-approval', 'result-verified', 'leaderboard'].includes(screen)) return 'results';
      return 'dashboard';
    } else {
      if (['profile', 'profile-updated'].includes(screen)) return 'profile';
      if (['game-identities'].includes(screen)) return 'games';
      if (['explore', 'explore-detail'].includes(screen)) return 'explore';
      if (['my-tournaments', 'gamer-credentials', 'gamer-match-result'].includes(screen)) return 'my-events';
      if (['achievement-celebration'].includes(screen)) return 'achievements';
      return 'profile';
    }
  };

  const activeTab = getActiveTab();

  return (
    <aside className="demo-sidebar">
      <div className="demo-sidebar-group">
        <span className="demo-sidebar-heading">
          {isOrganizer ? 'OPERATIONS' : 'COMPETITOR'}
        </span>

        {isOrganizer ? (
          <>
            <button
              className={`demo-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('dashboard')}
            >
              <span className="demo-nav-label">Dashboard</span>
            </button>

            <button
              className={`demo-nav-item ${activeTab === 'tournaments' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('tournaments')}
            >
              <span className="demo-nav-label">Tournaments</span>
              <span className="demo-nav-badge">1 Live</span>
            </button>

            <button
              className={`demo-nav-item ${activeTab === 'registrations' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('registrations')}
            >
              <span className="demo-nav-label">Registrations</span>
              <span className="demo-nav-badge warning">4 Rosters</span>
            </button>

            <button
              className={`demo-nav-item ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('matches')}
            >
              <span className="demo-nav-label">Lobbies</span>
            </button>

            <button
              className={`demo-nav-item ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('results')}
            >
              <span className="demo-nav-label">Result Verification</span>
            </button>

            <button
              className={`demo-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('profile')}
            >
              <span className="demo-nav-label">Organizer Profile</span>
            </button>
          </>
        ) : (
          <>
            <button
              className={`demo-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('profile')}
            >
              <span className="demo-nav-label">Gamer Identity</span>
            </button>

            <button
              className={`demo-nav-item ${activeTab === 'games' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('games')}
            >
              <span className="demo-nav-label">Connected IDs</span>
              <span className="demo-nav-badge">3 Linked</span>
            </button>

            <button
              className={`demo-nav-item ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('explore')}
            >
              <span className="demo-nav-label">Tournaments</span>
            </button>

            <button
              className={`demo-nav-item ${activeTab === 'my-events' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('my-events')}
            >
              <span className="demo-nav-label">My Matches</span>
              <span className="demo-nav-badge">Finals</span>
            </button>

            <button
              className={`demo-nav-item ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate('achievements')}
            >
              <span className="demo-nav-label">Achievements</span>
              <span className="demo-nav-badge highlight">Verified</span>
            </button>
          </>
        )}
      </div>

      <div className="demo-sidebar-footer">
        <span className="demo-footer-text">
          {isOrganizer ? 'Vortex Ops Command v2.4' : 'Gamer Passport #8821'}
        </span>
      </div>
    </aside>
  );
}

