# System Architecture
## Decision
V1 uses a modular monolith: one React SPA, one Express application, one MySQL database, explicit domain modules. This supports transaction-heavy workflows without premature distributed systems.

```mermaid
flowchart TB
 B[Browser] --> FE[React + Vite]
 FE -->|HTTPS REST JSON| API[Express API]
 FE <-->|Optional Socket.IO| RT[Realtime Gateway]
 API --> AUTH[Auth and Policy]
 API --> MOD[Domain Modules]
 MOD --> DB[(MySQL via Prisma)]
 MOD --> OBJ[Cloudinary / Object Storage]
 API --> MAIL[Transactional Email]
 MOD --> OUT[Outbox Worker]
 OUT --> RT
 OUT --> MAIL
 API --> OBS[Logs / Metrics / Error Monitoring]
```

## Backend modules
Auth; Users; Gamer; Organizer; Organizations; Teams; Games; Tournaments; Registrations; Competition (rounds/groups/matches); Scoring; Results; Standings; Qualifications; Achievements; Portfolios; Trust; Announcements; Notifications; Media; Admin; Analytics.

## Request flow
```mermaid
flowchart LR
 P[React page] --> H[Feature hook]
 H --> AX[Axios client]
 AX --> R[Express router]
 R --> M[Auth + validation + permission]
 M --> C[Controller]
 C --> S[Domain service]
 S --> PR[Prisma]
 PR --> DB[(MySQL)]
```

## Result pipeline
```mermaid
flowchart TD
 A[Submit result] --> B[Validate match and participant IDs]
 B --> C[Append pending revision]
 C --> D{Authorized reviewer?}
 D -- No --> E[Reject / request correction]
 D -- Yes --> F[Approve in transaction]
 F --> G[Recalculate standings]
 G --> H[Evaluate qualification]
 H --> I[Write derived snapshot]
 I --> J[Generate provenance-backed achievements]
 J --> K[Outbox notifications]
```

## Authentication sequence
```mermaid
sequenceDiagram
 participant U as User
 participant FE as Browser
 participant API as Express
 participant DB as MySQL
 U->>FE: Submit credentials
 FE->>API: POST /auth/login
 API->>DB: Verify password and create session
 API-->>FE: Set HttpOnly Secure cookie
 FE->>API: GET /auth/me
 API->>DB: Resolve active session
 API-->>FE: User and capabilities
```

## Architecture rules
Modules own their tables and service interfaces. Cross-module writes use services/application orchestration, not arbitrary table mutation. Results/standings/achievements are derived from authoritative approved records. Async email/socket delivery uses a durable outbox. Provider failures do not roll back an approved result.
