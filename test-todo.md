# Phase 9 Test Findings — 2026-03-17

## Summary
Diagnostic testing of all new pages added since Phase 7 (`/primary-maths`, `/nzqa-stories`, `/nzqa-patterns`, `/nzqa-creative`).

---

## Bugs Found and Fixed

### [x] /primary-maths — TIMSSTrendChart — Invalid CSS selector crash
**Error:** `Failed to execute 'querySelectorAll' on 'Element': '.dot-#60a5fa' is not a valid selector.`
**Root cause:** D3 `.selectAll('.dot-${colour}')` where `colour` is a hex string (`#60a5fa`, `#f472b6`). Hash `#` characters are invalid in CSS class selectors when used this way in D3.
**Fix:** Changed to label-based class names `.dot-girls` and `.dot-boys` in `TIMSSTrendChart.tsx`.
**File:** `src/components/charts/TIMSSTrendChart.tsx` line ~265
**Triggered by:** Clicking the "By gender" toggle on TIMSSTrendChart.

### [x] /nzqa-maths — EquityGapVisualizer, RegionalMap, DeltaChart — beforeEach timeout
**Error:** `Test timeout of 30000ms exceeded while running "beforeEach" hook`
**Root cause:** These describe blocks load `/nzqa-maths` which fires 10+ parallel API requests. The `beforeEach` called `waitForLoadState('networkidle')` without a timeout override, so the default 30s test timeout applied — not enough under parallel load.
**Fix:** Added `test.setTimeout(90000)` to each `beforeEach`, plus `waitForLoadState('networkidle', { timeout: 75000 })`.
**File:** `e2e/nzqa-maths.spec.ts`

---

## Not Real Bugs (Explained)

### /nzqa-patterns, /nzqa-creative — "Failed to load resource: 404" under parallel load
**Error:** Console error "Failed to load resource: the server responded with a status of 404 (Not Found)"
**Status:** NOT a real bug — parallel load timing issue only.
**Explanation:** When running 90+ tests in parallel, the Next.js dev server receives multiple chunk requests simultaneously while compiling routes. This causes transient 404s for `/_next/static/chunks/` files. The pages work perfectly in isolation (zero 404s confirmed via direct Playwright run). This is a dev server limitation — not a production issue.
**Already covered:** `creative-pages.spec.ts` covers these pages and passes when not under heavy parallel load.

---

## Tests Added

### [x] e2e/diagnostic-new-pages.spec.ts (temporary — Phase 9 investigation)
25 tests covering API health + all filter interactions on `/primary-maths`.
Identified the TIMSSTrendChart CSS selector bug.

### [x] e2e/primary-maths.spec.ts (permanent)
Full e2e coverage for `/primary-maths`:
- 3 API health checks (timss trend, timss intl, nmssa, curriculum-insights)
- Page load + hero content
- TIMSSTrendChart: National/By gender toggle
- TIMSSWorldRanking: SVG renders
- NMSSAEquityGaps: all 3 dimension toggles
- CurriculumInsightsPipeline: 2023/2024 year toggle
- Home page nav card for /primary-maths

---

## Remaining Known Issues (Pre-existing, out of Phase 9 scope)

- `/nzqa-maths` — tests are flaky under heavy parallel load due to dev server constraints.
  Mitigated by adding proper `test.setTimeout(90000)` to all affected describe blocks.
  Not a production bug.
