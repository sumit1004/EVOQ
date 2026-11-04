# Gamer API
- `GET /me/gamer-profile`: authenticated user's profile.
- `PATCH /me/gamer-profile`: own-profile permission; gamer name, IGN, bio, slug request, social links and media references.
- `GET /profiles/:slug`: public fields only.
- `GET /profiles/:slug/achievements`: separate verified and self-reported records.
- `GET /profiles/:slug/tournament-history`: approved participation only.
- `GET /profiles/:slug/statistics`: derived basic stats with metric definitions.

Example update:
```json
{
  "gamerName":"Nova",
  "ign":"NOVA",
  "bio":"Competitive player",
  "socialLinks":[{"type":"youtube","url":"https://example.com"}],
  "games":[{"gameId":"game-uuid","gamePlayerId":"player-123","competitiveRole":"IGL"}]
}
```
Social types and competitive-role vocabulary must be allowlisted. User-supplied stats cannot overwrite EVOQ-derived stats.
