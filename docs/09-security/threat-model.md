# Threat Model
## Assets
Credentials/sessions; private contact data; protected room credentials; registration/roster data; submitted/approved results; standings/qualifiers; gamer achievements; organizer verification; audit records and media.

## Trust boundaries
Browser/API; API/database; API/object storage/email; operator/reviewer; platform admin/user content.

## Abuse cases and controls
| Abuse case | Control |
|---|---|
| Duplicate registration via altered payload | Unique constraint, atomic capacity check |
| Captain adds player without consent | Invitation acceptance by invitee; membership audit |
| Organizer changes scoring after results | Versioned immutable scoring config; lock/change approval |
| Operator approves fraudulent own result | Separation-of-duty decision; audit and reviewer controls |
| Guess tournament ID to access room details | Resource-level permission and eligibility checks |
| Upload executable/oversized file | Signed upload, actual MIME and size validation |
| Admin suppresses feedback | Immutable moderation audit and reason |
| Correction silently removes achievement | Append-only result revision and achievement provenance |
| Public API leaks private fields | Explicit public DTO and field-level visibility |
| Invite token replay | Hashed single-use expiring token; transaction |

Residual product decisions: submitter/approver separation, dispute/appeal process, external verification evidence, retention and account deletion.
