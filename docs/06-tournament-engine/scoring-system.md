# Scoring System Specification
The blueprint requires custom scoring and server-side calculations but supplies no BGMI, Free Fire, Valorant or other game-specific formulas. Do not invent formulas.

## Proposed scoring configuration
Use a versioned declarative schema, never arbitrary JavaScript or `eval`:
- `schemaKey`: allowlisted approved template.
- `version`: immutable version number.
- `inputFields`: typed fields with bounds and required flags.
- `derivedMetrics`: allowlisted operations (sum, count, weighted sum, ranking).
- `aggregation`: match/group/tournament aggregation.
- `tieBreakers`: ordered metric keys and direction.
- `rounding`: explicit precision/mode.
- `validation`: numeric bounds and participant requirements.

Illustrative shape only:
```json
{
  "schemaKey": "owner-approved-template",
  "version": 1,
  "inputFields": [{"key":"metric_a","type":"integer","min":0,"max":1000}],
  "aggregation": [{"key":"total_a","operation":"sum","source":"metric_a"}],
  "ranking": [{"metric":"total_a","direction":"desc"}],
  "tieBreakers": []
}
```

## Calculation contract
Input: approved scoring version + validated result payloads + registered participants. Output: deterministic metrics, standings and tie-break values. Identical inputs/version must produce identical outputs. Persist calculation version and source hash.

## Product-owner approvals required
Supported games/modes; input fields and bounds; points/placement/kill/win weighting; penalties; aggregation across matches/rounds; tie-break order; unresolved tie behavior; rounding; evidence requirements; who may submit and approve; correction effect on already-started later rounds.

## Security
Reject unknown fields and out-of-range values. Cap payload size. No user-supplied executable expressions. Scoring changes after results exist require a new version and explicit recalculation approval.
