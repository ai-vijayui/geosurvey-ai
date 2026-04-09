# Prisma Workflow

This repo now uses tracked Prisma migrations from `prisma/migrations` instead of relying on `db push` as the default workflow.

## Local commands

- Generate client: `npm run db:generate`
- Create and apply a new development migration: `npm run db:migrate:dev -- --name <change-name>`
- Apply checked-in migrations: `npm run db:migrate:deploy`
- Reset and reapply migrations: `npm run db:reset`
- Seed demo data: `npm run db:seed`
- Fallback schema sync only: `npm run db:push`

## Docker workflow

- API startup now runs `prisma migrate deploy` and does not reseed automatically.
- Seed demo data explicitly when needed:
  - `docker compose --profile seed run --rm db-seed`

This avoids wiping local data every time the API container restarts.

## Baseline migration

The initial migration in `prisma/migrations/20260407154500_init/migration.sql` is the checked-in baseline for the current schema, including marker persistence fields on `SurveyJob`.
