## Task: Build NZ Maths Achievement Data Explorer

Add a new feature to the existing Mazmatics Stats Playground: an interactive exploration of New Zealand secondary school mathematics achievement data sourced from NZQA.

Read the CLAUDE.md and .claude/SUMMARY.md first. Read the relevant .claude/skills/ SKILL.md files (d3-visualization, threejs-viz, nextjs-ssr, frontend-design, ui-ux-pro-max, nzqa-data-research) before writing any code.

---

## STATUS (as of 2026-03-16)

**Phase 1 (Data Pipeline): ✅ COMPLETE**
**Phase 2 (Visualisations): ✅ COMPLETE — all 5 charts rendering with data**
**Phase 3 (Narrative & Polish): ✅ COMPLETE**
**Phase 4 (Bug Fixes & Browser Testing): ✅ COMPLETE**

**Phase 5 (Testing): 🔄 IN PROGRESS — next priority**

---

## Phase 5: Testing (Next Priority)

### 5a. Visual Verification
Run `npx playwright test e2e/diagnostic2.spec.ts --project=chromium --reporter=list` and check screenshots in `e2e/screenshots/` for:
- [ ] ComparisonDashboard heatmap shows data (year × group cells are coloured)
- [ ] RegionalMap choropleth shows varying colours across NZ regions
- [ ] EquityGapVisualizer shows all 5 ethnicity lines including Māori
- [ ] AchievementLandscape 3D bars are correct height and coloured by group
- [ ] TimelineExplorer shows 3 level lines clearly

### 5b. Unit Tests
Add to `src/__tests__/`:
- `lib/palette.test.ts` — `choroplethColour()`, `fmtRate()`, `fmtCount()`
- `lib/audio.test.ts` — mock AudioContext, test that functions don't throw
- `api/subjects.test.ts` — test query building with null/non-null params
- `api/timeline.test.ts` — test groupBy modes, metric validation

### 5c. Visual Regression Tests
Add to `e2e/visual/`:
- `nzqa-maths.visual.spec.ts` — snapshot each chart section
- Update snapshots: `npx playwright test --config=playwright.visual.config.ts --update-snapshots`

### 5d. E2E Interaction Tests
Add to `e2e/`:
- `nzqa-maths.spec.ts`:
  - Level toggle changes chart (Timeline, EquityGap)
  - Region click shows drilldown panel (RegionalMap)
  - GroupBy dropdown changes heatmap rows (ComparisonDashboard)
  - 3D landscape level buttons switch data

---

## Phase 1: Data Acquisition & Storage (COMPLETE)

### What Was Built
- `src/data/raw/nzqa/` — 38 CSV files (30 × 2024 + 8 × 2018)
- `src/data/nzqa.db` — SQLite database, seeded with 18,532 rows total
- `src/scripts/seed-nzqa.ts` — CSV parser, run: `npx tsx src/scripts/seed-nzqa.ts`
- `src/lib/db/index.ts` — `getDb()` singleton, TypeScript row types
- `next.config.ts` — `serverExternalPackages: ["better-sqlite3"]`

### API Routes
- `GET /api/nzqa/subjects` — filter by year, level, ethnicity, gender, equityGroup, region; `?param=null` = IS NULL
- `GET /api/nzqa/timeline` — groupBy national/ethnicity/equity_index_group/region/gender, returns time series

### CRITICAL: Data Structure
NZQA CSVs are NOT cross-tabulated. Each breakdown is a separate file with only ONE non-null dimension per row:
- National rows: all dimension columns NULL
- Ethnicity rows: only `ethnicity` non-null
- Gender rows: only `gender` non-null
- Region rows: only `region` non-null
- Equity rows: only `equity_index_group` non-null

**No row has two non-null dimension columns.** Do not design visualisations requiring cross-tabulation.

### Macron Fix Required After Re-seeding
After any `npx tsx src/scripts/seed-nzqa.ts` run, the CSV source files have `M?ori` (macron lost during download). Run this fix:
```js
const db = new Database('src/data/nzqa.db');
db.prepare("UPDATE subject_attainment SET ethnicity = REPLACE(ethnicity, 'M?ori', 'Māori') WHERE ethnicity LIKE '%M?ori%'").run();
db.close();
```

---

## Phase 2: Visualisations (COMPLETE)

### Components
1. `src/components/charts/TimelineExplorer.tsx` — D3 animated line/area, NCEA level toggle (null=all, 1, 2, 3)
2. `src/components/charts/EquityGapVisualizer.tsx` — D3 multi-line by ethnicity/equity, highlight on click, label collision avoidance
3. `src/components/charts/RegionalMap.tsx` — D3 choropleth TopoJSON, clickable regions show L1/L2/L3 drilldown
4. `src/components/three/AchievementLandscape.tsx` — R3F 3D bars (geometry height=1, scale.y=achievement*5)
5. `src/components/charts/ComparisonDashboard.tsx` — D3 heatmap, year × group from timeline API

### Dynamic Import Wrapper
`src/app/nzqa-maths/NzqaMathsClient.tsx` — `'use client'` wrapper with `ssr: false` for all 5 components (required because Next.js 15 forbids `ssr: false` in Server Components)

### Page
`src/app/nzqa-maths/page.tsx` — Server Component, imports from NzqaMathsClient, graph-paper background, gradient headings, stat cards

---

## Phase 3: Narrative & Polish (COMPLETE)

All narrative sections present in `page.tsx` with:
- 5 sections with `GradientHeading` components
- Contextual narrative text between each chart
- `SectionDivider` between sections
- `StatCard` row in hero (10 yrs, 16 regions, 5 ethnic groups, 3 NCEA levels)
- Sticky nav with back-to-home link

---

## Phase 4: Bug Fixes (COMPLETE — 2026-03-16)

See `.claude/SUMMARY.md` Session 3 for full details. Key fixes:
- Upgraded `@react-three/fiber` 8.x → 9.5.0 and `@react-three/drei` 9.x → 10.7.7 (React 19 compat)
- Upgraded `@playwright/test` 1.40.1 → 1.58.2 (macOS Sequoia compatibility)
- Fixed Māori macron in DB
- Fixed AchievementLandscape bar geometry (was quadratically tall)
- Fixed EquityGapVisualizer label overlap (collision avoidance)
- Fixed RegionalMap drilldown (changed from empty ethnicity breakdown to L1/L2/L3 breakdown)
- Redesigned ComparisonDashboard (year × group from timeline API instead of broken cross-tabulation)

---

## Original Phase 1–3 Spec (for reference)

### Phase 1: Data Acquisition & Storage (original spec)
[See original plan for CSV download URLs and DB schema]

### Phase 2: Visualization Specs
Build these visualizations in `src/components/charts/` and `src/components/three/`:

1. **TimelineExplorer** (D3) — Animated line/area chart of maths achievement rates ~2009–2024. Toggle NCEA levels. Smooth `.join()` transitions. Hover tooltips. Use `viewBox` for responsiveness.

2. **EquityGapVisualizer** (D3) — Overlaid charts comparing achievement by ethnicity and equity index group. Show Māori, Pacific, Asian, European, MELAA. Make disparities visually clear.

3. **RegionalMap** (D3 + TopoJSON) — NZ map coloured by regional maths achievement. Clickable regions for drill-down.

4. **AchievementLandscape** (Three.js/R3F) — 3D terrain: height = achievement rate, x-axis = time, z-axis = ethnicity. OrbitControls.

5. **ComparisonDashboard** (D3) — Heatmap: year × group dimension cross-tabulation.

### Phase 3: Narrative & Polish
Guided narrative sections between visualizations. Dark mode, responsive, animated, error boundaries, loading skeletons.
