# Phase 14: Data Sources Page (`/data-sources`)

## Goal
Build a `/data-sources` page that documents every data source used across Mazmatics Stats. Link to it from every chart section across all pages so users can verify the data they're reading.

## Progress Tracking

| Step | Status | Description |
|------|--------|-------------|
| 1 | ⬜ todo | Build `/data-sources` page (Server Component, no interactivity) |
| 2 | ⬜ todo | Add source links to `/nzqa-maths` chart captions |
| 3 | ⬜ todo | Add source links to `/nzqa-scholarship` chart captions |
| 4 | ⬜ todo | Add source links to `/primary-maths` chart captions |
| 5 | ⬜ todo | Add nav card to home page (`/`) |
| 6 | ⬜ todo | Add footer link to all pages |
| 7 | ⬜ todo | Write e2e tests |
| 8 | ⬜ todo | Run full test suite — all tests must pass |

Update this table as each step completes: ⬜ todo → 🔄 in progress → ✅ done

---

## Step 1 — Build `/data-sources` page

### Route
`src/app/data-sources/page.tsx` — Server Component (no `'use client'`)

### Page structure
Header section: "About the data" — short intro (2–3 sentences): all data is publicly sourced from NZ government bodies and international research organisations; links let users verify the numbers independently.

Then one `<section>` per data source, each with an anchor id for deep-linking.

### Sources to include — in this order

---

#### `#source-nzqa` — NZQA Secondary School Statistics
- **Full title:** New Zealand Qualifications Authority — Secondary School Statistics
- **Publisher:** New Zealand Qualifications Authority (NZQA)
- **URL:** `https://www.nzqa.govt.nz/about-us/publications/statistics/`
- **Years:** 2015–2024
- **What we use:** Subject attainment rates (Not Achieved / Achieved / Merit / Excellence) for NCEA Levels 1, 2, and 3, broken down by ethnicity, gender, school equity group, and region. Also scholarship attainment (Outstanding / Scholarship / No Award) for Calculus and Statistics.
- **Coverage:** English-medium secondary schools. Reported at national level and by 16 NZ regions.
- **Key caveats:**
  - `achieved_rate` is the Achieved-grade-only band — NOT the overall pass rate. Pass rate = `1 − not_achieved_rate`.
  - Equity group data (Q1–Q5) is available from 2019 onwards only.
  - Each breakdown is single-dimensional — ethnicity, gender, and region data cannot be cross-tabulated.
  - Scholarship `Maori` appears without macron in source data.
- **Used on:** `/nzqa-maths`, `/nzqa-scholarship`

---

#### `#source-timss` — TIMSS International Maths Study
- **Full title:** Trends in International Mathematics and Science Study (TIMSS) 2023 — International Results in Mathematics at Grade 4
- **Publisher:** IEA (International Association for the Evaluation of Educational Achievement)
- **URL:** `https://timss2023.org`
- **Years:** 1995, 2003, 2007, 2011, 2015, 2019, 2023 (every 4 years)
- **What we use:** NZ Grade 4 (Year 5, age ~9) maths scale scores 1995–2023, by gender. 2023 international country comparison (~58 countries).
- **Coverage:** Nationally representative sample of Year 5 students in English-medium schools. Tested in February each year.
- **Key caveats:**
  - International average is recalculated each cycle based on participating countries — not directly comparable across years.
  - TIMSS scale is NOT the same as NMSSA MS scale. These are completely separate measurement systems.
  - AUS/ENG comparison lines are approximate from published reports; exact values may vary slightly by rounding.
- **Used on:** `/primary-maths`

---

#### `#source-nmssa` — NMSSA Maths Achievement Reports
- **Full title:** National Monitoring Study of Student Achievement — Mathematics and Statistics
  - Report 19: Mathematics and Statistics 2018
  - Report 30: Mathematics and Statistics 2022
- **Publisher:** University of Otago / NZCER on behalf of the Ministry of Education
- **URLs:**
  - 2022: `https://nmssa-production.s3.amazonaws.com/documents/NMSSA_2022_Mathematics_Achievement_Report.pdf`
  - 2018: `https://nmssa-production.s3.amazonaws.com/documents/2018_NMSSA_MATHEMATICS.pdf`
- **Years:** 2013, 2018, 2022 (3 cycles)
- **What we use:** Mean Scale Score (MS units) for Year 4 and Year 8 students, by ethnicity, gender, and school decile band.
- **Coverage:** ~2,000 students per year level, English-medium state and integrated schools. Stratified sample by decile, region, and school size.
- **Key caveats:**
  - MS scale is designed so the combined 2013 average ≈ 100 with SD ≈ 20. Year 4 and Year 8 are NOT on the same sub-scale — a score of 84 at Y4 is not comparable to 84 at Y8.
  - 2013 values in our data are reconstructed on the 2018 MS scale via a linking exercise (NMSSA Report 19, Appendix 6). They differ from the original 2013 report figures.
  - 95% confidence intervals for 2013 are approximated from 2018 standard errors (similar sample sizes). Treat 2013 CIs as indicative.
  - NMSSA assessed at Year 4 and Year 8; the successor programme (Curriculum Insights) assesses at Year 3, Year 6, and Year 8.
- **Used on:** `/primary-maths`

---

#### `#source-curriculum-insights` — Curriculum Insights Dashboard
- **Full title:** Curriculum Insights Dashboard Reports 2023 and 2024
- **Publisher:** University of Otago / NZCER on behalf of the Ministry of Education
- **URL:** `https://curriculuminsights.otago.ac.nz`
- **Years:** 2023, 2024
- **What we use:** Percentage of students meeting / approaching / behind provisional NZ Curriculum benchmarks, at Year 3, Year 6, and Year 8.
- **Coverage:** Nationally representative sample of Year 3, Year 6, and Year 8 students. Successor to NMSSA (launched 2023).
- **Key caveats:**
  - Uses % meeting benchmarks — NOT the MS scale score used by NMSSA. These two datasets cannot be compared on the same chart.
  - Year levels changed: NMSSA measured Year 4 + Year 8; Curriculum Insights measures Year 3 + Year 6 + Year 8.
  - No statistically significant change was observed between 2023 and 2024 at any year level.
  - Demographic breakdowns (ethnicity, gender) are available in interactive data windows only — not included in our database.
- **Used on:** `/primary-maths`

---

### Design
- Dark background (`bg-slate-950`), matching existing pages
- Each source = a card (`bg-slate-900 rounded-xl p-6`) with:
  - Source name as `<h2>` with gradient text, id= anchor
  - Used-on chips: small `<span>` badges linking to the relevant page
  - Publisher / URL / Years as a small metadata row
  - "What we use" paragraph
  - Collapsible or always-visible caveats list
  - External link button to the original source

No interactivity required — Server Component. No dynamic imports needed.

---

## Step 2 — Add source links to `/nzqa-maths`

File: `src/app/nzqa-maths/page.tsx`

In the footer section (`{strings.dataNote}` paragraph), add a link:
```
Source: NZQA Secondary School Statistics 2015–2024.
<Link href="/data-sources#source-nzqa">About this data ↗</Link>
```

Keep the existing `{strings.dataNote}` and `{strings.decileNote}` — just append the link.

---

## Step 3 — Add source links to `/nzqa-scholarship`

File: `src/app/nzqa-scholarship/page.tsx`

Same pattern — add `<Link href="/data-sources#source-nzqa">About this data ↗</Link>` in the footer area.

---

## Step 4 — Add source links to `/primary-maths`

File: `src/app/primary-maths/page.tsx`

Three separate links to add, one per data source:
- TIMSS footer note → `<Link href="/data-sources#source-timss">About this data ↗</Link>`
- NMSSA footer note → `<Link href="/data-sources#source-nmssa">About this data ↗</Link>`
- Curriculum Insights footer note → `<Link href="/data-sources#source-curriculum-insights">About this data ↗</Link>`

---

## Step 5 — Add nav card to home page

File: `src/app/page.tsx`

Add a small card or link in the home page footer area (NOT a primary nav card — this is utility navigation). Something like:
```
All data is publicly sourced. <Link href="/data-sources">View data sources →</Link>
```

Or if there's a good place for a card, a compact one labelled "Data Sources & Methodology".

---

## Step 6 — Add footer link to all pages

Each page (`/nzqa-maths`, `/nzqa-scholarship`, `/primary-maths`) already has a footer. Add a small `<Link href="/data-sources">Data sources & methodology →</Link>` line at the bottom of each footer, styled like the existing `text-xs text-slate-600 font-mono` lines.

---

## Step 7 — E2E tests

File: `e2e/data-sources.spec.ts` (new file)

Tests:
- Page loads without console errors
- All 4 source section headings are visible (NZQA, TIMSS, NMSSA, Curriculum Insights)
- All 4 anchor ids are present in the DOM (`#source-nzqa`, `#source-timss`, `#source-nmssa`, `#source-curriculum-insights`)
- Deep link `GET /data-sources#source-timss` scrolls to TIMSS section (or at least the anchor exists)
- "About this data" links on `/nzqa-maths` and `/primary-maths` point to correct anchors
- External source links have `target="_blank"` and `rel="noopener noreferrer"`
- Nav link to `/data-sources` exists on home page

---

## Step 8 — Full test run

```bash
npm run test:e2e -- --reporter=list
npm test
```

All tests must pass before outputting the completion promise.

---

## Design reference

Follow the same dark theme as existing pages:
- Background: `#020617` with subtle grid
- Source card border: `border-slate-800`
- Heading gradient: `linear-gradient(to left, #47A5F1, #10b981)` (teal/blue, same as primary-maths)
- "Used on" chip: `bg-slate-800 text-slate-400 rounded-full px-2 py-0.5 text-xs font-mono`
- External link icon: ↗ (text, no icon library needed)
- Caveat items: `text-amber-500/80` for warnings, `text-slate-400` for info

---

## Completion Promise
<promise>PHASE_14_COMPLETE</promise>
