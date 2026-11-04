# Logical ER Diagram
```mermaid
erDiagram
 USER ||--o| GAMER_PROFILE : has
 USER ||--o| ORGANIZER_PROFILE : has
 USER ||--o{ USER_SESSION : authenticates
 USER ||--o{ ORGANIZATION_MEMBERSHIP : joins
 ORGANIZATION ||--o{ ORGANIZATION_MEMBERSHIP : contains
 USER ||--o{ TEAM_MEMBERSHIP : joins
 TEAM ||--o{ TEAM_MEMBERSHIP : has
 GAME ||--o{ TOURNAMENT : hosts
 TOURNAMENT ||--o{ REGISTRATION : accepts
 TEAM ||--o{ REGISTRATION : enters
 GAMER_PROFILE ||--o{ REGISTRATION : enters
 TOURNAMENT ||--o{ ROUND : contains
 ROUND ||--o{ COMPETITION_GROUP : contains
 ROUND ||--o{ MATCH : schedules
 COMPETITION_GROUP ||--o{ MATCH : groups
 MATCH ||--o{ MATCH_PARTICIPANT : includes
 REGISTRATION ||--o{ MATCH_PARTICIPANT : competes
 MATCH ||--o| MATCH_RESULT : has
 MATCH_RESULT ||--o{ RESULT_REVISION : versions
 GAMER_PROFILE ||--o{ ACHIEVEMENT : earns
 ACHIEVEMENT ||--o{ ACHIEVEMENT_SOURCE : proven_by
 TOURNAMENT ||--o{ STANDING_SNAPSHOT : derives
 STANDING_SNAPSHOT ||--o{ STANDING_ROW : contains
 USER ||--o{ NOTIFICATION : receives
 USER ||--o{ AUDIT_LOG : acts
```
Tournament owner must be exactly one of individual organizer or organization. Registration must be exactly one team or individual gamer; choose typed nullable FKs with DB check or a `TournamentEntrant` supertype before schema freeze. Match participants reference registration, not arbitrary user IDs.
