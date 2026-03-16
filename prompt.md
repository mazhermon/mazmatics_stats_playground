# Creative Visualisations — Implementation Plan

## Context

This plan uses `visualisations.md` (research notes) and the `creative-dataviz` skill to create three new pages of more creative, engaging visualisations of the NZQA maths achievement data we already have access to via existing API endpoints.

**Data available:** NZQA subject attainment 2015–2024, NCEA Levels 1–3, grouped by: national, ethnicity, equity_index_group, region, gender. Single-dimensional only (no cross-tabulation).

**API endpoints to use:**
- `GET /api/nzqa/timeline?metric=achieved_rate&groupBy=region&level=2` — primary data source
- `GET /api/nzqa/timeline?metric=achieved_rate&groupBy=ethnicity&level=2`
- `GET /api/nzqa/timeline?metric=assessed_count&groupBy=region&level=2`

**Skills to consult:** `creative-dataviz` (in `.claude/skills/creative-dataviz.md`), `visualisations.md` (in project root).

---

## Three New Pages

### Page 1: `/nzqa-creative` — "Creative Views"
Route: `src/app/nzqa-creative/`

Three visualisations, each in its own section:

**1A. Bump Chart — Regional Achievement Rankings**
- Shows how NZ regions changed rank in NCEA achievement from 2015 to 2024
- Data: `groupBy=region&metric=achieved_rate`, all years, level 2
- Compute rank per year from API data in the Client Component
- Y-axis: rank (1=best); X-axis: year; each line = one region
- Smooth monotoneX curves; hover shows region name + rank
- Colour: each region gets a unique colour from a 16-colour palette

**1B. Slope Chart — Ethnic Achievement: 2015 vs 2024**
- Two vertical axes (2015 left, 2024 right); each line = one ethnicity
- Data: `groupBy=ethnicity&metric=achieved_rate&level=2&yearFrom=2015&yearTo=2024`
- Filter only 2015 and 2024 data points in the component
- Colour lines green/up if improved, red/down if declined; label both endpoints
- Shows at a glance which groups gained the most over the decade

**1C. Stream Graph — Achievement Composition Over Time**
- Smooth, organic stacked area chart centred on a wiggle baseline
- Data: `groupBy=ethnicity&metric=achieved_rate&level=2`
- D3 stack with `stackOffsetWiggle` + `stackOrderInsideOut` + `curveCatmullRom`
- Shows ebb and flow of each ethnic group's contribution to the achievement landscape
- Use ethnicity colours from `ETHNICITY_COLOURS` in `src/lib/nzqa-strings.ts`

---

### Page 2: `/nzqa-stories` — "Data Stories"
Route: `src/app/nzqa-stories/`

Three visualisations with a narrative focus:

**2A. Waffle Chart — "In Every 100 Students"**
- 10×10 grid; each filled square = 1% of students who achieved
- Data: `groupBy=ethnicity&metric=achieved_rate&level=2` — one waffle per ethnicity
- User can select year via a slider or dropdown (default: 2024)
- Text: "In every 100 Māori students sitting NCEA Level 2 Maths, **68** achieved."
- Immediately humanises the statistics

**2B. Beeswarm — All Regions on the Achievement Scale**
- Each dot = one NZ region for a selected year + level
- X-axis = achieved_rate; dots jittered vertically to avoid overlap
- Use d3-force: `forceX(xScale(d.value)).strength(1)` + `forceCollide(r+1)`
- Dot size proportional to `assessed_count` (i.e. student population)
- Hover tooltip: region name, rate, student count
- Controls: year slider, level selector (L1/L2/L3)

**2C. Small Multiples — One Chart Per Ethnicity**
- 5 small line charts (one per ethnicity group), all on the same y-scale
- Each shows achieved_rate trend 2015–2024 for NCEA Level 2
- Data: `groupBy=ethnicity&metric=achieved_rate&level=2`
- Layout: CSS Grid `grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))`
- Each chart labelled with ethnicity name; reference line at national average
- Allows honest side-by-side comparison

---

### Page 3: `/nzqa-patterns` — "Patterns & Trends"
Route: `src/app/nzqa-patterns/`

Three visualisations for pattern discovery:

**3A. Ridgeline (Joy) Plot — Achievement Distribution by Ethnicity**
- Stacked density curves; one per ethnicity group, offset vertically
- Data: `groupBy=ethnicity&metric=achieved_rate` — all years, level 2
- Each "line" is a KDE of that ethnicity's achievement rates over years
- Use Epanechnikov kernel; `area` + `curveBasis` for smooth rendering
- Curves that shift right = improving; overlapping = converging; spreading = diverging

**3B. Horizon Chart — All 16 Regions Compact**
- Shows all NZ regions' achievement trends in a compact stacked view
- Data: `groupBy=region&metric=achieved_rate&level=2`
- Each row = one region; colour bands fold negatives upward (above/below national avg)
- Achieves in 16 rows what 16 separate line charts would need for comparison
- Sort regions by most-recently highest achievement for scanability

**3C. Proportional Bubble Comparison — Regions by Population & Achievement**
- NZ regions as circles; area ∝ `assessed_count`, colour ∝ `achieved_rate`
- Data: `groupBy=region&metric=achieved_rate&level=2` + `metric=assessed_count`
- Two separate fetches, merged in component by region + year
- Use `d3.pack()` or force-directed layout for circle placement
- Color scale: `d3.interpolateRdYlGn` (red=low, green=high achievement)
- Year slider to animate through 2015–2024

---

## Navigation

Update `src/app/page.tsx` to add 3 new navigation cards (replacing the "More coming soon" button):
- **"Creative Views"** → `/nzqa-creative`
- **"Data Stories"** → `/nzqa-stories`
- **"Patterns & Trends"** → `/nzqa-patterns`

Also add a top navigation bar to the home page consistent with the nzqa-maths page style. Each new page should have a nav header with a "← Home" back link and "Mazmatics" brand link.

---

## Architecture Pattern

Each new page follows the same Server/Client split as `nzqa-maths`:

```
src/app/nzqa-creative/
  page.tsx              ← Server Component: layout, metadata, static text
  NzqaCreativeClient.tsx ← 'use client' wrapper: dynamic imports for all 3 charts

src/app/nzqa-stories/
  page.tsx
  NzqaStoriesClient.tsx

src/app/nzqa-patterns/
  page.tsx
  NzqaPatternsClient.tsx

src/components/charts/
  BumpChart.tsx         ← 'use client', useEffect + D3
  SlopeChart.tsx
  StreamGraph.tsx
  WaffleGrid.tsx
  BeeswarmChart.tsx
  SmallMultiplesChart.tsx
  RidgelinePlot.tsx
  HorizonChart.tsx
  BubbleComparison.tsx
```

All chart components must:
- Have `'use client'` directive
- Be dynamically imported with `ssr: false` in their Client wrapper
- Use `useEffect` + `useRef<SVGSVGElement>` for D3
- Use `viewBox` for responsive SVGs
- Fetch their own data using the `/api/nzqa/timeline` endpoint
- Show a loading skeleton while data loads
- Use the project's dark theme colours (slate-950 bg, slate-900 chart bg)
- Use `ETHNICITY_COLOURS` from `@/lib/nzqa-strings` for ethnicity colours

---

## Visual Regression Tests

Add `e2e/visual/creative-pages.visual.spec.ts` with snapshot tests for all 3 new pages:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Creative Pages Visual Regression', () => {
  test('nzqa-creative page matches snapshot', async ({ page }) => {
    await page.goto('/nzqa-creative');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // allow D3 animations to settle
    await expect(page).toHaveScreenshot('nzqa-creative.png', { fullPage: true });
  });

  test('nzqa-stories page matches snapshot', async ({ page }) => {
    await page.goto('/nzqa-stories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('nzqa-stories.png', { fullPage: true });
  });

  test('nzqa-patterns page matches snapshot', async ({ page }) => {
    await page.goto('/nzqa-patterns');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('nzqa-patterns.png', { fullPage: true });
  });
});
```

Run with: `npx playwright test e2e/visual/creative-pages.visual.spec.ts --config=playwright.visual.config.ts --project=chromium`

---

## Implementation Order

```
Step 1 — Update home page (src/app/page.tsx)
  Replace "More coming soon" with 3 new nav cards
  Test: dev server + manual browser check

Step 2 — Build Page 1: /nzqa-creative
  2a. Create src/app/nzqa-creative/page.tsx (Server Component, layout + nav)
  2b. Create src/app/nzqa-creative/NzqaCreativeClient.tsx (dynamic imports)
  2c. Create src/components/charts/BumpChart.tsx
  2d. Create src/components/charts/SlopeChart.tsx
  2e. Create src/components/charts/StreamGraph.tsx
  Verify: npx tsc --noEmit && npm run lint

Step 3 — Build Page 2: /nzqa-stories
  3a. Create src/app/nzqa-stories/page.tsx
  3b. Create src/app/nzqa-stories/NzqaStoriesClient.tsx
  3c. Create src/components/charts/WaffleGrid.tsx
  3d. Create src/components/charts/BeeswarmChart.tsx
  3e. Create src/components/charts/SmallMultiplesChart.tsx
  Verify: npx tsc --noEmit && npm run lint

Step 4 — Build Page 3: /nzqa-patterns
  4a. Create src/app/nzqa-patterns/page.tsx
  4b. Create src/app/nzqa-patterns/NzqaPatternsClient.tsx
  4c. Create src/components/charts/RidgelinePlot.tsx
  4d. Create src/components/charts/HorizonChart.tsx
  4e. Create src/components/charts/BubbleComparison.tsx
  Verify: npx tsc --noEmit && npm run lint

Step 5 — Visual regression tests
  5a. Create e2e/visual/creative-pages.visual.spec.ts
  5b. Run: npx playwright test e2e/visual/creative-pages.visual.spec.ts --config=playwright.visual.config.ts --project=chromium
  Note: First run creates the snapshots (updateSnapshots: 'missing' in config)

Step 6 — Final verification
  npx tsc --noEmit
  npm run lint
  npx playwright test e2e/visual/creative-pages.visual.spec.ts --config=playwright.visual.config.ts --project=chromium
  Confirm all 3 snapshot tests pass

Step 7 — Update docs
  Update visualisations.md with implementation notes (which charts worked well, gotchas)
  Update .claude/skills/creative-dataviz.md if new patterns discovered
```

---

## Key Constraints (from CLAUDE.md and visualisations.md)

- **No cross-tabulation** — never fetch ethnicity AND region in same query; each groupBy is single-dimensional
- **ssr: false mandatory** — all D3 imports must be in 'use client' wrappers with dynamic import
- **R3F not needed here** — all 9 new charts are D3/SVG, no Three.js required
- **Ethnicity colours** — use `ETHNICITY_COLOURS` from `@/lib/nzqa-strings.ts`; don't invent new colours
- **Bubble area scaling** — MUST use `r = Math.sqrt(value / Math.PI) * scaleFactor`, NOT `r = value * scale`
- **Data flows server → client** — all API fetches happen inside Client Components (since these are dynamic)
- **Tailwind v4** — use utility classes; no custom CSS unless necessary
- **Dark mode default** — `slate-950` background, `slate-900` chart panels

---

## Completion Promise

Output `<promise>CREATIVE_VIZ_COMPLETE</promise>` when ALL of the following are true:
- All 3 new pages exist and are linked from the home page
- All 9 chart components are implemented (3 per page)
- `npx tsc --noEmit` exits 0
- `npm run lint` exits 0
- Visual regression snapshot tests pass for all 3 pages
- `visualisations.md` has been updated with implementation notes
