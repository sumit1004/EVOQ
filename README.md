# EVOQ

**The Professional Network & Operating System for Esports.**

*Play. Compete. Achieve. Get Recognized.*

---

## Architecture & Implementation Overview

EVOQ combines four connected product layers in a unified modular monolith:

1. **Tournament Operations Platform**: Automated bracket fixture generation (Single Elimination, Double Elimination, Round Robin, Battle Royale), encrypted AES-256-GCM lobby credentials, and referee result approval workflows.
2. **Gamer Professional Network**: Authoritative match results instantly generate immutable, cryptographically verifiable achievements, career stats, and career timelines across game titles (Riot, Steam, Epic Games).
3. **Organizer Professional Network**: Esports organizations and tournament directors earn verified operations credentials, credibility scores, and immutable event portfolios.
4. **Shared Data & Trust Layer**: Idempotent proof tracking, immutable audit logs, MySQL-backed server sessions, and anti-spoofing verification ensure complete trust across the competitive landscape.

---

## Implemented Modules (Phases 1, 4, 5, 6, 7)

### Phase 1: Platform Foundation & Security
- **Modular Monolith Architecture**: Clean domain boundaries (`src/modules/*`), separating HTTP routing, validation, controllers, and services.
- **UUID v4 Standard**: All primary keys and entity identifiers use UUID v4 stored as `CHAR(36)` across all Prisma models.
- **Server-Side Session Authentication**: MySQL-backed sessions using high-entropy crypto tokens (`crypto.randomBytes(32)`). Only the SHA-256 hash is persisted in the database; raw tokens are delivered exclusively via `HttpOnly`, `Secure`, `SameSite` browser cookies.
- **Password Security**: Argon2id (`m=65536, t=3, p=2`) password hashing via native bindings.
- **CSRF Protection**: Mutating requests require session-bound HMAC CSRF tokens passed via the `X-CSRF-Token` header.
- **Rate Limiting**: IP and account-based rate limiting on sensitive endpoints.
- **Validation**: Strict schema validation using Zod schemas for all inbound request bodies and parameters.
- **Dark-First Esports UI**: Plain CSS custom design system built with the confirmed EVOQ color tokens and responsive layouts.

### Phase 4: Identity Foundation
- **Gamer Profiles & Identities**: Bio, avatar, social handles, game-specific identities (Riot ID, Steam ID, Epic ID) with uniqueness and verification flags (`/api/v1/profiles`).
- **Teams & Rosters**: Team creation, invitations, captain role, roster snapshots, and public team profiles (`/api/v1/teams`).
- **Organizations & Staff**: Organization profiles, staff roles (`OWNER`, `ADMIN`, `TOURNAMENT_ADMIN`, `REFEREE`, `MEMBER`), and staff management (`/api/v1/organizations`).
- **Organizer Profiles**: Operational credibility tracking and public organizer profiles (`/api/v1/organizers`).

### Phase 5: Tournament Engine
- **Lifecycle Engine**: Deterministic state machine (`DRAFT` → `ANNOUNCED` → `REGISTRATION_OPEN` → `REGISTRATION_CLOSED` → `ONGOING` → `CONCLUDED` / `CANCELLED`).
- **Registrations & Rosters**: Solo and team registrations with roster freezing and organizer approval (`/api/v1/tournaments/:id/registrations`).
- **Competition Stages & Match Generation**: Automated bracket generation for Single Elimination, Round Robin, and Battle Royale matches (`/api/v1/tournaments/:id/generate-matches`).
- **Protected Match Credentials**: Room IDs, passwords, and lobby instructions encrypted at rest via AES-256-GCM, released to participants upon organizer authorization (`/api/v1/matches/:id/credentials`).

### Phase 6: Gamer Professional Network
- **Authoritative Result Engine**: Revision-based result submissions and referee approval (`/api/v1/matches/:id/results`, `/api/v1/results/:id/approve`).
- **Cross-Module Verification**: Approving final/concluding matches automatically produces verified `GamerAchievement` records, career history entries (`GamerCareerRecord`), and player performance statistics (`GamerStatistic`).
- **Standings Recalculation**: Live points, match wins, and game differentials computed per tournament stage.
- **Public Player Profiles**: Public portfolio at `/players/:slug` featuring achievements, verified badges, career timelines, and game handles.

### Phase 7: Organizer Professional Network
- **Organizer Portfolios**: Completed tournaments generate verified `OrganizerPortfolioRecord` entries with participant and match metrics.
- **Credibility Scoring**: Dynamic calculation of completion rates, total participants hosted, and dispute resolution history (`/api/v1/organizers/:slug`).
- **Organizer Control Room**: Full dashboard at `/dashboard/tournaments/:id/manage` to orchestrate lifecycle transitions, approve rosters, schedule fixtures, set encrypted room credentials, and authorize match results.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Language | JavaScript (ES Modules, JSX) |
| Styling | Plain CSS (CSS Variables, Dark-First Esports Theme) |
| Backend | Node.js + Express |
| Database | MySQL 8.4 |
| ORM | Prisma ORM |
| API | REST API `/api/v1` |
| Authentication | Server-Side Sessions (`user_sessions` table) with `HttpOnly` Cookies |
| Encryption | AES-256-GCM for Match Room Credentials |
| Hashing | Argon2id |
| Validation | Zod |
| HTTP Client | Axios (with credentials and CSRF interceptors) |
| Testing | Vitest · Supertest · React Testing Library · Playwright |

---

## Repository Structure

```text
EVOQ/
├── backend/
│   ├── prisma/
│   │   ├── migrations/             # Version-controlled migrations
│   │   ├── schema.prisma           # 31 Prisma models covering Phases 1, 4–7
│   │   └── seed.js                 # Canonical esports games seeder
│   ├── src/
│   │   ├── config/                 # Environment validation via Zod
│   │   ├── database/               # Prisma singleton client
│   │   ├── middleware/             # Auth, CSRF, rate limiter, error handler, logger
│   │   ├── modules/
│   │   │   ├── auth/               # Routes, controller, service, Zod schemas
│   │   │   ├── games/              # Canonical esports games catalog
│   │   │   ├── profiles/           # Gamer profiles & game identities
│   │   │   ├── teams/              # Teams, rosters & invitations
│   │   │   ├── organizations/      # Organizations & staff roles
│   │   │   ├── organizers/         # Organizer credibility & metrics
│   │   │   ├── tournaments/        # Tournament creation, lifecycle & discovery
│   │   │   ├── registrations/      # Participant registrations & roster freezing
│   │   │   ├── competition/        # Stages, rounds, match generation & credentials
│   │   │   └── results/            # Results, referee approval & achievement generator
│   │   ├── routes/                 # Health check, notifications, media
│   │   ├── services/               # Notifications, media upload, email stub
│   │   ├── utils/                  # AES-256-GCM, UUID, Argon2, tokens, typed errors
│   │   ├── app.js                  # Express app definition (no network port)
│   │   └── server.js               # Server listener initialization
│   └── tests/                      # Vitest + Supertest integration tests
│
├── frontend/
│   ├── src/
│   │   ├── app/                    # App entry point and React Router configuration
│   │   ├── components/             # Reusable UI components (Navbar, FormInput, ProtectedRoute)
│   │   ├── features/auth/          # AuthContext & AuthProvider
│   │   ├── hooks/                  # Custom hooks (useAuth)
│   │   ├── pages/                  # Home, Login, Register, Dashboard, ProfileEdit,
│   │   │                           # PublicPlayerProfile, TeamsManager, PublicTeamProfile,
│   │   │                           # OrganizationsManager, PublicOrganizationProfile,
│   │   │                           # PublicOrganizerProfile, TournamentsList, TournamentDetail,
│   │   │                           # TournamentWizard, TournamentManager, OrganizerDashboard,
│   │   │                           # NotificationsPage
│   │   ├── services/               # Axios API client & evoqService
│   │   └── styles/                 # Global CSS variables, platform.css & layout styles
│   ├── index.html
│   └── vite.config.js
│
├── e2e/                            # Playwright end-to-end integration tests
├── docs/                           # Engineering specifications and platform blueprints
├── .env.example                    # Environment variable template
└── package.json                    # Workspace root scripts
```

---

## Getting Started

### 1. Prerequisites

- **Node.js** ≥ 18
- **MySQL** 8.0 or 8.4
- **npm** ≥ 9

### 2. Installation & Setup

```bash
# Clone the repository
cd EVOQ

# Install workspace dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run database migrations
npm run --workspace backend prisma:migrate

# Seed canonical esports games
npm run --workspace backend prisma:seed
```

### 3. Start Development Servers

```bash
# Start frontend and backend concurrently
npm run dev

# Or independently:
npm run dev:backend     # http://localhost:4000
npm run dev:frontend    # http://localhost:5173
```

---

## Documentation

Full platform blueprints, system architecture, database design, and security specifications are preserved in [`docs/`](docs/00-README.md).
