# GeoSurvey AI Launch Checklist

Use this as a strict pass/fail checklist before releasing the app.

## 1. Environment Preflight

- [ ] Production database is provisioned and reachable.
- [ ] Production Redis is provisioned and reachable.
- [ ] Production object/file storage is configured and reachable.
- [ ] Production API base URLs are correct for web and API.
- [ ] Clerk production keys are configured.
- [ ] `DISABLE_AUTH` is not enabled in production.
- [ ] `VITE_DISABLE_AUTH` is not enabled in production.
- [ ] AI provider key is configured if conversational AI should be available.
- [ ] All exposed-looking secrets from local env files have been rotated if reused anywhere else.
- [ ] `.env.development` is not being used as a production source of truth.

## 2. Database and Backend Readiness

- [ ] Prisma schema validates.
- [ ] Production migrations are applied.
- [ ] Seed data is not required for production startup.
- [ ] API health endpoint responds successfully.
- [ ] Worker/queue process is running in the target environment.
- [ ] Upload, processing, and AI routes are reachable from the deployed web app.

## 3. Build and Release Validation

- [ ] `npm run build`
- [ ] `npm run build -w @geosurvey-ai/web`
- [ ] Docker build or deployment build completes successfully.
- [ ] No blocking runtime errors appear in API logs on startup.
- [ ] No blocking runtime errors appear in web logs on startup.
- [ ] No blocking runtime errors appear in worker logs on startup.

## 4. Core Product Flow QA

- [ ] Sign in works with production auth.
- [ ] Dashboard loads successfully.
- [ ] Projects page loads successfully.
- [ ] Jobs page loads successfully.
- [ ] Job workspace loads successfully.
- [ ] Processing page loads successfully.
- [ ] Reports page loads successfully.
- [ ] Settings page loads successfully.

## 5. End-to-End Survey Workflow

- [ ] Create a project.
- [ ] Create a job inside that project.
- [ ] Upload files to the job.
- [ ] Start processing.
- [ ] Monitor processing state changes.
- [ ] Open the map/boundary workflow.
- [ ] Run AI analysis.
- [ ] View reports/outputs.
- [ ] Retry a failed job if a failed case is available.

## 6. AI Command Center QA

- [ ] AI panel renders correctly in the main shell.
- [ ] AI panel works on dashboard.
- [ ] AI panel works on jobs list.
- [ ] AI panel works on job workspace.
- [ ] AI panel works on reports page.
- [ ] Graceful fallback works when conversational AI provider is unavailable.

## 7. AI Command Tests

- [ ] `Add project`
- [ ] `Create job`
- [ ] `Create a drone survey job`
- [ ] `Show failed jobs`
- [ ] `Open reports`
- [ ] `Start processing this job`
- [ ] `Analyze this job`

## 8. Required-Field Collection QA

- [ ] Missing project name triggers follow-up question instead of execution.
- [ ] Missing job name triggers follow-up question instead of execution.
- [ ] Missing job type triggers follow-up question instead of execution.
- [ ] Missing project context for job creation triggers follow-up question instead of execution.
- [ ] Missing current job context for processing triggers follow-up question instead of execution.
- [ ] Missing current job context for AI analysis triggers follow-up question instead of execution.
- [ ] Summary card appears before executing collected actions.
- [ ] `Confirm` executes the action.
- [ ] `Edit` allows field changes using `field: value`.
- [ ] `Cancel` stops the action without calling the API.

## 9. Ambiguity and Edge Cases

- [ ] Ambiguous project names ask for an exact project instead of guessing.
- [ ] Ambiguous job names ask for an exact job instead of guessing.
- [ ] Invalid survey type is rejected with a helpful message.
- [ ] Quick actions from AI cards work.
- [ ] Main UI refreshes after AI-driven actions without a page reload.

## 10. Known Non-Blocking Polish

- [ ] Clean the small remaining AI helper copy strings with bad quote encoding.
- [ ] Decide whether ambiguous record selection should stay text-based or become clickable.

## 11. Release Decision

Launch only if all items in sections 1 through 9 pass.

If anything in sections 1 through 9 fails:

- Stop release.
- Capture the failing route, action, and error.
- Fix and retest the affected area.
- Re-run the relevant checklist section before proceeding.
