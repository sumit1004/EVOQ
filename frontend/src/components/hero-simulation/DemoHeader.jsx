import React from 'react';

export default function DemoHeader({ chapter, screen }) {
  const isOrganizer = chapter === 'ORGANIZER';
  const isGamer = chapter === 'GAMER';
  const isTransition = chapter === 'TRANSITION';
  const isFinal = chapter === 'FINAL';

  return (
    <div className="demo-header-bar">
      {/* Left: Window Controls + EVOQ Workspace Brand */}
      <div className="demo-header-left">
        <div className="demo-window-dots">
          <span className="demo-dot demo-dot-red" />
          <span className="demo-dot demo-dot-yellow" />
          <span className="demo-dot demo-dot-green" />
        </div>
        <div className="demo-brand-tag">
          <span className="demo-brand-name">EVOQ</span>
          <span className="demo-brand-divider">/</span>
          {isOrganizer && (
            <span className="demo-workspace-badge organizer-badge">
              ORGANIZER WORKSPACE
            </span>
          )}
          {isGamer && (
            <span className="demo-workspace-badge gamer-badge">
              GAMER WORKSPACE
            </span>
          )}
          {isTransition && (
            <span className="demo-workspace-badge transition-badge">
              TRUST BRIDGE
            </span>
          )}
          {isFinal && (
            <span className="demo-workspace-badge final-badge">
              ECOSYSTEM OVERVIEW
            </span>
          )}
        </div>
      </div>

      {/* Right: Simulation Tag & Status Indicator */}
      <div className="demo-header-right">
        <span className="demo-illustrative-pill">
          ILLUSTRATIVE PRODUCT UI
        </span>
        <div className="demo-live-indicator" title="Live Interactive Simulation">
          <span className="demo-pulse-ring" />
          <span className="demo-status-dot" />
          <span className="demo-status-text">SIMULATION</span>
        </div>
      </div>
    </div>
  );
}

