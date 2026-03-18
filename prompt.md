# Phase 13: NMSSA Trend Chart (2013 → 2018 → 2022)

## Goal
Add a longitudinal NMSSA trend chart to `/primary-maths` showing how Year 4 and Year 8 maths achievement has changed across three NMSSA cycles: 2013, 2018, and 2022. Currently only 2022 data is in the DB — this phase seeds the earlier years and builds the chart.

## Progress Tracking

| Step | Status | Description |
|------|--------|-------------|
| 1 | ⬜ todo | Extract 2013 + 2018 NMSSA data from S3 PDFs using pdftotext |
| 2 | ⬜ todo | Update seed script + re-seed primary.db with 2013 + 2018 rows |
| 3 | ⬜ todo | Check existing `/api/primary/nmssa` route handles multi-year queries |
| 4 | ⬜ todo | Build `NMSSATrendChart` component |
| 5 | ⬜ todo | Add chart section to `/primary-maths` page |
| 6 | ⬜ todo | Write unit tests for API route |
| 7 | ⬜ todo | Write e2e tests |
| 8 | ⬜ todo | Run full test suite — all tests must pass |

Update this table as each step completes: ⬜ todo → 🔄 in progress → ✅ done

---

## Step 1 — Extract 2013 + 2018 data from PDFs

### PDF Sources (from research-findings.md)
- **2018**: `https://nmssa-production.s3.amazonaws.com/documents/2018_NMSSA_MATHEMATICS.pdf`
- **2013**: Try `https://nmssa-production.s3.amazonaws.com/documents/2013_NMSSA_MATHEMATICS.pdf` or similar
- Use: `curl -L <url> -o /tmp/nmssa_YEAR.pdf && pdftotext /tmp/nmssa_YEAR.pdf /tmp/nmssa_YEAR.txt`
- Then grep/search for the mean scale score tables

### 2022 data already in DB (reference)
| Group | Y4 Mean | Y8 Mean |
|-------|---------|---------|
| All | 84.0 | 115.8 |
| Girls | 82.4 | 113.3 |
| Boys | 85.7 | 118.1 |
| Māori | 75.3 | 105.0 |
| Pacific | 72.9 | 101.2 |
| Asian | 94.0 | 129.5 |
| NZ European | 86.2 | 119.0 |
| Low decile | 72.8 | 103.1 |
| Mid decile | 84.1 | 115.5 |
| High decile | 89.9 | 124.5 |

### Known 2018 summary findings (from research-findings.md, use as sanity check)
- Y8 average ~118.8 (115.8 + 3 units more than 2022 — wait, 2022 < 2018 per notes)
  Actually: "Y8 average increased 3 MS units from 2013 to 2018" and Y8 2022 = 115.8 < 2018
  So 2018 Y8 ≈ 118–119? Extract exact figures from PDF.
- Y4 2018: ~84 (increased 1 unit from 2013, not significant)
- 45% Year 8 at Level 4+, 81% Year 4 at Level 2+ (2018)
- Māori gap: -11 units at both Y4 and Y8 (2018)
- Pacific gap: -15 Y4, -13 Y8 (2018)

### 2013 fallback (if PDF unavailable)
Back-calculated estimates from research-findings.md:
- Y4 ≈ 83 MS units
- Y8 ≈ 112.8 MS units (115.8 - 3)
If using estimates, mark rows with a note in the seed data and show a disclaimer on the chart.

### Target: extract these groups for 2013 + 2018
- national (Y4 + Y8)
- gender: Girls, Boys (Y4 + Y8)
- ethnicity: Māori, Pacific, Asian, NZ European (Y4 + Y8)
- decile: Low, Mid, High (Y4 + Y8)

---

## Step 2 — Update seed script

File: `scripts/seed-primary.ts`

Add rows after the existing 2022 nmssa data. DO NOT drop/recreate tables — just INSERT new rows or delete-and-reinsert if needed.

Run: `npx tsx scripts/seed-primary.ts`

Verify: `npx tsx -e "import Database from 'better-sqlite3'; const db = new Database('src/data/primary.db'); console.log(JSON.stringify(db.prepare('SELECT DISTINCT year FROM nmssa_maths ORDER BY year').all()))"`

Expected: `[{"year":2013},{"year":2018},{"year":2022}]`

---

## Step 3 — Check existing NMSSA API

File: `src/app/api/primary/nmssa/route.ts`

Read the route. Confirm it:
- Accepts optional `year` or `yearLevel` params
- Returns `mean_score`, `ci_lower`, `ci_upper`, `group_type`, `group_value`
- If it only returns 2022 data or lacks multi-year support, update it to accept `groupType` param and return all years

The trend chart needs: all 3 years, for a given groupType (national/ethnicity/gender/decile), for a given year_level (4 or 8).

---

## Step 4 — Build NMSSATrendChart

File: `src/components/charts/NMSSATrendChart.tsx`

### Chart design
- **Type**: dot plot / connected line chart (only 3 time points: 2013, 2018, 2022)
- **X-axis**: year (categorical or linear, 3 points)
- **Y-axis**: mean scale score (MS units)
- **Error bars**: show 95% CI (ci_lower, ci_upper) as vertical bars through each dot
- **Lines**: connect the 3 dots per group

### Controls
- **Year level**: Year 4 / Year 8 (default: Year 8)
- **Group**: National / By Ethnicity / By Gender / By Decile (default: National)

### National view
- Single line + dots for national average
- Reference label: "MS Scale Score (2013 baseline = 100)"
- Annotation: if Y8 declined 2018→2022, flag it

### Grouped view (ethnicity/gender/decile)
- One line + dots per group
- Colour-coded by group
- End labels on right side
- For ethnicity: use ETHNICITY_COLOURS from @/lib/palette

### Colour scheme
- National: white/slate line
- Ethnicity: use existing ETHNICITY_COLOURS palette
- Decile: teal shades (Low = muted, High = bright)
- Gender: use GENDER_COLOURS

---

## Step 5 — Add to /primary-maths page

Files:
- `src/app/primary-maths/PrimaryMathsClient.tsx` — add NMSSATrendChart dynamic import
- `src/app/primary-maths/page.tsx` — add new section between existing NMSSA section and Curriculum Insights

Section heading: "Three cycles of NMSSA — how has achievement shifted?"
Text: explain that NMSSA sampled Year 4 and Year 8 in 2013, 2018, and 2022. Note the scale used (MS units, 2013 baseline ≈ 100 for combined Y4+Y8). Note that Y8 showed a significant decline 2018→2022 particularly for girls, Māori, and Pacific.

---

## Step 6 — Unit tests

File: `src/__tests__/api/nmssa.test.ts` (if it doesn't already exist)

Check: does `src/__tests__/api/nmssa.test.ts` exist? If not, create it following the pattern from `endorsement.test.ts`.

Cover:
- groupType validation (invalid → 400 if the route validates it)
- yearLevel param handling
- multi-year response shape
- DB failure → 500

---

## Step 7 — E2E tests

File: `e2e/primary-maths.spec.ts` (EXTEND, don't replace)

Add a new describe block: `NMSSATrendChart`

Tests:
- Year 4 / Year 8 toggle buttons are visible
- National / By Ethnicity / By Gender / By Decile toggles visible
- SVG renders
- Switching to Year 4 does not crash
- Switching to By Ethnicity does not crash

Also verify: API returns 3 years when called without year filter.

---

## Step 8 — Full test run

Run: `npm run test:e2e -- --reporter=list`
Run: `npm test`

All tests must pass. Fix any failures before outputting the completion promise.

---

## Data Constraints
- NMSSA uses Mean Scale Score (MS units), NOT percentages — keep chart Y-axis in MS units
- 95% CIs are available for all groups — always show them
- 2013 data may be estimated if PDF extraction fails — note this clearly in the UI

## Completion Promise
<promise>PHASE_13_COMPLETE</promise>
