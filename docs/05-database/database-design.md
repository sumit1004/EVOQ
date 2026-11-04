# Database Design
## Principles
MySQL is authoritative; Prisma migrations are version-controlled. Normalize identity, membership, competition and result data. Store derived standings as versioned snapshots that can be rebuilt. Store timestamps in UTC. Use opaque UUID identifiers (proposed; confirm before first migration). Do not store media binaries in MySQL.

## Entity specification
| Table | Purpose / key fields | Constraints and indexes |
|---|---|---|
| users | Auth identity: id, email, password_hash, status, email_verified_at | unique normalized email |
| user_sessions | user_id, token_hash, expires_at, revoked_at | unique token_hash; index user/expiry |
| email_tokens | user_id, token_hash, purpose, expires_at, used_at | unique token_hash |
| gamer_profiles | user_id, slug, gamer_name, IGN, bio, visibility, media refs | unique user_id and slug |
| gamer_games | gamer_profile_id, game_id, game_player_id, role | unique profile/game/player identity |
| games | name, slug, status | unique slug |
| organizer_profiles | user_id, slug, display_name, description, location, verification_status | unique user_id and slug |
| organizations | slug, name, description, location, media refs, verification_status | unique slug |
| organization_memberships | organization_id, user_id, role, permissions, status | unique active membership |
| teams | slug, name, created_by_user_id, status | unique slug |
| team_memberships | team_id, user_id, team_role, status, joined/left | unique active team/user |
| team_invitations | team_id, inviter, invitee, token_hash, status, expiry | unique token_hash |
| tournaments | slug, owner refs, game_id, format, participation_type, capacity, dates, timezone, status | unique slug; owner/date/status indexes |
| tournament_staff_grants | tournament_id, user_id, permissions, status | unique active grant |
| registrations | tournament_id, entrant type, team_id OR gamer_profile_id, status | unique tournament/entrant; exactly one entrant FK |
| registration_members | registration_id, gamer_profile_id, roster snapshot fields | unique registration/member |
| rounds | tournament_id, name, sequence, round_type, status | unique tournament/sequence |
| competition_groups | round_id, name, sequence, capacity | unique round/sequence |
| matches | round_id, optional group_id, match_number, schedule, status | unique round/match number |
| match_participants | match_id, registration_id, slot, seed | unique match/registration and match/slot |
| scoring_configs | tournament_id, optional round_id, version, schema_key, config_json | unique tournament/version |
| match_results | match_id, current_approved_revision_id, status | unique match |
| result_revisions | result_id, revision_number, submitted_by, payload, status, reviewer, reason | unique result/revision |
| standing_snapshots | tournament/round/group, calc_version, source_hash, is_current | index tournament/current |
| standing_rows | snapshot_id, registration_id, rank, metrics, tie_break_values | unique snapshot/registration |
| qualification_rules | source/target round, top_n, tie policy, version | indexed tournament/version |
| qualification_entries | rule_id, registration_id, source_snapshot_id, rank, qualified | unique rule/registration |
| achievements | gamer_profile_id, title, type, verification_status, awarded_at | index gamer/status |
| achievement_sources | achievement_id, source type/id, result_revision_id, rule_key | unique source/rule for idempotency |
| organizer_portfolio_records | organizer/org, tournament ref, title, verification status | unique organizer/tournament |
| media_assets | owner, provider, provider_asset_id, MIME, size, visibility, status | unique provider asset ID |
| announcements | tournament_id, author_id, title, body, published_at | index tournament/published |
| notifications | recipient_id, type, payload, read_at, dedupe_key | unique dedupe key; index recipient/read/date |
| feedback | author, target organizer/tournament, rating, body, status | eligibility and one-review constraints need approval |
| audit_logs | actor, action, resource type/id, reason, before/after refs | index resource/date |
| outbox_events | event type, aggregate, payload, status, attempts, next retry | index status/retry time |

## Relationships and business constraints
- Tournament owner must be exactly one of individual organizer or organization; enforce a DB check where supported and validate in service.
- Registration is exactly one team or individual gamer. Confirm whether to use typed nullable FKs or a `TournamentEntrant` supertype before schema freeze.
- Match participants reference registrations, not arbitrary users.
- Team roster is persistent; `registration_members` snapshots the roster at entry.
- Result revisions are append-only. Only the current approved revision feeds derived data.
- Achievement source is unique by source result + award rule; generation is idempotent.
- Organization/team membership status is historical; removal does not erase past event participation.

## Transaction requirements
Registration: lock/check capacity + duplicate + insert. Invitation acceptance: token validation + membership creation. Result approval: approve revision + recalculate standings/qualification + write outbox in one transaction or a controlled versioned workflow. Correction: append revision and recompute dependencies. Achievement creation: unique source key and upsert/idempotency.

## Indexing strategy
Index tournament status/date, owner/date, registrations tournament/status, match round/group/schedule, result match/status, revisions result/date, notifications recipient/read/date, audit resource/date. Add indexes only for measured query patterns; inspect EXPLAIN plans.

## Cascading and deletion
Cascade only disposable dependent drafts where safe. Never cascade-delete approved revisions, audit logs, achievements or provenance. Account deletion should anonymize personal data while retaining legally justified competition audit records; retention policy requires approval.

## Migration and seeds
Commit Prisma migrations. Production uses `prisma migrate deploy`, never `db push`. Back up before destructive migrations. Seed canonical game/permission definitions idempotently; production seed must not create fake users/tournaments. Test restores and migrations in staging.
