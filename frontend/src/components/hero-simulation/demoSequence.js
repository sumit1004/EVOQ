/**
 * EVOQ HERO INTERACTIVE PRODUCT SIMULATION - DEMO SEQUENCE
 * Scripted deterministic timeline defining the step-by-step product walkthrough.
 * Transitions smoothly between Organizer Workspace -> Transition Card -> Gamer Workspace -> Final State.
 */

export const DEMO_CHAPTERS = {
  ORGANIZER: 'ORGANIZER',
  TRANSITION: 'TRANSITION',
  GAMER: 'GAMER',
  FINAL: 'FINAL',
};

export const DEMO_STEPS = [
  // =========================================================================
  // CHAPTER 1: ORGANIZER WORKSPACE
  // =========================================================================
  {
    id: 'org-profile',
    chapter: DEMO_CHAPTERS.ORGANIZER,
    screen: 'profile',
    title: 'Organizer Profile & Credentials',
    description: 'Verified organization portfolio and event track record',
    cursor: { x: 32, y: 38, clicking: false },
    duration: 2800,
  },
  {
    id: 'org-nav-dashboard',
    chapter: DEMO_CHAPTERS.ORGANIZER,
    screen: 'dashboard',
    title: 'Operations Dashboard',
    description: 'Active competitions, registrations, and command metrics',
    cursor: { x: 12, y: 28, clicking: true },
    duration: 2600,
  },
  {
    id: 'org-nav-create',
    chapter: DEMO_CHAPTERS.ORGANIZER,
    screen: 'create',
    title: 'Create Tournament Flow',
    description: 'Configuring new competitive bracket and game settings',
    cursor: { x: 88, y: 19, clicking: true },
    duration: 2200,
  },
  {
    id: 'org-populate-form',
    chapter: DEMO_CHAPTERS.ORGANIZER,
    screen: 'create-filled',
    title: 'EVO CUP',
    description: 'Setting Valorant 5v5 Single Elimination format',
    cursor: { x: 55, y: 76, clicking: false },
    duration: 2800,
  },
  {
    id: 'org-submit-create',
    chapter: DEMO_CHAPTERS.ORGANIZER,
    screen: 'tournaments',
    title: 'Publish Competition',
    description: 'Tournament launched to public directory',
    cursor: { x: 78, y: 84, clicking: true },
    duration: 2400,
  },
  {
    id: 'org-registrations',
    chapter: DEMO_CHAPTERS.ORGANIZER,
    screen: 'registrations',
    title: 'Review Team Registrations',
    description: '4 competitive rosters awaiting roster validation',
    cursor: { x: 12, y: 44, clicking: true },
    duration: 2400,
  },
  {
    id: 'org-approve-teams',
    chapter: DEMO_CHAPTERS.ORGANIZER,
    screen: 'registrations-approved',
    title: 'Approve North & Orbit Rosters',
    description: 'Status updated from Pending to Approved',
    cursor: { x: 86, y: 42, clicking: true },
    duration: 2800,
    action: 'approveRegistrations',
  },
  {
    id: 'org-start-tournament',
    chapter: DEMO_CHAPTERS.ORGANIZER,
    screen: 'bracket-live',
    title: 'Generate Live Bracket',
    description: 'Seeding 4 qualified rosters into Single Elimination bracket',
    cursor: { x: 88, y: 22, clicking: true },
    duration: 3000,
    action: 'startTournament',
  },
  {
    id: 'org-match-credentials',
    chapter: DEMO_CHAPTERS.ORGANIZER,
    screen: 'credentials-modal',
    title: 'Generate Match Lobby Credentials',
    description: 'Creating encrypted Room ID and Password for Grand Final',
    cursor: { x: 62, y: 48, clicking: true },
    duration: 3200,
  },
  {
    id: 'org-send-credentials',
    chapter: DEMO_CHAPTERS.ORGANIZER,
    screen: 'credentials-sent',
    title: 'Broadcast Credentials to Captains',
    description: 'Lobby credentials distributed to team captains securely',
    cursor: { x: 75, y: 65, clicking: true },
    duration: 2800,
    action: 'sendCredentials',
  },
  {
    id: 'org-submit-result',
    chapter: DEMO_CHAPTERS.ORGANIZER,
    screen: 'result-approval',
    title: 'Record Match Result: NORTH 2 - 1 ORBIT',
    description: 'Grand final outcome submitted for official sign-off',
    cursor: { x: 50, y: 55, clicking: true },
    duration: 2800,
    action: 'submitScore',
  },
  {
    id: 'org-approve-result',
    chapter: DEMO_CHAPTERS.ORGANIZER,
    screen: 'result-verified',
    title: 'Approve Official Results',
    description: 'Cryptographic result sealed to blockchain/trust audit log',
    cursor: { x: 68, y: 72, clicking: true },
    duration: 3000,
    action: 'approveResult',
  },
  {
    id: 'org-leaderboard',
    chapter: DEMO_CHAPTERS.ORGANIZER,
    screen: 'leaderboard',
    title: 'Final Standings & Closure',
    description: 'North crowned Champion; event archived to organizer portfolio',
    cursor: { x: 82, y: 34, clicking: false },
    duration: 3000,
  },

  // =========================================================================
  // TRANSITION: CONNECTED TRUST BRIDGE
  // =========================================================================
  {
    id: 'bridge-transition',
    chapter: DEMO_CHAPTERS.TRANSITION,
    screen: 'transition',
    title: 'The Competition Continues',
    description: 'From Organizer to Gamer: verified results update player identity',
    cursor: { x: 50, y: 50, clicking: false },
    duration: 3200,
  },

  // =========================================================================
  // CHAPTER 2: GAMER WORKSPACE
  // =========================================================================
  {
    id: 'gamer-profile',
    chapter: DEMO_CHAPTERS.GAMER,
    screen: 'profile',
    title: 'Gamer Professional Profile',
    description: 'Verified player portfolio, competitive tier, and squad history',
    cursor: { x: 35, y: 36, clicking: false },
    duration: 2800,
  },
  {
    id: 'gamer-game-identities',
    chapter: DEMO_CHAPTERS.GAMER,
    screen: 'game-identities',
    title: 'Connected Game Identities',
    description: 'Verified game IDs across Valorant, CS2, and Free Fire',
    cursor: { x: 12, y: 42, clicking: true },
    duration: 2600,
  },
  {
    id: 'gamer-explore',
    chapter: DEMO_CHAPTERS.GAMER,
    screen: 'explore',
    title: 'Explore Competitions',
    description: 'Browsing sanctioned tournaments in the EVOQ ecosystem',
    cursor: { x: 12, y: 52, clicking: true },
    duration: 2400,
  },
  {
    id: 'gamer-select-tournament',
    chapter: DEMO_CHAPTERS.GAMER,
    screen: 'explore-detail',
    title: 'EVOQ CUP Entry',
    description: 'Squad NORTH registering with official roster roster',
    cursor: { x: 74, y: 46, clicking: true },
    duration: 2600,
  },
  {
    id: 'gamer-my-tournaments',
    chapter: DEMO_CHAPTERS.GAMER,
    screen: 'my-tournaments',
    title: 'Active Tournaments & Schedule',
    description: 'Grand final match scheduled against ORBIT',
    cursor: { x: 12, y: 62, clicking: true },
    duration: 2600,
  },
  {
    id: 'gamer-view-credentials',
    chapter: DEMO_CHAPTERS.GAMER,
    screen: 'gamer-credentials',
    title: 'Match Credentials Received',
    description: 'Exact Room ID & Password distributed by organizer',
    cursor: { x: 65, y: 50, clicking: true },
    duration: 3200,
  },
  {
    id: 'gamer-match-result',
    chapter: DEMO_CHAPTERS.GAMER,
    screen: 'gamer-match-result',
    title: 'Verified Grand Final Score',
    description: 'Infinity eSports 2 - 1 VECTOR GAMING verified by Vortex Esports Operations',
    cursor: { x: 50, y: 52, clicking: false },
    duration: 2800,
  },
  {
    id: 'gamer-achievement-unlocked',
    chapter: DEMO_CHAPTERS.GAMER,
    screen: 'achievement-celebration',
    title: 'New Verified Achievement Unlocked',
    description: 'EVOQ CUP 1st Place permanently added to profile',
    cursor: { x: 50, y: 60, clicking: false },
    duration: 3800,
    action: 'unlockAchievement',
  },
  {
    id: 'gamer-updated-profile',
    chapter: DEMO_CHAPTERS.GAMER,
    screen: 'profile-updated',
    title: 'Updated Career Portfolio',
    description: 'Achievement count increased to 5 with official verification seal',
    cursor: { x: 72, y: 45, clicking: false },
    duration: 3200,
  },

  // =========================================================================
  // CHAPTER 3: FINAL STATE
  // =========================================================================
  {
    id: 'final-ecosystem',
    chapter: DEMO_CHAPTERS.FINAL,
    screen: 'final-screen',
    title: 'Play. Compete. Achieve. Get Recognized.',
    description: 'Experience the future of esports infrastructure on EVOQ',
    cursor: { x: 50, y: 50, clicking: false },
    duration: 4500,
  },
];

