/**
 * EVOQ HERO INTERACTIVE PRODUCT SIMULATION - DEMO DATA
 * Single shared source of truth for both Organizer and Gamer chapters.
 * All credentials, tournament IDs, and results are illustrative dummy values
 * maintained consistently across both perspectives to demonstrate EVOQ's
 * connected trust infrastructure.
 */

export const INITIAL_DEMO_DATA = {
  // ORGANIZER PROFILE & IDENTITY
  organizer: {
    name: 'Evoq eSports',
    organization: 'Evoq Esports Operations',
    tag: 'Evoq',
    avatar: 'EV',
    verificationStatus: 'VERIFIED OPERATOR',
    tournamentsHosted: 12,
    completedTournaments: 11,
    activeTournaments: 1,
    pendingRegistrations: 2,
    trustRating: '4.98 / 5.0',
    bio: 'Tier-1 tournament organizer operating national qualifiers and tactical FPS leagues.',
  },

  // TOURNAMENT BEING SIMULATED
  tournament: {
    id: 'TRN-EVOQ-VAL-01',
    title: 'Evoq Cup',
    game: 'Valorant',
    format: 'Single Elimination',
    teamSize: '5v5 Squads',
    bracketSize: 4,
    registrationDeadline: 'Nov 8, 2026',
    date: 'Live Season Finals',
    prizePool: '$5,000 USD',
    rules: 'Official VCT Standard Ruleset, Bo3 Finals, Anti-Cheat Mandated',
    status: 'Upcoming', // 'Upcoming' -> 'Live' -> 'Completed'
  },

  // TEAMS REGISTERING & COMPETING
  teams: [
    {
      id: 'Infinity eSports',
      name: 'Infinity eSports',
      captain: 'Sumit',
      rosterCount: 5,
      seed: 1,
      status: 'Pending', // will transition to 'Approved'
      logo: 'INF',
      color: '#C9FF52',
    },
    {
      id: 'Infinity-2',
      name: 'S8UL',
      captain: 'Mohit',
      rosterCount: 5,
      seed: 2,
      status: 'Pending', // will transition to 'Approved'
      logo: 'S8UL',
      color: '#60A5FA',
    },
    {
      id: 'Infinity-3',
      name: 'VECTOR GAMING',
      captain: 'Priyanshu',
      rosterCount: 5,
      seed: 3,
      status: 'Approved',
      logo: 'VEC',
      color: '#F472B6',
    },
    {
      id: 'Infinity-4',
      name: 'APEX GAMING',
      captain: 'Harshit',
      rosterCount: 5,
      seed: 4,
      status: 'Approved',
      logo: 'APX',
      color: '#FBBF24',
    },
  ],

  // GRAND FINAL MATCH - SHARED CREDENTIALS & RESULT
  match: {
    id: 'MATCH-GF-904',
    title: 'Grand Final',
    tournamentName: 'Evoq Cup',
    game: 'Valorant',
    round: 'Finals (Bo3)',
    teamA: 'Infinity eSports',
    teamB: 'VECTOR GAMING',
    teamAScore: 2,
    teamBScore: 1,
    // EXACT SAME ROOM CREDENTIALS DISPLAYED IN BOTH CHAPTERS
    roomId: 'EVOQ-VAL-904',
    roomPassword: 'evoq-finals-7',
    credentialsSent: false,
    status: 'Scheduled', // 'Scheduled' -> 'In Progress' -> 'Completed'
    resultApproved: false,
    winner: 'Infinity eSports',
  },

  // GAMER PROFILE & IDENTITY
  gamer: {
    name: 'Sumit kumar',
    ign: 'Reset',
    gamerId: '#EVQ-0001',
    avatar: 'SK',
    tier: 'Radiant / Elite Tier 1',
    role: 'Initiator / Team IGL',
    team: 'Infinity eSports',
    rating: '2,840 ELO',
    winRate: '72.4%',
    matchesPlayed: 86,
    connectedGames: [
      {
        game: 'Valorant',
        ign: 'RESET#EVQ',
        rank: 'Radiant #42',
        stat: '1.42 K/D',
        icon: 'VAL',
        verified: true,
      },
      {
        game: 'Counter-Strike 2',
        ign: 'reset_fps',
        rank: 'Faceit Level 10',
        stat: '2,140 ELO',
        icon: 'CS2',
        verified: true,
      },
      {
        game: 'Free Fire',
        ign: 'reset_04',
        rank: 'Grandmaster',
        stat: '3.80 K/D',
        icon: 'FF',
        verified: true,
      },
    ],
    // Initial 4 verified achievements
    achievements: [
      {
        id: 'ach-01',
        title: 'VALORANT PRO INVITATIONAL',
        position: '1st Place',
        date: 'Oct 2026',
        verified: true,
        badge: '1ST',
        tier: 'Gold',
      },
      {
        id: 'ach-02',
        title: 'EVOQ CUP',
        position: 'Runner Up',
        date: 'Aug 2026',
        verified: true,
        badge: '2ND',
        tier: 'Silver',
      },
      {
        id: 'ach-03',
        title: 'SUMMER SHOWDOWN CUP',
        position: 'Semifinalist',
        date: 'Jun 2026',
        verified: true,
        badge: '3RD',
        tier: 'Bronze',
      },
      {
        id: 'ach-04',
        title: 'TACTICAL OPEN SEASON 2',
        position: '1st Place',
        date: 'Apr 2026',
        verified: true,
        badge: '1ST',
        tier: 'Gold',
      },
    ],
  },

  // NEW VERIFIED ACHIEVEMENT UNLOCKED AT THE CLIMAX
  newAchievement: {
    id: 'TRN-EVOQ-VAL-01',
    title: 'EVOQ CUP',
    position: '1st Place Champion',
    date: 'Official Result Verified',
    verified: true,
    badge: 'CHAMP',
    tier: 'Platinum',
    organizer: 'EVOQ eSports',
    verificationHash: 'EVQ-TX-8821-EVOQ-904',
  },
};
