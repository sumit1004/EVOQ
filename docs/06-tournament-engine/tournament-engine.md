# Tournament Engine Specification
## Core hierarchy
`Tournament → Rounds → [Groups] → Matches → Results → Standings → Qualifiers → Leaderboard`. Groups are optional; knockout brackets are not assumed.

## Lifecycle proposal
Tournament: draft → published → registration_closed → in_progress → completed. Cancellation, reopen and archive behavior require approval. Match: scheduled → ready → live → result_submitted → completed. Disputed/cancelled states require a defined policy before activation.

## Participation and registration
Each tournament has one participation mode (team or individual). Team size min/max applies in team mode. Registration is unique per tournament/entrant and capacity checks are atomic. Registration is separate from persistent team identity; roster snapshot preserves who entered. Eligibility, substitutions, check-in, waitlist promotion and roster-lock dates require product decisions.

## Structure and formats
Represent ordered rounds, optional groups, matches and progression rules. Initial supported templates should be explicitly approved (e.g. group-stage with top-N progression and single-stage standings). A format must not require every match to be a bracket node.

## Result lifecycle
1. Authorized operator submits typed payload.
2. Server validates scoring schema and participant IDs.
3. Pending revision is appended.
4. Reviewer approves/rejects with reason.
5. Approval transaction makes revision authoritative and recalculates derived records.
6. Correction appends a new revision; old revision remains auditable.
7. Standings, qualification, achievements and organizer portfolio are reconciled.

## Standings and qualification
Only approved results count. Store calculation version and source revision hash. Tie-breakers are explicit, ordered and versioned. Top-N is supported; N, per-group vs combined scope, tie expansion and playoff behavior require approval. Client never submits authoritative rank/points/qualifiers.

## Completion
Completion requires the configured required matches/results to be resolved. Completion generates organizer event record and eligible achievements. Result corrections after later rounds begin require an explicit downstream resolution policy.
