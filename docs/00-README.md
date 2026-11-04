# EVOQ Engineering Documentation
**Version:** 0.1.0-draft · **Status:** architecture baseline; owner approval required before implementation.

## Authority and change control
The uploaded EVOQ Product Strategy & Platform Blueprint is authoritative for product vision, feature inventory and V1/V2 scope. This package is its engineering translation. Items marked proposed/open are not product approvals. Approved decision-log entries supersede earlier proposals. If sources conflict, stop and raise a decision. Update requirement, API, DB, UI, tests and roadmap together; never silently change business behavior.

## Index
- `01-product/`: overview, PRD, success metrics.
- `02-requirements/`: SRS and functional/non-functional requirements.
- `03-users-and-permissions/`: role model and user journeys.
- `04-architecture/`: system, backend, frontend and ADRs.
- `05-database/`: database design, ER diagram and data dictionary.
- `06-tournament-engine/`: engine, scoring and qualification.
- `07-api/`: API overview and auth/tournament/gamer/organizer contracts.
- `08-frontend-and-design/`: UX, page inventory and design system.
- `09-security/`: security specification and threat model.
- `10-integrations/`: media and notifications.
- `11-testing/`: QA strategy, test cases and acceptance criteria.
- `12-development/`: roadmap, coding standards and repository structure.
- `13-deployment/`: deployment guide.
- `14-project-governance/`: traceability, open questions, risks and decision log.

## Terminology
User = authentication identity; GamerProfile = competitive identity; Team = persistent roster identity; Registration = tournament-specific entry; Tournament = event definition; Round/Group/Match = competition structure; ResultRevision = immutable submitted/approved version; Achievement = provenance-backed career record.

## Requirement IDs
`FR-*` functional, `NFR-*` non-functional, `UC-*` journey, `TC-*` test, `ADR-*` architecture decision, `Q-*` open question. P0 release blocker, P1 V1, P2 optional V1, P3 V2.

## Readiness
Do not start production implementation until P0 decisions are approved: launch games/scoring templates, supported formats, tie policy, result approval/dispute policy, entrant model and profile visibility. This package contains documentation only, not implemented software.
