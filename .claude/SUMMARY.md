# Project Session Log

## Session 1 — 2026-03-15: Project Scaffolding

### Goal
Set up "Mazmatics math stats playground" as a Next.js project with interactive data visualisation using D3, Three.js, and related technologies.

### What Was Done
- Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + D3.js v7 + Three.js/R3F scaffolded
- 7 Claude skills created in `.claude/skills/`
- `CLAUDE.md` created at project root
- npm registry was blocked in sandbox — Maz ran `npm install` locally

---

## Session 2 — 2026-03-15: NZ Maths Achievement Data Explorer (Build)

### Goal
Build the complete NZQA Data Explorer feature at `/nzqa-maths`.

### Data Pipeline
- `src/data/raw/nzqa/` — 38 CSV files (30 × 2024 + 8 × 2018)
- `src/data/nzqa.db` — SQLite: 834 subject rows (Maths, 2015–2024), 4536 qual, 2268 lit/num, 7678 scholarship, 3216 endorsement
- `src/scripts/seed-nzqa.ts` — run with `npx tsx src/scripts/seed-nzqa.ts`
- 6 API routes at `/api/nzqa/` (subjects, qualifications, literacy-numeracy, scholarship, endorsements, timeline)
- `next.config.ts` — `serverExternalPackages: ["better-sqlite3"]`

### Visualisations Built
1. `TimelineExplorer` — D3 animated line/area, NCEA level toggle, audio on hover
2. `EquityGapVisualizer` — D3 multi-line by ethnicity/equity, highlight on click
3. `RegionalMap` — D3 choropleth TopoJSON, drilldown by region
4. `AchievementLandscape` — Three.js/R3F 3D bar landscape (year × ethnicity × height)
5. `ComparisonDashboard` — D3 heatmap

### Audio
- `src/lib/audio/index.ts` — Web Audio API, pentatonic scale tones mapped to achievement values
- `playHoverTone()`, `playSelectChord()`, `playTransitionSweep()`

### Key Fixes Applied This Session
- Tailwind updated 4.0.0 → 4.2.1 (ScannerOptions negated error)
- `jest.config.ts`: `setupFilesAfterSetup` → `setupFilesAfterEnv`
- `tsconfig.json`: disabled `noUncheckedIndexedAccess` and `noPropertyAccessFromIndexSignature`
- R3F JSX types: `src/types/r3f.d.ts` with `declare module 'react' { namespace JSX { interface IntrinsicElements extends ThreeElements {} } }`
- `ssr: false` dynamic imports must live in Client Components — created `NzqaMathsClient.tsx`
- `ComparisonDashboard`: moved `setYDim()` from render body into `useEffect` (was causing setState-during-render error)
- `RegionalMap`: wrapped `regionRates` map in `useMemo` (was a new Map() every render, causing infinite `useCallback` loop)

---

## Session 3 — 2026-03-16: Bug Fixes, Data Fixes & Browser Testing

### Goal
Fix all runtime errors, verify page renders correctly in browser using Playwright.

### Playwright Setup
- Installed Playwright browsers: `npx playwright install chromium`
- **CRITICAL:** Playwright 1.40.1 (bundled Chromium 120) crashes with SIGSEGV on macOS Sequoia (Darwin 25.x)
- **Fix:** Upgraded `@playwright/test` to 1.58.2 and re-ran `npx playwright install chromium`
- Diagnostic test at `e2e/diagnostic.spec.ts` — run with `npx playwright test e2e/diagnostic.spec.ts --project=chromium --reporter=list`
- Screenshots saved to `e2e/screenshots/`

### Root Cause Found via Playwright
```
PAGE ERROR: Cannot read properties of undefined (reading 'ReactCurrentOwner')
```
- `@react-three/fiber` 8.x peer-requires `react >=18 <19` — crashes on React 19
- `ReactCurrentOwner` was moved/removed in React 19 internals

### React Three Fiber Upgrade
- Upgraded `@react-three/fiber` 8.17 → **9.5.0** (React 19 support)
- Upgraded `@react-three/drei` 9.117 → **10.7.7** (requires R3F 9 + React 19)
- `src/types/r3f.d.ts` still valid — import path `@react-three/fiber/dist/declarations/src/three-types` unchanged

### Data Issues Found & Fixed
1. **Māori macron corrupted in DB** — CSV source files use literal `?` where `ā` should be (encoding loss during download). Fixed with SQL UPDATE on `subject_attainment.ethnicity`: 30 rows corrected to `Māori`.

2. **AchievementLandscape bar geometry bug** — `boxGeometry args={[0.7, height*5, 0.7]}` combined with `scale.y` animating to `height` made bars quadratically tall (e.g. 45 world units for 60% achievement). Fixed: geometry → `args={[0.7, 1, 0.7]}`, position → `currentHeight.current / 2`.

3. **EquityGapVisualizer duplicate import** — `playTransitionSweep` was both statically imported AND shadowed by a local dynamic-import wrapper at the bottom of the file. Removed the local wrapper; using static import directly.

4. **EquityGapVisualizer end labels overlap** — Māori (~47.6%) and Pacific Peoples (~47.5%) in 2024 had virtually identical y-positions, causing one label to be hidden. Fixed with a pre-pass collision-avoidance algorithm (minimum 12px gap between sorted labels).

5. **RegionalMap drilldown showed no data** — NZQA data does NOT have region × ethnicity cross-tabulation. Subject attainment CSVs are single-dimension breakdowns only. Changed drilldown to show NCEA Level 1/2/3 breakdown for the selected region instead of ethnicity breakdown. URL changed from `region=X&gender=null&equityGroup=null` (with level filter) to `year=2024&region=X&ethnicity=null&gender=null&equityGroup=null` (all 3 levels).

6. **ComparisonDashboard "No data"** — Original design required cross-tabulated rows (ethnicity × equity_index_group), but no such rows exist — DB only has single-dimension per row. Redesigned to use `year × group` from the `/api/nzqa/timeline` endpoint. Now: one dropdown for groupBy (ethnicity/equity_index_group/gender/region), X-axis = year 2015–2024, Y-axis = group labels. This produces a meaningful heatmap showing how each group's achievement changed over time.

### CRITICAL DATA STRUCTURE FACT
The NZQA subject attainment CSVs are NOT cross-tabulated. Each breakdown is a separate CSV file:
- National → all dimension columns NULL
- By Ethnicity → only `ethnicity` non-null, all others NULL
- By Gender → only `gender` non-null, all others NULL
- By Region → only `region` non-null, all others NULL
- By Equity → only `equity_index_group` non-null, all others NULL

**There is NO data where two dimension columns are both non-null.** Any visualisation requiring cross-tabulation (ethnicity × region, ethnicity × equity, etc.) will return empty results.

### Current State After Session 3
- All Playwright tests pass (0 console errors, 2/2 pages render correctly)
- `e2e/diagnostic.spec.ts` — 5/5 tests pass
- `e2e/diagnostic2.spec.ts` — 1/1 test passes, 17 map region paths confirmed
- Dev server at `http://localhost:3000`
- `/nzqa-maths` fully functional with all 5 visualisations rendering

### Remaining Visual Issues (Not Yet Fixed)
- **ComparisonDashboard** — The redesigned heatmap is implemented but not yet visually verified post-fix
- **RegionalMap** — Map renders but choropleth fill may be all one colour if `subjectData` has only 1 row per level (the national aggregate); needs verification that regional rates populate correctly
- **EquityGapVisualizer** — 2024 Level 1 data shows unexpectedly high "achieved_rate" for Māori/Pacific vs European. Note: `achieved_rate` is specifically the "Achieved" NCEA grade band ONLY, NOT total pass rate (Merit + Excellence are separate). This may be correct data.

### Session 4 — 2026-03-16: Documentation & Data References

- `src/data/references.md` created — all data sources with URLs, file listings, processing pipeline, field definitions, and data caveats. Will be used to generate a `/references` web page later.
- All memory files written to `.claude/projects/.../memory/` (user_profile, feedback_responses, project_nzqa_status, project_stack_facts)
- `plan.md` updated with Phase 4 complete / Phase 5 (testing) as next priority
- `CLAUDE.md` updated with R3F v9 requirements, Playwright macOS Sequoia note, Known Issues section

### Next Steps
1. Visual verification that all 5 charts show data correctly (run `npx playwright test e2e/diagnostic2.spec.ts --project=chromium --reporter=list` and review `e2e/screenshots/`)
2. Fix any remaining empty/incorrect chart states
3. Add unit tests (`src/__tests__/lib/palette.test.ts`, `api/subjects.test.ts`, `api/timeline.test.ts`)
4. Add visual regression snapshots (`e2e/visual/nzqa-maths.visual.spec.ts`)
5. Add E2E interaction tests (level toggles, region clicks, groupBy dropdown, 3D landscape buttons)
6. Build `/references` web page from `src/data/references.md`
