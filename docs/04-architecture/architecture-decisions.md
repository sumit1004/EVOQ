# Architecture Decision Records
- **ADR-001 Modular monolith (Proposed):** one Express deployment and MySQL DB for V1; explicit modules; avoid premature microservices.
- **ADR-002 REST `/api/v1` (Proposed):** stable JSON contracts.
- **ADR-003 MySQL + Prisma (Proposed):** migrations in source control; review SQL constraints.
- **ADR-004 Cookie sessions (Proposed):** opaque revocable server-side sessions; CSRF protection required.
- **ADR-005 Approved results authoritative (Proposed interpretation):** only approved revisions feed derived data.
- **ADR-006 External media storage (Proposed):** MySQL stores metadata only.
- **ADR-007 Persisted notifications + optional Socket.IO (Proposed):** realtime is delivery, not source of truth.
- **ADR-008 Declarative scoring (Proposed):** allowlisted schema; no arbitrary code.
