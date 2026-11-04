# Qualification Engine
## Inputs
Approved standings snapshot; qualification rule version; eligible registrations; scope (per group, combined groups or whole round); top-N; tie-breakers; target round.

## Algorithm
1. Verify source snapshot is current and built from approved result revisions.
2. Select eligible participants in configured scope.
3. Sort by ranking and explicit tie-breakers.
4. Apply top-N and approved tie policy.
5. Persist qualification entries referencing source snapshot and rule version.
6. Emit audit/outbox event and notify affected entrants.

## Tie policies requiring approval
- Fixed slots: deterministic tie-breakers fill exactly N slots.
- Expanded slots: all tied at cutoff qualify.
- Playoff: additional match(es) determine final slot(s).
No policy is silently selected.

## Corrections
A corrected source result invalidates dependent qualification output and triggers recomputation. If a later round has started, freeze downstream state and require explicit admin resolution rather than silently removing a participant.

## Acceptance
Idempotent calculation; identical source/rule produces identical qualifiers; each entry traces to source standing row; tie tests match approved policy.
