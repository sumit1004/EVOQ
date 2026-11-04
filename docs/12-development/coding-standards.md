# Coding Standards
Use JavaScript ES2022+, ES modules, React, plain CSS/CSS Modules; no TypeScript or Tailwind without approval. ESLint/Prettier enforce style.

Naming: React components PascalCase; hooks `useX`; services `*.service.js`; controllers `*.controller.js`; routes `*.routes.js`; Zod schemas `*.schema.js`; DB snake_case; Prisma models PascalCase; API JSON camelCase.

Layering: router owns middleware/path; controller handles HTTP; service owns business rules and transactions; repository encapsulates Prisma queries where useful; policy authorizes resources; Zod validates requests. Avoid business logic in React components.

Errors: typed domain errors (VALIDATION_ERROR, UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, CONFLICT, INVALID_STATE, RATE_LIMITED, INTERNAL_ERROR). Logs include request ID and actor but redact passwords, tokens, room credentials, private URLs and contact details.

Branches: `feat/<area>-<name>`, `fix/<area>-<name>`, `docs/<area>-<name>`, `chore/<name>`. Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.

PR checklist: requirement IDs; API/DB changes documented; migration reviewed; permission and negative tests; no secrets; tests/lint/build pass; mobile/loading/empty/error states; logs redact; traceability updated.
