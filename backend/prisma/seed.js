import prisma from '../src/database/prisma.js';

const CANONICAL_GAMES = [
  {
    name: 'Valorant',
    slug: 'valorant',
    shortName: 'VAL',
    genre: 'Tactical Shooter',
    publisher: 'Riot Games',
    logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE',
    platforms: ['PC'],
    supportedRoles: ['Duelist', 'Initiator', 'Controller', 'Sentinel'],
    identityFields: [
      { key: 'riotId', label: 'Riot ID (Name#Tag)', required: true },
      { key: 'serverRegion', label: 'Server Region', required: true, options: ['NA', 'EU', 'AP', 'KR', 'BR', 'LATAM'] },
      { key: 'primaryRole', label: 'Primary Role', required: false },
    ],
    scoringTemplate: {
      format: 'ROUNDS',
      pointsPerWin: 3,
      pointsPerDraw: 1,
      pointsPerLoss: 0,
      tieBreakers: ['ROUND_DIFFERENTIAL', 'HEAD_TO_HEAD'],
    },
  },
  {
    name: 'Counter-Strike 2',
    slug: 'cs2',
    shortName: 'CS2',
    genre: 'Tactical Shooter',
    publisher: 'Valve',
    logoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE',
    platforms: ['PC'],
    supportedRoles: ['Entry Fragger', 'AWPer', 'In-Game Leader (IGL)', 'Support', 'Lurker'],
    identityFields: [
      { key: 'steamId64', label: 'SteamID64', required: true },
      { key: 'inGameName', label: 'Player Handle', required: true },
    ],
    scoringTemplate: {
      format: 'ROUNDS',
      pointsPerWin: 3,
      pointsPerLoss: 0,
    },
  },
  {
    name: 'Apex Legends',
    slug: 'apex-legends',
    shortName: 'APEX',
    genre: 'Battle Royale',
    publisher: 'Electronic Arts / Respawn',
    logoUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE',
    platforms: ['PC', 'PlayStation', 'Xbox'],
    supportedRoles: ['Fragger', 'Anchor', 'Recon', 'Support'],
    identityFields: [
      { key: 'eaAccountName', label: 'EA ID / Gamertag', required: true },
      { key: 'platform', label: 'Platform', required: true, options: ['PC', 'Console'] },
    ],
    scoringTemplate: {
      format: 'BATTLE_ROYALE',
      killPointsMultiplier: 1,
      placementPoints: {
        1: 12,
        2: 9,
        3: 7,
        4: 5,
        5: 4,
        6: 3,
        7: 3,
        8: 2,
        9: 2,
        10: 2,
        11: 1,
        12: 1,
        13: 1,
        14: 1,
        15: 1,
      },
    },
  },
  {
    name: 'League of Legends',
    slug: 'league-of-legends',
    shortName: 'LOL',
    genre: 'MOBA',
    publisher: 'Riot Games',
    logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE',
    platforms: ['PC'],
    supportedRoles: ['Top', 'Jungle', 'Mid', 'ADC / Bot', 'Support'],
    identityFields: [
      { key: 'riotId', label: 'Riot ID', required: true },
      { key: 'region', label: 'Server Region', required: true, options: ['NA', 'EUW', 'EUNE', 'KR'] },
    ],
    scoringTemplate: {
      format: 'MATCH_WINS',
      pointsPerWin: 1,
      pointsPerLoss: 0,
    },
  },
  {
    name: 'Rocket League',
    slug: 'rocket-league',
    shortName: 'RL',
    genre: 'Sports / Vehicular',
    publisher: 'Psyonix / Epic Games',
    logoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE',
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    supportedRoles: ['Striker', 'Playmaker', 'Defender', 'Rotational'],
    identityFields: [
      { key: 'epicGamesId', label: 'Epic Games Account ID', required: true },
    ],
    scoringTemplate: {
      format: 'SERIES',
      pointsPerWin: 1,
      pointsPerLoss: 0,
    },
  },
];

async function seed() {
  console.log('Seeding canonical games...');
  for (const game of CANONICAL_GAMES) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {
        name: game.name,
        shortName: game.shortName,
        genre: game.genre,
        publisher: game.publisher,
        logoUrl: game.logoUrl,
        bannerUrl: game.bannerUrl,
        status: game.status,
        platforms: game.platforms,
        supportedRoles: game.supportedRoles,
        identityFields: game.identityFields,
        scoringTemplate: game.scoringTemplate,
      },
      create: {
        name: game.name,
        slug: game.slug,
        shortName: game.shortName,
        genre: game.genre,
        publisher: game.publisher,
        logoUrl: game.logoUrl,
        bannerUrl: game.bannerUrl,
        status: game.status,
        platforms: game.platforms,
        supportedRoles: game.supportedRoles,
        identityFields: game.identityFields,
        scoringTemplate: game.scoringTemplate,
      },
    });
  }
  console.log(`Successfully seeded ${CANONICAL_GAMES.length} games.`);
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

