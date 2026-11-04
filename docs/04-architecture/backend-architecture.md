# Backend Architecture
Pipeline: request ID/logger → Helmet/CORS/body limits → session auth → Zod validation → resource policy → controller → domain service → Prisma/repository → response mapper. Services own business rules and transactions; controllers remain thin. Use typed domain errors and redact sensitive logs.

Transactions: registration capacity/duplicate + insert; invitation acceptance + membership; result approval + authoritative revision + derived snapshots/outbox; correction + recomputation; achievement idempotency. Handle deadlocks/retries. Durable async work uses DB outbox; no in-memory-only queue for critical effects.
