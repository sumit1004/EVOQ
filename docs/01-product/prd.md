# Product Requirements Document
**Status:** Draft derived from the EVOQ Product Strategy & Platform Blueprint.

## Vision and positioning
EVOQ — The Professional Network & Operating System for Esports. Tagline: **Play. Compete. Achieve. Get Recognized.** EVOQ combines tournament operations with professional gamer and organizer identities. Its central product loop is that approved tournament data becomes durable professional identity data.

## Problems and solution
| Problem | EVOQ response | Durable output |
|---|---|---|
| Registrations, teams, scoring and communication are fragmented across forms, sheets and chat | Central tournament workspace | Registrations, schedules, matches and results |
| Manual scoring/qualification can be inconsistent | Configurable, server-side scoring | Approved results, standings and qualification history |
| Gamer achievements are scattered | Public gamer profile and career history | Verified EVOQ achievements with source provenance |
| Organizers struggle to prove event experience | Organizer profile and event portfolio | Verified records from EVOQ tournaments |

## Personas
| Persona | Job | V1 value |
|---|---|---|
| College esports club organizer | Run campus events with limited staff | Registration, groups, matches, results, announcements |
| Independent organizer | Operate repeat events professionally | Tournament workspace and event portfolio |
| Competitive gamer | Prove experience | Profile, game IDs, achievements and history |
| Team captain | Enter a roster | Persistent team and tournament-specific registration |
| Organization owner/staff | Present event history and delegate operations | Basic organization profile and scoped staff access |
| Platform admin | Protect integrity | Moderation and audit capabilities |

## Product modules
1. Tournament Operations: tournament setup, games/formats, teams, registrations, rounds, groups, matches, scoring, results, standings, qualification, announcements, protected room details, dashboard and basic analytics.
2. Gamer Network: public profiles, IGN/game IDs, games/roles, achievements, proof, history, basic stats and team history.
3. Organizer Network: individual/organization identity, portfolio, event history, participant statistics, awards and verified records.
4. Trust Layer: verified vs self-reported provenance, result audit, basic feedback and permissions.

## Scope
### V1 — confirmed in blueprint
Authentication/roles; tournament creation and public pages; teams/rosters/invitations; tournament-wise registration; rounds/groups/matches; custom scoring; result submission, approval and correction; audit history; standings/leaderboards/top-N; organizer dashboard; announcements; protected room credentials; basic analytics; gamer and organizer public profiles; achievements/proofs/history/basic stats; basic trust and feedback.
### V2 — confirmed in blueprint
Follows, activity feeds, posts, reactions, comments, highlights, advanced stats, recruitment/tryouts, AI scouting, organizer networking, partnerships/sponsor discovery, staff/caster recruitment, advanced organization departments/analytics/branding, direct messaging, expanded moderation, advanced tournament templates/import-export/payments/refunds/disputes/prize payouts, subscriptions, marketplace and sponsored placements.

## Explicit V1 exclusions
No direct messaging, social feed, follow graph, AI scouting, recruitment marketplace, sponsor marketplace, payment collection, refunds, prize payout orchestration or advanced organization departments. These are V2 in the blueprint. Do not introduce microservices, Kubernetes or Redis without a documented need.

## Business objectives and success measures
Proposed KPIs (targets must be set after pilot): organizer activation (first tournament published within 7 days); tournament completion rate; registration conversion; organizer repeat rate within 90 days; result approval latency; result correction rate; profile completion; verified achievement coverage; organizer portfolio coverage; active gamer rate; dispute incidence; API reliability. Metrics must derive from persisted events and approved results only.

## Business model
Blueprint hypotheses: freemium; Pro Organizer ₹999–₹2,999/month; Organization ₹4,999–₹9,999/month; premium analytics, factual verification, sponsored visibility, recruitment/scouting, marketplace and enterprise plans. These are unvalidated hypotheses, not approved prices or engineering requirements.

## Acceptance outcomes
A tournament can be created, published, registered, structured, scheduled, scored, approved and completed. Approved results deterministically update standings/qualification and generate provenance-backed profile records. Unauthorized actors cannot mutate protected resources. Self-reported claims are never presented as verified EVOQ achievements.
