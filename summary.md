# Session Summary

## Current Project State (as of 2026-03-17)

### What's been built — complete picture

#### `/nzqa-maths` — Core Explorer (7 charts, all rendering, all tested)

| Chart | File | Notes |
|---|---|---|
| TimelineExplorer | `src/components/charts/TimelineExplorer.tsx` | Metric + year range + groupBy + series toggle |
| GradeStackChart | `src/components/charts/GradeStackChart.tsx` | NEW Phase 7 — stacked grade bands over time |
| DeltaChart | `src/components/charts/DeltaChart.tsx` | NEW Phase 7 — year-on-year fail rate change |
| EquityGapVisualizer | `src/components/charts/EquityGapVisualizer.tsx` | Default metric fixed to fail rate |
| RegionalMap | `src/components/charts/RegionalMap.tsx` | Bug fixed + year/metric/ranking enhancements |
| AchievementLandscape (3D) | `src/components/three/AchievementLandscape.tsx` | Three.js/R3F |
| ComparisonDashboard | `src/components/charts/ComparisonDashboard.tsx` | Heatmap |

Page: `src/app/nzqa-maths/page.tsx` — 7 sections
Client wrapper: `src/app/nzqa-maths/NzqaMathsClient.tsx` — all chart dynamic imports

#### Creative Pages (Phase 6 — previous sessions)
- `/nzqa-creative` — BumpChart, SlopeChart, StreamGraph
- `/nzqa-stories` — WaffleGrid, BeeswarmChart, SmallMultiplesChart
- `/nzqa-patterns` — RidgelinePlot, HorizonChart, BubbleComparison

---

### Phase 7 Changes — COMPLETE

#### BUG-1 — RegionalMap (was silently broken)
**Root cause:** `subjects` API called with `region=null` string → adds `region IS NULL` to SQL → returns national rows only → `regionRates` map always empty → all regions render the same blank colour.
**Fix:** Switched to `/api/nzqa/timeline?groupBy=region` (purpose-built for grouped regional data). Also switched default metric from `achieved_rate` to `not_achieved_rate`.

#### Metric correction (all charts)
`achieved_rate` = Achieved-grade-only band (NOT overall pass). Asian students appear "worst" on achieved_rate because they mostly earn Merit/Excellence instead. Fixed across all components:
- Default metric: `not_achieved_rate` (fail rate)
- Computed metrics (client-side): `pass_rate = 1 − not_achieved_rate`, `merit_excellence = merit_rate + excellence_rate`
- "Achieved only ⚠️" option retained with warning callout

#### TimelineExplorer — full rebuild (473 lines)
- Metric selector: Fail rate | Pass rate | Merit + Excellence | Achieved only ⚠️
- Year range: `yearFrom` / `yearTo` dropdowns (default 2015–2024). Equity mode auto-clamps to 2019.
- GroupBy: National | By ethnicity | Māori/non-Māori | By equity | By region | By gender
- Māori/non-Māori: client-side computed — non-Māori = `assessed_count`-weighted average of all other ethnic groups per year+level
- Series toggle: click legend items to fade/hide lines (0.15 opacity — keeps axis stable)
- Annotation dashed verticals: 2020 (COVID), 2023 (equity reform), 2024 (NCEA reform)

#### GradeStackChart — new component
- 4 parallel API fetches (`not_achieved_rate`, `achieved_rate`, `merit_rate`, `excellence_rate`)
- D3 `stack()` with `stackOrderNone`/`stackOffsetNone`; colours NA=#ef4444, Ach=#f59e0b, Merit=#6366f1, Excellence=#10b981
- Controls: level (L1/L2/L3), group mode (National/Ethnicity/Equity/Gender), specific group dropdown
- Hover tooltip, annotation lines at 2020 and 2024
- Equity group display labels: "Fewer resources (equiv. low decile)" etc.

#### DeltaChart — new component
- YoY delta: `delta = -(curr.value - prev.value)` — positive = improvement (fail rate fell)
- Diverging bars: green (improved) / red (regressed). D3 `scaleBand` for years, nested `scaleBand` for groups
- GroupBy: National | By ethnicity | By equity | By gender
- Annotations at 2020 (COVID leniency) and 2024 (NCEA reform)

#### RegionalMap enhancements
- Year selector (2015–2024), metric toggle (Fail/Pass/Merit+Excellence), level selector
- Region ranking panel: all regions sorted by metric with inline bars; click to select on map
- Drilldown: stacked grade band bar per level (NA/Achieved/Merit/Excellence) with percentage labels
- Secondary API fetch for merit+excellence (uses timeline merit_rate + excellence_rate)

#### Labels, narratives, display names
- `European` → `NZ European / Pākehā` in all display contexts (DB value unchanged)
- Equity group labels: "Fewer resources (equiv. low decile)", "Moderate resources", "More resources (equiv. high decile)"
- Timeline + equity section narratives corrected: now describe fail rates accurately

---

### Test Coverage — COMPLETE

**All tests green as of 2026-03-17.**

```
npm test            → 87 unit tests passing
npm run test:e2e    → 65 e2e tests passing (chromium, ~1.4 min)
npm run test:visual → 5 visual snapshot tests passing
tsc --noEmit        → clean
npm run lint        → clean
```

#### Unit tests
| File | Tests |
|---|---|
| `src/__tests__/nzqa-strings.test.ts` | 14 — narrative accuracy, equity groups, display names |
| `src/__tests__/api/subjects.test.ts` | 15 — SQL shape, null params, error handling |
| `src/__tests__/lib/metricComputation.test.ts` | 23 — pass rate, merit+exc, weighted mean, grade band sums |
| `src/__tests__/api/timeline.test.ts` | ✅ (earlier sessions) |
| `src/__tests__/palette.test.ts` | ✅ (earlier sessions) |
| `src/__tests__/hooks/useNzqaData.test.tsx` | ✅ (earlier sessions) |

#### E2e test files
| File | Tests | Covers |
|---|---|---|
| `e2e/nzqa-maths.spec.ts` | 36 | All Phase 7 charts + API endpoints |
| `e2e/creative-pages.spec.ts` | 23 | Creative pages + nav cards |
| `e2e/diagnostic.spec.ts` | 5 | Smoke: page load, API health, scroll screenshots |
| `e2e/landing.spec.ts` | 2 | Home heading + title |
| `e2e/visual/*.spec.ts` | 5 | Snapshot regression (visual config only) |

#### Test architecture
```
npm run test:e2e    → playwright.config.ts → chromium only, testIgnore: **/visual/**
npm run test:visual → playwright.visual.config.ts → chromium, visual dir only
```
Visual tests excluded from main suite — they use a different snapshot directory and would produce false failures if run under the wrong config.

#### Key patterns (see e2e-testing skill + e2e-learnings.md for full detail)
- `/nzqa-maths` has 10+ parallel API fetches → needs `test.setTimeout(90000)` + `waitForLoadState('networkidle', { timeout: 75000 })`
- Click → state assertions need `{ timeout: 5000 }` to survive parallel test load
- SVG count at initial load = `>= 3` (below-fold charts lazy-render on scroll)
- API tests use `{ request }` fixture (real dev server, no mocks)
- If subjects API returns plain "Internal Server Error": corrupted webpack cache → restart dev server

---

### Earlier Test Coverage (Previous Sessions)

| Area | Type | Status |
|---|---|---|
| `src/lib/palette.ts` | Jest unit | ✅ |
| `src/lib/hooks/useNzqaData.ts` | Jest unit | ✅ |
| `src/app/api/nzqa/timeline/route.ts` | Jest integration | ✅ |
| Home page | Playwright visual snapshot | ✅ |
| Creative pages | Playwright visual snapshot | ✅ |

---

### API Quick Reference

```
GET /api/nzqa/timeline
  ?metric=not_achieved_rate    ← not_achieved_rate | achieved_rate | merit_rate | excellence_rate
  &groupBy=national            ← national | ethnicity | equity_index_group | region | gender
  &level=1                     ← 1 | 2 | 3
  &yearFrom=2015 &yearTo=2024
  → { data: [...], metric, groupBy }
  national: { year, level, value, assessed_count }
  grouped:  { year, level, group_label, value, assessed_count }

GET /api/nzqa/subjects
  ?year=2024 &level=1 &region=Auckland &ethnicity=null &gender=null &equityGroup=null
  → { data: SubjectRow[], count }
  ⚠️  param=null (string) → adds IS NULL to SQL
  ⚠️  DO NOT use subjects API for regional data — use timeline?groupBy=region
```

---

### Known Constraints (do not forget)

- **No cross-tabulation** — NZQA data is single-dimensional. Never filter by both ethnicity AND region.
- **`achieved_rate` ≠ pass rate** — Achieved-grade-only band. Pass rate = `1 - not_achieved_rate`.
- **Regional data** — use `/api/nzqa/timeline?groupBy=region`. Never subjects API with `region=null`.
- **Equity data** — only available 2019–2024. Always show a note when equity groupBy is active.
- **`assessed_count`** — use as weight when computing non-Māori or any weighted average across groups.
- **`ssr: false` mandatory** — all D3/Three.js imports in `'use client'` wrappers with dynamic import.
- **Bubble radius** — `scaleSqrt` (area-proportional), never `scaleLinear`.
- **Beeswarm force** — run simulation synchronously (`.stop()` + loop), not async.
- **TopoJSON** — object key `regions`, feature property `REGC_name` (has " Region" suffix). NZQA names have no suffix — use `NZQA_TO_TOPOJSON` dict in `RegionalMap.tsx`.
- **RegionalMap Manawatu** — DB has `Manawatu-Whanganui` (no macron), TopoJSON has `Manawatū-Whanganui Region`.
- **Stream graph** — fill missing year×group combos with `0` before `d3.stack()`.

---

### What's Next (future sessions)

**P5 — Untapped DB tables** (new pages/sections):
- `scholarship` table — who gets NZ's highest academic award by ethnicity/equity/region
- `qualification_endorsement` table — Merit/Excellence for full NCEA qualifications
- `literacy_numeracy` table — co-attainment of literacy/numeracy co-requisite

**P6 — Correlation ideas** (all feasible with single-dimension data):
- Gender gap by level (does gap widen at L2/L3?)
- Level progression (national pass rate thinning at L2/L3 over time)
- Regional variance / most volatile regions post-2024 reform
- Equity × level interaction
- Scholarship by ethnicity (who attempts vs who succeeds)
