# EVOQ

**The Professional Network & Operating System for Esports.**

*Play. Compete. Achieve. Get Recognized.*

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Language | JavaScript (ES Modules) |
| Styling | Plain CSS |
| Backend | Node.js + Express |
| Database | MySQL 8.4 |
| ORM | Prisma |
| API | REST — `/api/v1` |
| Authentication | Server-side sessions (HttpOnly cookies) |
| Validation | Zod |
| HTTP Client | Axios |
| Password Hashing | Argon2id |
| Testing | Vitest · Supertest · React Testing Library · Playwright |

## Repository Structure

```
EVOQ/
├── backend/              # Express API server
│   ├── prisma/           # Prisma schema & migrations
│   ├── src/
│   │   ├── config/       # Environment validation
│   │   ├── middleware/    # Express middleware
│   │   ├── modules/      # Domain modules (auth, users, …)
│   │   ├── routes/       # Route definitions
│   │   └── utils/        # Shared utilities
│   └── tests/            # Backend tests
│
├── frontend/             # React + Vite SPA
│   ├── src/
│   │   ├── app/          # Root App component & router
│   │   ├── components/   # Shared UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Route-level pages
│   │   ├── services/     # API client
│   │   └── styles/       # Global & page CSS
│   └── index.html
│
├── docs/                 # Engineering documentation
├── .env.example          # Environment variable template
└── package.json          # Workspace root
```

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MySQL** 8.4

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd EVOQ
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your local MySQL credentials and settings
```

### 4. Database setup

Create a MySQL database for local development:

```sql
CREATE DATABASE evoq_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run Prisma migrations (once models are defined):

```bash
npm run --workspace backend prisma:migrate
npm run --workspace backend prisma:generate
```

### 5. Start development servers

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start individually
npm run dev:backend    # Express on http://localhost:4000
npm run dev:frontend   # Vite on http://localhost:5173
```

### 6. Verify

- Frontend: http://localhost:5173
- Backend health: http://localhost:4000/api/v1/health

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend and backend concurrently |
| `npm run dev:frontend` | Start Vite dev server |
| `npm run dev:backend` | Start Express with nodemon |
| `npm run build` | Build frontend and backend |
| `npm run test` | Run all tests |
| `npm run test:frontend` | Run frontend tests |
| `npm run test:backend` | Run backend tests |
| `npm run lint` | Lint frontend and backend |

## Documentation

Detailed engineering documentation is available under [`docs/`](docs/00-README.md).

## License

Proprietary — All rights reserved.
