import React from 'react';

export default function OrganizerDemo({ screen, data, actionToast }) {
  const { organizer, tournament, teams, match } = data;

  // 1. ORGANIZER PROFILE
  if (screen === 'profile') {
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-profile-header">
          <div className="demo-org-avatar">{organizer.avatar}</div>
          <div className="demo-org-meta">
            <div className="demo-org-title-row">
              <h4 className="demo-org-name">{organizer.organization}</h4>
              <span className="demo-verified-tag">✓ {organizer.verificationStatus}</span>
            </div>
            <p className="demo-org-sub">Lead Operator: {organizer.name} • {organizer.tag}</p>
            <p className="demo-org-bio">{organizer.bio}</p>
          </div>
        </div>

        <div className="demo-stat-matrix">
          <div className="demo-stat-box">
            <span className="demo-stat-num">{organizer.tournamentsHosted}</span>
            <span className="demo-stat-label">Events Hosted</span>
          </div>
          <div className="demo-stat-box">
            <span className="demo-stat-num">{organizer.completedTournaments}</span>
            <span className="demo-stat-label">Completed</span>
          </div>
          <div className="demo-stat-box highlight">
            <span className="demo-stat-num">{organizer.activeTournaments}</span>
            <span className="demo-stat-label">Active Now</span>
          </div>
          <div className="demo-stat-box">
            <span className="demo-stat-num">{organizer.trustRating}</span>
            <span className="demo-stat-label">Trust Score</span>
          </div>
        </div>

        <div className="demo-card-row">
          <div className="demo-subcard">
            <span className="demo-subcard-title">Sanctioned Games</span>
            <div className="demo-tags-wrap">
              <span className="demo-tag">Valorant</span>
              <span className="demo-tag">Counter-Strike 2</span>
              <span className="demo-tag">Apex Legends</span>
            </div>
          </div>
          <div className="demo-subcard">
            <span className="demo-subcard-title">Organizer Trust Seal</span>
            <span className="demo-seal-pill">Cryptographically Validated Host</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD OVERVIEW
  if (screen === 'dashboard') {
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-view-header">
          <div>
            <h4 className="demo-view-title">Operations Command</h4>
            <span className="demo-view-desc">Central tournament execution control</span>
          </div>
          <button className="demo-btn-primary">
            + New Competition
          </button>
        </div>

        <div className="demo-stat-matrix">
          <div className="demo-stat-box">
            <span className="demo-stat-num">12</span>
            <span className="demo-stat-label">Total Tournaments</span>
          </div>
          <div className="demo-stat-box highlight">
            <span className="demo-stat-num">1</span>
            <span className="demo-stat-label">Active Event</span>
          </div>
          <div className="demo-stat-box warning">
            <span className="demo-stat-num">2</span>
            <span className="demo-stat-label">Pending Approval</span>
          </div>
          <div className="demo-stat-box">
            <span className="demo-stat-num">11</span>
            <span className="demo-stat-label">Verified Closures</span>
          </div>
        </div>

        <div className="demo-table-wrapper">
          <div className="demo-table-caption">
            <span>Recent Tournament Operations</span>
            <span className="demo-status-pill green">SYSTEMS READY</span>
          </div>
          <div className="demo-compact-list">
            <div className="demo-list-row active">
              <span className="demo-col-bold">EVOQ CUP</span>
              <span className="demo-col-pill">Valorant • 5v5</span>
              <span className="demo-col-status live">● LIVE BRACKET</span>
              <span className="demo-col-action">Manage →</span>
            </div>
            <div className="demo-list-row">
              <span className="demo-col-bold"> VORTEX WINTER INVITATIONAL</span>
              <span className="demo-col-pill">Counter-Strike 2</span>
              <span className="demo-col-status done">✓ COMPLETED</span>
              <span className="demo-col-action">Archived</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. CREATE TOURNAMENT MODAL / FORM
  if (screen === 'create' || screen === 'create-filled') {
    const isFilled = screen === 'create-filled';
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-view-header">
          <div>
            <h4 className="demo-view-title">Launch Competition</h4>
            <span className="demo-view-desc">Configure tournament bracket rules and scoring</span>
          </div>
          <span className="demo-preview-badge">STEP 1 OF 3</span>
        </div>

        <div className="demo-form-grid">
          <div className="demo-form-field">
            <label className="demo-form-label">Tournament Title</label>
            <input
              type="text"
              className={`demo-input ${isFilled ? 'typing-highlight' : ''}`}
              readOnly
              value={isFilled ? 'EVOQ CUP' : 'Typing tournament name...'}
            />
          </div>

          <div className="demo-form-field">
            <label className="demo-form-label">Competitive Title</label>
            <div className="demo-input-select">
              <span>{isFilled ? 'Valorant (5v5 Tactical)' : 'Select game...'}</span>
              <span>▼</span>
            </div>
          </div>

          <div className="demo-form-field">
            <label className="demo-form-label">Bracket Format</label>
            <div className="demo-input-select">
              <span>{isFilled ? 'Single Elimination (Bo3 Finals)' : 'Select format...'}</span>
              <span>▼</span>
            </div>
          </div>

          <div className="demo-form-field">
            <label className="demo-form-label">Prize Pool &amp; Verified Badges</label>
            <input
              type="text"
              className="demo-input"
              readOnly
              value={isFilled ? '$5,000 USD + Tier-1 Career Badges' : '$0.00'}
            />
          </div>
        </div>

        <div className="demo-form-actions">
          <span className="demo-text-muted">Rosters will verify IDs automatically</span>
          <button className={`demo-btn-primary ${isFilled ? 'pulse-btn' : ''}`}>
            {isFilled ? '✓ Publish Competition' : 'Saving Draft...'}
          </button>
        </div>
      </div>
    );
  }

  // 4. TOURNAMENTS LIST
  if (screen === 'tournaments') {
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-view-header">
          <div>
            <h4 className="demo-view-title">Tournament Management</h4>
            <span className="demo-view-desc">Manage registrations, brackets, and match rooms</span>
          </div>
          <div className="demo-tab-pills">
            <span className="demo-tab-pill active">Active (1)</span>
            <span className="demo-tab-pill">Upcoming (0)</span>
            <span className="demo-tab-pill">Completed (11)</span>
          </div>
        </div>

        <div className="demo-tournament-card active-border">
          <div className="demo-trn-top">
            <div className="demo-trn-info">
              <span className="demo-badge-game">Valorant</span>
              <h5 className="demo-trn-name">{tournament.title}</h5>
              <span className="demo-trn-meta">
                {tournament.format} • {tournament.teamSize} • Prize: {tournament.prizePool}
              </span>
            </div>
            <span className="demo-badge-status live">● LIVE BRACKET</span>
          </div>

          <div className="demo-trn-stats-row">
            <div className="demo-trn-stat">
              <span className="demo-label">Teams</span>
              <span className="demo-value">4 / 4 Approved</span>
            </div>
            <div className="demo-trn-stat">
              <span className="demo-label">Phase</span>
              <span className="demo-value">Grand Final</span>
            </div>
            <div className="demo-trn-stat">
              <span className="demo-label">Trust Status</span>
              <span className="demo-value green">Encrypted Lobbies</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. REGISTRATIONS
  if (screen === 'registrations' || screen === 'registrations-approved') {
    const isApproved = screen === 'registrations-approved';
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-view-header">
          <div>
            <h4 className="demo-view-title">Roster Registrations</h4>
            <span className="demo-view-desc">{tournament.title} • 4 Participating Squads</span>
          </div>
          <span className={`demo-badge-status ${isApproved ? 'done' : 'warning'}`}>
            {isApproved ? '✓ 4 ROSTERS APPROVED' : '2 PENDING VALIDATION'}
          </span>
        </div>

        <div className="demo-roster-table">
          {teams.map((t) => {
            const teamApproved = isApproved || t.status === 'Approved';
            return (
              <div key={t.id} className="demo-roster-row">
                <div className="demo-team-ident">
                  <span className="demo-team-badge" style={{ borderColor: t.color }}>
                    {t.logo}
                  </span>
                  <div>
                    <span className="demo-team-name">{t.name}</span>
                    <span className="demo-team-captain">Captain: {t.captain} • 5 Players</span>
                  </div>
                </div>

                <div className="demo-team-status-col">
                  <span className={`demo-status-tag ${teamApproved ? 'approved' : 'pending'}`}>
                    {teamApproved ? '✓ APPROVED' : 'PENDING'}
                  </span>
                  {!teamApproved && (
                    <button className="demo-btn-sm-action">Approve</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isApproved && (
          <div className="demo-toast-banner animate-slide-up">
            <span>✓ All 4 squads verified. Bracket seeding ready.</span>
          </div>
        )}
      </div>
    );
  }

  // 6. LIVE BRACKET
  if (screen === 'bracket-live') {
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-view-header">
          <div>
            <h4 className="demo-view-title">Live Bracket Engine</h4>
            <span className="demo-view-desc">{tournament.title} • Single Elimination</span>
          </div>
          <span className="demo-badge-status live">● GRAND FINAL IN PROGRESS</span>
        </div>

        <div className="demo-bracket-grid">
          {/* Semifinals */}
          <div className="demo-bracket-col">
            <span className="demo-bracket-col-title">SEMIFINALS (BO1)</span>

            <div className="demo-bracket-match completed">
              <div className="demo-match-line winner">
                <span>▲ NORTH</span>
                <span className="demo-score">2</span>
              </div>
              <div className="demo-match-line">
                <span>◆ VECTOR</span>
                <span className="demo-score">0</span>
              </div>
            </div>

            <div className="demo-bracket-match completed">
              <div className="demo-match-line winner">
                <span>● ORBIT</span>
                <span className="demo-score">2</span>
              </div>
              <div className="demo-match-line">
                <span>■ APEX</span>
                <span className="demo-score">1</span>
              </div>
            </div>
          </div>

          <div className="demo-bracket-arrow">→</div>

          {/* Grand Final */}
          <div className="demo-bracket-col">
            <span className="demo-bracket-col-title highlight">GRAND FINAL (BO3)</span>

            <div className="demo-bracket-match grand-final active-glow">
              <div className="demo-match-line current">
                <span className="bold-team">▲ NORTH</span>
                <span className="demo-score-highlight">2</span>
              </div>
              <div className="demo-match-line current">
                <span className="bold-team">● ORBIT</span>
                <span className="demo-score-highlight">1</span>
              </div>
              <div className="demo-match-footer">
                <span>Official Room Assigned</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. MATCH CREDENTIALS MODAL
  if (screen === 'credentials-modal' || screen === 'credentials-sent') {
    const isSent = screen === 'credentials-sent';
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-view-header">
          <div>
            <h4 className="demo-view-title">Lobby Credentials Distribution</h4>
            <span className="demo-view-desc">Grand Final: NORTH vs ORBIT</span>
          </div>
          <span className="demo-badge-status live">SANCTIONED ROOM</span>
        </div>

        <div className="demo-credentials-card">
          <div className="demo-cred-row">
            <span className="demo-cred-label">SERVER LOBBY ID</span>
            <code className="demo-cred-code">{match.roomId}</code>
          </div>
          <div className="demo-cred-row">
            <span className="demo-cred-label">ACCESS PASSWORD</span>
            <code className="demo-cred-code-pwd">{match.roomPassword}</code>
          </div>
          <div className="demo-cred-row">
            <span className="demo-cred-label">MATCH PROTOCOL</span>
            <span className="demo-cred-val">Server: Frankfurt 1 • Anti-Cheat: Enforced</span>
          </div>
        </div>

        <div className="demo-action-strip">
          <button className={`demo-btn-primary ${isSent ? 'btn-success' : 'pulse-btn'}`}>
            {isSent ? '✓ Credentials Distributed' : 'Send Credentials to Captains'}
          </button>
        </div>

        {isSent && (
          <div className="demo-toast-banner success-toast animate-slide-up">
            <span>✓ Match credentials sent successfully to Team Captains KAIRO &amp; ZYPH.</span>
          </div>
        )}
      </div>
    );
  }

  // 8. RESULT APPROVAL
  if (screen === 'result-approval' || screen === 'result-verified') {
    const isVerified = screen === 'result-verified';
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-view-header">
          <div>
            <h4 className="demo-view-title">Official Result Verification</h4>
            <span className="demo-view-desc">{tournament.title} • Grand Final</span>
          </div>
          <span className={`demo-badge-status ${isVerified ? 'done' : 'warning'}`}>
            {isVerified ? '✓ CRYPTOGRAPHICALLY APPROVED' : 'AWAITING APPROVAL'}
          </span>
        </div>

        <div className="demo-result-showcase">
          <div className="demo-result-team winner-box">
            <span className="demo-team-badge-lg" style={{ color: '#C9FF52' }}>▲</span>
            <span className="demo-result-team-name">NORTH</span>
            <span className="demo-result-score">2</span>
            <span className="demo-result-crown">CHAMPION</span>
          </div>

          <span className="demo-result-vs">FINAL SCORE</span>

          <div className="demo-result-team">
            <span className="demo-team-badge-lg" style={{ color: '#60A5FA' }}>●</span>
            <span className="demo-result-team-name">ORBIT</span>
            <span className="demo-result-score">1</span>
            <span className="demo-result-sub">RUNNER UP</span>
          </div>
        </div>

        <div className="demo-approval-card">
          <div className="demo-hash-line">
            <span>AUDIT HASH:</span>
            <code>0x8f2d...4a91-EVQ-EVOQ-VAL-904</code>
          </div>
          <button className={`demo-btn-primary ${isVerified ? 'btn-success' : 'pulse-btn'}`}>
            {isVerified ? '✓ Official Result Approved' : 'Sign & Verify Outcome'}
          </button>
        </div>

        {isVerified && (
          <div className="demo-toast-banner success-toast animate-slide-up">
            <span>✓ Official result approved. Gamer achievements queued for verification.</span>
          </div>
        )}
      </div>
    );
  }

  // 9. LEADERBOARD & CLOSE
  if (screen === 'leaderboard') {
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-view-header">
          <div>
            <h4 className="demo-view-title">Tournament Concluded</h4>
            <span className="demo-view-desc">{tournament.title} • Official Final Standings</span>
          </div>
          <span className="demo-badge-status done">✓ ARCHIVED TO PORTFOLIO</span>
        </div>

        <div className="demo-standings-list">
          <div className="demo-standing-row champion">
            <span className="demo-rank">#1</span>
            <span className="demo-team">▲ NORTH</span>
            <span className="demo-record">2 - 0 (Wins)</span>
            <span className="demo-prize">$3,500 + Verified Trophy</span>
          </div>
          <div className="demo-standing-row runner-up">
            <span className="demo-rank">#2</span>
            <span className="demo-team">● ORBIT</span>
            <span className="demo-record">1 - 1 (Wins)</span>
            <span className="demo-prize">$1,500 + Silver Badge</span>
          </div>
          <div className="demo-standing-row">
            <span className="demo-rank">#3</span>
            <span className="demo-team">◆ VECTOR</span>
            <span className="demo-record">0 - 1</span>
            <span className="demo-prize">Semifinalist Badge</span>
          </div>
        </div>

        <div className="demo-closure-note">
          <span>10 Verified Gamer Achievements generated across all rosters.</span>
        </div>
      </div>
    );
  }

  return null;
}

