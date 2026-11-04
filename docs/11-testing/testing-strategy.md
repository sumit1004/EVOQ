# Testing and QA Strategy
## Tools
Vitest for unit tests; Supertest for Express integration; Playwright for E2E/responsive flows; MySQL test database for real constraints/transactions; optional k6 for load tests; dependency/secret scans in CI.

## Test layers
1. Unit: Zod schemas, policies, lifecycle transitions, scoring and tie-break functions.
2. Integration: API + MySQL + Prisma transactions, constraints and outbox.
3. E2E: signup → create tournament → register → schedule → submit result → approve → achievement.
4. Security: role matrix, IDOR, CSRF, rate limits, upload restrictions.
5. Performance: public reads, dashboard, registration contention, standings rebuild.

## Release gates
Every P0 requirement has automated coverage. Critical transactions run against MySQL, not only SQLite. No test depends on production email/provider. CI runs lint, unit, integration, build and secret/dependency scans. Failed tests block merge.
