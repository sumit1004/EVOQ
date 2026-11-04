# Assumptions and Open Questions
All items remain **Open** until product owner approval. Proposed resolutions are not confirmed requirements.

| ID | Question | Impact | Priority | Proposed resolution |
|---|---|---|---|---|
| Q-001 | Which games/modes launch? | Catalog, scoring, QA | P0 | Approve 1–3 initial games/modes |
| Q-002 | Exact scoring fields/formulas per mode? | Scoring, standings | P0 | Supply score sheets and expected outputs |
| Q-003 | Gamer profile at signup or onboarding? | Auth/schema | P1 | Draft profile during onboarding |
| Q-004 | Team and individual tournaments both in V1? | Registration | P0 | Confirm per-tournament participation mode |
| Q-005 | Typed entrant FKs or entrant supertype? | DB integrity | P0 | Approve model before schema freeze |
| Q-006 | May result submitter approve own result? | Trust | P0 | Recommend separation of duties |
| Q-007 | Dispute/appeal process and deadline? | Result lifecycle | P0 | Define actor, evidence, deadline, final authority |
| Q-008 | Correction after next round begins? | Qualification | P0 | Freeze downstream and require admin resolution |
| Q-009 | Tie-breaker and unresolved tie behavior? | Standings | P0 | Define per scoring template |
| Q-010 | Which formats launch? | Engine scope | P0 | Approve group-stage/top-N and any bracket format |
| Q-011 | Registration states/waitlist/withdrawal? | Registration | P1 | Approve proposed status lifecycle |
| Q-012 | Protected room credential release window? | Security | P1 | Define eligible users and time window |
| Q-013 | Public profile visibility defaults/private fields? | Privacy | P0 | Field-level visibility policy |
| Q-014 | Organization verification evidence/reviewer? | Trust ops | P1 | Define documentary evidence and SLA |
| Q-015 | Participant count definition? | Organizer metrics | P1 | Registered vs approved vs checked-in vs unique |
| Q-016 | V1 organization membership complexity? | RBAC/schema | P1 | Basic owner/staff membership only |
| Q-017 | Feedback scale/eligibility/moderation? | Reputation | P2 | One eligible post-event review, if approved |
| Q-018 | Account deletion and retention policy? | Compliance | P0 | Legal/product review |
| Q-019 | Media/email providers? | Deployment | P1 | Select provider and region |
| Q-020 | UUID vs numeric IDs? | DB/API | P1 | Recommend UUID |
| Q-021 | Cookie domain/session deployment topology? | Auth/CSRF/CORS | P1 | Decide same-site domain arrangement |
| Q-022 | Public profile search included in V1? | Discovery | P2 | Basic indexed filters only if required |
| Q-023 | External achievement verification in V1? | Trust workload | P1 | Self-reported label unless manual process approved |
| Q-024 | Pilot SLO and backup RPO/RTO? | Ops | P1 | Approve after hosting selection |

## Assumptions
V1 has no payment collection; no social feed/direct messages; notifications persist and Socket.IO is optional; public tournament/profile pages are accessible without login; only approved results generate verified records.
