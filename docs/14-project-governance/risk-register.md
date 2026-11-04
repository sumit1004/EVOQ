# Risk Register
| ID | Risk | Likelihood/impact | Mitigation | Owner |
|---|---|---|---|---|
| R-001 | Scoring remains undefined | High/Critical | Do not enable template until signed-off examples exist | Product |
| R-002 | V2 scope creeps into V1 | High/High | Enforce scope table and change control | Product |
| R-003 | Result dispute damages trust | Medium/Critical | Approval separation, immutable revisions, dispute policy | Product/Security |
| R-004 | Organizer adoption friction | High/High | Pilot with real organizers and observe workflow | Product/Growth |
| R-005 | Network cold start | High/Medium | Lead with tournament operations; profiles derive value from events | Product |
| R-006 | Manual verification cost | Medium/High | Limit V1 verified claims to platform-derived data | Operations |
| R-007 | Registration race bug | Medium/High | DB uniqueness, transactions and concurrency tests | Backend |
| R-008 | Profile privacy leakage | Medium/High | Field-level DTOs and visibility tests | Security |
| R-009 | Scoring DSL too permissive | Medium/High | Allowlisted declarative templates only | Architect |
| R-010 | Derived standings inconsistency | Medium/Critical | Versioned snapshots and deterministic rebuild | Backend |
| R-011 | Media provider lock-in/exposure | Medium/Medium | Provider abstraction and private asset policy | Architect |
| R-012 | Inadequate backup/recovery | Medium/Critical | Automated backup and restore drills | DevOps |
| R-013 | Role model complexity | Medium/High | Contextual permission keys and policy tests | Architect |
| R-014 | V1 infrastructure over-engineered | Medium/Medium | Modular monolith; ADR required for new infra | Tech lead |
