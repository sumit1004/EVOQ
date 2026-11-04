# Requirement Traceability Matrix
| Product feature | SRS IDs | Module | DB entities | API | UI | Tests | Phase |
|---|---|---|---|---|---|---|---|
| Authentication | FR-AUTH-001..003 | Auth | User, Session, EmailToken | auth endpoints | Login/Register | TC-AUTH | 1 |
| Gamer identity | FR-GAMER-001 | Gamer | GamerProfile, GamerGame | `/me/gamer-profile` | Profile | TC-PROFILE | 2 |
| Teams | FR-TEAM-001 | Teams | Team, Membership, Invitation | `/teams/*` | Team pages | TC-TEAM | 2 |
| Organizer identity | FR-ORG-001..002 | Organizer/Org | OrganizerProfile, Organization, Membership | `/organizers/*`, `/organizations/*` | Organizer profile | RBAC | 2 |
| Tournament create/publish | FR-TOUR-001..002 | Tournament | Tournament, Game | `/tournaments` | Create/manage | Lifecycle tests | 3 |
| Registration | FR-REG-001..002 | Registration | Registration, RegistrationMember | registrations | Registration admin | TC-REG | 3 |
| Rounds/groups/matches | FR-ENGINE-001..002 | Competition | Round, Group, Match, MatchParticipant | rounds/groups/matches | Structure/matches | TC-ENG | 4 |
| Scoring/results | FR-SCORE-001, FR-RESULT-* | Scoring/Results | ScoringConfig, MatchResult, ResultRevision | result endpoints | Result manager | TC-SCORE/RESULT | 5 |
| Standings/qualification | FR-STAND-001, FR-QUAL-001 | Standings | Snapshot/Row, QualificationRule/Entry | standings/qualifications | Leaderboard | TC-STAND/QUAL | 5 |
| Verified achievements | FR-GAMER-002..004, FR-TRUST-* | Trust/Achievement | Achievement, Source, Audit | gamer achievements | Gamer profile | TC-ACH | 6 |
| Organizer portfolio | FR-ORG-003 | Portfolio | OrganizerPortfolioRecord | organizer portfolio | Organizer profile | TC-ORG | 6 |
| Announcements | FR-ANN-001 | Announcements | Announcement | announcement endpoint | Organizer page | API/E2E | 7 |
| Notifications | Supporting requirement | Notifications | Notification, OutboxEvent | inbox endpoints | Notification inbox | TC-NOTIF | 7 |
| Protected credentials | FR-ROOM-001 | Tournament security | Secret reference, AuditLog | room-credentials | Tournament detail | TC-ROOM | 4 |
| Basic analytics | FR-ANALYTICS-001 | Analytics | Derived queries/snapshots | dashboard APIs | Organizer dashboard | Integration | 7 |
| Moderation | FR-ADMIN-001 | Admin | ModerationAction, AuditLog | admin endpoints | Admin dashboard | RBAC | 8 |

Coverage gaps: dispute/appeal workflow; organization verification evidence; feedback eligibility/rating/moderation; game-specific formulas/stats; depth of public profile search; field-level profile visibility. These require product decisions.
