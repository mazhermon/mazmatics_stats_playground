---
name: e2e-testing
description: Playwright e2e testing patterns, architecture, and maintenance rules for this project. Read before writing, fixing, or running e2e tests.
version: 1.0.0
stacks:
  - Playwright 1.58+
  - Next.js 15
  - D3.js
---

# E2E Testing — Mazmatics Stats

## Test Commands

```bash
npm run test:e2e     # Main suite — chromium only, 91 tests (~3.5 min)
npm run test:visual  # Visual regression — chromium only, 5 snapshot tests
npm test             # Jest unit tests — 87 tests
```

## Test Architecture

```
e2e/
  diagnostic.spec.ts          ← smoke: home + nzqa-maths load, API health, screenshots
  creative-pages.spec.ts      ← /nzqa-creative, /nzqa-stories, /nzqa-patterns + nav cards
  landing.spec.ts             ← home page heading + title
  nzqa-maths.spec.ts          ← full phase 7 explorer: all charts + API endpoints
  visual/
    creative-pages.visual.spec.ts  ← snapshot regression (visual config only)
    landing.visual.spec.ts         ← snapshot regression (visual config only)

playwright.config.ts          ← testDir: ./e2e, testIgnore: **/visual/**, chromium only
playwright.visual.config.ts   ← testDir: ./e2e/visual, snapshotDir: ./e2e/visual/snapshots
```

**Key rule:** `testIgnore: ['**/visual/**']` in main config means visual specs NEVER run under `test:e2e`. They use different snapshot directories and would produce false failures.

## Browser Setup

Only Chromium is installed. To add Firefox/WebKit:
```bash
npx playwright install firefox webkit
# Then uncomment in playwright.config.ts projects array
```
Never commit a config with browsers listed that aren't installed — every test fails in 4ms.

---

## Timeout Rules

The `/nzqa-maths` page fires 10+ parallel API requests on load. **Do NOT use `networkidle`** for
`/nzqa-maths` tests — with 3 parallel workers all loading the page simultaneously (30+ concurrent
requests), the server never reaches 500ms silence. Use structure-based waiting instead:

| Situation | Rule |
|---|---|
| Any test that loads `/nzqa-maths` | `test.setTimeout(90000)` + `waitForSelector('h1', { timeout: 20000 })` + `waitForTimeout(6000)` |
| `beforeEach` loading `/nzqa-maths` with scroll | same as above, then scroll + `waitForTimeout(5000)` |
| Test where clicking triggers new API fetches | `test.setTimeout(60000)` |
| Visual snapshot tests | No networkidle needed — use `waitForTimeout(3000)` only |
| Any page with >4 simultaneous fetches | Structure-based wait (h1 + timeout), not networkidle |
| Checking "no console errors" on `/nzqa-maths` | Use response listener + filter `Failed to load resource` — see CLAUDE.md |

**Why `networkidle` fails:** `waitForLoadState('networkidle')` requires 500ms of NO network activity.
With 3 parallel workers each loading `/nzqa-maths` (10+ API requests), the combined 30+ requests
keep the dev server permanently busy. Networkidle is never reached → test timeout.

**Playwright config:** `workers: 3` locally (capped from unlimited to reduce parallel load on dev server).

---

## Writing Good E2E Tests

### Do
- Test that key UI elements render and are interactive
- Test API health via `{ request }` fixture — hits the real dev server, no mocks
- Use `.first()` on text locators when the same text appears in multiple components
- Add `await expect(btn).toBeVisible()` before clicking any button
- After click → state change, add `{ timeout: 5000 }` to the assertion
- For D3 SVG content, wait 3–4s after networkidle (D3 renders after data arrives)

### Don't
- Create test files with no `expect()` calls — those are scripts, not tests
- Test implementation details (exact CSS class names beyond the one you control)
- Duplicate tests across files — each behaviour tested in one place
- Use `page.locator('text=...')` without `.first()` if the text appears more than once

### SVG count gotcha
Below-fold D3 charts are not rendered at initial load. Test `>= 3` SVGs at page load, not `>= total chart count`. Scroll is needed to trigger lazy-render for charts below the fold.

---

## Debugging Common Failures

### "Executable doesn't exist" (firefox/webkit)
Browsers not installed. Either install them or remove them from `playwright.config.ts projects`.

### Plain "Internal Server Error" (not JSON `{ error: 'Database error' }`)
Next.js-level crash, not the route handler. Almost always a corrupted webpack cache.
**Fix:** Kill and restart the dev server. Clears the cache.
```bash
pkill -f "next dev" && sleep 2 && npm run dev &
```

### `networkidle` timeout on `/nzqa-maths`
Page has too many parallel fetches for default 30s. Add explicit timeout — see timeout rules above.

### Visual snapshot mismatch after UI change
Update snapshots explicitly (the `updateSnapshots: 'missing'` config does NOT update changed ones):
```bash
npx playwright test --config=playwright.visual.config.ts --update-snapshots
```

### Test passes alone but fails in parallel suite
Usually a timing issue under load. Fixes:
1. Add `await expect(element).toBeVisible()` before interactions
2. Add `{ timeout: 5000 }` to post-interaction assertions
3. Increase `waitForTimeout` in `beforeEach`

### Stale section names / text after page changes
When renaming page sections or button labels, grep e2e tests for the old text:
```bash
grep -r "old text" e2e/
```

---

## Updating Tests After Page Changes

When adding a new chart or section to `/nzqa-maths`:
1. Add section heading to the "5 key section headings" test in `nzqa-maths.spec.ts`
2. Add a new `test.describe` block for the chart (SVG renders, key controls visible, no crash on interaction)
3. Add any new API endpoints to the "API endpoints" describe block
4. Update `diagnostic.spec.ts` sections list if you rename headings
5. Run `npm run test:e2e` to verify

When adding a new page:
1. Add nav card link tests to `creative-pages.spec.ts`
2. Add page load + key chart render tests to `creative-pages.spec.ts`
3. Add visual snapshot test to `e2e/visual/creative-pages.visual.spec.ts`
4. Run `npm run test:visual -- --update-snapshots` to capture baseline

---

## Test Value Matrix

| Test type | Keep? | Why |
|---|---|---|
| Page loads without console errors | ✅ Yes | Catches unhandled exceptions and SSR errors |
| Section headings present | ✅ Yes | Catches content deletions and wrong routes |
| SVG renders (D3 chart present) | ✅ Yes | Catches data fetch or D3 render failures |
| Key control buttons visible | ✅ Yes | Catches UI regressions on controls |
| Click → no crash | ✅ Yes | Catches state management bugs |
| API endpoint returns 200 + data | ✅ Yes | Catches DB/query regressions independent of UI |
| Exact pixel count in chart | ❌ No | Too brittle, breaks on data changes |
| Specific colour values | ❌ No | Too brittle, use visual snapshots instead |
| Screenshot comparison (non-visual suite) | ❌ No | Use `test:visual` for that, not `test:e2e` |
| Debug scripts with no expect() | ❌ Remove | Not a test |

---

## File Reference

```
e2e/nzqa-maths.spec.ts       ← 37 tests, all phase 7 features
e2e/primary-maths.spec.ts    ← 26 tests, phase 8 primary school explorer
e2e/creative-pages.spec.ts   ← 23 tests, creative pages + nav
e2e/diagnostic.spec.ts       ← 5 tests, smoke + API health
e2e/landing.spec.ts          ← 2 tests, home heading + title
e2e-learnings.md             ← session-by-session failure log with root causes
```
