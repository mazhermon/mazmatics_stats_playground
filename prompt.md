# Jest Unit Tests + Code Review Fixes — Implementation Plan

## Context
This plan covers two work streams for the Mazmatics Stats Playground:
1. **Fix code issues** identified in the code review (WARNING-severity first)
2. **Add targeted Jest unit tests** to the pure utility and hook layers

The goal is NOT 100% coverage — it's a focused safety net for the units most likely to break silently as the project evolves. D3/Three.js visualisation components are excluded (covered by Playwright visual tests). API routes and the SQLite layer are integration-test territory and are excluded for now.

---

## Code Review Findings

### `src/lib/palette.ts`

| Severity | Issue | Fix |
|----------|-------|-----|
| WARNING | `choroplethColour(NaN)` — NaN bypasses the null check and produces `CHOROPLETH_SEQUENTIAL[NaN]` = `undefined`, falling through to `??` fallback. Inconsistent with intent. | Add `if (rate === null || isNaN(rate)) return '#2a2a3a';` |
| INFO | `fmtRate(NaN)` returns `"NaN%"` — SQLite can surface NaN at runtime even when typed as `number`. | Add `if (rate === null || isNaN(rate)) return '—';` |
| INFO | `fmtCount(NaN)` returns `"NaN"` via toLocaleString. Same root cause. | Add `if (count === null || isNaN(count)) return '—';` |
| INFO | Double fallback in `choroplethColour`: `CHOROPLETH_SEQUENTIAL[idx] ?? CHOROPLETH_SEQUENTIAL[7] ?? '#BA90FF'` — `Math.min(7, ...)` makes the second fallback unreachable. | Simplify to `return CHOROPLETH_SEQUENTIAL[idx]!` (post-NaN fix) |

### `src/lib/audio/index.ts`

| Severity | Issue | Fix |
|----------|-------|-----|
| INFO | Oscillator/gain nodes are created and connected but never explicitly `.disconnect()`ed after stop. Browser GC handles it, but explicit cleanup is better practice. | Add `osc.onended = () => { osc.disconnect(); gain.disconnect(); };` after `osc.stop(...)` in all three functions. |
| INFO | Empty `catch {}` blocks intentionally swallow errors. Already partially documented, but the catch blocks themselves lack inline comments. | Add `// intentional: audio errors are non-fatal` to empty catch blocks. |

### `src/lib/hooks/useNzqaData.ts`

| Severity | Issue | Fix |
|----------|-------|-----|
| WARNING | When `url` becomes `null` after having a value, the effect returns early but leaves the previous state unchanged — UI can be stuck showing stale data or a loading spinner. | Reset to `{ data: null, loading: false, error: null }` when url is null, before the early return. |
| INFO | `catch((err: Error)` — `.catch()` param is `any` so this compiles but is a silent cast. If a non-Error is thrown, `err.message` is `undefined`. | Use `unknown` and narrow: `const msg = err instanceof Error ? err.message : String(err)` |

### `src/lib/db/index.ts`

| Severity | Issue | Fix |
|----------|-------|-----|
| INFO | `PRAGMA journal_mode = WAL` has no effect on a readonly connection — silently ignored by SQLite. Misleading to future readers. | Remove the pragma. |

### `src/app/api/nzqa/timeline/route.ts`

| Severity | Issue | Fix |
|----------|-------|-----|
| WARNING | `parseInt(level, 10)` without NaN guard — `level = "abc"` produces NaN, which better-sqlite3 will throw on when binding. | After parseInt, add: `if (isNaN(lvl)) return NextResponse.json({ error: 'Invalid level' }, { status: 400 });` — same for yearFrom / yearTo. |
| WARNING | `catch (error)` — the error variable is unused and swallowed. No server-side visibility into DB failures. | Add `console.error('[/api/nzqa/timeline]', error);` before returning the 500. |
| INFO | `ORDER BY year, level, ${groupBy}` — safe because groupBy is allowlist-validated, but no comment makes this clear to reviewers. | Add `// groupBy is allowlist-validated above — safe to interpolate` |

### `src/lib/nzqa-strings.ts`

| Severity | Issue | Fix |
|----------|-------|-----|
| INFO | `tooltips.achievementRate(rate, year, group)` — if `rate` is null at the call site (possible from API responses), `(null * 100).toFixed(1)` = `"0.0%"`. | Guard: replace `(rate * 100).toFixed(1)%` with `rate != null ? (rate * 100).toFixed(1) + '%' : '—'` |

---

## Unit Tests to Add

### Priority 1 — Pure Utilities (highest value, no mocks needed)

#### `src/__tests__/palette.test.ts`

```
choroplethColour:
  - null → '#2a2a3a'
  - NaN  → '#2a2a3a'  (after fix)
  - 0    → CHOROPLETH_SEQUENTIAL[0]
  - 0.5  → CHOROPLETH_SEQUENTIAL[4]
  - 1.0  → CHOROPLETH_SEQUENTIAL[7]  (boundary — not index 8)
  - 0.999 → CHOROPLETH_SEQUENTIAL[7]
  - 0.125 → CHOROPLETH_SEQUENTIAL[1]  (exactly on boundary: 0.125 * 8 = 1.0 → floor = 1)

fmtRate:
  - null  → '—'
  - NaN   → '—'  (after fix)
  - 0     → '0.0%'
  - 0.756 → '75.6%'
  - 1.0   → '100.0%'
  - 0.001 → '0.1%'

fmtCount:
  - null    → '—'
  - NaN     → '—'  (after fix)
  - 0       → '0'
  - 1234567 → '1,234,567'  (NZ locale comma separation)
```

#### `src/__tests__/nzqa-strings.test.ts`

```
tooltips.achievementRate:
  - (0.756, 2024, 'Māori') → includes '75.6%', '2024', 'Māori'
  - null rate              → includes '—'  (after fix)

strings shape (smoke):
  - strings.page.title is a non-empty string
  - strings.controls.level exists and is a string
  - strings.sections has keys: timeline, equity, map, landscape, comparison

ETHNICITY_COLOURS coverage (cross-check with strings.ethnicities):
  - every key in strings.ethnicities exists in ETHNICITY_COLOURS
```

### Priority 2 — Custom Hook (fetch mock via jest.spyOn)

#### `src/__tests__/hooks/useNzqaData.test.tsx`

Use `@testing-library/react` `renderHook`. Mock global fetch via `jest.spyOn(global, 'fetch')`.

```
Initial state:
  - { data: null, loading: true, error: null }

Successful fetch:
  - fetch resolves ok with JSON → { data: <payload>, loading: false, error: null }

Failed fetch — non-ok response:
  - fetch resolves with res.ok = false, status 404 → { data: null, loading: false, error: 'HTTP 404' }

Failed fetch — network error:
  - fetch rejects with Error('Network error') → { data: null, loading: false, error: 'Network error' }

url = null (never fetches):
  - rendered with null url → { data: null, loading: false, error: null }  (after fix)
  - fetch should NOT be called

url change resets loading:
  - url changes → loading = true immediately before new fetch resolves

Cancellation (stale request):
  - url changes before first fetch resolves → stale data never applied to state
```

### Priority 3 — API Route Validation (mock DB)

#### `src/__tests__/api/timeline.test.ts`

Mock `@/lib/db` with `jest.mock`. Use Next.js `NextRequest` directly (no server needed).

```
Validation — metric:
  - metric = 'bad_field'  → 400 { error: 'Invalid metric' }
  - metric = 'achieved_rate' (valid) → 200

Validation — groupBy:
  - groupBy = 'hacker'    → 400 { error: 'Invalid groupBy' }
  - groupBy = 'ethnicity' (valid) → 200

Validation — level (after fix):
  - level = 'abc'  → 400 { error: 'Invalid level' }
  - level = '1'    → 200

Validation — yearFrom/yearTo (after fix):
  - yearFrom = 'nope' → 400

Happy path:
  - valid params, mock DB returns [] → 200 { data: [], metric: 'achieved_rate', groupBy: 'national' }

DB failure:
  - mock DB throws → 500 { error: 'Database error' }
```

---

## Implementation Order

```
Step 1 — Apply code fixes (WARNING severity first)
  palette.ts:          NaN guards in choroplethColour, fmtRate, fmtCount
  useNzqaData.ts:      null-url state reset + error type narrowing
  timeline/route.ts:   parseInt NaN guard for level/yearFrom/yearTo + console.error in catch
  db/index.ts:         remove WAL pragma
  audio/index.ts:      onended cleanup + catch comments
  nzqa-strings.ts:     null-rate guard in tooltip function

  Verify: npx tsc --noEmit && npm run lint

Step 2 — palette.test.ts (pure functions, no mocks)
  Run: npm test -- --testPathPattern=palette

Step 3 — nzqa-strings.test.ts (pure, no mocks)
  Run: npm test -- --testPathPattern=nzqa-strings

Step 4 — useNzqaData.test.tsx (jest.spyOn fetch mock)
  Run: npm test -- --testPathPattern=useNzqaData

Step 5 — timeline.test.ts (jest.mock @/lib/db)
  Run: npm test -- --testPathPattern=timeline

Step 6 — Full suite
  npm test
  npm run lint
  npx tsc --noEmit
  Confirm all green before done.
```

---

## Skills Available
- `code-reviewer` — referenced for this review
- `nextjs-ssr` — Next.js App Router patterns if needed
- No dedicated Jest skill exists in the official Anthropic marketplace — standard Jest patterns apply

## Completion Promise

Output `<promise>TESTS AND FIXES COMPLETE</promise>` when ALL of the following are true:
- All WARNING-severity issues are fixed in source files
- All INFO-severity issues are fixed where trivial
- All 4 new test files exist and pass individually
- `npm test` exits 0 with no failures
- `npm run lint` exits 0
- `npx tsc --noEmit` exits 0

---

## Out of Scope — Do NOT Touch
- D3 chart components (TimelineExplorer, EquityGapVisualizer, RegionalMap, ComparisonDashboard)
- Three.js / R3F components (AchievementLandscape)
- Playwright e2e and visual regression tests
- Database seeding script (src/scripts/seed-nzqa.ts)
- Page-level components (app/page.tsx, app/nzqa-maths/page.tsx)
- Any feature work or new visualisations
