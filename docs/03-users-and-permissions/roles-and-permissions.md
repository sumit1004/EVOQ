# Roles, Permissions and Access Control
## Model
A user may hold multiple roles. Roles are contextual grants, not a single `user.role` value. Team captain is team-scoped; organization owner/staff is organization-scoped; tournament admin is tournament-scoped.

| Role | Scope | Default access |
|---|---|---|
| Guest | Public | Read published tournaments and public profiles |
| Registered Gamer | Account | Own profile, participation and personal records |
| Team Member | Team | View team and own membership |
| Team Captain | Team | Manage roster, invitations and tournament entry |
| Individual Organizer | Organizer profile | Create/manage own tournaments |
| Organization Owner | Organization | Manage organization and memberships |
| Organization Member | Organization | Explicit assigned permissions |
| Organization Staff | Organization/tournament | Limited operational permissions |
| Tournament Admin | Tournament | Tournament-scoped operations |
| Platform Admin | Platform | Moderation and platform operations; all audited |

Legend Y=allowed; C=conditional on ownership/grant; N=denied by default.

| Action | Guest | Gamer | Team member | Captain | Individual organizer | Org owner | Org staff | Tournament admin | Platform admin |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| View public tournament/profile | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Edit own gamer profile | N | Y | Y | Y | C | C | C | C | C |
| Manage team roster | N | N | N | Y | N | N | N | N | C |
| Register team | N | N | N | Y | N | N | C | C | C |
| Create tournament | N | C | N | N | Y | C | C | C | C |
| Edit tournament | N | N | N | N | C | C | C | C | C |
| Review registrations | N | N | N | N | C | C | C | C | C |
| Schedule matches | N | N | N | N | C | C | C | C | C |
| Submit/approve result | N | N | N | N | C | C | C | C | C |
| Read protected room info | N | C | C | C | C | C | C | C | C |
| Moderate content/account | N | N | N | N | N | N | N | N | Y |

## Permission keys
`profile.read_public`, `profile.update_self`, `team.create`, `team.roster.manage`, `team.invite`, `tournament.create`, `tournament.update`, `registration.review`, `match.manage`, `result.submit`, `result.approve`, `result.correct`, `standings.rebuild`, `announcement.publish`, `room_credentials.read`, `organization.profile.update`, `organization.members.manage`, `moderation.content`, `moderation.account`, `audit.read`.

## Authorization algorithm
Authenticate → resolve resource and owner → load active memberships/grants → check action permission → check resource state and business invariants → audit privileged mutation → respond. Never trust role/owner/tournament IDs supplied by client. Frontend guards are UX only; backend checks are authoritative. Use 403 for known forbidden resources; 404 may conceal resource existence where policy requires.

## High-risk controls
Least privilege; revocable staff grants; admin audit reason; team captain not global; organization owner differs from tournament admin; protected credentials require participant eligibility and release-window validation.
