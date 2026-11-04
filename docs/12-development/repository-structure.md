# Repository Structure
```text
EVOQ/
  frontend/
    src/
      app/ components/ features/ hooks/ services/ styles/ utils/
    public/ vite.config.js
  backend/
    src/
      app.js server.js
      config/ middleware/ shared/
      modules/
        auth/ users/ gamer/ organizer/ organizations/ teams/
        games/ tournaments/ registrations/ competition/
        scoring/ results/ standings/ qualifications/
        achievements/ portfolios/ announcements/
        notifications/ media/ admin/ analytics/
      workers/
    prisma/ (schema.prisma, migrations/, seed/)
    tests/
  docs/
  .github/workflows/
  README.md
```
Backend module pattern: `module.routes.js`, `.controller.js`, `.service.js`, `.repository.js` (only when useful), `.schema.js`, `.policy.js`, tests. Frontend feature pattern: `pages/`, `components/`, `hooks/`, `api/`, `styles/`. Do not create empty abstraction layers.
