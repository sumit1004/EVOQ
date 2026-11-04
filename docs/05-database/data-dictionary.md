# Data Dictionary — Core Field Specification
Common fields: UUID `id` PK; `created_at`, `updated_at` UTC. Use `deleted_at` only for recoverable user-facing records.

- **users:** normalized unique email, password_hash, email_verified_at, status.
- **user_sessions:** user_id FK, token_hash unique, expires_at, revoked_at, last_seen_at.
- **gamer_profiles:** user_id unique FK, slug unique, gamer_name, IGN, bio, visibility, avatar/cover media refs.
- **gamer_games:** profile_id, game_id, game_player_id, competitive_role; unique identity per profile/game.
- **games:** name, slug unique, status.
- **organizer_profiles:** user_id unique, slug unique, display_name, description, location, verification_status.
- **organizations:** slug unique, name, description, location, media refs, verification_status.
- **organization_memberships:** organization_id, user_id, role, bounded permissions, status, joined_at.
- **teams:** slug unique, name, created_by, status.
- **team_memberships:** team_id, user_id, team_role, status, joined/left timestamps.
- **team_invitations:** team_id, inviter, invitee, token_hash, status, expires_at.
- **tournaments:** slug, game_id, owner_type, organizer_profile_id OR organization_id, participation_type, capacity, dates, timezone, status, format_key.
- **registrations:** tournament_id, entrant_type, team_id OR gamer_profile_id, status, registered_at; unique tournament+entrant.
- **registration_members:** registration_id, gamer_profile_id, roster snapshot fields.
- **rounds/groups/matches:** ordered round; optional group; match schedule/status/number.
- **match_participants:** match_id, registration_id, slot; unique match+entrant and match+slot.
- **scoring_configs:** tournament_id, version, schema_key, config_json; unique tournament+version.
- **match_results:** match_id unique, current_approved_revision_id, status.
- **result_revisions:** result_id, revision_number, submitter, payload, status, reviewer, reason; unique result+revision.
- **standing_snapshots/rows:** source hash, calc version, current flag; row rank/metrics/tie values.
- **qualification_rules/entries:** source/target round, top_n, tie policy, source snapshot, qualified/rank.
- **achievements/sources:** gamer, title, verification status; source result/tournament/rule key unique for idempotency.
- **organizer_portfolio_records:** organizer/org, tournament ref, title, verification status.
- **media_assets:** owner, provider, provider asset ID, MIME, size, visibility, status.
- **announcements/notifications:** tournament/author; recipient/type/payload/read_at/dedupe_key.
- **feedback:** author, target, rating, body, moderation status; policy unresolved.
- **audit_logs/outbox_events:** actor/action/resource/reason; event type/aggregate/payload/status/retry fields.

Foreign keys should restrict deletion of authoritative history. Use indexes on tournament status/date, owner/date, registration tournament/status, match round/group/schedule, result match/status, revisions result/date, notification recipient/read/date, audit resource/date.
