# Session Summary

## Current Project State (as of 2026-03-19, updated Phase 16)

### Phase 16 — Supabase Migration — COMPLETE (2026-03-19)

**Goal:** Replace SQLite (`better-sqlite3`) with Supabase Postgres. App was returning 500 errors on Vercel due to SQLite WAL files and serverless incompatibility.

**What changed:**
- `postgres` npm package added; `better-sqlite3` moved to devDependencies (seed script only)
- `src/lib/db/index.ts` — rewritten with postgres client; prefers `MZMS__POSTGRES_URL_NON_POOLING` (port 5432 direct) over `MZMS__POSTGRES_URL` (port 6543 PgBouncer — hangs in local dev)
- `src/lib/db/primary.ts` — re-exports `getDb` as `getPrimaryDb`
- All 10 API routes (7 NZQA + 3 primary) converted to async, `sql.unsafe(queryStr, params)`, positional `$1`/`$2` params
- `next.config.ts` cleaned — removed `serverExternalPackages`, `outputFileTracingIncludes`
- `src/data/schema.sql` — Postgres DDL for all 9 tables
- `src/scripts/seed-supabase.ts` — reads local SQLite, bulk-inserts to Supabase in batches of 500
- `.npmrc` — `legacy-peer-deps=true` for Vercel build compatibility
- `.env.local.example` — documents all required env vars
- Unit tests: all 5 test files updated to `mockUnsafe` pattern; `@testing-library/dom` installed fixing 2 pre-existing failures → **175/175 passing**
- e2e tests: `nzqa-maths.spec.ts` updated for Supabase timing (selector-based waits, 90s timeouts) → **36/36 passing**

**Env vars (set via Vercel Marketplace integration, pulled via `vercel env pull`):**
- `MZMS__POSTGRES_URL_NON_POOLING` — direct connection (preferred, used by app + seed)
- `MZMS__POSTGRES_URL` — PgBouncer pooled (fallback, works on Vercel production)
- `MZMS__POSTGRES_URL` contains port 6543 — DO NOT use as primary in local dev (hangs)

**One-time setup (already done):**
1. `src/data/schema.sql` run in Supabase SQL editor ✅
2. `npm run seed:supabase` run — all 9 tables populated ✅
3. Data seeded from local SQLite files (`src/data/nzqa.db`, `src/data/primary.db`)

**If DB needs to be re-seeded:** `npm run seed:supabase` (reads from local SQLite, truncates + re-inserts)
**If Supabase project is paused (free tier):** See `restarting-the-db.md`

**Branches:** all work on `db-fixes` branch, ready to merge to `master`

---

### `/about` — About Page (Phase 15 — NEW)

**Route:** `src/app/about/page.tsx` — Server Component, fully static, no client JS
**Purpose:** Introduces Maz, the Mazmatics book, and the purpose of this data site. Bridges the playful kids-book brand with the adult-focused data journalism aesthetic.

**Sections:**
1. **Hero** — gradient h1, subheading, graph-paper grid background texture, animated diagonal stripe SVG decoration (CSS keyframe, respects `prefers-reduced-motion`)
2. **Stat cards** — 3-column grid: Wellington NZ / Two kids / Web developer; `#BA90FF` left-border accent
3. **Where it all started** — book description, 2-column layout with offset colour-block shadow placeholder, external link to `mazmatics.com/get-the-book`
4. **From a story book to a data story** — why this site exists, honest and warm NZ English
5. **The data behind the charts** — 2×2 source card grid (NZQA, TIMSS, NMSSA, Curriculum Insights), link to `/data-sources`
6. **Get in touch** — email/Instagram/Facebook with inline SVG icons

**Brand elements applied:**
- Gradient text (`linear-gradient(to left, #BA90FF, #47A5F1)`) on all headings
- Offset colour-block shadow (`#BA90FF 12px 12px, #47A5F1 -12px -12px`) on book card
- Graph-paper grid background (faint purple lines, 32px × 32px) in hero
- Animated diagonal stripe SVG decorations

**Home page:** "About Mazmatics" nav card added to `navCards` array
**Tests:** `e2e/about.spec.ts` — 14 tests, all passing
**Final test count: 204/204 e2e, 175/175 unit — all green**

---

### `/data-sources` — Data Sources & Methodology Page (Phase 14)

**Route:** `src/app/data-sources/page.tsx` — Server Component, fully static, no client JS
**Purpose:** Documents all 4 data sources used across the app with deep-link anchors, publisher metadata, caveats, and external links.

| Anchor | Source | Used on |
|---|---|---|
| `#source-nzqa` | NZQA Secondary School Statistics 2015–2024 | `/nzqa-maths`, `/nzqa-scholarship` |
| `#source-timss` | TIMSS International Maths Study 1995–2023 | `/primary-maths` |
| `#source-nmssa` | NMSSA Reports 19 (2018) + 30 (2022) | `/primary-maths` |
| `#source-curriculum-insights` | Curriculum Insights Dashboard 2023–2024 | `/primary-maths` |

**Links added to existing pages:**
- `/nzqa-maths` footer: "About this data ↗" → `#source-nzqa` + "Data sources & methodology →"
- `/nzqa-scholarship` footer: "About this data ↗" → `#source-nzqa` + "Data sources & methodology →"
- `/primary-maths` footer: 3 separate "About this data ↗" links (TIMSS / NMSSA / Curriculum Insights) + "Data sources & methodology →"
- Home page: "View data sources →" utility link

**Tests:** `e2e/data-sources.spec.ts` — 9 tests (page load, headings, anchors, external link attrs, cross-page links)
**Final test count: 190/190 e2e, 175/175 unit — all green**

---

### What's been built — complete picture

#### `/nzqa-scholarship` — Scholarship Explorer (Phase 10 — NEW)

| Chart | File | Notes |
|---|---|---|
| ScholarshipTrendChart | `src/components/charts/ScholarshipTrendChart.tsx` | D3 stacked area (national) + multi-line (ethnicity/gender); subject toggle; hover tooltip |
| ScholarshipBreakdownChart | `src/components/charts/ScholarshipBreakdownChart.tsx` | Horizontal stacked bar — Outstanding/Scholarship/No Award; groupBy ethnicity/equity/gender/region; year selector |

Page: `src/app/nzqa-scholarship/page.tsx` — hero + 2 chart sections + data notes
Client wrapper: `src/app/nzqa-scholarship/NzqaScholarshipClient.tsx` — dynamic imports (ssr: false)

**API route:** `GET /api/nzqa/scholarship?subject=Calculus|Statistics&groupBy=national|ethnicity|equity_index_group|region|gender&yearFrom=&yearTo=`
- Returns `{ data, subject, groupBy }` — always returns outstanding_rate, scholarship_rate, no_award_rate, total_assessed
- Equity data available 2019–2024 only
- Allowlist-validated subject + groupBy; parameterised SQL

**Data notes (scholarship-specific):**
- `scholarship` table: 7678 rows, 38 subjects, 2015–2024
- Maths subjects: `Calculus` (~1169–1345 assessed/yr) and `Statistics` (~739–980 assessed/yr)
- Ethnicity column has `Maori` without macron (DB value) — display-side mapping in chart components
- Equity `More` group has very small n in maths (6–19 students) — data unreliable, noted in UI
- `outstanding_rate + scholarship_rate = award_rate` (both are passing awards)

**Landing page:** `src/app/page.tsx` — scholarship nav card added (3rd card)
**Tests:** `e2e/nzqa-scholarship.spec.ts` — 24 tests (API health × 9, page load × 5, chart controls × 10) — all passing

---

#### `/primary-maths` — Primary School Maths Feature (Phase 8 + 13)

| Chart | File | Notes |
|---|---|---|
| TIMSSTrendChart | `src/components/charts/TIMSSTrendChart.tsx` | D3 line — NZ 1995–2023 TIMSS, AUS/ENG context, gender toggle |
| TIMSSWorldRanking | `src/components/charts/TIMSSWorldRanking.tsx` | Horizontal bar — 21 countries, NZ highlighted, intl avg line |
| NMSSAEquityGaps | `src/components/charts/NMSSAEquityGaps.tsx` | Grouped bar — Y4 vs Y8, ethnicity/decile/gender, CI error bars |
| NMSSATrendChart | `src/components/charts/NMSSATrendChart.tsx` | Connected dot/line — 3 NMSSA cycles (2013/2018/2022), CI error bars, all breakdowns |
| CurriculumInsightsPipeline | `src/components/charts/CurriculumInsightsPipeline.tsx` | Stacked bar — % meeting/behind at Y3/Y6/Y8, 2023 vs 2024 toggle |

Page: `src/app/primary-maths/page.tsx` — 4 sections + hero + cross-link to secondary
Client wrapper: `src/app/primary-maths/PrimaryMathsClient.tsx` — all chart dynamic imports (ssr: false)

**Database:** `src/data/primary.db` — seeded via `scripts/seed-primary.ts`
```
timss_nz_yr5 (21 rows) — NZ Year 5 TIMSS scores 1995–2023 by national/gender
timss_intl_2023 (21 rows) — 2023 international country comparison
nmssa_maths (20 rows) — NMSSA 2022 Y4+Y8 mean scale scores by ethnicity/decile/gender
curriculum_insights_maths (6 rows) — 2023+2024 % meeting benchmarks at Y3/Y6/Y8
```

**DB accessor:** `src/lib/db/primary.ts` — `getPrimaryDb()` + typed row interfaces

**API routes:**
```
GET /api/primary/timss?type=trend|intl
GET /api/primary/nmssa?yearLevel=4|8|all&groupType=all|national|gender|ethnicity|decile
GET /api/primary/curriculum-insights
```

**Landing page:** `src/app/page.tsx` — primary-maths nav card added (first card)

**Tests:** 26 e2e tests (`e2e/primary-maths.spec.ts`). tsc + lint clean. All APIs verified.

---

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

### Phase 13 — NMSSA Trend Chart (2026-03-18, COMPLETE)

Added `NMSSATrendChart` to `/primary-maths`. Shows Y4 and Y8 mean scale scores across 3 cycles (2013, 2018, 2022) with 95% CI error bars, Year level toggle, and National/Ethnicity/Gender/Decile grouping.

- `nmssa_maths` table expanded from 20 → 60 rows (2013 + 2018 data seeded)
- 2013 reconstructed on 2018 MS scale via linking exercise (NMSSA Report 19)
- New chart: `src/components/charts/NMSSATrendChart.tsx`
- New unit tests: `src/__tests__/api/nmssa.test.ts` (20 tests)
- Extended: `e2e/primary-maths.spec.ts` (+11 tests, now 40 total)

---

### Test Coverage — current as of Phase 13

```
npm test            → 175 unit tests passing
npm run test:e2e    → 179/181 e2e passing (2 pre-existing failures, chromium, ~5 min)
npm run test:visual → 5 visual snapshot tests passing
tsc --noEmit        → clean
npm run lint        → clean
```

Pre-existing e2e failures (not Phase 13):
- `e2e/creative-pages.spec.ts` `/nzqa-patterns` networkidle timeout (needs setTimeout bump)
- `e2e/diagnostic.spec.ts` timeline API 500 for `metric=not_achieved_rate&groupBy=ethnicity&level=1`
See `test-todo.md` for details and fix instructions.

#### Unit tests
| File | Tests |
|---|---|
| `src/__tests__/nzqa-strings.test.ts` | 14 — narrative accuracy, equity groups, display names |
| `src/__tests__/api/subjects.test.ts` | 15 — SQL shape, null params, error handling |
| `src/__tests__/lib/metricComputation.test.ts` | 23 — pass rate, merit+exc, weighted mean, grade band sums |
| `src/__tests__/api/nmssa.test.ts` | 20 — yearLevel/groupType validation, multi-year response, DB failure |
| `src/__tests__/api/timeline.test.ts` | ✅ (earlier sessions) |
| `src/__tests__/palette.test.ts` | ✅ (earlier sessions) |
| `src/__tests__/hooks/useNzqaData.test.tsx` | ✅ (earlier sessions) |

#### E2e test files
| File | Tests | Covers |
|---|---|---|
| `e2e/nzqa-maths.spec.ts` | 36 | All Phase 7 charts + API endpoints |
| `e2e/creative-pages.spec.ts` | 23 | Creative pages + nav cards |
| `e2e/primary-maths.spec.ts` | 40 | Phase 8+13 charts + API endpoints |
| `e2e/nzqa-scholarship.spec.ts` | 24 | Phase 10 scholarship API + page + chart controls |
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

GET /api/nzqa/scholarship
  ?subject=Calculus          ← Calculus | Statistics (default: Calculus)
  &groupBy=national          ← national | ethnicity | equity_index_group | region | gender
  &yearFrom=2015 &yearTo=2024
  → { data: [...], subject, groupBy }
  national: { year, outstanding_rate, scholarship_rate, no_award_rate, total_assessed }
  grouped:  { year, group_label, outstanding_rate, scholarship_rate, no_award_rate, total_assessed }
  ⚠️  Equity data only 2019–2024. Scholarship table has 'Maori' without macron (display-side fix).
  ⚠️  award_rate = outstanding_rate + scholarship_rate (computed client-side)
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

### Colour Palette — current (updated Phase 17.5)

| Group | Colour | Hex |
|---|---|---|
| Boys / Male | Brand purple | `#BA90FF` |
| Girls / Female | Brand yellow | `#FFF73E` |
| Māori | Red (culturally significant) | `#E53E3E` |
| All Students | Brand purple | `#BA90FF` |
| Pacific Peoples | Golden yellow | `#CCBB44` |
| Asian | Sky blue | `#66CCEE` |
| NZ European / Pākehā | Solid blue | `#4477AA` |

GenderNote component (`src/components/charts/GenderNote.tsx`) renders a rainbow SVG + disclaimer on all charts when gender view is active.

---

### What's Next (future sessions)

**Phase 18 (next):** Social media videos — 5 × `.webm` Reels-style clips using Playwright video recording at 390×844 mobile viewport. Full spec in `prompt.md`. Run with `/ralph-loop --max-iterations 8 --completion-promise "SOCIAL_VIDEOS_COMPLETE"`.

**Phase 15 onwards (Track B — remaining NZQA untapped tables):**
- `/nzqa-endorsement` — `qualification_endorsement` table (Merit/Excellence for full NCEA qualifications)
- `/nzqa-literacy` — `literacy_numeracy` table (co-attainment of literacy/numeracy co-requisite)

**P6 — Correlation ideas** (all feasible with single-dimension data):
- Gender gap by level (does gap widen at L2/L3?)
- Level progression (national pass rate thinning at L2/L3 over time)
- Regional variance / most volatile regions post-2024 reform
- Equity × level interaction
