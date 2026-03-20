# Fix Deployment + Verify Tests — Mazmatics Stats

## Context

Phase 20 (Data Sources Filtering System) just shipped. A background e2e test run completed with **119 passed, exit code 0** — all tests are currently passing.

The only confirmed broken thing is the **Vercel deployment** (build fails due to `remotion/remotion.config.ts` being compiled by Next.js TypeScript). This has been partially addressed in `tsconfig.json` but needs verification via a full build.

---

## Skills to Read First

- `e2e-testing` — before running or fixing any e2e tests
- `data-sources-maintenance` — context on Phase 20 changes

---

## What Changed in Phase 20

New files created:
- `src/lib/data-sources.ts` — 7 sources, 8 chart pages, `SourceId`/`ChartPageId` types, mappings
- `src/components/ViewSourcesLink.tsx` — `<a href="/data-sources?chart=...">`
- `src/components/PageSourcesFooter.tsx` — source chips + view link (server-safe)
- `src/app/data-sources/DataSourcesClient.tsx` — `'use client'` interactive filter page
- `src/app/data-sources/page.tsx` — thin server wrapper using `searchParams`

All 8 explorer pages got `PageSourcesFooter` added to their footers.

The `/data-sources` page is now fully dynamic (not static). Section anchor IDs changed:
- Old: `#source-nzqa` → New: `#source-nzqa-secondary`
- `#source-timss`, `#source-nmssa`, `#source-curriculum-insights` — unchanged

---

## Step 1 — Verify Deployment Fix

`tsconfig.json` has `"remotion"` added to the `exclude` array (already done). Verify with:

```bash
npx tsc --noEmit
```
Should be clean. Then run a full production build:

```bash
npm run build
```

The deployment error was:
```
./remotion/remotion.config.ts:1:24
Type error: Cannot find module '@remotion/cli/config' or its corresponding type declarations.
```
The `tsconfig.json` fix (excluding `remotion/` from compilation) should resolve this. If `npm run build` passes clean, the deployment is fixed.

---

## Step 2 — Run All E2E Tests

```bash
npm run test:e2e
```

A background run completed with 119 passed / exit code 0. Confirm this is still the case. Note the **2 known pre-existing failures** that are acceptable:
- `/nzqa-patterns` networkidle timeout in `e2e/creative-pages.spec.ts`
- Diagnostic timeline API 500 in `e2e/diagnostic.spec.ts`

If data-sources tests are failing (they test old anchor IDs), fix them:

**File: `e2e/data-sources.spec.ts`**

Known staleness to check:
- `#source-nzqa` selector → should be `#source-nzqa-secondary` (new section ID)
- h2 heading "NZQA Secondary School Statistics" → now "NZQA Subject Attainment Statistics" (source name changed in `data-sources.ts`)
- Test checking `href="/data-sources#source-nzqa"` in nzqa-maths HTML → link still exists in page.tsx footer but points to old anchor

Also check these page files still reference correct anchors:
- `src/app/nzqa-maths/page.tsx` has `href="/data-sources#source-nzqa"` — anchor is now `#source-nzqa-secondary`
- `src/app/nzqa-scholarship/page.tsx` — same issue
- `src/app/primary-maths/page.tsx` — `#source-timss`, `#source-nmssa`, `#source-curriculum-insights` — these are unchanged and fine

If these are actual failures, fix `data-sources.spec.ts` (update assertions) AND the broken anchor links in the page files.

---

## Step 3 — Update Visual Snapshots

The creative pages (`/nzqa-creative`, `/nzqa-stories`, `/nzqa-patterns`) now have a `PageSourcesFooter` in their footers. The existing visual snapshots were taken without this footer and are now stale.

Regenerate:
```bash
npx playwright test --config=playwright.visual.config.ts --update-snapshots
```

Then verify the new snapshots look correct:
```bash
npm run test:visual
```

All 5 visual snapshot tests (landing + 4 creative) should pass.

---

## Step 4 — Run Unit Tests

```bash
npm test
```
These are unlikely affected by Phase 20 changes. Should all pass.

---

## Step 5 — Final Build Confirmation

After all test fixes:
```bash
npm run build
```
Must pass clean. This is what Vercel runs.

---

## Acceptance Criteria

- [ ] `npx tsc --noEmit` passes clean
- [ ] `npm run build` passes clean (deployment fix confirmed)
- [ ] `npm run test:e2e` — all tests pass except the 2 known pre-existing failures
- [ ] `e2e/data-sources.spec.ts` — all 9 tests pass with correct anchor IDs
- [ ] `npm run test:visual` — all 5 visual snapshot tests pass
- [ ] `npm test` — all unit tests pass

## Completion Promise

Output `<promise>TESTS_AND_DEPLOYMENT_CLEAN</promise>` when all acceptance criteria are met.

## Completion Promise section (for ralph-loop stop hook detection)

TESTS_AND_DEPLOYMENT_CLEAN
