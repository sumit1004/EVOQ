# Tournament API
## Create tournament
`POST /api/v1/tournaments` — authenticated user with `tournament.create`.
```json
{
  "name":"Campus Open",
  "gameId":"game-uuid",
  "ownerType":"organization",
  "organizationId":"org-uuid",
  "participationType":"team",
  "teamSizeMin":4,
  "teamSizeMax":4,
  "capacity":32,
  "registrationOpensAt":"2026-12-01T00:00:00Z",
  "registrationClosesAt":"2026-12-10T18:30:00Z",
  "timezone":"Asia/Kolkata",
  "startsAt":"2026-12-12T04:30:00Z",
  "formatKey":"group-stage"
}
```
Response 201 includes `id`, `slug`, `status:"draft"`. Publish validates required rules, date ordering, supported format and scoring configuration.

## Registration
Body contains `entrantType` and exactly one corresponding `teamId` or `gamerProfileId`. Server checks tournament state, date window, eligibility, duplicate, roster and capacity atomically.

## Competition
- `POST /tournaments/:id/rounds`
- `POST /rounds/:id/groups`
- `POST /rounds/:id/matches`
- `PATCH /matches/:id`
All require `match.manage`; centralized service validates stage progression and participant mapping.

## Results
`POST /matches/:id/results` creates pending revision. `POST /results/:id/approve` approves; `/reject` requires reason; `/corrections` appends revision. Approval response includes revision and standings version. Client cannot submit authoritative standings or qualifiers.

## Protected room credentials
`GET /tournaments/:id/room-credentials` requires `room_credentials.read`, eligibility and configured release window. Encrypt at rest or use secret-capable provider; audit reads. Release window is unresolved product decision.
