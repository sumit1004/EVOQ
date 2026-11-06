# EVOQ

**The Professional Network & Operating System for Esports.**

*Play. Compete. Achieve. Get Recognized.*

---

## Phase 1 — Platform Foundation

Phase 1 establishes the core technical foundation and security architecture for EVOQ:

- **Modular Monolith Architecture**: Clean domain boundaries (`src/modules/*`), separating HTTP routing, validation, controllers, and services.
- **UUID v4 Standard**: All primary keys and entity identifiers use UUID v4 stored as `CHAR(36)` for native Prisma and MySQL compatibility.
- **Server-Side Session Authentication**: MySQL-backed sessions using high-entropy crypto tokens (`crypto.randomBytes(32)`). Only the SHA-256 hash is persisted in the database; raw tokens are delivered exclusively via `HttpOnly`, `Secure`, `SameSite` browser cookies.
- **Password Security**: Argon2id (`m=65536, t=3, p=2`) password hashing via native bindings.
- **CSRF Protection**: Mutating requests require session-bound HMAC CSRF tokens passed via the `X-CSRF-Token` header.
- **Rate Limiting**: IP and account-based rate limiting on registration, login, and password reset endpoints.
- **Validation**: Strict schema validation using Zod schemas for all inbound request bodies and parameters.
- **Dark-First Esports UI**: Plain CSS custom design system built with the confirmed EVOQ color tokens and responsive layouts.

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
│   │   └── schema.prisma           # Prisma schema (User, Session, EmailToken, AuditLog)
│   ├── src/
│   │   ├── config/                 # Environment validation via Zod
│   │   ├── database/               # Prisma singleton client
│   │   ├── middleware/             # Auth, CSRF, rate limiter, error handler, logger
│   │   ├── modules/
│   │   │   └── auth/               # Routes, controller, service, Zod schemas
│   │   ├── routes/                 # Health check route
│   │   ├── services/               # Configurable email delivery stub
│   │   ├── utils/                  # UUID, Argon2, tokens, cookies, typed errors
│   │   ├── app.js                  # Express app definition (no network port)
│   │   └── server.js               # Server listener initialization
│   └── tests/                      # Vitest + Supertest integration tests
│
├── frontend/
│   ├── src/
│   │   ├── app/                    # App entry point and React Router configuration
│   │   ├── components/             # Reusable UI components (FormInput, ProtectedRoute)
│   │   ├── features/auth/          # AuthContext & AuthProvider
│   │   ├── hooks/                  # Custom hooks (useAuth)
│   │   ├── pages/                  # Home, Login, Register, Forgot/Reset Password, Verify, Dashboard
│   │   ├── services/               # Axios API client & AuthService
│   │   └── styles/                 # Global CSS variables & layout styles
│   ├── index.html
│   └── vite.config.js
│
├── e2e/                            # Playwright end-to-end integration tests
├── docs/                           # Engineering specifications and platform blueprints
├── playwright.config.js            # Playwright browser test configuration
├── .env.example                    # Environment variable template
└── package.json                    # Workspace root scripts
```

---

## Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Protection | Description |
|--------|----------|------------|-------------|
| `POST` | `/api/v1/auth/register` | Public (Rate limited) | Register new user account; hashes password with Argon2id |
| `POST` | `/api/v1/auth/login` | Public (Rate limited) | Verify credentials; issue server-side session and `HttpOnly` cookie |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve current user profile, capabilities, and CSRF token |
| `POST` | `/api/v1/auth/logout` | Authenticated + CSRF | Revoke active session and clear cookie |
| `POST` | `/api/v1/auth/logout-all` | Authenticated + CSRF | Revoke all active sessions for current user |
| `POST` | `/api/v1/auth/password/forgot` | Public (Rate limited) | Generate expiring single-use password reset token (generic response) |
| `POST` | `/api/v1/auth/password/reset` | Public (Rate limited) | Reset password and invalidate all existing user sessions |
| `POST` | `/api/v1/auth/verify-email` | Public (Rate limited) | Verify email address with single-use token |
| `POST` | `/api/v1/auth/resend-verification` | Public (Rate limited) | Resend verification token for unverified account |
| `GET` | `/api/v1/health` | Public | System health check and real MySQL database connectivity test |

---

## Getting Started

### 1. Prerequisites

- **Node.js** ≥ 18
- **MySQL** 8.0 or 8.4
- **npm** ≥ 9

### 2. Installation

```bash
# Clone the repository
cd EVOQ

# Install workspace dependencies
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your local MySQL credentials:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="mysql://evoq:password@localhost:3306/evoq_dev"
FRONTEND_URL=http://localhost:5173
SESSION_COOKIE_NAME=evoq_session
SESSION_TTL_HOURS=72
CSRF_TOKEN_TTL_HOURS=24
EMAIL_PROVIDER=console
```

### 4. Database Migration

```bash
npm run --workspace backend prisma:migrate
```

### 5. Start Development Servers

```bash
# Concurrently start frontend (Vite) and backend (Express)
npm run dev

# Or independently:
npm run dev:backend     # http://localhost:4000
npm run dev:frontend    # http://localhost:5173
```

---

## Automated Testing

All tests run against real database instances and actual browser environments.

```bash
# Run all unit and integration tests (frontend + backend)
npm run test

# Run backend API & integration tests (Vitest + Supertest)
npm run test:backend

# Run frontend component tests (Vitest + React Testing Library)
npm run test:frontend

# Run Playwright End-to-End tests (Headless Chrome)
npm run test:e2e
```

---

## Documentation

Full platform blueprints, system architecture, database design, and security specifications are preserved in [`docs/`](docs/00-README.md).
