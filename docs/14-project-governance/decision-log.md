# Decision Log
| ID | Decision | Status | Rationale/source | Affected docs |
|---|---|---|---|---|
| DEC-001 | V1 foundation; V2 expands social/business ecosystem | Confirmed | Product Blueprint scope strategy | PRD, roadmap |
| DEC-002 | Flexible tournament structures; no knockout-only model | Confirmed | Blueprint tournament principles | Engine, DB, tests |
| DEC-003 | Approved result activity generates verified records | Confirmed principle | Blueprint trust/USP | Results, trust |
| DEC-004 | Self-reported and verified records remain distinct | Confirmed | Blueprint key principles | Trust, UI, API |
| DEC-005 | Paid status is not proof of trust/achievement | Confirmed | Blueprint key principles | Trust, monetization |
| ADR-001 | Modular monolith for V1 | Proposed | Preferred architecture | Architecture/deploy |
| ADR-002 | REST API under `/api/v1` | Proposed | Stable contracts | API/frontend |
| ADR-003 | MySQL + Prisma | Proposed | Preferred stack | DB/deploy |
| ADR-004 | Cookie-backed sessions | Proposed | Revocation/browser security | Auth/security |
| ADR-005 | Approved result is authoritative | Proposed interpretation | Audit/trust principles | Engine/QA |
| ADR-006 | External media storage | Proposed | No binary in MySQL | Integrations |
| ADR-007 | Persisted notifications + optional Socket.IO | Proposed | Durable delivery | Integrations |
| ADR-008 | Declarative scoring; no executable formulas | Proposed | Security/determinism | Scoring/API |

A decision changes only when an authorized owner records the new choice, rationale, approver, date and affected docs. Product changes update PRD/SRS/traceability; technical changes include migration and compatibility impact.
