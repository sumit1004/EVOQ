# REST API Overview
## Conventions
Base `/api/v1`; HTTPS; JSON; opaque UUID IDs; ISO-8601 UTC timestamps. Browser sessions use HttpOnly/Secure/SameSite cookies; state-changing requests require CSRF token. Public slugs are for navigation only.

Success: `{"data":{...},"meta":{"requestId":"req-id"}}`  
List: `{"data":[...],"meta":{"requestId":"req-id","pagination":{"page":1,"pageSize":20,"total":42,"totalPages":3}}}`  
Error: `{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","details":[{"field":"capacity","issue":"Must be positive"}]},"meta":{"requestId":"req-id"}}`

Pagination: page default 1; pageSize default 20, max 100; stable ordering with ID tie-breaker. Sort keys are allowlisted. Unknown filters return validation errors.

## Endpoint catalogue
| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/logout` | Auth | Revoke session |
| GET | `/auth/me` | Auth | Current user/capabilities |
| POST | `/auth/verify-email` | Token | Verify email |
| POST | `/auth/password/forgot` | Public | Start reset |
| POST | `/auth/password/reset` | Token | Reset password |
| GET/PATCH | `/me/gamer-profile` | Auth/profile.update_self | Own profile |
| GET | `/profiles/:slug` | Public | Gamer public profile |
| GET/POST | `/teams` | Auth/team.create | List/create teams |
| GET/PATCH | `/teams/:id` | Team member/captain | Read/update team |
| POST | `/teams/:id/invitations` | Captain | Invite |
| POST | `/team-invitations/:token/accept` | Invitee | Accept |
| GET/POST | `/organizations` | Auth | List/create |
| PATCH | `/organizations/:id` | Organization permission | Update |
| POST | `/organizations/:id/members` | Org owner/member.manage | Invite staff |
| GET | `/tournaments` | Public | Discover published |
| POST | `/tournaments` | tournament.create | Create draft |
| GET | `/tournaments/:slug` | Public | Tournament detail |
| PATCH | `/tournaments/:id` | tournament.update | Update |
| POST | `/tournaments/:id/publish` | Owner | Publish |
| POST | `/tournaments/:id/registrations` | Gamer/captain | Register |
| GET | `/tournaments/:id/registrations` | registration.review | Manage entries |
| PATCH | `/registrations/:id/status` | registration.review | Approve/reject |
| POST | `/tournaments/:id/rounds` | match.manage | Create round |
| POST | `/rounds/:id/groups` | match.manage | Create group |
| POST | `/rounds/:id/matches` | match.manage | Create match |
| PATCH | `/matches/:id` | match.manage | Schedule/update |
| POST | `/matches/:id/results` | result.submit | Submit result |
| POST | `/results/:id/approve` | result.approve | Approve |
| POST | `/results/:id/reject` | result.approve | Reject |
| POST | `/results/:id/corrections` | result.correct | Append correction |
| GET | `/tournaments/:id/standings` | Public if published | Standings |
| POST | `/tournaments/:id/standings/recalculate` | standings.rebuild | Rebuild |
| GET | `/tournaments/:id/qualifications` | Public if published | Qualifiers |
| POST | `/tournaments/:id/announcements` | announcement.publish | Publish announcement |
| GET | `/me/notifications` | Auth | Inbox |
| PATCH | `/notifications/:id/read` | Recipient | Mark read |
| POST | `/media/upload-intents` | Auth | Signed upload intent |
| GET | `/organizers/:slug` | Public | Organizer profile |
| GET | `/organizers/:slug/portfolio` | Public | Portfolio |
| GET | `/admin/audit-logs` | Platform admin | Audit search |
| POST | `/admin/moderation/actions` | Platform admin | Moderation action |

## Sample registration
Request `POST /tournaments/{id}/registrations`:
```json
{"entrantType":"team","teamId":"uuid"}
```
Response 201:
```json
{"data":{"id":"registration-uuid","tournamentId":"tournament-uuid","status":"pending","entrantType":"team"},"meta":{"requestId":"req-id"}}
```

## Sample result submission
```json
{
  "payload":{"participantResults":[{"registrationId":"registration-1","metrics":{"approvedMetricKey":12}}]},
  "evidenceMediaIds":["media-uuid"]
}
```
`approvedMetricKey` is illustrative only. Actual keys come from the approved scoring template. Pending results do not affect standings.

## Errors
400 validation; 401 unauthenticated; 403 forbidden; 404 not found; 409 conflict/invalid state; 413 payload too large; 429 rate limit; 500 generic error. Never return stack traces or raw Prisma messages.

## API security
Resolve resource from DB; never trust body owner IDs. Every mutation checks permission and state. Protected room credentials use a separate endpoint. Admin actions require reason and audit. Maintain an OpenAPI specification alongside implementation.
