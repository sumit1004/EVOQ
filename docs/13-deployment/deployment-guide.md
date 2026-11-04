# Deployment and Environment Guide
## V1 topology
Static React build via CDN/managed static hosting; one Node.js Express application initially; managed MySQL with private access and automated backups; Cloudinary/object storage; transactional email; HTTPS, monitoring and structured logs. No Kubernetes or microservices.

## Environments
Local: Vite, Express, local MySQL and provider sandbox. Staging: production-like config and migration rehearsal. Production: isolated secrets, HTTPS, restricted DB, backups and monitoring.

Backend `.env.example`:
```dotenv
NODE_ENV=development
PORT=4000
APP_ORIGIN=http://localhost:5173
API_BASE_URL=http://localhost:4000/api/v1
DATABASE_URL=mysql://evoq_user:change_me@localhost:3306/evoq
SESSION_SECRET=replace_with_random_secret
CSRF_SECRET=replace_with_random_secret
EMAIL_PROVIDER_API_KEY=
EMAIL_FROM=no-reply@example.com
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
LOG_LEVEL=debug
```
Frontend `.env.example`:
```dotenv
VITE_API_BASE_URL=http://localhost:4000/api/v1
```
Only public config belongs in Vite variables; never put secrets in `VITE_` variables.

## Release process
CI build/test → backup DB → deploy backend → run `prisma migrate deploy` → deploy frontend → smoke-test auth/public tournament/registration/result read/health → monitor. Prefer forward-fix for schema rollback unless reverse migration is tested.

## Backups and recovery
Daily automated encrypted backup minimum; point-in-time recovery/binlogs if available; restricted access; test restore monthly. Proposed initial RPO 24h/RTO 8h require owner approval. Monitor API errors/latency, DB connections, storage failures, outbox backlog, email failures and backup status.
