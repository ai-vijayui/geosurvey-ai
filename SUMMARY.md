# GeoSurvey AI Summary

## What was completed
- Stabilized the monorepo so `@geosurvey-ai/shared`, `@geosurvey-ai/api`, and `@geosurvey-ai/web` all build cleanly in the current workspace.
- Fixed API test tooling so backend unit tests run successfully with Vitest.
- Extended shared domain types to cover persisted survey boundaries, centroid coordinates, and processing metadata/timeline.
- Updated the Prisma schema and seed data to support boundary geometry, centroid storage, processing metadata, richer seed jobs, input files, output artifacts, and AI insight records.
- Replaced Anthropic usage with a provider-based NVIDIA OpenAI-compatible integration using `openai/gpt-oss-120b` by default.
- Completed backend workflow APIs for jobs, dashboard stats, GNSS import, boundary persistence, file deletion, download links, processing queueing, progress streaming, AI analysis, and AI chat streaming.
- Completed the main frontend workflow pages: dashboard, jobs list, job detail, reports, GNSS processing, and settings.
- Added real map-driven survey boundary editing and GNSS visualization using the existing MapLibre-compatible map flow.
- Updated environment and Docker configuration to use NVIDIA-hosted GPT-OSS-120B variables instead of Anthropic variables.
- Verified builds and tests, including a successful `docker compose build`.

## What was fixed
- Removed broken Prisma enum import patterns from API routes and workers.
- Fixed API implicit typing issues that were blocking TypeScript compilation.
- Repaired `/api/jobs` consumers in the frontend to work with paginated responses instead of assuming a raw array.
- Added missing job boundary endpoints:
  - `GET /api/jobs/:id/boundary`
  - `POST /api/jobs/:id/boundary`
  - `DELETE /api/jobs/:id/boundary`
- Added missing file deletion endpoint:
  - `DELETE /api/jobs/:id/files/:fileId`
- Added persisted processing timeline/status metadata so SSE progress can replay recent state from the database.
- Updated streaming web components to use the shared API URL helper so non-root API deployments work correctly.
- Fixed report downloads so both input files and output artifacts resolve through the same backend download route.
- Removed stale Anthropic env usage from `.env.example`, `.env.development`, and `docker-compose.yml`.

## What was newly added
- `apps/api/src/services/ai/provider.ts`
- `apps/api/src/services/ai/nvidia.ts`
- `apps/api/src/services/aiOrchestrator.ts`
- `apps/api/src/services/jobState.ts`
- `apps/web/src/components/BoundaryEditor.tsx`
- Persisted boundary geometry support across schema, API, seed data, dashboard map, and job detail map tab.
- GNSS CSV import diagnostics including invalid row counts, reprojection support, average accuracy, and bounding box response data.
- Settings sections for organization info, CRS defaults, units, map preferences, AI configuration, storage diagnostics, processing defaults, auth/account info, appearance, and environment/system status.

## NVIDIA AI provider migration
- Anthropic-specific analysis and chat code was replaced with a provider abstraction.
- The default provider now targets:
  - Base URL: `https://integrate.api.nvidia.com/v1`
  - Model: `openai/gpt-oss-120b`
  - API key env var: `NVIDIA_API_KEY`
- Structured job analysis now:
  - prompts for JSON-only output
  - strips code fences when present
  - validates parsed insights with Zod
  - safely falls back to an empty result on parse failure
- Streaming AI chat now uses NVIDIA's OpenAI-compatible chat completion stream and emits SSE-friendly token events for the frontend.

## Architecture decisions
- Kept a provider abstraction around AI calls so future provider/model changes are isolated from route and worker logic.
- Persisted a single survey boundary directly on `SurveyJob` instead of introducing a separate boundary table, because the current product workflow is one boundary per job.
- Preserved the BullMQ worker flow and made it more production-ready by persisting timeline/progress snapshots on every stage transition.
- Kept graceful mock/fallback processing behavior when external geospatial binaries are unavailable, so the product workflow stays usable in local/dev environments.
- Continued using the existing frontend map stack and extended it with reusable boundary editing instead of swapping to a completely different map architecture.

## Known limitations
- `prisma generate`, `prisma migrate dev`, and `prisma db seed` were not executed successfully in this environment because Prisma binary download / database runtime prerequisites were not available during this pass. The schema and seed code were updated, but live migration execution still depends on a reachable database toolchain in the target environment.
- The point cloud tab is structured and non-broken, but still uses a fallback operational panel rather than a full native point cloud renderer.
- Processing remains a realistic staged mock pipeline when PDAL/GDAL-backed production processing is not available.
- AI features build and stream correctly, but live responses still require a valid `NVIDIA_API_KEY` at runtime.
- Clerk remains on the existing optional/dev-fallback approach; Docker build logs show blank-key warnings when auth env vars are not supplied.

## Local run instructions
1. Install dependencies from the repo root with `npm install`.
2. Populate environment variables using `.env.example` or `.env.development`.
3. Ensure PostgreSQL/PostGIS, Redis, and S3-compatible storage are reachable.
4. Run Prisma generate/migration/seed commands against the intended database environment.
5. Start the API with `npm run dev -w @geosurvey-ai/api`.
6. Start the worker with `npm run worker -w @geosurvey-ai/api`.
7. Start the web app with `npm run dev -w @geosurvey-ai/web`.

## Docker run instructions
1. Supply runtime env values such as `DATABASE_URL`, `REDIS_URL`, `NVIDIA_API_KEY`, storage credentials, and Clerk keys as needed.
2. Build services with `docker compose build`.
3. Start the stack with `docker compose up`.
4. Open the web app at `http://localhost:5173` and the API health endpoint at `http://localhost:4000/api/health`.

## Environment variable reference
- `DATABASE_URL`: PostgreSQL/PostGIS connection string.
- `REDIS_URL`: Redis connection string for BullMQ.
- `AWS_ACCESS_KEY_ID`: S3-compatible storage access key.
- `AWS_SECRET_ACCESS_KEY`: S3-compatible storage secret key.
- `AWS_ENDPOINT_URL`: S3-compatible endpoint URL, such as MinIO.
- `AWS_BUCKET_NAME`: Bucket name for input and output artifacts.
- `AWS_REGION`: Storage region.
- `NVIDIA_API_KEY`: NVIDIA hosted model API key.
- `NVIDIA_API_BASE_URL`: NVIDIA OpenAI-compatible base URL. Defaults to `https://integrate.api.nvidia.com/v1`.
- `NVIDIA_LLM_MODEL`: Default model name. Defaults to `openai/gpt-oss-120b`.
- `CLERK_SECRET_KEY`: Clerk backend secret.
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk frontend publishable key.
- `VITE_API_BASE_URL`: Optional frontend API base URL override.
- `WEB_ORIGIN`: Allowed browser origin for API CORS.
- `PDAL_PATH`: Optional PDAL binary path.
- `GDAL_PATH`: Optional GDAL binary path.

## Validation completed
- `npm run build -w @geosurvey-ai/shared`
- `npm run test -w @geosurvey-ai/api`
- `npm run build -w @geosurvey-ai/api`
- `npm run build -w @geosurvey-ai/web`
- `docker compose build`

## Next recommended improvements
- Execute Prisma migration and seed against the target database environment and verify seeded dashboard/job/report data end to end.
- Upgrade Clerk server integration away from the deprecated `@clerk/clerk-sdk-node` package.
- Add deeper backend tests for route-level status transitions, boundary CRUD, AI parsing fallbacks, and file deletion.
- Replace the point cloud fallback panel with a real browser viewer when the chosen visualization stack is finalized.
- Expand report filtering and dashboard analytics once live production data is available.
