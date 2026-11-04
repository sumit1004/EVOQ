# Software Requirements Specification
Priority: P0 = release blocker; P1 = required V1; P2 = optional V1; P3 = V2. Status is Confirmed when explicitly in blueprint; technical details may be Proposed.

| ID | Requirement | Priority | Module | Acceptance criteria | Dependencies |
|---|---|---:|---|---|---|
| FR-AUTH-001 | Register users with unique normalized email and hashed password | P0 | Auth | Duplicate normalized email rejected; no plaintext password | DB, email |
| FR-AUTH-002 | Login/logout with revocable session | P0 | Auth | Login creates session; logout revokes it | FR-AUTH-001 |
| FR-AUTH-003 | Email verification and password reset | P1 | Auth | Single-use expiring tokens; generic reset response | Email |
| FR-USER-001 | User maintains gamer profile | P1 | Gamer | Own profile editable; public fields obey visibility | Auth |
| FR-TEAM-001 | Create team and manage roster | P0 | Teams | Captain-only roster changes; invite acceptance by invitee | Auth |
| FR-ORG-001 | Create/update organizer identity | P1 | Organizer | Owner can edit; public DTO excludes private fields | Auth |
| FR-ORG-002 | Grant scoped organization/staff access | P1 | Organization | Owner can grant/revoke explicit permissions | FR-ORG-001 |
| FR-TOUR-001 | Create/configure tournament | P0 | Tournament | Required fields and owner validated | Auth, Game |
| FR-TOUR-002 | Publish public tournament page | P0 | Tournament | Only published fields publicly visible | FR-TOUR-001 |
| FR-REG-001 | Register individual/team for specific tournament | P0 | Registration | Duplicate and capacity checks are atomic | Tournament, Team |
| FR-REG-002 | Review registration | P0 | Registration | Only authorized staff can approve/reject | RBAC |
| FR-ENGINE-001 | Support rounds, optional groups and matches | P0 | Engine | Group-stage and no-group rounds supported | Tournament |
| FR-ENGINE-002 | Schedule/manage matches | P1 | Engine | Valid state transitions enforced | FR-ENGINE-001 |
| FR-SCORE-001 | Use versioned scoring configuration | P0 | Scoring | Unknown fields/config versions rejected | Approved scoring template |
| FR-RESULT-001 | Submit match result | P0 | Results | Match, participant and payload validated | Match, scoring |
| FR-RESULT-002 | Approve/reject result | P0 | Results | Approval records actor/time and triggers recalculation | FR-RESULT-001 |
| FR-RESULT-003 | Correct approved result with revision history | P0 | Results | New revision appended; old revision retained | FR-RESULT-002 |
| FR-STAND-001 | Calculate standings from approved results | P0 | Standings | Reproducible for same inputs and rules version | Results |
| FR-QUAL-001 | Calculate configured top-N qualification | P0 | Qualification | Server output follows approved tie policy | Standings |
| FR-ANN-001 | Publish tournament announcements | P1 | Announcements | Participants can retrieve published announcement | Tournament |
| FR-ROOM-001 | Protect match-room credentials | P1 | Security | Only eligible participants/authorized staff can retrieve | RBAC |
| FR-GAMER-001 | Maintain gamer identity, games, roles, IDs and links | P1 | Gamer | Validated profile fields appear publicly as permitted | Auth |
| FR-GAMER-002 | Generate verified achievements from approved EVOQ results | P0 | Trust | Idempotent record references source result | Results |
| FR-GAMER-003 | Label self-reported achievements | P1 | Trust | Self-report never appears EVOQ-verified | Gamer |
| FR-GAMER-004 | Show tournament history and basic stats | P1 | Gamer | Derived from approved records only | Results |
| FR-ORG-003 | Show EVOQ event portfolio | P1 | Organizer | Completed events link to source tournament | Tournament |
| FR-TRUST-001 | Maintain result audit history | P0 | Trust | Actor, action, timestamp and revision retained | Results |
| FR-TRUST-002 | Distinguish verified and self-reported records | P0 | Trust | API and UI expose provenance | Profiles |
| FR-TRUST-003 | Support basic organizer feedback | P2 | Trust | Eligibility and moderation policy approved | Completed event |
| FR-ADMIN-001 | Moderate accounts/content | P1 | Admin | Only platform admins; every action audited | RBAC |
| FR-ANALYTICS-001 | Provide basic organizer analytics | P1 | Analytics | Metrics derive from tournament records | Tournament |

## Non-functional requirements
| ID | Requirement | Priority | Acceptance criteria |
|---|---|---:|---|
| NFR-PERF-001 | Common reads p95 ≤ 500ms at pilot load | P1 | Load test against documented environment |
| NFR-PERF-002 | Concurrent critical writes remain correct | P0 | Duplicate/capacity race tests pass |
| NFR-SEC-001 | Backend enforces resource-level authorization | P0 | Negative permission matrix passes |
| NFR-SEC-002 | Passwords use Argon2id or reviewed bcrypt | P0 | Hash-only storage verified |
| NFR-SEC-003 | Secrets never committed or returned to client | P0 | Secret scan and response tests pass |
| NFR-DATA-001 | Approved results are immutable revisions | P0 | Historical revision remains queryable |
| NFR-DATA-002 | Derived standings are reproducible | P0 | Rebuild matches authoritative input |
| NFR-AVAIL-001 | Proposed pilot availability 99.5% monthly | P2 | Monitoring reports availability |
| NFR-UX-001 | Core flows work at 360px and desktop | P1 | Playwright viewport suite |
| NFR-A11Y-001 | Keyboard-accessible forms/navigation/dialogs | P1 | Automated and manual audit |
| NFR-COMP-001 | Current and previous major browsers supported | P1 | Browser smoke suite |
| NFR-OBS-001 | Structured logs include request ID | P1 | Trace request across layers |

## Business rules
BR-001 registration is tournament-specific. BR-002 team roster history is separate from registration snapshot. BR-003 only approved results affect standings/stats/achievements. BR-004 corrections append revisions. BR-005 standings and qualification are server-calculated. BR-006 users can hold multiple contextual roles. BR-007 payment never implies trust. BR-008 provenance is visible. BR-009 groups are optional. BR-010 capacity/duplicate checks are concurrency-safe.

## Constraints
React/Vite/JavaScript/plain CSS; Node/Express/ESM/REST; Prisma/MySQL; Zod; no Tailwind or TypeScript without approval; modular monolith for V1.
