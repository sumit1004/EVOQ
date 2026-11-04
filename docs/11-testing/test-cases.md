# Critical Test Cases
| ID | Scenario | Expected |
|---|---|---|
| TC-AUTH-001 | Valid registration | User created; password hash only |
| TC-AUTH-002 | Duplicate normalized email | 409; no duplicate |
| TC-AUTH-003 | Invalid login | Generic 401; throttled |
| TC-AUTH-004 | Expired/reused reset token | Rejected |
| TC-RBAC-001 | Gamer edits another profile | 403/404; no mutation |
| TC-RBAC-002 | Staff without approval grant approves result | 403 |
| TC-RBAC-003 | Admin moderation action | Audit actor/reason recorded |
| TC-TEAM-001 | Non-captain changes roster | Rejected |
| TC-TEAM-002 | Expired invite accepted | Rejected |
| TC-REG-001 | Duplicate entrant registration | Conflict |
| TC-REG-002 | Concurrent requests for last slot | Exactly one succeeds |
| TC-REG-003 | Registration after close | Rejected |
| TC-REG-004 | Roster changes after entry | Snapshot unchanged |
| TC-ENG-001 | Group stage without bracket | Supported |
| TC-ENG-002 | Round without group | Supported |
| TC-SCORE-001 | Unknown scoring field | Rejected |
| TC-SCORE-002 | Same inputs/config version | Identical output |
| TC-RESULT-001 | Unauthorized submission | Rejected |
| TC-RESULT-002 | Pending result requested in standings | Excluded |
| TC-RESULT-003 | Approved result | Standings updated |
| TC-RESULT-004 | Correction | New revision; old retained |
| TC-RESULT-005 | Concurrent approval | One authoritative approval |
| TC-STAND-001 | Rebuild standings | Same result/hash |
| TC-QUAL-001 | Top-N without tie | Correct N qualifiers |
| TC-QUAL-002 | Tie at cutoff | Approved policy applied |
| TC-ACH-001 | Duplicate achievement event | One achievement |
| TC-ACH-002 | Result correction | Provenance/status reconciled |
| TC-PROFILE-001 | Self-reported award | Labelled self-reported |
| TC-ORG-001 | EVOQ event completes | Organizer portfolio record linked |
| TC-MEDIA-001 | Oversized/executable upload | Rejected |
| TC-MEDIA-002 | Guest accesses private proof | Denied/expired |
| TC-NOTIF-001 | Outbox retries | No duplicate notification |
| TC-ROOM-001 | Guest requests room credentials | Denied |

Edge cases: zero/one entrant; odd group sizes; missing results; withdrawal after draw; config change after registration; correction after qualification; disabled game template; timezone boundary; removed team member with historical event; owner departure; repeated outbox delivery.
