# Development Roadmap
No implementation is started by this document.

## Phase 0 — Product/architecture freeze
Resolve launch games, scoring templates, tie-breakers, submit/approve separation, disputes/corrections, profile visibility, organization ownership, ID/session model. Deliver approved ADRs, sample scoring sheets, ERD/schema contract and API contract. **Gate:** no unresolved P0 business decision.

## Phase 1 — Platform foundation
Auth, sessions, permissions, audit, logging, errors, React shell, API client and migration pipeline. Test auth/session, role policy and migration/restore. DoD: login/logout end-to-end; backend policy tests pass.

## Phase 2 — Identity and teams
Gamer/organizer profiles, organization basics, teams, membership/invitations and media. Test ownership, visibility and invitation edge cases.

## Phase 3 — Tournament setup and registration
Games/templates, tournament draft/publish, public discovery/detail, registration, capacity and roster snapshots. Test duplicate/capacity concurrency and eligibility.

## Phase 4 — Competition structure and scheduling
Rounds, optional groups, matches, allocation, schedule and protected room credentials. Test group/no-group formats and access rules.

## Phase 5 — Scoring, results, standings and qualification
Approved scoring template, result submission/review/correction, audit, standings, top-N and tie policy. Test deterministic calculations and correction after qualification.

## Phase 6 — Trust profiles and organizer portfolio
Achievement generation, history, basic stats, event records, self-report labels and feedback if approved. Test idempotency, provenance and correction propagation.

## Phase 7 — Announcements, notifications and analytics
Announcements, persisted notifications, optional Socket.IO and basic organizer analytics. Test dedupe/retry and permissions.

## Phase 8 — Hardening and pilot
E2E, security, performance, accessibility, backup restore, monitoring and pilot feedback.

## V2 workstreams
Social feed/follows; messaging; recruitment/AI scouting; advanced organization departments; advanced tournament templates/import/export; payments/refunds/prize payouts; marketplace/sponsored placements; premium analytics/subscriptions. Start only after V1 usage validates demand.

## Definition of Done
Requirement IDs linked; migrations reviewed; authorization tested; validation/errors standardized; logs/metrics included; tests pass; responsive UX; docs updated; no known P0 defect; rollback plan exists.
