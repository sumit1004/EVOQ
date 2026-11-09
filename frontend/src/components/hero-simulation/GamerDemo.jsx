import React from 'react';

export default function GamerDemo({ screen, data, isAchievementUnlocked }) {
  const { gamer, tournament, match, newAchievement } = data;
  const achievementCount = isAchievementUnlocked
    ? gamer.achievements.length + 1
    : gamer.achievements.length;

  // 1. GAMER PROFILE
  if (screen === 'profile' || screen === 'profile-updated') {
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-profile-header">
          <div className="demo-gamer-avatar">{gamer.avatar}</div>
          <div className="demo-org-meta">
            <div className="demo-org-title-row">
              <h4 className="demo-org-name">{gamer.ign} <span className="demo-tag-clean">{gamer.name}</span></h4>
              <span className="demo-verified-tag">✓ PRO VERIFIED</span>
            </div>
            <p className="demo-org-sub">
              ID: {gamer.gamerId} • Squad: <strong style={{ color: '#C9FF52' }}>{gamer.team}</strong> • Role: {gamer.role}
            </p>
            <div className="demo-tags-wrap" style={{ marginTop: '0.4rem' }}>
              <span className="demo-tag highlight">{gamer.tier}</span>
              <span className="demo-tag">{gamer.rating}</span>
              <span className="demo-tag">{gamer.winRate} Win Rate</span>
            </div>
          </div>
        </div>

        <div className="demo-stat-matrix">
          <div className="demo-stat-box highlight">
            <span className="demo-stat-num">{achievementCount}</span>
            <span className="demo-stat-label">Verified Badges</span>
          </div>
          <div className="demo-stat-box">
            <span className="demo-stat-num">{gamer.matchesPlayed}</span>
            <span className="demo-stat-label">Sanctioned Matches</span>
          </div>
          <div className="demo-stat-box">
            <span className="demo-stat-num">3</span>
            <span className="demo-stat-label">Linked Game IDs</span>
          </div>
          <div className="demo-stat-box">
            <span className="demo-stat-num">#42</span>
            <span className="demo-stat-label">Regional Rank</span>
          </div>
        </div>

        {/* Career Achievements List */}
        <div className="demo-table-wrapper">
          <div className="demo-table-caption">
            <span>Career Verified Achievements ({achievementCount})</span>
            <span className="demo-status-pill green">PORTFOLIO SEALED</span>
          </div>
          <div className="demo-achievements-list">
            {isAchievementUnlocked && (
              <div className="demo-achieve-card new-unlocked-card animate-slide-up">
                <span className="demo-achieve-badge">{newAchievement.badge}</span>
                <div className="demo-achieve-info">
                  <span className="demo-achieve-title">{newAchievement.title}</span>
                  <span className="demo-achieve-meta">
                    {newAchievement.position} • {newAchievement.date}
                  </span>
                </div>
                <span className="demo-verified-pill">✓ VERIFIED BY {newAchievement.organizer}</span>
              </div>
            )}

            {gamer.achievements.slice(0, isAchievementUnlocked ? 2 : 3).map((ach) => (
              <div key={ach.id} className="demo-achieve-card">
                <span className="demo-achieve-badge">{ach.badge}</span>
                <div className="demo-achieve-info">
                  <span className="demo-achieve-title">{ach.title}</span>
                  <span className="demo-achieve-meta">{ach.position} • {ach.date}</span>
                </div>
                <span className="demo-verified-pill">✓ OFFICIAL</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. CONNECTED GAME IDENTITIES
  if (screen === 'game-identities') {
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-view-header">
          <div>
            <h4 className="demo-view-title">Connected Game Passports</h4>
            <span className="demo-view-desc">Cryptographically bound in-game credentials</span>
          </div>
          <span className="demo-badge-status done">3 GAME IDs VERIFIED</span>
        </div>

        <div className="demo-game-cards-stack">
          {gamer.connectedGames.map((g) => (
            <div key={g.game} className="demo-game-id-card">
              <div className="demo-game-id-left">
                <span className="demo-game-icon">{g.icon}</span>
                <div>
                  <h5 className="demo-game-name">{g.game}</h5>
                  <span className="demo-game-ign">IGN: <code>{g.ign}</code></span>
                </div>
              </div>
              <div className="demo-game-id-right">
                <span className="demo-game-rank">{g.rank}</span>
                <span className="demo-game-stat">{g.stat}</span>
                <span className="demo-badge-status done" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
                  ✓ BOUND
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="demo-closure-note" style={{ marginTop: '0.75rem' }}>
          <span>Connected game identities are verified against tournament roster requirements.</span>
        </div>
      </div>
    );
  }

  // 3. EXPLORE TOURNAMENTS
  if (screen === 'explore' || screen === 'explore-detail') {
    const isDetail = screen === 'explore-detail';
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-view-header">
          <div>
            <h4 className="demo-view-title">Tournament Discovery</h4>
            <span className="demo-view-desc">Browse tier-1 sanctioned events</span>
          </div>
          <span className="demo-badge-status live">● REGISTRATIONS OPEN</span>
        </div>

        <div className="demo-tournament-card active-border">
          <div className="demo-trn-top">
            <div className="demo-trn-info">
              <span className="demo-badge-game">Valorant</span>
              <h5 className="demo-trn-name">{tournament.title}</h5>
              <span className="demo-trn-meta">
                Organized by Vortex Ops • {tournament.format} • {tournament.teamSize}
              </span>
            </div>
            <span className="demo-prize-tag">{tournament.prizePool}</span>
          </div>

          <div className="demo-trn-stats-row">
            <div className="demo-trn-stat">
              <span className="demo-label">Registration</span>
              <span className="demo-value green">Open Now</span>
            </div>
            <div className="demo-trn-stat">
              <span className="demo-label">Roster Check</span>
              <span className="demo-value">Squad NORTH Qualified</span>
            </div>
            <div className="demo-trn-stat">
              <span className="demo-label">Verified Badges</span>
              <span className="demo-value highlight">Champion &amp; Finalist</span>
            </div>
          </div>

          <div className="demo-action-strip" style={{ marginTop: '0.85rem' }}>
            <button className={`demo-btn-primary ${isDetail ? 'btn-success' : 'pulse-btn'}`}>
              {isDetail ? '✓ Squad NORTH Registered' : 'Enter Tournament with NORTH'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. MY TOURNAMENTS
  if (screen === 'my-tournaments') {
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-view-header">
          <div>
            <h4 className="demo-view-title">My Competitions</h4>
            <span className="demo-view-desc">Active registrations and upcoming matches</span>
          </div>
          <span className="demo-badge-status live">1 MATCH SCHEDULED</span>
        </div>

        <div className="demo-match-card-gamer">
          <div className="demo-match-card-top">
            <span className="demo-match-label">{tournament.title} • GRAND FINAL</span>
            <span className="demo-badge-status live">● LIVE NOW</span>
          </div>

          <div className="demo-match-versus-row">
            <div className="demo-squad-box">
              <span className="demo-squad-logo" style={{ color: '#C9FF52' }}>▲</span>
              <span className="demo-squad-name">NORTH (My Squad)</span>
              <span className="demo-squad-seed">Seed #1</span>
            </div>
            <span className="demo-vs-pill">VS</span>
            <div className="demo-squad-box">
              <span className="demo-squad-logo" style={{ color: '#60A5FA' }}>●</span>
              <span className="demo-squad-name">ORBIT</span>
              <span className="demo-squad-seed">Seed #2</span>
            </div>
          </div>

          <div className="demo-action-strip" style={{ marginTop: '0.85rem' }}>
            <button className="demo-btn-primary">
              View Match Room Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. MATCH CREDENTIALS (RECEIVED FROM ORGANIZER - EXACT CONTINUITY!)
  if (screen === 'gamer-credentials') {
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-view-header">
          <div>
            <h4 className="demo-view-title">Match Room Credentials</h4>
            <span className="demo-view-desc">Received from Vortex Esports Operations</span>
          </div>
          <span className="demo-badge-status done">✓ VERIFIED BY ORGANIZER</span>
        </div>

        <div className="demo-credentials-card gamer-cred-border">
          <div className="demo-cred-row">
            <span className="demo-cred-label">OFFICIAL LOBBY ID</span>
            {/* EXACT SAME ROOM ID AS ORGANIZER */}
            <code className="demo-cred-code">{match.roomId}</code>
          </div>
          <div className="demo-cred-row">
            <span className="demo-cred-label">ROOM PASSWORD</span>
            {/* EXACT SAME ROOM PASSWORD AS ORGANIZER */}
            <code className="demo-cred-code-pwd">{match.roomPassword}</code>
          </div>
          <div className="demo-cred-row">
            <span className="demo-cred-label">MATCH STATUS</span>
            <span className="demo-cred-val green">● Both squads checked in. Match live.</span>
          </div>
        </div>

        <div className="demo-closure-note" style={{ marginTop: '0.85rem' }}>
          <span>Cryptographic lobby continuity: same server credentials dispatched by tournament organizer.</span>
        </div>
      </div>
    );
  }

  // 6. MATCH RESULT
  if (screen === 'gamer-match-result') {
    return (
      <div className="demo-view-container animate-fade-in">
        <div className="demo-view-header">
          <div>
            <h4 className="demo-view-title">Official Match Outcome</h4>
            <span className="demo-view-desc">{tournament.title} • Grand Final Score</span>
          </div>
          <span className="demo-badge-status done">✓ OFFICIAL RESULT APPROVED</span>
        </div>

        <div className="demo-result-showcase">
          <div className="demo-result-team winner-box">
            <span className="demo-team-badge-lg" style={{ color: '#C9FF52' }}>▲</span>
            <span className="demo-result-team-name">NORTH</span>
            <span className="demo-result-score">2</span>
            <span className="demo-result-crown">VICTORY</span>
          </div>

          <span className="demo-result-vs">BO3 FINALS</span>

          <div className="demo-result-team">
            <span className="demo-team-badge-lg" style={{ color: '#60A5FA' }}>●</span>
            <span className="demo-result-team-name">ORBIT</span>
            <span className="demo-result-score">1</span>
            <span className="demo-result-sub">DEFEAT</span>
          </div>
        </div>

        <div className="demo-approval-card" style={{ marginTop: '0.85rem' }}>
          <div className="demo-hash-line">
            <span>TOURNAMENT STANDING:</span>
            <strong style={{ color: '#C9FF52' }}>1st Place Champion • $3,500 Prize</strong>
          </div>
          <span className="demo-text-muted">Awaiting automatic verified achievement issuance...</span>
        </div>
      </div>
    );
  }

  // 7. ACHIEVEMENT CELEBRATION (THE CORE DIFFERENTIATOR MOMENT)
  if (screen === 'achievement-celebration') {
    return (
      <div className="demo-view-container celebration-view animate-fade-in">
        <div className="demo-celebration-hero">
          <div className="demo-celebration-badge-glow">
            <span className="demo-celebration-crown" style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.1em' }}>CHAMPION</span>
          </div>

          <div className="demo-eyebrow" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
            <span className="demo-eyebrow-dot" />
            NEW VERIFIED ACHIEVEMENT UNLOCKED
          </div>

          <h3 className="demo-celebration-title">EVOQ CUP</h3>
          <p className="demo-celebration-sub">
            1st Place Champion • {tournament.game} 5v5 Squads
          </p>

          <div className="demo-verification-receipt">
            <div className="demo-receipt-row">
              <span>Verified By:</span>
              <strong>{newAchievement.organizer}</strong>
            </div>
            <div className="demo-receipt-row">
              <span>Audit Signature:</span>
              <code>{newAchievement.verificationHash}</code>
            </div>
            <div className="demo-receipt-row">
              <span>Career Impact:</span>
              <strong style={{ color: '#C9FF52' }}>Added to Verified Esports Portfolio</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

