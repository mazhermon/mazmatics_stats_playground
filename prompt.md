# Fix E2E Tests — Nav Drawer Caused Duplicate Link Failures

## What Was Built (Already Done)

- `src/components/layout/SiteNav.tsx` — global side-nav drawer, wired into `src/app/layout.tsx`
- `e2e/site-nav.spec.ts` — 10 tests for the nav drawer (all passing when run in isolation)
- Visual snapshots updated for all 5 visual tests (8s settle timeout for D3 force sims)

## The Remaining Problem

The SiteNav adds duplicate `a[href="..."]` links to every page (all nav links appear
in the hidden drawer on every page). This caused Playwright strict-mode violations in
existing tests that used unscoped `a[href="..."]` selectors.

## What's Already Fixed in Test Files

`.first()` / `.last()` added to resolve strict-mode violations:
- `e2e/landing.spec.ts` — `.first()` on card presence, `.last().click()` on nav clicks
- `e2e/data-sources.spec.ts` — `.first()` on `/data-sources` link check
- `e2e/about.spec.ts` — `.first()` on `/about` link check
- `e2e/creative-pages.spec.ts` — `.first()` on presence checks, `.last()` on all clicks
- `e2e/primary-maths.spec.ts` — `.first()` on presence, `.last().click()` on nav

## Outstanding Issue: Cold Dev Server Race Condition

After `rm -rf .next`, the dev server races when 3 parallel test workers all hit different
pages simultaneously. Some pages only get the manifest written (not page.js) and 500.
Affected when cold: `/nzqa-maths`, `/nzqa-patterns`, `/nzqa-endorsement`.

## Step 1 — Ensure Dev Server is Warm

Check all pages return 200:
```bash
for page in / /primary-maths /nzqa-maths /nzqa-literacy-numeracy /nzqa-creative /nzqa-stories /nzqa-patterns /nzqa-scholarship /nzqa-endorsement /data-sources /about; do
  curl -s -o /dev/null -w "$page: %{http_code}\n" "http://localhost:3000$page"
done
```

If any return 500 — restart and warm sequentially:
```bash
kill $(lsof -ti:3000) 2>/dev/null && rm -rf .next && sleep 2
npm run dev > /tmp/dev-server.log 2>&1 &
sleep 10
for page in / /primary-maths /nzqa-maths /nzqa-literacy-numeracy /nzqa-creative /nzqa-stories /nzqa-patterns /nzqa-scholarship /nzqa-endorsement /data-sources /about; do
  curl -s -o /dev/null -w "$page: %{http_code}\n" "http://localhost:3000$page"; sleep 3
done
```

## Step 2 — Run Full E2E Suite

```bash
npm run test:e2e
```

Expected: 222 passed. Known pre-existing failures (acceptable):
- `/nzqa-patterns` networkidle timeout in `e2e/creative-pages.spec.ts`
- Diagnostic timeline API 500 in `e2e/diagnostic.spec.ts`

If timeout failures on nzqa-maths etc → server not warm, re-warm.
If strict-mode violations → find the selector and add `.first()`.

## Step 3 — Visual Snapshots

```bash
npm run test:visual
```

5/5 should pass (already updated).

## Step 4 — Unit Tests + Build

```bash
npm test && npm run build
```

## Acceptance Criteria

- [ ] All 11 pages return HTTP 200
- [ ] `npm run test:e2e` — 222 pass (only 2 known pre-existing failures)
- [ ] `npm run test:visual` — 5/5 pass
- [ ] `npm test` — 175/175 pass
- [ ] `npm run build` — clean

## Completion Promise

Output `<promise>TESTS_FULLY_GREEN</promise>` when all acceptance criteria are met.

## Completion Promise section (for ralph-loop stop hook detection)

TESTS_FULLY_GREEN
