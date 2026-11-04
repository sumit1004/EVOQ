# Organizer API
- `POST /organizer-profile`: create individual organizer identity.
- `GET /organizers/:slug`: public profile.
- `PATCH /me/organizer-profile`: update own profile.
- `POST /organizations`: create organization; creator becomes owner.
- `PATCH /organizations/:id`: requires `organization.profile.update`.
- `POST /organizations/:id/members`: invite staff/member; requires membership management.
- `GET /organizers/:slug/portfolio`: event portfolio with provenance labels.
- `GET /organizers/:slug/statistics`: platform-derived event/participant statistics.

EVOQ-hosted completed tournaments are system-derived portfolio records. External events/awards are self-reported unless a factual verification workflow is approved. Participant count definition (registered vs approved vs checked-in vs unique users) is an open product decision.
