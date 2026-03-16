# E2E Test Maintenance Learnings

## What Broke and Why

### 1. Firefox + WebKit installed separately
`playwright.config.ts` listed all 3 browsers but only Chromium was installed after `npx playwright install chromium`.
After upgrading Playwright for macOS 15 compatibility, always re-install ALL browsers you intend to use.
**Fix:** Removed firefox/webkit from projects list (commented out). Add them back only if `npx playwright install firefox webkit` is run.

### 2. Visual tests ran under two configs with different snapshot dirs
`playwright.config.ts` (testDir: `./e2e`) was picking up `e2e/visual/*.spec.ts` and looking for snapshots at the default location. `playwright.visual.config.ts` stored them at `./e2e/visual/snapshots/`. They disagreed.
**Fix:** Added `testIgnore: ['**/visual/**']` to main config. Visual tests now ONLY run via `npm run test:visual`.

### 3. /nzqa-maths networkidle timeout
The page has 10+ parallel API fetches (4 for GradeStackChart, 2+ for TimelineExplorer merit_excellence, 2+ for RegionalMap, etc.). `waitForLoadState('networkidle')` requires 500ms of no network activity — nearly impossible on first load. Default 30s timeout hit.
**Fix:** Add `test.setTimeout(90000)` + `waitForLoadState('networkidle', { timeout: 75000 })` for tests that load /nzqa-maths.
**Rule:** Any page with >4 simultaneous API fetches needs explicit networkidle timeout override.

### 4. Corrupted webpack cache → subjects API 500
Dev server was returning 500 for `/api/nzqa/subjects` even though the DB query was valid. The actual error: `webpack.cache.PackFileCacheStrategy: Error: invalid stored block lengths`.
**Fix:** Kill and restart the dev server. The corrupted cache is cleared on restart.
**Detection:** If API returns plain "Internal Server Error" (not the JSON `{ error: 'Database error' }` from the catch block), it's a Next.js-level error, not a route-level error. Check server logs.

### 5. Old section names in diagnostic test
Phase 7 renamed `/nzqa-maths` sections. `diagnostic.spec.ts` was scrolling to 'Trends over time', 'equity', 'region', '3D', 'comparison' — none of which matched the new headings.
**Fix:** Updated to current section names. Sections are now: "A decade of maths achievement", "Where do students land", "Year-on-year change", "Not every student starts from the same place", "Where you live matters".
**Rule:** When renaming page sections, search e2e tests for the old text.

### 6. debug2.spec.ts had no assertions — removed
`diagnostic2.spec.ts` was a one-off investigation file (just takes screenshots, no `expect()` calls). It was timing out because `/nzqa-maths` with all its data fetches takes >30s on a cold server to reach networkidle. No value in keeping it as a test.
**Rule:** Test files with no `expect()` assertions are not tests — they're scripts. Either add real assertions or remove them.

### 7. Flaky ridgeline test under parallel load
`ridgeline level selector works` was checking `toHaveClass(/bg-violet-600/)` immediately after click. Under parallel load, React state update was slower.
**Fix:** Added `await expect(level3Btn).toBeVisible()` before click, added `{ timeout: 5000 }` to the class assertion.
**Rule:** After any user interaction (click, type), add a timeout to the assertion that checks the resulting state.

### 8. Visual snapshot needed update after UI changes
nzqa-patterns snapshot was stale. Run `npx playwright test --config=playwright.visual.config.ts --update-snapshots` after any visual change to update snapshots.
Note: `updateSnapshots: 'missing'` in visual config only adds new snapshots, doesn't update changed ones. Use `--update-snapshots` flag explicitly.

---

## Healthy Test Architecture (for this project)

```
npm run test:e2e    → playwright.config.ts → chromium only, no visual dir
                      65 tests: landing, diagnostic, creative-pages, nzqa-maths (API + UI)

npm run test:visual → playwright.visual.config.ts → chromium only, visual dir only
                      5 tests: snapshot regression for all 4 pages + home
```

## Timeout Rules for /nzqa-maths
| Scenario | Recommended timeout |
|---|---|
| `waitForLoadState('networkidle')` on /nzqa-maths | `{ timeout: 75000 }` |
| `test.setTimeout()` for tests that load /nzqa-maths | 90000 |
| DeltaChart beforeEach | `{ timeout: 60000 }` (5 fetches) |
| Any test that clicks and triggers new API fetches | `test.setTimeout(60000)` |
| Visual snapshot tests | No networkidle needed — just `waitForTimeout(3000)` |

## Subjects API Health Check
The diagnostic test now uses the regional endpoint as a health check:
```
/api/nzqa/timeline?metric=not_achieved_rate&groupBy=region&level=1&yearFrom=2024&yearTo=2024
```
This is better than `subjects?region=null` (which returns national rows and was the source of the misleading RegionalMap bug).
