# Authentication and Security Specification
## Proposed V1 authentication
Opaque server-side sessions stored in MySQL and delivered via HttpOnly, Secure, SameSite cookies. This supports revocation and avoids long-lived tokens in localStorage. Mutating cookie-authenticated requests require CSRF token. If deployment forces JWT, record an ADR covering expiry, refresh rotation, revocation and XSS exposure.

## Controls
- Argon2id preferred; bcrypt acceptable after cost review.
- Single-use, expiring email verification/reset tokens; store token hashes.
- Backend resource-level authorization on every private read/write.
- Zod request validation, allowlists, size limits and strict response DTOs.
- Prisma parameterized queries; review raw SQL.
- React output escaping; sanitize permitted rich text; CSP.
- CSRF token + SameSite for cookie sessions.
- Explicit CORS origins; credentials only for approved origins.
- Helmet security headers.
- Rate-limit login, registration, reset, invitation acceptance and upload signing.
- Signed uploads; validate actual MIME, dimensions and size.
- IDOR prevention: resolve target resource and authorize on server.
- Secrets in environment/secret manager; never expose secrets in Vite variables.
- Audit role changes, result approval/correction, room credential access and moderation.

## Threat model
| Threat | Impact | Mitigation |
|---|---|---|
| Account takeover | User/tournament abuse | Argon2id, verification, rate limit, session revocation |
| IDOR | Unauthorized data/action | Resource policy tests on every ID endpoint |
| Forged standings | Competitive integrity damage | Server-only calculation from approved results |
| Result tampering | False achievements | Append-only revisions, approval policy, audit |
| Registration race | Capacity overrun | Unique constraints and transaction/locking |
| Malicious upload | XSS/malware/storage abuse | Signed upload, MIME/size validation, safe rendering |
| CSRF/session theft | Unauthorized actions | HttpOnly cookie, TLS, CSRF, rotation |
| Admin abuse | Trust damage | Least privilege, reasoned audit |
| Secret leakage | Provider/DB compromise | Secret manager, scans, rotation |

## Release gate
No public launch until auth, permission, IDOR, CSRF, upload, rate-limit and result-integrity tests pass. Run dependency and secret scans in CI. Manually review admin and protected-room endpoints.
